const jsonfile = require('jsonfile')
const fs = require('fs')

/////////////////Alpha Vantage: https://medium.com/alpha-vantage/get-started-with-alpha-vantage-data-619a70c7f33a
//(up to 5 API requests per minute and 500 requests per day)
//Welcome to Alpha Vantage! 
//Please record this API key for future access to Alpha Vantage.
const Stocks = require('stocks.js');//Alpha Vantage

var API_key = "";//YOUR API key here
var stocks = new Stocks(API_key);


stockdataget();//download stock data
/*let stockarray = loadStockData('Bionano Genomics_BNGO_1min_20200524221335');
stockarray.reverse();//reverse the array to make it oldest to newest

console.log(stockarray[0].close+" "+stockarray[100].close);*/

async function stockdataget(){
    //symbol = 'BITUSD';//bitcoin/usd(DOES NOT WORK!!)
    let symbol = 'TSLA';let n = 'Tesla, Inc.';//($816.88)
    symbol = 'BNGO';n = 'Bionano Genomics'//($0.47)
    /*symbol = 'MARK';n = 'Remark Holdings'//($2.26)
    symbol = 'RMED';n = 'Ra Medical Systems Inc.'//($0.49)
    symbol = 'COTY';n = 'Coty Inc.'//($3.75)
    symbol = 'BIOC';n = 'Biocept Inc'//($0.50)
    symbol = 'DFFN';n = 'Diffusion Pharmaceuticals Inc.'//($1.24)
    symbol = 'GENE';n = 'Genetic Technologies Limited'//($2.40)
    symbol = 'IZEA';n = 'IZEA Worldwide'//($0.55)
    symbol = 'INUV';n = 'Inuvo Inc'//($0.39)
    //symbol = 'USDJPY';n = ''//currency pairs
    symbol = 'GNUS';n = 'Genius Brands International Inc'//($1.39)
    symbol = 'STON';n = 'StoneMor Partners L.P.'//($0.63)
    symbol = 'CNAT';n = 'Conatus Pharmaceuticals Inc'//($0.56)
    symbol = 'ARTL';n = 'Artelo Biosciences'//($1.30)//unusually small amount of data given
    symbol = 'SNDL';n = 'Sundial Growers Inc'//($0.85)*/

    let interval = '1min';//max seems to be 5 days worth if no amount is given
    //interval = '60min';
    //interval = 'daily';

    var result = await stocks.timeSeries({
        symbol: symbol,
        interval: interval,
        //amount: 10,//comment this out for max results count
        //start: new Date('2017-07-01'),
        //end: new Date('2017-07-09'),
    });
    saveStockData(result,n+"_"+symbol+"_"+interval);
    console.log(result);
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

function dateTimeLine(date1){
    // get the date
    let date = ("0" + date1.getDate()).slice(-2);//day
    let month = ("0" + (date1.getMonth() + 1)).slice(-2);
    let year = date1.getFullYear();
    let hours = ("0" + date1.getHours()).slice(-2);
    let minutes =  ("0" + date1.getMinutes()).slice(-2);
    let seconds = ("0" + date1.getSeconds()).slice(-2);

    return year + month + date + hours + minutes + seconds;
}