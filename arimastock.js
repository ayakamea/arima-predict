const fs = require('fs');//file system for handling files
const ARIMA = require('arima');//ARIMA
const TI_SMA = require('technicalindicators').SMA;
const TI_EMA = require('technicalindicators').EMA;

//Marks the start time
let time = Date.now();
let date_ob = new Date(time);
let start_time_ob = new Date(time);
console.log(start_time_ob);

//stock/crypto/forex prices
let stockFiles =[
    ///STOCKS(open for 6+1/2 hours/390 minutes on week days(9:30am to 4:00pm))
    "Bionano Genomics_BNGO_1min_20200524221335",//Good
    "Biocept Inc_BIOC_1min_20200524225810",//Good
    "Conatus Pharmaceuticals Inc_CNAT_1min_20200524235725",//Good
    "Remark Holdings_MARK_1min_20200524224916",//Good
    "Inuvo Inc_INUV_1min_20200524232249",//Good
    "Genius Brands International Inc_GNUS_1min_20200524235420",//Good
    "Diffusion Pharmaceuticals Inc._DFFN_1min_20200524225956",//Good
    "StoneMor Partners L.P._STON_1min_20200524235609",//Good
    "Bionano Genomics_BNGO_60min_20200525001250",//
    "Tesla, Inc_TSLA_1min(for 5days total)_20200524204921",//risky
    "Sundial Growers Inc_SNDL_60min_20200525001124",//
    "Remark Holdings_MARK_60min_20200525001218",//Good(based on limited data)
    "Ra Medical Systems Inc_RMED_1min_20200524224955",//Bad, lose more than gain
    "IZEA Worldwide_IZEA_1min_20200524230112",//Good and some bad
    "Genetic Technologies Limited_GENE_1min_20200524230044",//Bad
    "Coty Inc._COTY_1min_20200524225723",//Bad and Good(Mixed)


    //FOREX
    "_USDJPY_daily_20200524234519",//Very unstable
    "_USDJPY_60min_20200524234908",//good, but not enough data to be sure
    //"_USDJPY_1min_20200524233120(GMT time)",//read error, armia seems to crash on this
    "_USDCAD_1min_20200524233931",//no buy?
    "_GBPUSD_1min_20200524233644",//stock not moving at beginning
    "_EURUSD_daily_20200524234259",//gaining overall but unstable
    "_EURUSD_60min_20200524235025",//good but not enough data
    "_EURUSD_1min_20200524232516(GMT time)",//error?
    "_AUDUSD_60min_20200524235133",//bad
    "_AUDUSD_1min_20200524233842",//didn't buy any

    //CRYPTO
    "__Coinbase_BTCUSD_daily",//
    "__Coinbase_BTCUSD_1h",//very bad, followed by extremely good
    "__Coinbase_ETHUSD_1h",//unstable/bad/good-ish
    "__Coinbase_ETHUSD_daily",//good to extremely bad
    "__Coinbase_LTCUSD_1h",//unstable
    "__Coinbase_LTCUSD_daily",//generally good
    "",//
];

//candle file settings
let stockFileTimesLoaded = [];//count the times each file was loaded
for(let j=0;j<stockFiles.length;j++){
    stockFileTimesLoaded.push(0);//sets all array values to 0
}
let stockFile_index = 1//2//0;//index of file to load
let loadDifferentStockFileOnEnd = 0;//0=same file(no load), 1=next file, 2=random file
let stockFile_miniLoops = 1//5;//loops before going to next file
let stockFile_miniLoops_pos = 1;//automatic value, no need to change
if (loadDifferentStockFileOnEnd == 2){//picks a random file
    stockFile_index = Math.min(Math.floor(Math.random()*stockFiles.length),stockFiles.length-1);
}
let stockFile = stockFiles[stockFile_index];
let stockArrayFull = loadStockData(stockFile);//load stock file

