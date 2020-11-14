let express = require('express');
let app = express();
const { getAccountData, getLatestPrice, sendOrder, getServerTime } = require('./src/api')
require('dotenv').config();

const fs = require('fs');

app.get('/123', (req, res) => {
  let rawdata = fs.readFileSync('history.json'); 
  let collection = JSON.parse(rawdata); 
  res.json(collection)
})

app.listen(4002, () => {
  const ACCESS_KEY = process.env.ACCESS_KEY;
  const SECRET_KEY = process.env.SECRET_KEY;
  const stableBalance = 150000;
  const commision = 1100; // 0.01%
  let isInitialPrice = true;
  let history = [];
  let variableHistory = {};

  let currency = {
    BNB: {
      balance: '',
    },
    BTC: {
      balance: '',
    },
  };

  let pairs = {
    BNBBTC: {
      base: 'BNB',
      qoute: 'BTC',
      pair: 'BNBBTC',
      initialPrice: '',
      orderHistoryPrice: [],
      currentSide: '',
      precision: {
        BNB: 2,
        BTC: 2,
      },
    },
  };

  

  const startScript = () => {

    setInterval(() => {
      let day = new Date().getDate();
      let hours = new Date().getHours();
      let minutes = new Date().getMinutes();
      let seconds = new Date().getSeconds();
      // if (hours == 0 && minutes == 0) {
        variableHistory.localTime = day+':'+hours+':'+minutes+':'+seconds;
        checkTime();
      // }
    }, 60000);
    
  };

  startScript();

  const checkTime = () => {
    // let hours = new Date().getHours();
    // let minutes = new Date().getMinutes();
    // console.log('START SCRIPT 1')
    // if (hours === 0 && minutes === 0) {
      getServerTime().then(time => {
        // console.log('h / m', hours, ' : ', minutes);
        const dayExc = new Date().getDate();
        const hoursExc = new Date(time).getHours();
        const minutesExc = new Date(time).getMinutes();
        const secondsExc = new Date(time).getSeconds();
        // console.log('hoursExc', hoursExc+':'+minutesExc);
        // if (hoursExc === 0 && minutesExc === 0) {
          loadBalances().then(() => {
            variableHistory.startTime = dayExc+':'+hoursExc +':'+minutesExc+':'+secondsExc;
            getPrice();
          });
        // }
      })
    // }
  };

  const loadBalances = () => 
    getAccountData(ACCESS_KEY, SECRET_KEY, {}).then(account=>{
      variableHistory.loadBalanse = true;
      let currencyKeys = Object.keys(currency);
      let newCurrency = {};
      account.forEach(element => {
        if (currencyKeys.includes(element.asset)) {
          let { asset, free } = element;
          newCurrency = {
            ...newCurrency,
            [asset]: {
              balance: free,
            }
          };
        }
      });
      currency = {...newCurrency};
      variableHistory.currency = currency;
    })
    .catch(err => {
      variableHistory.loadBalancesFAILS = err;
    })

  const getPrice = () => {
    const allPairs = Object.keys(pairs);
    getLatestPrice(allPairs).then(lastPrices => {
      // Load first prices
      if (isInitialPrice) {
        console.log('INITIAL PRICE', pairs);
        for (let i = 0; i < lastPrices.length; i++) {
          pairs[lastPrices[i].symbol].initialPrice = lastPrices[i].price;
        };
        console.log('INITIAL PRICE FINISH', pairs);
        isInitialPrice = false;
      };

      // console.log('lastPrices', lastPrices[0].price)
      // variableHistory.lastPrice = lastPrices;

      checkPrice(lastPrices);
    });
  };

  const checkPrice = (lastPrices) => {
    // let i = 0;
    // while (i < lastPrices.length) {

      const currentPair = pairs[lastPrices[0].symbol]; // TRXBTC {}
      const lastOrderPrice = currentPair.orderHistoryPrice[currentPair.orderHistoryPrice.length - 1] || currentPair.initialPrice;
      const newPrice = lastPrices[0].price; // 0.12345678

      const minPricePositiv = Number(lastOrderPrice) + (lastOrderPrice / 100);
      const minPriceNegativ = Number(lastOrderPrice) - (lastOrderPrice / 100);

      // variableHistory.initialPrice = currentPair.initialPrice;
      variableHistory.A_0_pairs = {...pairs};
      variableHistory.A_1_lastPrices = lastPrices;
      variableHistory.A_2_currentPair = {...currentPair};
      variableHistory.A_3_lastOrderPrice = lastOrderPrice;
      variableHistory.A_4_newPrice = newPrice;

      variableHistory.A_5_minPricePositiv = minPricePositiv;
      variableHistory.A_6_minPriceNegativ = minPriceNegativ;
      
      const currentSide = currentPair.currentSide;

      if (newPrice >= minPricePositiv) {
        // BUY
        currentPair.orderHistoryPrice.push(newPrice);

        variableHistory.B_1_currentPairAfterPush = {...currentPair};
        variableHistory.B_2_pairsAfterPush = {...pairs};

        if (currentSide !== "buy") {
          currentPair.currentSide = "buy";
          
          variableHistory.C_1_newPrice = newPrice;
          variableHistory.C_2_ifNewPriceMoreMinPricePositiv = newPrice >= minPricePositiv;
          variableHistory.C_3_currentSide = "buy";
          variableHistory.C_4_minPricePositiv = minPricePositiv;
          variableHistory.C_5_minPriceNegativ = minPriceNegativ;

          variableHistory.C_6_currentPairAfterPush = {...currentPair};
          variableHistory.C_7_pairsAfterPush = {...pairs};
  
          preparingOrder(currentPair, 'buy', newPrice);
          // break;
        } else {

          variableHistory.B_3_pushedNewMaxPrice = 'ADD NEW MAX PRICE';

          let data = fs.readFileSync('history.json');
          let collection = JSON.parse(data);
          collection.push(variableHistory);
          fs.writeFileSync('history.json', JSON.stringify(collection))
          variableHistory = {};
        }
        
      } else if (newPrice <= minPriceNegativ) {
        // SELL
        currentPair.orderHistoryPrice.push(newPrice);

        variableHistory.B_1_currentPairAfterPush = {...currentPair};
        variableHistory.B_2_pairsAfterPush = {...pairs};

        if (currentSide !== "sell") {
          currentPair.currentSide = 'sell';

          variableHistory.C_1_newPrice = newPrice;
          variableHistory.C_2_ifNewPriceMoreMinPricePositiv = newPrice <= minPriceNegativ;
          variableHistory.C_3_currentSide = "sell";
          variableHistory.C_4_minPricePositiv = minPricePositiv;
          variableHistory.C_5_minPriceNegativ = minPriceNegativ;

          variableHistory.C_6_currentPairAfterPush = {...currentPair};
          variableHistory.C_7_pairsAfterPush = {...pairs};

          preparingOrder(currentPair, 'sell', newPrice);

        } else {

          variableHistory.B_3_pushedNewMinPrice = 'ADD NEW MIN PRICE';

          let data = fs.readFileSync('history.json');
          let collection = JSON.parse(data);
          collection.push(variableHistory);
          fs.writeFileSync('history.json', JSON.stringify(collection))
          variableHistory = {};
        }

      } else {

        variableHistory.A_7_newPriseCheckFail = 'Not BUY not SELL';
        variableHistory.A_8_currentSide = currentPair.currentSide;
        variableHistory.A_9_newPrice = newPrice;
        variableHistory.A_10_minPricePositiv = minPricePositiv;
        variableHistory.A_11_minPriceNegativ = minPriceNegativ;
  
        let data = fs.readFileSync('history.json');
        let collection = JSON.parse(data);
        collection.push(variableHistory);
        fs.writeFileSync('history.json', JSON.stringify(collection))
        variableHistory = {};
      }

      // if (newPrice <= minPriceNegativ && currentSide !== "sell") {
      //   // SELL
      //   console.log('SEL')

      //   pairs[lastPrices[i].symbol].currentSide = 'sell';
      //   pairs[lastPrices[i].symbol].orderHistoryPrice.push(newPrice);

      //   variableHistory.newPrice = newPrice;
      //   variableHistory.ifNewPriceLessMinPriceNegativ = newPrice <= minPriceNegativ && currentSide !== "sell"
      //   variableHistory.newPricePushed = pairs[lastPrices[i].symbol].orderHistoryPrice;
      //   variableHistory.currentSide = 'sell';
      //   variableHistory.minPriceNegativ = minPriceNegativ;

      //   preparingOrder(currentPair, 'sell', newPrice);
      //   // break;
      // }
      
      // variableHistory.newPriseCheckFail = 'Not BUY not SELL';
      // variableHistory.currentSide = pairs[lastPrices[i].symbol].currentSide;
      // variableHistory.minPricePositiv = minPricePositiv;
      // variableHistory.minPriceNegativ = minPriceNegativ;

      // let data = fs.readFileSync('history.json');
      // let collection = JSON.parse(data);
      // collection.push(variableHistory);
      // fs.writeFileSync('history.json', JSON.stringify(collection))
      // variableHistory = {};

    //   i++;
    // };
  };

  const preparingOrder = (currentPair, side, newPrice) => {

    const whatCrypto = side === 'sell' ? currentPair.base : currentPair.qoute; // TRX or BTC
    const precision = currentPair.precision[whatCrypto]; // 8
    const pair = currentPair.pair; // TRXBTC
    let balance = (currency[whatCrypto].balance) / 100;
    
    variableHistory.D_1_whatCrypto = whatCrypto;
    variableHistory.D_2_precision = precision;
    variableHistory.D_3_pair = pair;
    variableHistory.D_4_balance = balance;

    if (side === 'buy') {
      balance = balance / newPrice; // BTC convert to TRX
      // console.log('ВТС конвертирован в BNB = ', balance);
      variableHistory.D_5_btcConverted = balance;
    }
    if (side === 'sell') {
      // balance -= stableBalance; // TRX minus stable balance
      // console.log('BNB = ', balance);
      variableHistory.D_5_bnbConverted = balance;
    }

    // console.log('balance', balance);
    console.log('============== 1 ОРДЕР ===============')

    const quantityWithCommision = balance - (balance / commision);
    let quantityWithPrecision = quantityWithCommision.toFixed(precision);

    if (side === 'buy') {
      quantityWithPrecision = quantityWithCommision.toFixed();
    }

    // console.log('Баланс с комисией', quantityWithCommision)
    // console.log('Сумма сделки обрезанна', quantityWithPrecision);
    variableHistory.D_6_quantityWithCommision = quantityWithCommision;
    variableHistory.D_7_quantityWithPrecision = quantityWithPrecision;

    const addLogToHistory = () => {
      variableHistory.F_1_currentPair = {...currentPair};
      variableHistory.F_2_pairs = {...pairs};

      let data = fs.readFileSync('history.json');
      let collection = JSON.parse(data);
      collection.push(variableHistory);
      fs.writeFileSync('history.json', JSON.stringify(collection))
      console.log('-------------------------------- ФИНИШ ---------------------------');

      history.push(variableHistory);
      variableHistory = {};
    }

    
    sendOrder(ACCESS_KEY, SECRET_KEY, {
      symbol: pair, // TRXBTC
      side: side, // sell
      type: 'MARKET',
      quantity: quantityWithPrecision,
    })
    .then(res => {
      variableHistory.sendOrderThenRes = res;
      addLogToHistory();
      // loadBalances().then(() => {
      //   variableHistory.sendOrderSUCCESS = true;
      //   console.log('Обновляем балансы')
      //   variableHistory.updateBalances = true;
      //   console.log('Финиш баланс 1', currency[whatCrypto].balance);
      //   variableHistory.balanceFinish = currency[whatCrypto].balance;
      // });
    })
    .catch(err => {
      variableHistory.sendOrderERROR = err;
    })
    .finally(() => {
      addLogToHistory();
    })
  };
  
})