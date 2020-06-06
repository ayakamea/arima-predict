const PolynomialRegression = require("./PolynomialRegressionNode.js");//use polynoimal regression in nodejs
const plotlib = require('nodeplotlib');
const fs = require('fs');//file system for handling files
const ARIMA = require('arima');//ARIMA
const TI_SMA = require('technicalindicators').SMA

//sliver candle history files
let pocketOptionFiles =[
    "po_candle_Silver OTC_1587866014492.txt",//0,this file seems to oppose most of the other files, about 38 hours
    "po_candle_Silver OTC_1587719596346.txt",//1, ARIMA seems to crash on this file
    "po_candle_Silver OTC_1587455546006.txt",//2,
    "po_candle_Silver OTC_1586867046615.txt",//3,
    "po_candle_Silver OTC_1586178780004.txt",//4, about 16 hours
    "po_candle_Silver OTC_1587397862473.txt",//5,
    "po_candle_Silver OTC_1587059247529.txt",//
    "po_candle_Silver OTC_1587603365950.txt",//
    "po_candle_Silver OTC_1586427857972.txt",//
    "po_candle_Silver OTC_1587152308881.txt",//
    "po_candle_Silver OTC_1587837917704.txt",//
    "po_candle_Silver OTC_1586689642762.txt",//
    "po_candle_Silver OTC_1586373632082.txt",//
    "po_candle_Silver OTC_1586843503243.txt",//
    "po_candle_Silver OTC_1587323880478.txt",//
    "po_candle_Silver OTC_1586618652279.txt",//
    "po_candle_Silver OTC_1587371931825.txt",//
    "po_candle_Silver OTC_1586957627512.txt",//
    "po_candle_Silver OTC_1586928846414.txt",//
    "po_candle_Silver OTC_1586726437340.txt",//
    "po_candle_Silver OTC_1586654879469.txt",//
    "po_candle_Silver OTC_1587188663731.txt",//
    "po_candle_Silver OTC_1586397526194.txt",//
    "po_candle_Silver OTC_1587230926804.txt",//
    "po_candle_Silver OTC_1587304104592.txt",//
    "po_candle_Silver OTC_1587000435010.txt",//
    "po_candle_Silver OTC_1586824583418.txt",//
    "po_candle_Silver OTC_1588001733434.txt",//
    "po_candle_Silver OTC_1586533398280.txt",//
    "po_candle_Silver OTC_1586579877808.txt",//
    "po_candle_Silver OTC_1586641717855.txt",//
    "po_candle_Silver OTC_1587047003954.txt",//
    "po_candle_Silver OTC_1586486869639.txt",//
    "po_candle_Silver OTC_1586606798671.txt",//
    "po_candle_Silver OTC_1586748641839.txt",//
    "po_candle_Silver OTC_1587113748697.txt",//
    "po_candle_Silver OTC_1586416571629.txt",//
    "po_candle_Silver OTC_1587219027138.txt",//
    "po_candle_Silver OTC_1587036905254.txt",//
    "po_candle_Silver OTC_1587641738489.txt",//
    "po_candle_Silver OTC_1586762187725.txt",//
    "po_candle_Silver OTC_1587278810152.txt",//
    "po_candle_Silver OTC_1587292545638.txt",//
    "po_candle_Silver OTC_1587357046191.txt",//
    "po_candle_Silver OTC_1586980469122.txt",//
    "po_candle_Silver OTC_1586593706204.txt",//
    "po_candle_Silver OTC_1586673538597.txt",//
    "po_candle_Silver OTC_1586714266406.txt",//
    "po_candle_Silver OTC_1587107117869.txt",//
    "po_candle_Silver OTC_1587255115196.txt",//
    "po_candle_Silver OTC_1587351357002.txt",//
    "po_candle_Silver OTC_1586990463379.txt",//
    "po_candle_Silver OTC_1587181848483.txt",//
    "po_candle_Silver OTC_1587030628068.txt",//
    "po_candle_Silver OTC_1587023262665.txt",//
    "po_candle_Silver OTC_1587249989297.txt",//
    "po_candle_Silver OTC_1586819943925.txt",//
    "po_candle_Silver OTC_1587143473647.txt",//
    "po_candle_Silver OTC_1587274511505.txt",//
    "po_candle_Silver OTC_1587288617133.txt",//
    "po_candle_Silver OTC_1586158298761.txt",//
    "po_candle_Silver OTC_1586814911771.txt",//
    "po_candle_Silver OTC_1586603498556.txt",//
    "po_candle_Silver OTC_1586840431768.txt",//
    "po_candle_Silver OTC_1587019934031.txt",//
    "po_candle_Silver OTC_1587321262003.txt",//
    "po_candle_Silver OTC_1587017175219.txt",//
    "po_candle_Silver OTC_1586978206817.txt",//
    "po_candle_Silver OTC_1586955275591.txt",//
    "po_candle_Silver OTC_1586998517645.txt",//
    "po_candle_Silver OTC_1587579896690.txt",//
    "po_candle_AUDCHF OTC_1586563545314(labeled as sliver wholetime).txt",//this is actual sliver(changed to sliver at beginning),  about 4 hours
];