stockArrayFull.reverse();//reverse the array to make it oldest to newest
let stockArray = [];
for(let t = 0; t< stockArrayFull.length; t++){
    stockArray.push(stockArrayFull[t].close);
}
//console.log(stockArray);

let sim_pos = 0;//current time position
let predictor_mode = 0;//0=use normal candles, 1=use sma, 2=use ema(only 0 can be used right now)
let needed_timesteps = 60//20//history needed before arima can be used to buy(this is also how far back in time the arima will look)
let timesteps_in_future_to_predict = 1;//how many minutes/hours/etc in the future you want predicted, program needs to be adjusted to  use this, don't change this

//===buy/sell simulation money
let account_balance = 10;//balance on account your pretend account(in USD)
let commission_fee = 0.0//0.08;//percent fee charged on each trade you win(on loss you will just lose the entire bet)
let liquidated = false;//tells if you loss all your money and can no longer bet(for testing sake though, betting will still continue), automatic value, don't change
let shares_to_buy = 0//1;//number of shares you want to buy,0=always buy as many as possible
let shares_bought = 0;//number of shares bought, automatic value
let buy_price = 0.0;//how much Sliver was worth at the time it was buyed, no need to change this
let new_price = 0.0;//resulting price, no need to change this



//=====Martingale/Anti-Martingale/D'Alembert Add-on
//use these to add Martingale, Anti-Martingale or D'Alembert betting, set bet_mutliplyonloss_mode to 0 to turn off
//Martingale video      -  https://www.youtube.com/watch?v=5Q3j1gvULxU
//Anti-Martingale video -  https://www.youtube.com/watch?v=ZtKDni0V1Rg
//D'Alembert video      -  https://www.youtube.com/watch?v=C89AOo5ASkw
let bet_mutliplyonloss_mode = 0;//0=off, 1=mutliply on loses(Martingale), -1=mutliply on wins(Anti-Martingale), 2=adding on loses and subtracting on wins(D'Alembert), -2=adding on wins and subtracting on loses(Anti-D'Alembert)
let bet_mutliply = 4//4;//max times mutliple to mutlply on loss/win(number should be a mutliple of 2, example 2,4,8,16,32...)0=unlimited, this is ignored for D'Alembert/Anit-D'Alembert
let bet_mutliplyreset = true;//if true, will reset bet_mutliply_pos to 1 when you win(for Martingale) or when you lose(for Anti-Martingale)
                             //if false, will not reset automatically on win(for Martingale)/loss(for Anti-Martingale)
                             //in normal Martingale/Anti-Martingale, this value is always true, will be ignored for D'Alembert/Anti-D'Alembert
let bet_mutliply_peak = 1;//automatic value                            
let bet_mutliply_pos = 1;//this value doubles on each loss(for Martingale) or each win(Anti-Martingale) until bet_mutliply is reached then goes back to 1, Ignored for D'Alembert/Anti-D'Alembert automatically calculated value, don't change this                 
let bet_dalembert = 0;//used only for D'Alembert/Anti-D'Alembert, this value will add and subtract, automatically calculated value, don't change this
let bet_dalembert_reset_after_profit = 0;//0=off
let bet_dalembert_profit_pos = account_balance+bet_dalembert_reset_after_profit;//automatic value
let bet_dalembert_clamp_max = 0;//0=no limit
let bet_dalembert_weaken_factor = 1//1;//how many times to weaken the dalembert's effect, 1=off
//////////////

