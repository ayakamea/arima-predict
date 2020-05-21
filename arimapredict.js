const fs = require('fs');//file system for handling files
const ARIMA = require('arima');//ARIMA

//Marks the start time
let time = Date.now();
let date_ob = new Date(time);
let start_time_ob = new Date(time);
console.log(start_time_ob);

//sliver candle history files
let candleFiles =[
    "ts/po_candle_Silver OTC_1587866014492.txt",//this file seems to oppose most of the other files, about 38 hours
    "ts/po_candle_Silver OTC_1587719596346.txt",//
    "ts/po_candle_Silver OTC_1587455546006.txt",//
    "ts/po_candle_Silver OTC_1586867046615.txt",//
    "ts/po_candle_Silver OTC_1586178780004.txt",//about 16 hours
    "ts/po_candle_Silver OTC_1587397862473.txt",//
    "ts/po_candle_Silver OTC_1587059247529.txt",//
    "ts/po_candle_Silver OTC_1587603365950.txt",//
    "ts/po_candle_Silver OTC_1586427857972.txt",//
    "ts/po_candle_Silver OTC_1587152308881.txt",//
    "ts/po_candle_Silver OTC_1587837917704.txt",//
    "ts/po_candle_Silver OTC_1586689642762.txt",//
    "ts/po_candle_Silver OTC_1586373632082.txt",//
    "ts/po_candle_Silver OTC_1586843503243.txt",//
    "ts/po_candle_Silver OTC_1587323880478.txt",//
    "ts/po_candle_Silver OTC_1586618652279.txt",//
    "ts/po_candle_Silver OTC_1587371931825.txt",//
    "ts/po_candle_Silver OTC_1586957627512.txt",//
    "ts/po_candle_Silver OTC_1586928846414.txt",//
    "ts/po_candle_Silver OTC_1586726437340.txt",//
    "ts/po_candle_Silver OTC_1586654879469.txt",//
    "ts/po_candle_Silver OTC_1587188663731.txt",//
    "ts/po_candle_Silver OTC_1586397526194.txt",//
    "ts/po_candle_Silver OTC_1587230926804.txt",//
    "ts/po_candle_Silver OTC_1587304104592.txt",//
    "ts/po_candle_Silver OTC_1587000435010.txt",//
    "ts/po_candle_Silver OTC_1586824583418.txt",//
    "ts/po_candle_Silver OTC_1588001733434.txt",//
    "ts/po_candle_Silver OTC_1586533398280.txt",//
    "ts/po_candle_Silver OTC_1586579877808.txt",//
    "ts/po_candle_Silver OTC_1586641717855.txt",//
    "ts/po_candle_Silver OTC_1587047003954.txt",//
    "ts/po_candle_Silver OTC_1586486869639.txt",//
    "ts/po_candle_Silver OTC_1586606798671.txt",//
    "ts/po_candle_Silver OTC_1586748641839.txt",//
    "ts/po_candle_Silver OTC_1587113748697.txt",//
    "ts/po_candle_Silver OTC_1586416571629.txt",//
    "ts/po_candle_Silver OTC_1587219027138.txt",//
    "ts/po_candle_Silver OTC_1587036905254.txt",//
    "ts/po_candle_Silver OTC_1587641738489.txt",//
    "ts/po_candle_Silver OTC_1586762187725.txt",//
    "ts/po_candle_Silver OTC_1587278810152.txt",//
    "ts/po_candle_Silver OTC_1587292545638.txt",//
    "ts/po_candle_Silver OTC_1587357046191.txt",//
    "ts/po_candle_Silver OTC_1586980469122.txt",//
    "ts/po_candle_Silver OTC_1586593706204.txt",//
    "ts/po_candle_Silver OTC_1586673538597.txt",//
    "ts/po_candle_Silver OTC_1586714266406.txt",//
    "ts/po_candle_Silver OTC_1587107117869.txt",//
    "ts/po_candle_Silver OTC_1587255115196.txt",//
    "ts/po_candle_Silver OTC_1587351357002.txt",//
    "ts/po_candle_Silver OTC_1586990463379.txt",//
    "ts/po_candle_Silver OTC_1587181848483.txt",//
    "ts/po_candle_Silver OTC_1587030628068.txt",//
    "ts/po_candle_Silver OTC_1587023262665.txt",//
    "ts/po_candle_Silver OTC_1587249989297.txt",//
    "ts/po_candle_Silver OTC_1586819943925.txt",//
    "ts/po_candle_Silver OTC_1587143473647.txt",//
    "ts/po_candle_Silver OTC_1587274511505.txt",//
    "ts/po_candle_Silver OTC_1587288617133.txt",//
    "ts/po_candle_Silver OTC_1586158298761.txt",//
    "ts/po_candle_Silver OTC_1586814911771.txt",//
    "ts/po_candle_Silver OTC_1586603498556.txt",//
    "ts/po_candle_Silver OTC_1586840431768.txt",//
    "ts/po_candle_Silver OTC_1587019934031.txt",//
    "ts/po_candle_Silver OTC_1587321262003.txt",//
    "ts/po_candle_Silver OTC_1587017175219.txt",//
    "ts/po_candle_Silver OTC_1586978206817.txt",//
    "ts/po_candle_Silver OTC_1586955275591.txt",//
    "ts/po_candle_Silver OTC_1586998517645.txt",//
    "ts/po_candle_Silver OTC_1587579896690.txt",//
    "ts/po_candle_AUDCHF OTC_1586563545314(labeled as sliver wholetime).txt",//this is actual sliver(changed to sliver at beginning),  about 4 hours
];