let stockFiles =[
    ///STOCKS(open for 6+1/2 hours/390 minutes on week days(9:30am to 4:00pm))
    "Bionano Genomics_BNGO_1min_20200524221335",//0, Good//may 22nd
    "Bionano Genomics_BNGO_1min_20200528162235.json",//1, Weaking may 27th
    "Bionano Genomics_BNGO_1min_20200529151115",//2, balanced may 28th
    "Biocept Inc_BIOC_1min_20200524225810",//3, Good
    "Conatus Pharmaceuticals Inc_CNAT_1min_20200524235725",//4, Good
    "Remark Holdings_MARK_1min_20200524224916",//5, Good
    "Inuvo Inc_INUV_1min_20200524232249",//6, Good
    "Genius Brands International Inc_GNUS_1min_20200524235420",//7, Good
    "Diffusion Pharmaceuticals Inc._DFFN_1min_20200524225956",//8, Good
    "StoneMor Partners L.P._STON_1min_20200524235609",//9, Good
    "Bionano Genomics_BNGO_60min_20200525001250",//10
    "Tesla, Inc_TSLA_1min(for 5days total)_20200524204921",//11, risky
    "Sundial Growers Inc_SNDL_60min_20200525001124",//12, 
    "Remark Holdings_MARK_60min_20200525001218",//13, Good(based on limited data)
    "Ra Medical Systems Inc_RMED_1min_20200524224955",//14, Bad, lose more than gain
    "IZEA Worldwide_IZEA_1min_20200524230112",//15, Good and some bad
    "Genetic Technologies Limited_GENE_1min_20200524230044",//16, Bad
    "Coty Inc._COTY_1min_20200524225723",//16, Bad and Good(Mixed)

    //FOREX
    "_USDJPY_daily_20200524234519",//17, Very unstable
    "_USDJPY_60min_20200524234908",//18, good, but not enough data to be sure
    "_USDJPY_1min_20200524233120(GMT time)",//19, read error, armia seems to crash on this
    "_USDCAD_1min_20200524233931",//20, no buy?
    "_GBPUSD_1min_20200524233644",//21, stock not moving at beginning
    "_EURUSD_daily_20200524234259",//22, gaining overall but unstable
    "_EURUSD_60min_20200524235025",//23, good but not enough data
    "_EURUSD_1min_20200524232516(GMT time)",//24, error?
    "_AUDUSD_60min_20200524235133",//25, bad
    "_AUDUSD_1min_20200524233842",//26, didn't buy any

    //CRYPTO
    "__Coinbase_BTCUSD_daily",//27
    "__Coinbase_BTCUSD_1h",//28, very bad, followed by extremely good
    "__Coinbase_ETHUSD_1h",//29, unstable/bad/good-ish
    "__Coinbase_ETHUSD_daily",//30, good to extremely bad
    "__Coinbase_LTCUSD_1h",//31, unstable
    "__Coinbase_LTCUSD_daily",//32, generally good
    "",//
];
let stockFile_index = 0;//index of file to load
let pocketOptionFile_index = 8;//index of file to load

plotFromPOFile(pocketOptionFiles[pocketOptionFile_index]);
//plotFromFile(stockFiles[stockFile_index]);
//plotCandlesticksFromFile(stockFiles[stockFile_index]);