//======additonal starting values
let buyLag = 0;//number of timesteps site takes to buy something after clicking buy button(a delay in buying)
let rl_forecast = 0;//future action, 0=hold, 1=up, 2=down
let arima_pred = [];//array of predictions outputed by arima
let arima_diff = 0;
let arima_change = 0;
let i = 0;//current second, used to simulate time moving
let print_on_size = 10;//used to limit the number of outputs to termial, no need to change this value
let moves_count = 0;//the total number of up and down buys(does not include holds)
let rl_loses = 0;//losses
let rl_wins = 0;//wins
let rl_holds = 0;//holds, meaning did not buy anything
let rl_draws = 0;//draws, happens when buy price was the same as the result
let rl_ups = 0;
let rl_downs = 0;
let rl_reward_total = 0;//total count of rewards(basically just wins minus losses)
let predictions=0;//total number of predictions made
let outtext = "";//output text to logfile(will only output after completion due to async)
let moves_to_make = 0;//moves(timesteps) until complete, 0 = no limit
let complete = false;//completed running program

///counts the highest number of consecutive wins and losses(info could be useful for Martingale/D'Alembert)
let consecutive_wins = 0;
let consecutive_wins_count = 0;
let consecutive_loss = 0;
let consecutive_loss_counter = 0;

//calculate indicators
let stockArray_sma_period = 12;
let stockArray_sma = TI_SMA.calculate({period : stockArray_sma_period, values : stockArray});
for(let t = stockArray_sma_period-1; t>0;t--){
    stockArray_sma.unshift(stockArray[t]);//add values to make array same size
}

//sim_seconds_ema = TI_EMA.calculate({period : sim_seconds_ema_period, values : stockArray});

//change sim_seconds to indicator values if needed
let dataArray = stockArray;
if (predictor_mode == 0){//normal prices
    //no change
} else if (predictor_mode == 1){//SMA
    dataArray = stockArray_sma;
} else if (predictor_mode == 2){//EMA
    //dataArray = stockArray_ema;
}

//will predict if the price will go up or down in the next minute
play_predict();