//candle file settings
let candleFileTimesLoaded = [];//count the times each file was loaded
for(let j=0;j<candleFiles.length;j++){
    candleFileTimesLoaded.push(0);//sets all array values to 0
}
let candleFile_index = 1;
let loadDifferentCandleFileOnEnd = 1;//0=same file(no load), 1=next file, 2=random file
let candleFile_miniLoops = 1//5;//loops before going to next file
let candleFile_miniLoops_pos = 1;
if (loadDifferentCandleFileOnEnd == 2){//picks a random file
    candleFile_index = Math.min(Math.floor(Math.random()*candleFiles.length),candleFiles.length-1);
}
let candleFile = candleFiles[candleFile_index];
let sim_seconds = [];//history of every candle second
let sim_seconds_pos = 0;//current second

//load candle history from textfile, synchronously reading(wait for reading to complete)
try {
    let data = fs.readFileSync(candleFile, 'utf8');
    let data_clean = data.replace(/\r?\n?.*\(.*\)\r\n/g,'');//turns to only numbers with commas + \r\n on last values
    sim_seconds = data_clean.split(","); 
    //consolelog(sim_seconds);
    console.log("candles file loaded, seconds = about " + sim_seconds.length);
} catch(e) {
    console.log('Error:', e.stack);
}

//===buy/sell simulation money
let account_balance = 100;//balance on account your pretend account(in USD)
let bet = 1;//amount of intial dollars to bet on each trade(USD, must be whole dollars with no cents)
let commission_fee = 0.08;//percent fee (8%) charged on each trade you win(on loss you will just lose the entire bet)
let liquidated = false;//tells if you loss all your money and can no longer bet(for testing sake though, betting will still continue), automatic value, don't change
let buy_price = 0.0;//how much Sliver was worth at the time it was buyed, no need to change this
let new_price = 0.0;//resulting price, no need to change this

//=====Martingale/Anti-Martingale/D'Alembert Add-on
//use these to add Martingale, Anti-Martingale or D'Alembert betting, set bet_mutliplyonloss_mode to 0 to turn off
//Martingale video      -  https://www.youtube.com/watch?v=5Q3j1gvULxU
//Anti-Martingale video -  https://www.youtube.com/watch?v=ZtKDni0V1Rg
//D'Alembert video      -  https://www.youtube.com/watch?v=C89AOo5ASkw
let bet_mutliplyonloss_mode = 0;//0=off, 1=mutliply on loses(Martingale), -1=mutliply on wins(Anti-Martingale), 2=adding on loses and subtracting on wins(D'Alembert), -2=adding on wins and subtracting on loses(Anti-D'Alembert)
let bet_mutliply = 4;//max times mutliple to mutlply on loss/win(number should be a mutliple of 2, example 2,4,8,16,32...), this is ignored for D'Alembert/Anit-D'Alembert
let bet_mutliplyreset = true;//if true, will reset bet_mutliply_pos to 1 when you win(for Martingale) or when you lose(for Anti-Martingale)
                             //if false, will not reset automatically on win(for Martingale)/loss(for Anti-Martingale)
                             //in normal Martingale/Anti-Martingale, this value is always true, will be ignored for D'Alembert/Anti-D'Alembert
let bet_mutliply_pos = 1;//this value doubles on each loss(for Martingale) or each win(Anti-Martingale) until bet_mutliply is reached then goes back to 1, Ignored for D'Alembert/Anti-D'Alembert automatically calculated value, don't change this                 
let bet_dalembert = 0;//used only for D'Alembert/Anti-D'Alembert, this value will add and subtract, automatically calculated value, don't change this
//let bet_dalembert_weaken_factor = 1;//how many times to weaken the dalembert's effect to reduce risk, 1=off
//////////////