///////////plot from file data
function plotFromPOFile(filename='plotdata.txt', path = 'po/', type='line'){
    let chartTitle = 'PocketOptions - ARIMA price direction prediction';
    let plotArraySeconds = [];//candle history in seconds
    var plotCloses = {x: [],y: [], type: 'scatter', name: 'Closing Price ['+pocketOptionFile_index+']',}; //mode: 'lines+markers'};
    let plotOpens = {x: [],y: [], type: 'scatter', name: 'Opens',};
    let plotHighs = {x: [],y: [], type: type, name: 'Highs',};
    let plotLows = {x: [],y: [], type: type, name: 'Lows',};
    let SMAperiod = 12//24;
    let plotClosesSMA = {x: [],y: [], type: type, name: 'Simple Moving Average ('+SMAperiod+')',};
    let ARIMAperiod = 30;//input
    let ARIMA_p = 2;  //2 Number of Autoregressive coefficients
    let ARIMA_d = 1; //1 Number of Integrated times the series needs to be differenced(to make series stationary)
    let ARIMA_q = 0; //0 Number of Moving Average Coefficients(Error of the model)
    let plotClosesARIMA = {x: [],y: [], type: type,  name: 'ARIMA (p='+ARIMA_p+',d='+ARIMA_d+',q='+ARIMA_q+')('+ARIMAperiod+')',};
    let plotWins = {x: [],y: [], mode: 'markers', marker: {size: 15, symbol: 'circle-open', color: '#338b34'}, type: 'scatter', name: 'ARIMA wins',};
    let plotLoses = {x: [],y: [], mode: 'markers', marker: {size: 15, symbol: 'x-open', color: '#F01A1A'}, type: 'scatter', name: 'ARIMA loses',};
    

    //load candle history from textfile, synchronously reading(wait for reading to complete)
    try {
        let data = fs.readFileSync(path+filename, 'utf8');
        let data_clean = data.replace(/\r?\n?.*\(.*\)\r\n/g,'');//turns to only numbers with commas + \r\n on last values
        plotArraySeconds = data_clean.split(","); 
        console.log("candles file loaded, seconds = about " + plotArraySeconds.length);
    } catch(e) {
        console.log('Error:', e.stack);
    }

    let interval = 60;//60 seconds = 1 minute

    //grabs the hloc from second candles
    for(s=0;s<plotArraySeconds.length-interval;s+=interval){
    //for(s=0;s<2000*interval;s+=interval){
        //set the x(time)
        plotOpens.x.push(s/interval);
        plotCloses.x.push(s/interval);
        plotHighs.x.push(s/interval);
        plotLows.x.push(s/interval);

        //get open and close
        plotOpens.y.push(parseFloat(plotArraySeconds[s]));//open
        plotCloses.y.push(parseFloat(plotArraySeconds[s+(interval-1)]));//close

        //gets high and low
        let t_high = parseFloat(plotArraySeconds[s]);
        let t_low = parseFloat(plotArraySeconds[s]);
        for(t=s;t<s+interval;t++){
            t_low = Math.min(t_low,parseFloat(plotArraySeconds[t]))
            t_high = Math.max(t_high,parseFloat(plotArraySeconds[t]))
        }
        if (t_low<=0){
            t_low=plotLows.y[plotLows.y.length-1];//ignores to prevent extreme outzoom
        }
        plotHighs.y.push(t_high);//high
        plotLows.y.push(t_low);//low
    }

    //candlesticks
    let plotCandleClose = {
        x: plotCloses.x, 
        close: plotCloses.y, 
        high: plotHighs.y, 
        low: plotLows.y, 
        open: plotOpens.y, 
        type: 'candlestick', 
        xaxis: 'x', 
        yaxis: 'y',
        name: 'Candlesticks',
        //increasing: {line: {color: '#17BECF'}}, //will use default green and red if commented out
        //decreasing: {line: {color: '#7F7F7F'}}, 
        //line: {color: 'rgba(31,119,180,1)'}
    };
    //console.log(plotCandleClose)

    //Polynomial Regression
    let PR_fitDegree = 20//10//3;
    let PR_futurePreictions = 10//100;//number of future predictions you want after end of chart(only applies to the end of the chart)
    let plotPR = PolynomialRegressionGet(plotCloses, PR_fitDegree, PR_futurePreictions);

    //ARIMA
    for(let t=ARIMAperiod;t<plotCloses.x.length-1;t++){
        plotClosesARIMA.x.push(t+1);
        plotClosesARIMA.y.push(arima_prediction(plotCloses.y.slice(t-ARIMAperiod,t), ARIMA_p, ARIMA_d, ARIMA_q));

        //checks if win or lose
        //win if ARIMA moved same direction as real price
        if (t>ARIMAperiod){
            let t_dir = Math.sign(plotCloses.y[t+1]-plotCloses.y[t+1-1]);//real direction
            let t_dira = Math.sign(plotClosesARIMA.y[plotClosesARIMA.y.length-1]-plotClosesARIMA.y[plotClosesARIMA.y.length-1-1]);
            if (t_dira == t_dir){//predicted next direction(up/down/netural) correctly
                plotWins.x.push(t+1);
                plotWins.y.push(plotClosesARIMA.y[plotClosesARIMA.y.length-1]);
            } else {
                plotLoses.x.push(t+1);
                plotLoses.y.push(plotClosesARIMA.y[plotClosesARIMA.y.length-1]);
            }
        }
        //simple test, win if ARIMA price is higher than real price
        /*if (plotClosesARIMA.y[plotClosesARIMA.y.length-1] > plotCloses.y[t+1]){
            plotWins.x.push(t+1);
            plotWins.y.push(plotClosesARIMA.y[plotClosesARIMA.y.length-1]);
        } else if (plotClosesARIMA.y[plotClosesARIMA.y.length-1] < plotCloses.y[t+1]){
            plotLoses.x.push(t+1);
            plotLoses.y.push(plotClosesARIMA.y[plotClosesARIMA.y.length-1]);
        }*/
        
        //console.log(plotCloses.y[plotCloses.y.length-1]+" "+t)
        //console.log(plotClosesARIMA.y[plotClosesARIMA.y.length-1])
    }
    plotWins.name+=" ("+plotWins.x.length+")";
    plotLoses.name+=" ("+plotLoses.x.length+")";
    

    //indicators
    plotClosesSMA.y = TI_SMA.calculate({period: SMAperiod, values: plotCloses.y});//SMA prices
    plotClosesSMA.x = plotClosesSMA.y.map(function(item, index){//index
        return (index+SMAperiod-1);
    });//index+12 for SMA
    var layout = {
        title: chartTitle,
    };

    //Basic Pie Chart of wins and loses
    var pie_data = {
        values: [plotWins.x.length, plotLoses.x.length],
        labels: ['ARIMA Wins', 'ARIMA Loses'],
        textinfo: 'percent+value',
        //textinfo: 'label+text+percent+value',
        type: 'pie',
    };

    plotlib.stack([plotCloses, plotClosesARIMA, plotWins, plotLoses], layout);//main graph
    plotlib.stack([pie_data], {height: 400,width: 500});//pie chart
    plotlib.plot();//draw stacks

    //plotlib.plot(pie_data, pie_layout);

    //plotlib.plot([plotCloses, plotClosesARIMA, plotWins, plotLoses], layout);
    //plotlib.plot([plotCloses, plotClosesSMA, plotPR, plotClosesARIMA]);
    //plotlib.plot([plotCandleClose]);
    //plotlib.plot([plotCandleClose, plotCloses, plotClosesSMA]);
}

