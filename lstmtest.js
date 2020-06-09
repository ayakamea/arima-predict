const fs = require('fs');//file system for handling files
const tf = require('@tensorflow/tfjs-node');//tensorflow.js
const TI_SMA = require('technicalindicators').SMA;
const plotlib = require('nodeplotlib');

//sliver candle history files
let pocketOptionFiles =[
    "po_candle_Silver OTC_1587866014492.txt",//0,this file seems to oppose most of the other files, about 38 hours
    "po_candle_Silver OTC_1587719596346.txt",//1, ARIMA seems to crash on this file
    "po_candle_Silver OTC_1587455546006.txt",//2,
    "po_candle_Silver OTC_1586867046615.txt",//3,
    "po_candle_Silver OTC_1586178780004.txt",//4, about 16 hours
    "po_candle_Silver OTC_1587397862473.txt",//5,
    "po_candle_Gold OTC_1588042863060.txt",//6 GOLD
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

///stocks
let stockFiles =[
    "Bionano Genomics_BNGO_1min_20200524221335",//Good
    "Biocept Inc_BIOC_1min_20200524225810",//Good
    "Conatus Pharmaceuticals Inc_CNAT_1min_20200524235725",//Good
    "Remark Holdings_MARK_1min_20200524224916",//Good
    "Inuvo Inc_INUV_1min_20200524232249",//Good
    "Genius Brands International Inc_GNUS_1min_20200524235420",//Good
    "Diffusion Pharmaceuticals Inc._DFFN_1min_20200524225956",//Good
    "StoneMor Partners L.P._STON_1min_20200524235609",//Good
    "Tesla, Inc_TSLA_1min(for 5days total)_20200524204921",//risky
];
//let stockArrayFull = loadStockData(stockFiles[0]);//load stock file
//stockArrayFull.reverse();//reverse the array to make data from oldest to newest
let stockArrayFull = loadPOData(pocketOptionFiles[10]);//load pocket options file
let stockArray = [];
let stockArrayDate = [];
for(let t = 0; t< stockArrayFull.length; t++){
    stockArrayDate.push(stockArrayFull[t].date);//get only the closing prices
    stockArray.push(stockArrayFull[t].close);//get only the closing prices
}

//normalize data
let normalizeRatio;
{
    normalize = normalizeArray(stockArray);
    normalizeRatio = normalize.normalizeRatio;
    stockArray = normalize.normalizedArray;
}


//let stockArray_SMA = TI_SMA.calculate({period : 12, values : stockArray});//create an SMA
//stockArray = stockArray_SMA;
//console.log(stockArrayDate)

let inputSize = 1//10;//10 minutes input
let outputSize = 100;//5 future predictions

let stockIn = [];
let stockOut = [];
let percentageForTraining = 0.90;//percentage of data to use for training(unused will be for testing)
let mini = [];//array groups in stockIn/stockOut
for (let t=inputSize;t<(stockArray.length*percentageForTraining)-outputSize;t++){
    //creates input array
    mini = [];
    let tiny = [];
    tiny.push(0);
    for (let r=t-inputSize; r<t; r++){
        stockIn.push(stockArray[r]);
        //tiny[0]=stockArray[r].close;
        //console.log(stockArray[r].close)
        //mini.push(tiny);
        //console.log("mini");
        //console.log(mini);
    }
    //stockIn.push(mini);
    //console.log(tiny);
    //console.log(mini);
    //creates output array
    mini = [];
    for (let r=t; r<t+outputSize; r++){
        //mini.push(stockArray[r].close);
        stockOut.push(stockArray[r]);
        //console.log(stockOut)
        //console.log("r="+r+" stockArray="+stockArray[r]+" stockOut="+stockOut[stockOut.length-1]);
    }
    //stockOut.push(mini);
}

let stockInFull = [];
let stockOutFull = [];
for (let t=inputSize;t<stockArray.length-outputSize;t++){//full version of array(to test on unknown data)
    for (let r=t-inputSize; r<t; r++){
        stockInFull.push(stockArray[r]);
    }
    for (let r=t; r<t+outputSize; r++){
        stockOutFull.push(stockArray[r]);
    }
}
//console.log(stockOut);
console.log("StockIn");
console.log(stockIn.length);
console.log("StockOut");
console.log(stockOut.length);


//this is the model - input > hidden > output
const model = tf.sequential();//creates empty feed-forward nerutal network

///create and add hidden lstm layer
/*const hidden = tf.layers.lstm({//lstm - long-short term memory layer
    units: 10,//inputSize,//10,//8,// number of nodes
    inputShape: [inputSize, 1],//this is for the inputs, 10 inputs
    activation: 'sigmoid',//activation function
});
model.add(hidden);//add the hidden layer to the model*/

let lstm_cells = [];
let lstm_layers = 4;//number of hidden lstm layers
for (let index = 0; index < lstm_layers; index++) {
     lstm_cells.push(tf.layers.lstmCell({units: 10}));
}

model.add(tf.layers.rnn({
  cell: lstm_cells,
  inputShape: [inputSize, 1],
  returnSequences: false
}));


//add output layer
const output = tf.layers.dense({//dense = every layer is connected to every node in the previous layer
    units: outputSize,//there are 5 outputs(5 nodes)
    // here the input shape is "inferred" from the previous layer
    activation: 'sigmoid',//activation function
}); 
model.add(output);//add output layer

//optimizer for model (using gradient descent)
const learningRate = 0.01//0.5;//this is the learning rate
const sgdOpt = tf.train.adam(learningRate);//tf.train.sgd(learningRate);//optimizer that tries to get the lowest error

//compile model
model.compile({
    optimizer: sgdOpt,
    loss: tf.losses.meanSquaredError,//this is the loss function used
});

//loads or creates test data

const xs = tf.tensor3d(stockIn, [(stockIn.length/inputSize), inputSize, 1]);/*[//inputs
    [0, 0],//input 1
    [0.5, 0.5],//input 2
    [1, 1]//input 3
]);*/
const xsFull = tf.tensor3d(stockInFull, [(stockInFull.length/inputSize), inputSize, 1]);//inputs

const ys = tf.tensor2d(stockOut, [(stockOut.length/outputSize), outputSize]);/*[//outputs, desired outputs from xs data
   // [0.1, 0.1, 0.02],
   // [0.4, 0.05, 0.22],
   // [0.2, 0.9, 0.02]
    [1],
    [0.5],
    [0]
]);*/
const ysFull = tf.tensor2d(stockOutFull, [(stockOutFull.length/outputSize), outputSize]);//outputs, desired outputs from xs data

xs.print();
ys.print();

//train model on data
train().then(() => {
    console.log('training complete')
    const saveResults = model.save("file://models/lstmtestmodel")//save the model
    //predicts using inputs
    let predictions = model.predict(xsFull);
    console.log('predictions');
    predictions.print();
    console.log('real');
    ys.print();
    //console.log(ys.dataSync());
    let t_realdata=ysFull.dataSync();//return as 1dArray
    let t_data=predictions.dataSync();//return as 1dArray
    t_realdata=normalizeArrayRevert(t_realdata, normalizeRatio)//convert back to un-normalized data
    t_data=normalizeArrayRevert(t_data, normalizeRatio)//convert back to un-normalized data
    let realdata = {x: [],y: [],type: 'line',name: 'Closing Price'}
    let outdata = {
        x: [],
        y: [],
        type: 'line',
        name: 'LSTM prediction(training data)'
    }
    let outdata_new = {
        x: [],
        y: [],
        type: 'line',
        name: 'LSTM prediction(unknown data)'
    }

    let trainout_length = ys.dataSync().length;//size of training set
    for(let t=0;t<t_data.length;t+=outputSize){
        realdata.x.push(t/outputSize);
        realdata.y.push(t_realdata[t]);
        if (t<trainout_length){//known data
            outdata.x.push(t/outputSize);
            outdata.y.push(t_data[t]);
        }
        /*if (t>=trainout_length-1){//unknown data
            outdata_new.x.push(t);//predictions from completely unknown data
            outdata_new.y.push(t_data[t]);
        }*/
    }

    for(let t=trainout_length;t<trainout_length+outputSize;t++){//unknown data
        outdata_new.x.push((trainout_length/outputSize)+(t-trainout_length)-1);//predictions from completely unknown data
        outdata_new.y.push(t_data[t]);
    }
    /*console.log(t_realdata);
    console.log(t_data)
    console.log("trainout_length="+trainout_length+" Full="+(ysFull.dataSync().length)+" outdata_new.x.length="+outdata_new.x.length+" outputSize="+outputSize)
    console.log("realdata "+t_realdata[1]+" "+t_realdata[100]+" "+t_realdata[101])
    console.log("data "+t_data[1]+" "+t_data[100]+" "+t_data[101])*/
    //console.log(outdata);
    plotlib.plot([realdata,outdata,outdata_new]);
});
    
async function train(){
    //for (let i = 0; i < 10; i++){//batch of tests, can use epochs instead of for loop
        const config = {
            shuffle: true,//shuffle the inputs each time(good if your training off the same data repeatively)
            epochs: 1000,//20,//200,//10,//100,
        }
        const response = await model.fit(xs, ys, config);
        console.log(response.history.loss[0])
    //}
}

/*const config = {
    //verbose: true,
    epochs: 100
}//fit is async(returns a promise)
model.fit(xs, ys, config).then((response) => console.log(response.history.loss[0]));//returns how training is going
*/

//get inputs(x=input, y=output)
/*const xs = tf.tensor2d([//inputs
    [0.25, 0.92],//input 1
    [0.12, 0.3],//input 2
    [0.4, 0.74],//input 3
    [0.1, 0.22],//input 4
]);*/

//predicts using inputs
//let predictions = model.predict(xs);
//predictions.print();

//console.log(model);

function loadPOData(filename='pocketoption_data.txt', path = 'po/', convertSecondsToMintues=1){
    //load candle history from textfile, synchronously reading(wait for reading to complete)
    try {
        let newArray = [];
        let data = fs.readFileSync(path+filename, 'utf8');
        let data_clean = data.replace(/\r?\n?.*\(.*\)\r\n/g,'');//turns to only numbers with commas + \r\n on last values
        newArray = data_clean.split(","); 
        newArray = newArray.map(Number);//convert to numbers;
        console.log("candles file loaded, seconds = " + newArray.length);
        if (convertSecondsToMintues > 0){
            //grabs the hloc from second candles
            let interval = 60*convertSecondsToMintues;
            let outCloses = [];
            for(s=0;s<newArray.length-interval;s+=interval){
                let t_o = newArray[s];//open
                let t_c = newArray[s+(interval-1)];//close
                let t_d = s/interval;//date in minutes

                //gets high and low
                let t_h = newArray[s];
                let t_l = newArray[s];
                for(t=s;t<s+interval;t++){
                    t_l = Math.min(t_l,newArray[t])
                    t_h = Math.max(t_h,newArray[t])
                }
                if (t_l<=0){
                    t_l=t_c;//ignores to prevent extreme outzoom
                }

                outCloses.push({//adds to object array
                    high: t_h,
                    low: t_l,
                    open: t_o,
                    close: t_c,
                    date: t_d,
                });
            }
            return outCloses;//returns data with given minute interval
        } else {
            return newArray;//return second by second array
        }  
    } catch(e) {
        console.log('Error:', e.stack);
    }
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

function normalizeArray(nArray){//make number between 0 and 1
    var normalizeRatio = Math.max.apply(this, nArray) / 100;

    nArray = nArray.map(v => ((v / normalizeRatio)/100));
    return {normalizedArray: nArray, normalizeRatio: normalizeRatio};//return as object
}
function normalizeArrayRevert(nArray, nRatio){//back to original values
    nArray = nArray.map(v => ((v * nRatio) * 100));
    return nArray;
}