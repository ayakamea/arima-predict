const arima = require('arima')
const ts = Array(1000).fill(0).map((v, i) => Math.sin(i + 1))

const pred = arima(ts.slice(0, 980), 20, {
  method: 0, // ARIMA method (Default: 0)
  optimizer: 5,//6, // Optimization method (Default: 6)
  p: 2, // Number of Autoregressive coefficients
  q: 0, // Number of Moving Average Coefficients
  d: 1, // Number of times the series needs to be differenced
  verbose: false // Output model analysis to console
})
/*
==ARIMA Method (method)==
0 - Exact Maximum Likelihood Method (Default)
1 - Conditional Method - Sum Of Squares
2 - Box-Jenkins Method

==Optimization Method (optimizer)==
Method 0 - Nelder-Mead
Method 1 - Newton Line Search
Method 2 - Newton Trust Region - Hook Step
Method 3 - Newton Trust Region - Double Dog-Leg
Method 4 - Conjugate Gradient
Method 5 - BFGS
Method 6 - Limited Memory BFGS (Default)
Method 7 - BFGS Using More Thuente Method
*/

/*let state = [];
for(let j = 0; j<20; j++){
    state.push(pred[j]-ts[980+j]);
}

console.log(state);
console.log(pred[0] + " and " + ts[980]);
console.log(pred.length + " " + ts.length);*/
console.log(pred, ts.slice(980))//outputs predicts compared to real results