function plotCandlesticksFromFile(filename='plotdata.json', path = 'stocks/', type='line'){
    let plotArrayFull = loadJSONData(filename, path);//load x,y points file
    let plotCloses = {x: [],y: [], type: 'scatter', name: 'Closes',};
    let plotHighs = {x: [],y: [], type: type, name: 'Highs',};
    let plotLows = {x: [],y: [], type: type, name: 'Lows',};
    let plotClosesSMA = {x: [],y: [], type: type, name: 'Simple Moving Average',}; //line: {color: '#6ac5fe'}};
    let SMAperiod = 12;
    plotArrayFull.reverse();//reverse the array to make it oldest to newest

    /*var trace1 = {
        x: ['2017-01-04', '2017-01-05', '2017-01-06', '2017-01-09', '2017-01-10', '2017-01-11', '2017-01-12', '2017-01-13', '2017-01-17', '2017-01-18', '2017-01-19', '2017-01-20', '2017-01-23', '2017-01-24', '2017-01-25', '2017-01-26', '2017-01-27', '2017-01-30', '2017-01-31', '2017-02-01', '2017-02-02', '2017-02-03', '2017-02-06', '2017-02-07', '2017-02-08', '2017-02-09', '2017-02-10', '2017-02-13', '2017-02-14', '2017-02-15'], 
        close: [116.019997, 116.610001, 117.910004, 118.989998, 119.110001, 119.75, 119.25, 119.040001, 120, 119.989998, 119.779999, 120, 120.080002, 119.970001, 121.879997, 121.940002, 121.949997, 121.629997, 121.349998, 128.75, 128.529999, 129.080002, 130.289993, 131.529999, 132.039993, 132.419998, 132.119995, 133.289993, 135.020004, 135.509995], 
        high: [116.510002, 116.860001, 118.160004, 119.43, 119.379997, 119.93, 119.300003, 119.620003, 120.239998, 120.5, 120.089996, 120.449997, 120.809998, 120.099998, 122.099998, 122.440002, 122.349998, 121.629997, 121.389999, 130.490005, 129.389999, 129.190002, 130.5, 132.089996, 132.220001, 132.449997, 132.940002, 133.820007, 135.089996, 136.270004], 
        low: [115.75, 115.809998, 116.470001, 117.940002, 118.300003, 118.599998, 118.209999, 118.809998, 118.220001, 119.709999, 119.370003, 119.730003, 119.769997, 119.5, 120.279999, 121.599998, 121.599998, 120.660004, 120.620003, 127.010002, 127.779999, 128.160004, 128.899994, 130.449997, 131.220001, 131.119995, 132.050003, 132.75, 133.25, 134.619995], 
        open: [115.849998, 115.919998, 116.779999, 117.949997, 118.769997, 118.739998, 118.900002, 119.110001, 118.339996, 120, 119.400002, 120.449997, 120, 119.550003, 120.419998, 121.669998, 122.139999, 120.93, 121.150002, 127.029999, 127.980003, 128.309998, 129.130005, 130.539993, 131.350006, 131.649994, 132.460007, 133.080002, 133.470001, 135.520004], 
        type: 'candlestick', 
        xaxis: 'x', 
        yaxis: 'y',
        //increasing: {line: {color: '#17BECF'}}, //will use default green and red if commented out
        //decreasing: {line: {color: '#7F7F7F'}}, 
        //line: {color: 'rgba(31,119,180,1)'}
    };*/

    let trace1 = {
        x: [], 
        close: [], 
        high: [], 
        low: [], 
        open: [], 
        type: 'candlestick', 
        xaxis: 'x', 
        yaxis: 'y',
        name: 'Candlesticks',
        increasing: {line: {color: '#17BECF'}}, //will use default green and red if commented out
        decreasing: {line: {color: '#7F7F7F'}}, 
        line: {color: 'rgba(31,119,180,1)'}
    };

    //add values to plot
    trace1.x = plotArrayFull.map((item, index) => index);//returns index number of items
    trace1.close = plotArrayFull.map(item => item.close);//get the close prices
    trace1.open = plotArrayFull.map(item => item.open);//get the close prices
    trace1.high = plotArrayFull.map(item => item.high);//get the close prices
    trace1.low = plotArrayFull.map(item => item.low);//get the close prices

    //indicators
    plotClosesSMA.y = TI_SMA.calculate({period: SMAperiod, values: trace1.close});//SMA prices
    plotClosesSMA.x = trace1.x.map(function(item, index){//index
        return (index+SMAperiod);
    });//index+12 for SMA

    const layout = {
        dragmode: 'zoom', 
        margin: {
          r: 10, 
          t: 25, 
          b: 40, 
          l: 60
        }, 
        showlegend: true, 
        xaxis: {
          autorange: true, 
          domain: [0, 1], 
          range: ['2017-01-03 12:00', '2017-02-15 12:00'], 
          rangeslider: {range: ['2017-01-03 12:00', '2017-02-15 12:00']}, 
          title: 'Date', 
          type: 'date'
        }, 
        yaxis: {
          autorange: true, 
          domain: [0, 1], 
          range: [114.609999778, 137.410004222], 
          type: 'linear'
        }
    };

    plotlib.plot([trace1, plotClosesSMA]);
}