//======additonal starting values
let neededminutes = 20;//minutes of history needed before arima can be used to buy
let buyLag = 2;//number of seconds site takes to buy something after clicking buy button(a delay in buying)
let rl_action = 0;//future action, 0=hold, 1=up, 2=down
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

//will predict if the price will go up or down in the next minute
play_predict();

function play_predict(){
    //creates an async log file(file will remain blank until completion of loop due to async)
    let file_ob_name_part = 'rl_arimacandle_'+ dateTimeLine(date_ob);
    var file_ob = fs.createWriteStream(file_ob_name_part+".txt");//creates a file to log data
    file_ob.on('error', function(err) { consolelog(err) });
    file_ob.write("===========limited history of candle prediction(only 1 out of every "+Math.max(moves_to_make/1000,1)+" games will be displayed below)\r\n");
    
    //main loop start
    while (complete == false){
        let rl_reward = 0;//reward earned: +1 for win, -1 for loss
        buy_price = 0.0;//how much Sliver was worth at the time it was buyed

        //==check if candle history is complete
        if (sim_seconds.length <= sim_seconds_pos+60 && sim_seconds.length >= neededminutes){
            i=0;
            sim_seconds_pos=0;
            console.log("end of candle history ["+ candleFile_index + "," + candleFileTimesLoaded[candleFile_index] + "] " + candleFile +" reached...("+candleFile_miniLoops_pos+"/"+candleFile_miniLoops+")");
            candleFile_miniLoops_pos += 1;
            if (loadDifferentCandleFileOnEnd > 0 && candleFile_miniLoops_pos > candleFile_miniLoops){//picks a random file
                candleFile_miniLoops_pos = 1;
                if (loadDifferentCandleFileOnEnd == 1){
                    candleFile_index += 1;
                    if (candleFile_index >= candleFiles.length){
                        candleFile_index = 0;
                        complete=true;//remove this line if you want bot to keep going after every file is read
                    }
                } else {
                    candleFile_index = Math.min(Math.floor(Math.random()*candleFiles.length),candleFiles.length-1);
                }
                candleFile = candleFiles[candleFile_index];
                sim_seconds = [];//delete array
                //load candle history from textfile, synchronously reading(wait for reading to complete)
                try {
                    let data = fs.readFileSync(candleFile, 'utf8');
                    let data_clean = data.replace(/\r?\n?.*\(.*\)\r\n/g,'');//turns to only numbers with commas + \r\n on last values
                    sim_seconds = data_clean.split(","); 
                    candleFileTimesLoaded[candleFile_index] += 1;
                    console.log("=========new candles file loaded, seconds = about " + sim_seconds.length);
                } catch(e) {
                    console.log('Error:', e.stack);
                }
            }
        }
        
        ///use ARIMA to pick an action(call(up), put(down) or hold(do nothing))
        if (i>neededminutes){
            let temp_predict = arima_prediction(sim_seconds.slice(sim_seconds_pos-(60*neededminutes),sim_seconds_pos));//retrives 1200 seconds of past history
            rl_action = 0;//hold
            //let price_divergence_max = 0.004;//require price to still be considered a buy with this divergence
            if (temp_predict > sim_seconds[sim_seconds_pos]){ //&& (temp_predict-price_divergence_max) > sim_seconds[sim_seconds_pos]){
                rl_action = 1;//up
            } else if (temp_predict < sim_seconds[sim_seconds_pos]){ //&& (temp_predict+price_divergence_max) < sim_seconds[sim_seconds_pos]){
                rl_action = 2;//down
            }
            predictions+=1;
        }

        //saves buying price
        buy_price=parseFloat(sim_seconds[sim_seconds_pos+buyLag]);

        //===moves up in time by 1 minute(60 seconds)
        sim_seconds_pos+=60;
        
        //price of the last close
        new_price = parseFloat(sim_seconds[sim_seconds_pos-1]);//price of the last close

        //=====checks if prediction was correct by comparing it to the buy_price
        if (i>neededminutes){
            if (rl_action == 1){//call(up)
                if (new_price > buy_price){
                    rl_reward=1;//correct
                } else if (new_price < buy_price){
                    rl_reward=-1;//wrong
                } else {
                    rl_draws +=1;//uncommon, on the level trade, no win/loss
                }
            } else if (rl_action == 2){//put(down)
                if (new_price < buy_price){
                    rl_reward=1;//correct
                } else if (new_price > buy_price){
                    rl_reward=-1;//wrong
                } else {
                    rl_draws +=1;//uncommon, on the level trade, no win/loss
                }
            } else if (rl_action == 0){
                rl_holds +=1;//do nothing
            }
            ////====updates win/loss
            if (rl_reward == 1){//just won
                rl_wins+=1;
                moves_count+=1;//count of total up/down actions made
                consecutive_wins_count+=1;
                consecutive_loss_counter = 0;
                account_balance+=((bet+bet_dalembert)-((bet+bet_dalembert)*commission_fee))*bet_mutliply_pos;//add to pretend balance
                if (bet_mutliplyonloss_mode == 2){//D'Alembert
                    bet_dalembert = Math.max(bet_dalembert-1,0);
                } else if (bet_mutliplyonloss_mode == -2){//Anti-D'Alembert
                    bet_dalembert += 1;
                } else if (bet_mutliplyonloss_mode == -1){//Anti-Martingale
                    bet_mutliply_pos = bet_mutliply_pos*2;
                } else if (bet_mutliplyreset == true){
                    bet_mutliply_pos=1;
                }
                arima_diff+=Math.abs(arima_pred[arima_pred.length-1]-new_price);//how accurate was the guess
            } else if (rl_reward == -1){//just loss
                rl_loses+=1;
                moves_count+=1;//count of total up/down actions made
                consecutive_loss_counter+=1;
                consecutive_wins_count = 0;
                account_balance-=(bet+bet_dalembert)*bet_mutliply_pos;
                if (bet_mutliplyonloss_mode == 2){//D'Alembert
                    bet_dalembert += 1; 
                } else if (bet_mutliplyonloss_mode == -2){//Anti-D'Alembert
                    bet_dalembert = Math.max(bet_dalembert-1,0);
                    //bet_dalembert = Math.min(bet_dalembert-1,0);
                } else if (bet_mutliplyonloss_mode == 1){//Martingale
                    bet_mutliply_pos = bet_mutliply_pos*2;
                } else if (bet_mutliplyreset == true){
                    bet_mutliply_pos=1;
                }
                arima_diff+=Math.abs(arima_pred[arima_pred.length-1]-new_price);//how accurate was the guess
            }
            //reset bet_mutliply_pos when it goes higher than bet_mutliply 
            if (bet_mutliply_pos > bet_mutliply){
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
        if (liquidated == false && account_balance < bet){
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
        //print_on_size=1;//remove comment from this line to output all predictions to terminal
        if (predictions > moves_to_make && moves_to_make > 0){//completed run
            complete = true;
        } else if (i%print_on_size == 0){//output info to terminal
            console.log("i="+i+" predictions="+predictions+" wins="+rl_wins+ " loses=" + rl_loses + " holds="+ rl_holds +" draws=" + rl_draws + " rewards=" + rl_reward_total + " account_balance=" + account_balance + " d="+bet_dalembert + " liquidated=" + liquidated );
            //console.log("i="+i+" predicts="+predictions+" w="+rl_wins+ " l=" + rl_loses + " h="+ rl_holds +" d=" + rl_draws + " rs=" + rl_reward_total + " account_balance=" + account_balance + " > p="+new_price+", r="+rl_reward+" a="+arima_pred[arima_pred.length-1]+"/"+new_price+ " ad="+(arima_diff/moves_count));
        }
    }
    //updates time
    time = Date.now();
    date_ob = new Date(time);
    
    //saves and completes
    console.log("moves="+moves_count+"/"+(i-1)+" correct="+rl_wins+" Time(in Minutes) = " + ((dateDiff(date_ob,start_time_ob)/1000)/60));
    file_ob.write(outtext);
    file_ob.write("moves="+moves_count+"/"+(i-1)+" correct="+rl_wins+ " wrong=" + rl_loses+'\r\n');
    file_ob.write("Time(in Minutes) = " + ((dateDiff(date_ob,start_time_ob)/1000)/60) + '\r\n');
    file_ob.end();
    console.log("complete");
}

function arima_prediction(ts){
    //ARIMA = Auto-Regressive Intergrated Moving Average
    //ts = Time Series, an array of price history from oldest to newest
    arima_pred = ARIMA(ts, 59, {//set to predict 59 seconds into the future
        method: 0,      // ARIMA method (Default: 0)
        optimizer: 6,//5,//6, // Optimization method (Default: 6)
        p: 2,      // Number of Autoregressive coefficients
        d: 1,          // Number of Integrated times the series needs to be differenced(to make series stationary)
        q: 0,//3,//0,          // Number of Moving Average Coefficients(Error of the model)
        verbose: false // Output model analysis to console
    })
    arima_change+=Math.abs(arima_pred[arima_pred.length-1]-new_price);//how far off arima is to real prices overall
    /*console.log("===real future prices===");
    console.log(sim_seconds.slice(sim_seconds_pos+1,sim_seconds_pos+1+60));
    console.log("arima predictions")
    console.log(arima_pred);*/
    return arima_pred[arima_pred.length-1];//returns newest prediction(the price 59 seconds into the future)
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