function play_predict(){
    //creates an async log file(file will remain blank until completion of loop due to async)
    let file_ob_name_part = 'rl_arimastock_'+ dateTimeLine(date_ob);
    //var file_ob = fs.createWriteStream(file_ob_name_part+".txt");//creates a file to log data
    //file_ob.on('error', function(err) { consolelog(err) });
    //file_ob.write("===========limited history of stock prediction(only 1 out of every "+Math.max(moves_to_make/1000,1)+" games will be displayed below)\r\n");
    
    //main loop start
    while (complete == false){
        let rl_reward = 0;//reward earned: +1 for win, -1 for loss

        //==check if candle history is complete
        if (stockArray.length <= sim_pos+1 && stockArray.length >= needed_timesteps){
            i=0;
            sim_pos=0;
            console.log("end of stock history ["+ stockFile_index + "," + stockFileTimesLoaded[stockFile_index] + "] " + stockFile +" reached...("+stockFile_miniLoops_pos+"/"+stockFile_miniLoops+")");
            stockFile_miniLoops_pos += 1;
            if (stockFile_index+1 >= 0){
                complete=true;//remove this line if you want bot to keep going after every file is read
            }
            if (loadDifferentStockFileOnEnd > 0 && stockFile_miniLoops_pos > stockFile_miniLoops){//picks a random file
                stockFile_miniLoops_pos = 1;
                if (loadDifferentStockFileOnEnd == 1){
                    stockFile_index += 1;
                    if (stockFile_index >= stockFiles.length){
                        stockFile_index = 0;
                    }
                } else {
                    stockFile_index = Math.min(Math.floor(Math.random()*stockFiles.length),stockFiles.length-1);
                }
                stockFile = stockFiles[stockFile_index];

                //load stock history from file, synchronously reading(wait for reading to complete)
                stockArrayFull = [];
                stockArray = [];
                stockArrayFull = loadStockData(stockFile);//load stock file
                stockArrayFull.reverse();//reverse the array to make it oldest to newest
                for(let t = 0; t< stockArrayFull.length; t++){
                    stockArray.push(stockArrayFull[t].close);//get only the closing prices
                }

                //calculate indicators
                //stockArray = sim_seconds.map(Number);//convert to number array for indicators
                //stockArray_sma = TI_SMA.calculate({period : stockArray_sma_period, values : stockArray});
                

                //change sim_seconds to indicator values if needed
                if (predictor_mode == 0){//normal prices
                    //no change
                } else if (predictor_mode == 1){//SMA
                   //stockArray = stockArray_sma;
                } else if (predictor_mode == 2){//EMA
                    //stockArray = sim_seconds_ema;
                }
            }
        }
        
        ///use ARIMA to predict if price will go up or down
        if (i>needed_timesteps){
            let temp_predict = arima_prediction(dataArray.slice(sim_pos-(needed_timesteps),sim_pos));//retrives 1200 seconds of past history

            rl_forecast = 0;//hold
            if (temp_predict > dataArray[sim_pos]){//predict price will go up
                rl_forecast = 1;//up
            } else if (temp_predict < dataArray[sim_pos]){//predict price will go down
                rl_forecast = 2;//down
            }

            if (rl_forecast == 1){//up
                if (shares_bought == 0){
                    buy_price=parseFloat(stockArray[sim_pos+buyLag]);//saves buying price
                    let temp_shares = shares_to_buy;
                    if (shares_to_buy == 0){//buy max
                        temp_shares = Math.floor((account_balance-1)/buy_price);//buys max stocks-1
                    }
                    shares_bought+=((temp_shares*bet_mutliply_pos)+bet_dalembert);//buy a share
                    
                    rl_ups += 1;
                } else {rl_holds+=1;};//holds position
                
            } else if (rl_forecast == 2){//down
                if (shares_bought > 0){
                    shares_bought=shares_bought*-1;//sell shares
                    rl_downs += 1;
                }
            }
            predictions+=1;
        }
        
        //===moves up in time by 1 time step
        sim_pos+=1;
        
        //price of the last close
        new_price = parseFloat(stockArray[sim_pos]);//real price of the last close

        //=====checks if prediction was correct by comparing it to the buy_price
        if (i>needed_timesteps){
            if (shares_bought < 0){//sell shares
                //console.log("b="+buy_price+" n="+new_price+" profit="+((new_price-buy_price)*Math.abs(shares_bought)));
                account_balance+=(new_price-buy_price)*Math.abs(shares_bought);//updates balance
                shares_bought = 0;
                if (new_price > buy_price){
                    rl_reward=1;//correct
                } else if (new_price < buy_price){
                    rl_reward=-1;//wrong
                } else {
                    rl_draws +=1;//uncommon, on the level trade, no win/loss
                }
            }
            //console.log(buy_price+" price "+new_price+" r="+rl_reward+" a="+rl_forecast+ "size="+(sim_pos+buyLag+temp_sub)+"/"+sim_seconds.length);
            ////====updates win/loss
            if (rl_reward == 1){//just won
                rl_wins+=1;
                moves_count+=1;//count of total up/down actions made
                consecutive_wins_count+=1;
                consecutive_loss_counter = 0;
                if (bet_mutliplyonloss_mode == 2){//D'Alembert
                    bet_dalembert = Math.max(bet_dalembert-(1/bet_dalembert_weaken_factor),0);
                    if (account_balance > bet_dalembert_profit_pos && bet_dalembert_reset_after_profit > 0){
                        bet_dalembert_profit_pos=account_balance+bet_dalembert_reset_after_profit;
                        bet_dalembert = 0;
                    }
                } else if (bet_mutliplyonloss_mode == -2){//Anti-D'Alembert
                    bet_dalembert += (1/bet_dalembert_weaken_factor);
                    if (bet_dalembert_clamp_max > 0 && bet_dalembert > bet_dalembert_clamp_max){
                        bet_dalembert = bet_dalembert_clamp_max;
                    }
                } else if (bet_mutliplyonloss_mode == -1){//Anti-Martingale
                    bet_mutliply_pos = Math.min(bet_mutliply_pos*2,bet_mutliply);
                } else if (bet_mutliplyreset == true){
                    bet_mutliply_pos=1;
                }
                arima_diff+=Math.abs(arima_pred[arima_pred.length-1]-new_price);//how accurate was the guess
            } else if (rl_reward == -1){//just loss
                rl_loses+=1;
                moves_count+=1;//count of total up/down actions made
                consecutive_loss_counter+=1;
                consecutive_wins_count = 0;
                if (bet_mutliplyonloss_mode == 2){//D'Alembert
                    bet_dalembert += (1/bet_dalembert_weaken_factor);
                    if (bet_dalembert_clamp_max > 0 && bet_dalembert > bet_dalembert_clamp_max){
                        bet_dalembert = bet_dalembert_clamp_max;
                    }
                } else if (bet_mutliplyonloss_mode == -2){//Anti-D'Alembert
                    bet_dalembert = Math.max(bet_dalembert-(1/bet_dalembert_weaken_factor),0);
                } else if (bet_mutliplyonloss_mode == 1){//Martingale
                    if (bet_mutliply > 0){
                        bet_mutliply_pos = Math.min(bet_mutliply_pos*2,bet_mutliply);
                    } else {
                        bet_mutliply_pos = bet_mutliply_pos*2;
                    }
                    
                    bet_mutliply_peak=Math.max(bet_mutliply_peak,bet_mutliply_pos*1);
                } else if (bet_mutliplyreset == true){
                    bet_mutliply_pos=1;
                }
                arima_diff+=Math.abs(arima_pred[arima_pred.length-1]-new_price);//how accurate was the guess
            }
            //reset bet_mutliply_pos when it goes higher than bet_mutliply 
            if (bet_mutliply_pos > bet_mutliply && bet_mutliply > 0){
                bet_mutliply_pos = 1;
            }

            //check for new highest number of consecutive wins/losses
            if (consecutive_wins_count > consecutive_wins){
                consecutive_wins = consecutive_wins_count;
            }
            if (consecutive_loss_counter > consecutive_loss){
                consecutive_loss = consecutive_loss_counter;
            }

            //updates reward total
            rl_reward_total+=rl_reward;
        }

        //checks if you loss too much money to bet anymore
        if (liquidated == false && account_balance <= 0){ //&& shares_bought == 0){
            liquidated = true;
        }

        //saves/outputs text on console/log file
        if (predictions > (moves_to_make-200) && moves_to_make > 0){
            console.log("_______________");
                outtext+="_______________\r\n"
            console.log("last_price="+last_price+" price="+state[0]+" rl_reward="+rl_reward+" correct="+rl_wins+ " wrong=" + rl_loses);
            outtext+=("last_price="+last_price+" price="+state[0]+" rl_reward="+rl_reward+" correct="+rl_wins+ " wrong=" + rl_loses+"\r\n");
        }
    
        //current minute increase
        i+=1;

        //this is just to limit the number of outputs displayed in the terimal
        if (i > print_on_size && i <= 800){
            if (i==80 || i==100 || i==200 || i==400 || i==800){
                print_on_size = i/4;
            }
        }
        print_on_size=60//1;//remove comment from this line to output all predictions to terminal
        if (predictions > moves_to_make && moves_to_make > 0){//completed run
            complete = true;
        } else if (i%print_on_size == 0){//output info to terminal
            console.log("i="+i+" predictions="+predictions+" w="+rl_wins+ " l=" + rl_loses + " holds="+ rl_holds +" draws=" + rl_draws + " rewards=" + rl_reward_total + " account_balance=" + account_balance + " d="+bet_dalembert + " liquidated=" + liquidated + " u/d="+rl_ups+"/"+rl_downs+" share="+new_price);
            //console.log("i="+i+" predicts="+predictions+" w="+rl_wins+ " l=" + rl_loses + " h="+ rl_holds +" d=" + rl_draws + " rs=" + rl_reward_total + " account_balance=" + account_balance + " > p="+new_price+", r="+rl_reward+" a="+arima_pred[arima_pred.length-1]+"/"+new_price+ " ad="+(arima_diff/moves_count));
        }
    }
    //updates time
    time = Date.now();
    date_ob = new Date(time);
    
    //saves and completes
    console.log("moves="+moves_count+"/"+(i-1)+" correct="+rl_wins+" Time(in Minutes) = " + ((dateDiff(date_ob,start_time_ob)/1000)/60));
    //file_ob.write(outtext);
    //file_ob.write("moves="+moves_count+"/"+(i-1)+" correct="+rl_wins+ " wrong=" + rl_loses+'\r\n');
    //file_ob.write("Time(in Minutes) = " + ((dateDiff(date_ob,start_time_ob)/1000)/60) + '\r\n');
    //file_ob.end();
    console.log("complete");
}