function plotFromFile(filename='plotdata.json', path = 'stocks/', type='line'){
    let plotArrayFull = loadJSONData(filename, path);//load x,y points file
    let plotCloses = {x: [],y: [], type: 'scatter', name: 'Closes',};
    let plotHighs = {x: [],y: [], type: type, name: 'Highs',};
    let plotLows = {x: [],y: [], type: type, name: 'Lows',};
    let SMAperiod = 12;
    let plotClosesSMA = {x: [],y: [], type: type, name: 'Simple Moving Average ('+SMAperiod+')',};
    let ARIMAperiod = 100//30;//input
    let plotClosesARIMA = {x: [],y: [], type: type, name: 'ARIMA ('+ARIMAperiod+')',};
    plotArrayFull.reverse();//reverse the array to make it oldest to newest

    //add values to plot
    plotCloses.x = plotArrayFull.map((item, index) => index);//returns index number of items
    plotCloses.y = plotArrayFull.map(item => item.close);//get the close prices
    plotHighs.x = plotArrayFull.map((item, index) => index);//returns index number of items
    plotHighs.y = plotArrayFull.map(item => item.high);//get the close prices
    plotLows.x = plotArrayFull.map((item, index) => index);//returns index number of items
    plotLows.y = plotArrayFull.map(item => item.low);//get the close prices

    //ARIMA
    for(let t=ARIMAperiod;t<plotCloses.x.length-1;t++){
        plotClosesARIMA.x.push(t+1);
        plotClosesARIMA.y.push(arima_prediction(plotCloses.y.slice(t-ARIMAperiod,t)));
    }

    //indicators
    plotClosesSMA.y = TI_SMA.calculate({period: SMAperiod, values: plotCloses.y});//SMA prices
    plotClosesSMA.x = plotClosesSMA.y.map(function(item, index){//index
        return (index+SMAperiod);
    });//index+12 for SMA

    const layout = [{
        polar: {
          radialaxis: {
            visible: true,
            range: [0, 50]
          }
        }
    }];

    plotlib.plot([plotCloses, plotClosesARIMA]);
    //plotlib.plot([plotHighs, plotCloses, plotLows, plotClosesSMA, plotClosesARIMA]);
}


