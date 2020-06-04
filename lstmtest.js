const fs = require('fs');//file system for handling files
const tf = require('@tensorflow/tfjs-node');//tensorflow.js
const TI_SMA = require('technicalindicators').SMA;
const plotlib = require('nodeplotlib');

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
let stockArrayFull = loadStockData(stockFiles[0]);//load stock file
stockArrayFull.reverse();//reverse the array to make data from oldest to newest
let stockArray = [];
let stockArrayDate = [];
for(let t = 0; t< stockArrayFull.length; t++){
    stockArrayDate.push(stockArrayFull[t].date);//get only the closing prices
    stockArray.push(stockArrayFull[t].close);//get only the closing prices
}
//let stockArray_SMA = TI_SMA.calculate({period : 12, values : stockArray});//create an SMA
//stockArray = stockArray_SMA;
console.log(stockArrayDate)

let inputSize = 10;//10 minutes input
let outputSize = 1;//5 future predictions

let stockIn = [];
let stockOut = [];
let mini = [];//array groups in stockIn/stockOut
for (let t=inputSize;t<stockArray.length-outputSize;t++){
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
    }
    //stockOut.push(mini);
}
console.log("StockIn");
console.log(stockIn.length);
console.log("StockOut");
console.log(stockOut.length);


//this is the model - input > hidden > output
const model = tf.sequential();//creates empty feed-forward nerutal network

///create and add hidden lstm layer
const hidden = tf.layers.lstm({//lstm - long-short term memory layer
    units: 10,//inputSize,//10,//8,// number of nodes
    inputShape: [inputSize, 1],//this is for the inputs, 10 inputs
    activation: 'sigmoid',//activation function
});
model.add(hidden);//add the hidden layer to the model


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

const ys = tf.tensor2d(stockOut, [(stockOut.length/outputSize), outputSize]);/*[//outputs, desired outputs from xs data
   // [0.1, 0.1, 0.02],
   // [0.4, 0.05, 0.22],
   // [0.2, 0.9, 0.02]
    [1],
    [0.5],
    [0]
]);*/

xs.print();
ys.print();

//train model on data
train().then(() => {
    console.log('training complete')
    //predicts using inputs
    let predictions = model.predict(xs);
    console.log('predictions');
    predictions.print();
    console.log('real');
    ys.print();
    //console.log(ys.dataSync());
    let t_realdata=ys.dataSync();//return as 1dArray
    let t_data=predictions.dataSync();//return as 1dArray
    let realdata = {x: [],y: [],type: 'line',name: 'Closing Price'}
    let outdata = {
        x: [],
        y: [],
        type: 'line',
        name: 'LSTM prediction'
    }
    for(let t=0;t<t_data.length;t++){
        realdata.x.push(t);
        realdata.y.push(t_realdata[t]);
        outdata.x.push(t);
        outdata.y.push(t_data[t]);
    }
    //console.log(outdata);
    plotlib.plot([realdata,outdata]);
});
    
async function train(){
    //for (let i = 0; i < 10; i++){//batch of tests, can use epochs instead of for loop
        const config = {
            shuffle: true,//shuffle the inputs each time(good if your training off the same data repeatively)
            epochs: 10,//100,
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