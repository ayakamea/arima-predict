const fs = require('fs');//file system for handling files
const ARIMA = require('arima');//ARIMA
const Alpaca = require('@alpacahq/alpaca-trade-api')//Alpaca API
const API_KEY = '';//'YOUR_API_KEY_HERE'//https://www.alphavantage.co/support/#api-key
const API_SECRET = '';//'YOUR_API_SECRET_HERE';
const USE_POLYGON = false;  // by default we use the Alpaca data stream but you can change that

const MINUTE = 60000
const SideType = { BUY: 'buy', SELL: 'sell' }
const PositionType = { LONG: 'long', SHORT: 'short' }

/////////////////////LONGBUYSELL OBJECT START
class LongBuySell {
  constructor ({ keyId, secretKey, paper = true, shares_to_buy = 0}) {
    this.alpaca = new Alpaca({
      keyId: keyId, 
      secretKey: secretKey, 
      paper: paper,
      usePolygon: USE_POLYGON
    })

    //let stocks = ['DOMO', 'TLRY', 'SQ', 'MRO', 'AAPL', 'GM', 'SNAP', 'SHOP', 'SPLK', 'BA', 'AMZN', 'SUI', 'SUN', 'TSLA', 'CGC', 'SPWR', 'NIO', 'CAT', 'MSFT', 'PANW', 'OKTA', 'TWTR', 'TM', 'RTN', 'ATVI', 'GS', 'BAC', 'MS', 'TWLO', 'QCOM']
    //stocks that did good in past arima tests, should be all cheap penny stocks
    let stocks = ['BIOC','BNGO','CNAT','MARK','INUV','GNUS','DFFN','STON'];//will only buy and sell the first stock on this list currently
    this.stockList = stocks.map(item => ({ name: item, pc: 0 }))

    this.buys=0;
    this.sells=0;
    this.predictions=0;
    this.shares_to_buy=shares_to_buy;
    this.buy_price = 0.0;
    this.rewards=0;
    this.wins=0;
    this.loses=0;

    ///possibly unneed variables below
    this.long = []
    this.short = []
    this.qShort = null
    this.qLong = null
    this.adjustedQLong = null
    this.adjustedQShort = null
    this.blacklist = new Set()
    this.longAmount = 0
    this.shortAmount = 0
    this.timeToClose = null
  }

  //////////////////////RUN START
  async run () {
    // First, cancel any existing orders so they don't impact our buying power.
    await this.cancelExistingOrders()

    // Wait for market to open.
    log('Waiting for market to open...')
    await this.awaitMarketOpen()
    log('Market opened.')

    // Rebalance the portfolio every minute, making necessary trades.
    var spin = setInterval(async () => {
      // Figure out when the market will close so we can prepare to sell beforehand.
      try {
        let clock = await this.alpaca.getClock()
        let closingTime = new Date(clock.next_close.substring(0, clock.next_close.length - 6))
        let currTime = new Date(clock.timestamp.substring(0, clock.timestamp.length - 6))
        this.timeToClose = Math.abs(closingTime - currTime)
      } catch (err) {
        log(err.error)
      }

      const INTERVAL = 15 // minutes

      if (this.timeToClose < (MINUTE * INTERVAL)) {
        // Close all positions when 15 minutes til market close.
        log('Market closing soon. Closing positions.')

        try {
          let positions = await this.alpaca.getPositions()

          await Promise.all(positions.map(position => this.submitOrder({
            quantity: Math.abs(position.qty),
            stock: position.symbol,
            side: position.side === PositionType.LONG ? SideType.SELL : SideType.BUY
          })))
        } catch (err) {
          log(err.error)
        }

        clearInterval(spin)
        log(`Sleeping until market close (${INTERVAL} minutes).`)

        setTimeout(() => {
          // Run script again after market close for next trading day.
          this.run()
        }, MINUTE * INTERVAL)
      } else {
        //buy/sell/hold using arima
        await this.arimaBuySell();
      }
    }, MINUTE)
  }
  //////////////RUN END

  async arimaBuySell() {

    //get account equity(total value of everything owned)
    let account_equity = await this.getAccountEquity();

    //get the shares currently in possession for the stock
    let shares_bought = await this.getStockSharesBought(stocks[0]);

    ///gets a 60 minute recent history of stock
    let stockArray = await this.getStockPrices(stocks[0]);

    ///gets the next predicted price
    let predicted_price = await arima_prediction(stockArray);

    //prints out stats
    console.log("Equity="+account_equity+" stock="+stocks[0]+" shares="+shares_bought+" price="+stockArray[stockArray.length-1]+" prediction="+predicted_price)

    ///check if price is forecasted to up or down
    let price_forecast = 0;//hold
    if (predicted_price > stockArray[stockArray.length-1]){
      price_forecast = 1;//up
    } else if (predicted_price > stockArray[stockArray.length-1]){
      price_forecast = 2;//down
    }

    ///buy/sell/hold based on forecast
    if (price_forecast == 1){//up
      if (shares_bought == 0){//buy shares
        this.buy_price=parseFloat(stockArray[stockArray.length-1]);//saves buying price
        shares_bought = this.shares_to_buy;
        if (shares_to_buy == 0){//buy max if none was set by user
          shares_bought = Math.floor((account_equity-1)/this.buy_price);//buys max stocks-1
        }
        //order shares
        try {
          await this.submitOrder({
            shares_bought,
            stock: stocks[0],
            side: SideType.BUY
          })
        } catch (err) {
          log(err.error)
        }  
        this.buys += 1;
      } else {holds+=1;};//holds position 
    } else if (price_forecast == 2){//down
        if (shares_bought > 0){
            //sell order shares
            try {
              await this.submitOrder({
                shares_bought,
                stock: stocks[0],
                side: SideType.SELL
              })
            } catch (err) {
              log(err.error)
            }
            shares_bought=shares_bought*-1;//shares have been sold
            this.sells += 1;
            //compares sell price with buy price to know if it's prediction was correct
            if (stockArray[stockArray.length-1] > this.buy_price){
              this.rewards-=1;
              this.wins+=1;
            } else if (stockArray[stockArray.length-1] < this.buy_price){
              this.rewards+=1;
              this.loses+=1;
            }
        }
    }
    this.predictions+=1;
  }