/////simple plotting examples
function plot2linesOn1Graph(){
    const trace1 = {x: [1, 2, 5, 6], y: [1, 2, 4, 2], type: 'scatter'};
    const trace2 = {x: [3, 4], y: [9, 16], type: 'scatter'};
    plotlib.plot([trace1, trace2]);
}

function plot1line(){
    let data = [{x: [1, 4, 5], y: [1, 2, 1], type: 'line'}];
    plotlib.plot(data);
}

function plot2on1page(){
    const data = [{x: [1, 4, 5], y: [1, 2, 1], type: 'line'}];
    const data2 = [{x: [1, 2, 3], y: [1, 2, 1], type: 'scatter'}];
    plotlib.stack(data);
    plotlib.stack(data2);
    plotlib.plot();
}

///////get PR
function PolynomialRegressionGet(plotPoints, fitDegree=3, futurePreictions=10){
    //Polynomial Regression
    /*let plotPointspart = {x: [], y: []};
    for(let t=0;t<plotPoints.x.length-1000;t++){
        plotPointspart.x.push(t);
        plotPointspart.y.push(plotPoints.y[t]);
    }*/
    let PolynomialRegressionModel = PolynomialRegression.read(plotPoints, fitDegree);
    let terms = PolynomialRegressionModel.getTerms();
    let plotPR = {x: [], y: [], name:"Polynomial Regression ("+fitDegree+")"};
    for(let t=0;t<plotPoints.x.length+futurePreictions;t++){
        plotPR.x.push(t);
        plotPR.y.push(PolynomialRegressionModel.predictY(terms, t));
    }
    return plotPR;
}

////get ARIMA
function arima_prediction(ts, p=2, d=1, q=0){
    //ARIMA = Auto-Regressive Intergrated Moving Average
    //ts = Time Series, an array of price history from oldest to newest
    let arima_pred = ARIMA(ts, 1, {//set to predict 1 count into the future
        method: 0,      // ARIMA method (Default: 0)
        optimizer: 6,//5,//6, // Optimization method (Default: 6)
        p: p,      // Number of Autoregressive coefficients
        d: d,          // Number of Integrated times the series needs to be differenced(to make series stationary)
        q: q,//3,//0,          // Number of Moving Average Coefficients(Error of the model)
        verbose: false // Output model analysis to console
    })
    return arima_pred[arima_pred.length-1];//returns newest prediction(the price 59 seconds into the future)
}

///////////file loading
function loadJSONData(filename='plotdata.json', path = 'stocks/'){
    //read dqnSolver properties from a file to load the model
    try {
        path = path + filename;
        if (path.search('.json') < 0){
            path = path + '.json';
        }
        if(fs.existsSync(path)) {
            let data = fs.readFileSync(path);
            console.log("JSON Data Loaded from file: "+path);
            return JSON.parse(data);//Convert to JSON
        } else {
            console.log("JSON file not found.");
            return -1;
        }
    } catch (err) {
        console.error(err);
        return -2;
    }
}