function arima_prediction(ts){
    //ARIMA = Auto-Regressive Intergrated Moving Average
    //ts = Time Series, an array of price history from oldest to newest
    arima_pred = ARIMA(ts, timesteps_in_future_to_predict+5, {//set to predict time steps into the future
        method: 0,      // ARIMA method (Default: 0)
        optimizer: 6,//5,//6, // Optimization method (Default: 6)
        p: 2,      // Number of Autoregressive coefficients
        d: 1,          // Number of Integrated times the series needs to be differenced(to make series stationary)
        q: 0,//10,//3,//0,          // Number of Moving Average Coefficients(Error of the model)
        verbose: false // Output model analysis to console
    })
    arima_change+=Math.abs(arima_pred[arima_pred.length-1]-new_price);//how far off arima is to real prices overall
    /*console.log("===real future prices===");
    console.log(sim_seconds.slice(sim_pos+1,sim_pos+1+60));
    console.log("arima predictions")
    console.log(arima_pred);*/
    return arima_pred[arima_pred.length-1];//returns newest prediction(the price 59 seconds into the future)
}

function loadStockData(filename='stockdata.json', path = 'stocks/'){
    //read dqnSolver properties from a file to load the model
    try {
        path = path + filename;
        if (path.search('.json') < 0){
            path = path + '.json';
        }
        if(fs.existsSync(path)) {
            let data = fs.readFileSync(path);
            console.log("Stock Data Loaded from file: "+path);
            return JSON.parse(data);//Convert to JSON
        } else {
            console.log("stock file not found.");
            return -1;
        }
    } catch (err) {
        console.error(err);
        return -2;
    }
}