  async getAccountEquity(){
    //returns account equity
    let result;
    try {
      result = await this.alpaca.getAccount()
    } catch (err) {
      log(err.error)
    }
    return result.equity;
  }

  async getStockSharesBought(stockname=""){
    //gets the number of shares you currenctly have for a stock
    let shares = 0;
    let position
    try {
      position = await this.alpaca.getPosition(stockname);
      shares = Math.abs(position.qty);
      //let symbol = position.symbol//stock symbol
      //let position_side = position.side//position side, Long or Short(all should be Long)
    } catch (err) {
      log(err.error)
    }
    return shares;
  }

  //get current price history of stock.
  async getStockPrices(stockname = "", get_limit=60) {
      return new Promise(async (resolve) => {
        try {
          let resp = await this.alpaca.getBars('minute', stockname, { limit: get_limit })
          // polygon and alpaca have different responses to keep backwards
          // compatibility, so we handle it a bit differently
          let outprices = [];
          if (this.alpaca.configuration.usePolygon) {
            for (let j=0;j<resp[stockname].length;j++){
              outprices.push(resp[stockname][j].c);//saves close prices
            }
          } else{
            for (let j=0;j<resp[stockname].length;j++){
              outprices.push(resp[stockname][j].closePrice);//saves close prices
            }
          }
          resolve(outprices);//will return the close prices list
        } catch (err) {
          log(err.message)
        }
      })
  }

  // Spin until the market is open
  async awaitMarketOpen () {
    return new Promise(resolve => {
      const check = async () => {
        try {
          let clock = await this.alpaca.getClock()
          if (clock.is_open) {
            resolve()
          } else {
            let openTime = new Date(clock.next_open.substring(0, clock.next_close.length - 6))
            let currTime = new Date(clock.timestamp.substring(0, clock.timestamp.length - 6))
            this.timeToClose = Math.floor((openTime - currTime) / 1000 / 60)
            log(`${this.timeToClose} minutes til next market open.`)
            setTimeout(check, MINUTE)
          }
        } catch (err) {
          log(err.error)
        }
      }
      check()
    })
  }

  async cancelExistingOrders () {
    let orders
    try {
      orders = await this.alpaca.getOrders({
        status: 'open',
        direction: 'desc'
      })
    } catch (err) {
      log(err.error)
    }

    return Promise.all(orders.map(order => {
      return new Promise(async (resolve) => {
        try {
          await this.alpaca.cancelOrder(order.id)
        } catch (err) {
          log(err.error)
        }
        resolve()
      })
    }))
  }

  // Submit an order if quantity is above 0.
  async submitOrder ({ quantity, stock, side }) {
    return new Promise(async (resolve) => {
      if (quantity <= 0) {
        log(`Quantity is <=0, order of | ${quantity} ${stock} ${side} | not sent.`)
        resolve(true)
        return
      }

      try {
        await this.alpaca.createOrder({
          symbol: stock,
          qty: quantity,
          side,
          type: 'market',
          time_in_force: 'day'
        })
        log(`Market order of | ${quantity} ${stock} ${side} | completed.`)
        resolve(true)
      } catch (err) {
        log(`Order of | ${quantity} ${stock} ${side} | did not go through.`)
        resolve(false)
      }
    })
  }
}
//////////////////////LONGBUYSELL OBJECT END

async function arima_prediction(ts,return_predictions=6){
  //ARIMA = Auto-Regressive Intergrated Moving Average
  //ts = Time Series, an array of price history from oldest to newest
  arima_pred = ARIMA(ts, return_predictions, {//set to predict time steps into the future
      method: 0,      // ARIMA method (Default: 0)
      optimizer: 6,//5,//6, // Optimization method (Default: 6)
      p: 2,      // Number of Autoregressive coefficients
      d: 1,          // Number of Integrated times the series needs to be differenced(to make series stationary)
      q: 0,//10,//3,//0,          // Number of Moving Average Coefficients(Error of the model)
      verbose: false // Output model analysis to console
  })
  //arima_change+=Math.abs(arima_pred[arima_pred.length-1]-new_price);//how far off arima is to real prices overall
  /*console.log("===real future prices===");
  console.log(sim_seconds.slice(sim_pos+1,sim_pos+1+60));
  console.log("arima predictions")
  console.log(arima_pred);*/
  return arima_pred[arima_pred.length-1];//returns newest prediction(the price 59 seconds into the future)
}

//short version of console.log
function log (text) {
  console.log(text)
}

//Create and Run the LongBuySell instant
let ls = new LongBuySell({
  keyId: API_KEY,
  secretKey: API_SECRET,
  paper: true
})

ls.run()