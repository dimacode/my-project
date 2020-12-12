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
  const commision = 1000; // 0.01%
  let isInitialPrice = true;
  let history = [];
  let variableHistory = {};

  let currency = {
    TRX: {
      balance: '',
    },
    BTC: {
      balance: '',
    },
  };

  let pairs = {
    TRXBTC: {
      base: 'TRX',
      qoute: 'BTC',
      pair: 'TRXBTC',
      initialPrice: '',
      orderHistoryPrice: [],
      currentSide: '',
      precision: {
        TRX: 0,
        BTC: 0,
      },
    },
  };

  

  
  const checkBalance = () => {
    variableHistory.a2 = 2;
    const { TRX, BTC } = currency;
    if (TRX.balance === '' && BTC.balance === '') {
      variableHistory.a3 = 3;
      loadBalances().then(() => {
        variableHistory.a4 = 4;
        variableHistory.loadFirstBalance = true;
        // getPrice();
      });
    } else {
      variableHistory.a5 = 5;
      // getPrice();
    }

    let data = fs.readFileSync('history.json');
    let collection = JSON.parse(data);
    collection.push(variableHistory);
    fs.writeFileSync('history.json', JSON.stringify(collection))
    // variableHistory = {};
  };

  const startScript = () => {
    variableHistory.a0 = 1;
    // let data = fs.readFileSync('history.json');
    // let collection = JSON.parse(data);
    // collection.push(variableHistory);
    // fs.writeFileSync('history.json', JSON.stringify(collection))
    setInterval(() => {
      variableHistory.a1 = 1;
      checkBalance();
    }, 1000);
  };

  startScript();


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
    .finally(() => {
      variableHistory.loadBalances = true;
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

    const symbol = lastPrices[0].symbol; // "TRXBTC"
    const currentPair = pairs[symbol]; // TRXBTC {}
    const lastOrderPrice = currentPair.orderHistoryPrice[currentPair.orderHistoryPrice.length - 1] || currentPair.initialPrice;
    const newPrice = lastPrices[0].price; // 0.12345678

    const minPricePositiv = Number(lastOrderPrice) + (lastOrderPrice / 100);
    const minPriceNegativ = Number(lastOrderPrice) - (lastOrderPrice / 100);

    variableHistory.A_0_pairs = {...pairs};
    variableHistory.A_1_lastPrices = lastPrices;
    variableHistory.A_2_currentPair = {...currentPair};
    variableHistory.A_3_lastOrderPrice = lastOrderPrice;
    variableHistory.A_4_newPrice = newPrice;

    variableHistory.A_5_minPricePositiv = minPricePositiv;
    variableHistory.A_6_minPriceNegativ = minPriceNegativ;

    const isNewPricePositive = newPrice >= minPricePositiv;
    const isNewPriceNegative = newPrice <= minPriceNegativ;
    variableHistory.B_1_isNewPricePositive = isNewPricePositive;
    variableHistory.B_2_isNewPriceNegative = isNewPriceNegative;

    if (isNewPricePositive || isNewPriceNegative) {
      pairs[symbol].orderHistoryPrice.push(newPrice);
      variableHistory.C_1_pairsAfterPush = [...pairs[symbol].orderHistoryPrice];

      preparingOrder(symbol, isNewPricePositive ? 'sell' : 'buy', newPrice);
      return;
    }

    // variableHistory.A_7_newPriseCheckFail = 'Not BUY not SELL';
    // variableHistory.A_9_newPrice = newPrice;
    // variableHistory.A_10_minPricePositiv = minPricePositiv;
    // variableHistory.A_11_minPriceNegativ = minPriceNegativ;

    let data = fs.readFileSync('history.json');
    let collection = JSON.parse(data);
    collection.push(variableHistory);
    fs.writeFileSync('history.json', JSON.stringify(collection))
    variableHistory = {};
  };

  const preparingOrder = (symbol, side, newPrice) => {
    variableHistory.D_0_preparingOrder = symbol+' | '+side+' | '+newPrice;
    const TRX = pairs[symbol].base;
    const BTC = pairs[symbol].qoute;
    const whatCrypto = side === 'sell' ? TRX : BTC; // TRX or BTC
    const precision = pairs[symbol].precision[whatCrypto]; // 8
    const pair = pairs[symbol].pair; // TRXBTC
    let summForSell = 0;
    
    variableHistory.D_1_whatCrypto = whatCrypto;
    variableHistory.D_2_precision = precision;
    variableHistory.D_3_pair = pair;

    if (side === 'sell') {
      const btcToTrx = Math.trunc(currency[BTC].balance / newPrice);
      const btcPlusTrx = Math.trunc(btcToTrx + currency[TRX].balance);
      const halfOfTrx = btcPlusTrx / 2;
      summForSell = currency[TRX].balance - halfOfTrx;

      variableHistory.D_4_btcToTrx = btcToTrx;
      variableHistory.D_4_btcPlusTrx = btcPlusTrx;
      variableHistory.D_4_halfOfTrx = halfOfTrx;
      variableHistory.D_4_summForSell = summForSell;
    }
    if (side === 'buy') {
      const trxToBtc = currency[TRX].balance * newPrice;
      const trxPlusBtc = trxToBtc + currency[BTC].balance;
      const halfOfBtc = trxPlusBtc / 2;
      summForSell = currency[BTC].balance - halfOfBtc;

      variableHistory.D_4_trxToBtc = trxToBtc;
      variableHistory.D_4_trxPlusBtc = trxPlusBtc;
      variableHistory.D_4_halfOfBtc = halfOfBtc;
      variableHistory.D_4_summForSell = summForSell;
    }

    console.log('============== 1 ОРДЕР ===============')

    const quantityWithCommision = summForSell - (summForSell / commision);
    let quantityWithPrecision = quantityWithCommision.toFixed(precision);

    variableHistory.D_6_quantityWithCommision = quantityWithCommision;
    variableHistory.D_7_quantityWithPrecision = quantityWithPrecision;

    const addLogToHistory = () => {
      // variableHistory.F_1_currentPair = {...pairs[symbol]};
      variableHistory.F_2_pairs = {...pairs};

      let data = fs.readFileSync('history.json');
      let collection = JSON.parse(data);
      collection.push(variableHistory);
      fs.writeFileSync('history.json', JSON.stringify(collection))
      console.log('-------------------------------- ФИНИШ ---------------------------');

      loadBalances();
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