function saveStockData(stock_data, filename = 'stockdata', path = 'stocks/'){
    //write xseq properties to file to save the model
    let time = Date.now();
    let date_ob = new Date(time);
    path = path + filename;
    if (path.search('.json') < 0){
        path = path + "_" + dateTimeLine(date_ob) + '.json';
    }
    let objasstring = JSON.stringify(stock_data);
    fs.writeFileSync(path, objasstring, 'utf8', function (err) {
        if (err) {
            console.log("file write error!");
            return console.log(err);
        }
    }); 
    console.log("Stock Data Saved to file: "+path);
}

function dateDiff(date1, date2){
    //returns the difference between 2 dates in milliseoncds
    //date1 = newest date
    let date_ob1 = new Date(date1);
    let date_ob2 = new Date(date2);
  
    // Convert both dates to milliseconds
    var date1_ms = date_ob1.getTime();
    var date2_ms = date_ob2.getTime();
  
    // Calculate the difference in milliseconds
    return (date1_ms - date2_ms);
}

function dateTimeLine(date1){
    // get the date in a single short line
    let date = ("0" + date1.getDate()).slice(-2);//day
    let month = ("0" + (date1.getMonth() + 1)).slice(-2);
    let year = date1.getFullYear();
    let hours = ("0" + date1.getHours()).slice(-2);
    let minutes =  ("0" + date1.getMinutes()).slice(-2);
    let seconds = ("0" + date1.getSeconds()).slice(-2);

    return year + month + date + hours + minutes + seconds;
}