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
  const commision = 5000; // 0.01%
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
      checkTime();
    }, 30000);
  };

  startScript();

  const checkTime = () => {
    let hours = new Date().getHours();
    let minutes = new Date().getMinutes();
    if (hours === 0 && minutes === 0) {
      getServerTime().then(time => {
        // console.log('h / m', hours, ' : ', minutes);
        const hoursExc = new Date(time).getHours();
        const minutesExc = new Date(time).getMinutes();
        // console.log('hoursExc', hoursExc+':'+minutesExc);
        loadBalances().then(() => {
          console.log('START SCRIPT')
          variableHistory.startTime = hoursExc +':'+minutesExc;
          getPrice();
        });
      })
    }
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
      variableHistory.lastPrice = lastPrices;

      checkPrice(lastPrices);
    });
  };

  const checkPrice = (lastPrices) => {
    let i = 0;
    while (i < lastPrices.length) {

      let currentPair = pairs[lastPrices[i].symbol]; // TRXBTC
      let lastOrderPrice = currentPair.orderHistoryPrice[currentPair.orderHistoryPrice.length - 1] || currentPair.initialPrice;
      let newPrice = lastPrices[i].price; // 0.12345678

      const minPricePositiv = Number(lastOrderPrice) + (lastOrderPrice / 100);
      const minPriceNegativ = Number(lastOrderPrice) - (lastOrderPrice / 100);

      console.log('1 - OrderHistoryPrice', currentPair.orderHistoryPrice[currentPair.orderHistoryPrice.length - 1]);
      console.log('2 - InitialPrice', currentPair.initialPrice);
      console.log('3 - LastOrderPrice', lastOrderPrice);
      variableHistory.orderHistoryPrice = currentPair.orderHistoryPrice[currentPair.orderHistoryPrice.length - 1];
      variableHistory.initialPrice = currentPair.initialPrice;
      variableHistory.lastOrderPrice = lastOrderPrice;
      variableHistory.minPricePositiv = minPricePositiv;
      variableHistory.minPriceNegativ = minPriceNegativ;

      const currentSide = pairs[lastPrices[i].symbol].currentSide;

      if (newPrice >= minPricePositiv && currentSide !== 'buy') {
        // BUY
        console.log('BUY')
        variableHistory.side = 'BUY';

        pairs[lastPrices[i].symbol].currentSide = 'buy';
        pairs[lastPrices[i].symbol].orderHistoryPrice.push(newPrice);
        variableHistory.currentSide = 'buy';
        variableHistory.orderHistoryPrice = pairs[lastPrices[i].symbol].orderHistoryPrice;

        preparingOrder(currentPair, 'buy', newPrice);
        break;
      }

      if (newPrice <= minPriceNegativ && currentSide !== 'sell') {
        // SELL
        console.log('SEL')
        variableHistory.side = 'SELL';

        pairs[lastPrices[i].symbol].currentSide = 'sell';
        pairs[lastPrices[i].symbol].orderHistoryPrice.push(newPrice);
        variableHistory.currentSide = 'sell';
        variableHistory.orderHistoryPrice = pairs[lastPrices[i].symbol].orderHistoryPrice;

        preparingOrder(currentPair, 'sell', newPrice);
        break;
      }

      variableHistory.newPriseCheckFail = 'Not BUY not SELL';
      variableHistory.currentSide = pairs[lastPrices[i].symbol].currentSide;
      let data = fs.readFileSync('history.json');
      let collection = JSON.parse(data);
      collection.push(variableHistory);
      fs.writeFileSync('history.json', JSON.stringify(collection))
      
      i++;
    };
  };

  const preparingOrder = (currentPair, side, newPrice) => {

    let whatCrypto = side === 'sell' ? currentPair.base : currentPair.qoute; // TRX or BTC
    let precision = currentPair.precision[whatCrypto]; // 8
    let pair = currentPair.pair; // TRXBTC
    let balance = currency[whatCrypto].balance;
    
    console.log('side -', side);
    console.log('pair - ', pair)
    console.log('balance - ', balance)
    variableHistory.side = side;
    variableHistory.pair = pair;
    variableHistory.balance = balance;

    if (side === 'buy') {
      balance = balance / newPrice; // BTC convert to TRX
      console.log('ВТС конвертирован в BNB = ', balance);
      variableHistory.btcConverted = balance;
    }
    if (side === 'sell') {
      // balance -= stableBalance; // TRX minus stable balance
      console.log('BNB = ', balance);
      variableHistory.bnbConverted = balance;
    }

    // console.log('balance', balance);
    console.log('============== 1 ОРДЕР ===============')

    const quantityWithCommision = balance - (balance / commision);
    const quantityWithPrecision = quantityWithCommision.toFixed(precision);

    console.log('Баланс с комисией', quantityWithCommision)
    console.log('Сумма сделки обрезанна', quantityWithPrecision);
    variableHistory.quantityWithCommision = quantityWithCommision;
    variableHistory.quantityWithPrecision = quantityWithPrecision;
    
    sendOrder(access_key, secret_key, {
      symbol: pair, // TRXBTC
      side: side, // sell
      type: 'MARKET',
      quantity: quantityWithPrecision,
    }).then(res => {
      loadBalances().then(() => {
        console.log('Обновляем балансы')
        variableHistory.updateBalances = true;
        console.log('Финиш баланс 1', currency[whatCrypto].balance);
        variableHistory.balanceFinish = currency[whatCrypto].balance;

        let data = fs.readFileSync('history.json');
        let collection = JSON.parse(data);
        collection.push(variableHistory);
        fs.writeFileSync('history.json', JSON.stringify(collection))
        console.log('-------------------------------- ФИНИШ ---------------------------');

        history.push(variableHistory);
        variableHistory = {};
      });
    })
  };
  
})