const plotlib = require('nodeplotlib');
const fs = require('fs');//file system for handling files
const TI_SMA = require('technicalindicators').SMA

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
let stockFile_index = 6;//index of file to load

plotFromFile(stockFiles[stockFile_index]);

///////////plot from file data
function plotFromFile(filename='plotdata.json', path = 'stocks/', type='line'){
    let plotArrayFull = loadJSONData(filename, path);//load x,y points file
    let plotCloses = {x: [],y: [], type: 'scatter', name: 'Closes',};
    let plotHighs = {x: [],y: [], type: type, name: 'Highs',};
    let plotLows = {x: [],y: [], type: type, name: 'Lows',};
    let plotClosesSMA = {x: [],y: [], type: type, name: 'Simple Moving Average',};
    let SMAperiod = 12;
    plotArrayFull.reverse();//reverse the array to make it oldest to newest

    //add values to plot
    plotCloses.x = plotArrayFull.map((item, index) => index);//returns index number of items
    plotCloses.y = plotArrayFull.map(item => item.close);//get the close prices
    plotHighs.x = plotArrayFull.map((item, index) => index);//returns index number of items
    plotHighs.y = plotArrayFull.map(item => item.high);//get the close prices
    plotLows.x = plotArrayFull.map((item, index) => index);//returns index number of items
    plotLows.y = plotArrayFull.map(item => item.low);//get the close prices

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

    plotlib.plot([plotHighs, plotCloses, plotLows, plotClosesSMA]);
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