import { access_key, secret_key } from './keys';
import { getAccountData, getLatestPrice, sendOrder } from './api';

let currency = {
  // TRX: {
  //   balance: '',
  // },
  // BTC: {
  //   balance: '',
  // },
  // ETH: {
  //   balance: '',
  // },
  // USDT: {
  //   balance: '',
  // },
  JST: {
    balance: '',
  },
  USDT: {
    balance: '',
  },
};
let TRX = 150000;
let BTC = 0.261;
const initialPrice = 0.00000174;



const commision = 400; // 0.25%

let pairs = {
  // TRXBTC: {
  //   base: 'TRX',
  //   qoute: 'BTC',
  //   pair: 'TRXBTC',
  //   lastPrice: '',
  //   percent: 0.1,
  //   precision: {
  //     TRX: 0,
  //     BTC: 0,
  //   }
  // },
  JSTUSDT: {
    base: 'JST',
    qoute: 'USDT',
    pair: 'JSTUSDT',
    lastPrice: '',
    percent: 1,
    precision: {
      JST: 1,
      USDT: 1,
    }
  },
};

let history = [];
let variableHistory = {};

export const startScript = () => {
  loadBalances().then(() => {
    console.log('START SCRIPT')
    getPrice();
  });
}

export const loadBalances = () => 
  getAccountData(access_key, secret_key, {}).then(account=>{
    // console.log('currency 1', currency);
    // console.log('account', account);
    let currencyKeys = Object.keys(currency);
    let newCurrency = {};
    account.forEach(element => {
      if (currencyKeys.includes(element.asset)) {
        let { asset, free } = element;
        // console.log('TRUE BALANCE', element.asset, element.free);
        // newCurrency[asset].balance = free;
        newCurrency = {
          ...newCurrency,
          [asset]: {
            balance: free,
          }
        };
        // console.log('TRUE BALANCE AFTER', currency, newCurrency)
      }
    });
    // console.log('NEW CURRENCY', newCurrency)
    currency = {...newCurrency};
    // console.log('TRUE BALANCE FINISH', currency)
    // console.log('base', base);
  });
  // console.log(22222)
  // if (!onlyBalance) {
  //   console.log(11111)
    
  // };

const getPrice = () => {
  const allPairs = Object.keys(pairs);
  getLatestPrice(allPairs).then(lastPrices => {
    // Load first prices
    if (!pairs[lastPrices[0].symbol].lastPrice) {
      for (let i = 0; i < lastPrices.length; i++) {
        pairs[lastPrices[i].symbol].lastPrice = lastPrices[i].price;
      };
    };
    // console.log('currency', currency);
    // console.log('lastPrices', lastPrices);
    // console.log('pairs', pairs)
    checkPrice(lastPrices);

    // sendOrder(access_key, secret_key, {
    //   symbol: 'JSTUSDT', // TRXBTC
    //   side: 'buy', // sell
    //   type: 'MARKET',
    //   quantity: '1524.5',
    // }).then(account => {
    //   console.log('<AKJ')
    //   loadBalances();
    // });
  });
};


const checkPrice = (lastPrices) => {
  let i = 0;
  while (i < lastPrices.length) {
    // console.log('lastPrices', lastPrices)
    // console.log('lastPrices[i].symbol', lastPrices[i].symbol)
    // console.log('pairs[lastPrices[i].symbol]', pairs[lastPrices[i].symbol])
    // console.log('888888888888888888888888888888888888888')
    let currentPair = pairs[lastPrices[i].symbol]; // TRXBTC
    let newPrice = lastPrices[i].price; // 0.12345678
    let calculatePercent = (newPrice - currentPair.lastPrice) * 100 / currentPair.lastPrice;
    let negativPercent = calculatePercent - (calculatePercent * 2);

    const minPricePositiv = (currentPair.lastPrice / 100) + Number(currentPair.lastPrice);
    const minPriceNegativ = (currentPair.lastPrice / 100) - Number(currentPair.lastPrice);

    // console.log('currentPair', currentPair)
    // console.log('newPrice', newPrice, calculatePercent)
    // console.log('currentPair.percent', currentPair.percent)

    // console.log('calculatePercent', calculatePercent)


    // console.log('newPrice', newPrice)
    // console.log('currentPair.lastPrice', currentPair.lastPrice)
    // console.log('minPricePositiv', minPricePositiv)
    // console.log('----------------')

    if (newPrice > minPricePositiv) {
      // SELL
      // currentPair.side = 'sell';.side
      // console.log('SELL')
      // currentPair.lastPrice = newPrice;
      // console.log('Была цена', pairs[lastPrices[i].symbol].lastPrice);
      // console.log('стала цена', newPrice);

      // console.log('newPrice', newPrice)
      // console.log('currentPair.lastPrice', currentPair.lastPrice)
      // console.log('minPricePositiv', minPricePositiv)

      preparingOrder(currentPair, 'sell', newPrice, minPricePositiv);
      return false;
      break;
    }
    if (newPrice < minPriceNegativ) {
      // BUY
      // currentPair.side = 'buy';
      // console.log('BUY')
      // currentPair.lastPrice = newPrice;
      // console.log('Была цена', pairs[lastPrices[i].symbol].lastPrice);
      // console.log('стала цена', newPrice);

      // console.log('newPrice', newPrice)
      // console.log('currentPair.lastPrice', currentPair.lastPrice)
      // console.log('minPricePositiv', minPriceNegativ)

      preparingOrder(currentPair, 'buy', newPrice, minPriceNegativ);
      return false;
      break;
    }
    i++;
  };
  setTimeout(() => {
    // console.log(1111111111111111111111111111111111111)
    getPrice();
  }, 5000)
  // console.log('--------------------------------------------------------')
};

const preparingOrder = (currentPair, side, newPrice, minPrice) => {

  let whatCrypto1 = side === 'sell' ? currentPair.base : currentPair.qoute; // TRX or BTC
  // console.log('Обновляем балансы', currency)
  // console.log('Обновляем балансы 1', currency[whatCrypto1].balance)
  let precision = currentPair.precision[whatCrypto1]; // 8
  let pair = currentPair.pair;
  let balance = currency[whatCrypto1].balance;

  // Если BUY то кол-во Битка делим на цену = кол-во TRX
  if (side === 'buy') { // whatCrypto1 !== currentPair.base
    // console.log('BALANCES', currency)
    // console.log('BUY', currency[whatCrypto1].balance, newPrice, currency[whatCrypto1].balance / newPrice)
    balance = currency[currentPair.qoute].balance / newPrice;
  }

  const quantityWithCommision = balance - (balance / commision);
  const quantityWithPrecision = quantityWithCommision.toFixed(precision);

  console.log('============== 1 ОРДЕР ===============')
  console.log('CURRENCY', currency);
  console.log('Сторона', side === 'sell' ? 'sell' : 'buy');
  console.log('Символ', side === 'sell' ? currentPair.base : currentPair.qoute);
  
  console.log('Предыдущая Макс. цена', currentPair.lastPrice);
  console.log('Текущая цена', newPrice);
  console.log('Минимальная цена', minPrice);

  console.log('Был баланс 1', currency[currentPair.base].balance);
  console.log('Был баланс 2', currency[currentPair.qoute].balance);
  console.log('Баланс после вычислений', balance);
  console.log('Баланс с комисией', quantityWithCommision)
  console.log('Сумма сделки обрезанна', quantityWithPrecision);

  variableHistory = {
    firstOrder: '1 ОРДЕР',
    // currency: currency,
    side: side === 'sell' ? 'sell' : 'buy',
    symbol: side === 'sell' ? currentPair.base : currentPair.qoute,
    lastPrice: currentPair.lastPrice,
    newPrice: newPrice,
    minPrice: minPrice,
    wasBalance1: currency[currentPair.base].balance,
    wasBalance2: currency[currentPair.qoute].balance,
    balanceAfterCalc: balance,
    balanceWithComision: quantityWithCommision,
    balanceWithPrecis: quantityWithPrecision
  };
  

  
  sendOrder(access_key, secret_key, {
    symbol: pair, // TRXBTC
    side: side, // sell
    type: 'MARKET',
    quantity: quantityWithPrecision,
  }).then(account => {
    // console.log('ACCOUNT', account)
    // console.log('NEXT=================================')
    if (true) {
      console.log('Сделка удачна 1')
      pairs[currentPair.pair].lastPrice = newPrice;
      // pairs[currentPair.pair].lastPrice;
      loadBalances().then(() => {
        
        // console.log('Чекаем обновились ли балансы')
        let whatCrypto2 = side === 'sell' ? currentPair.qoute : currentPair.base;
        // console.log('Обновляем балансы', currency)
        // console.log('Обновляем балансы 1', currency[whatCrypto1].balance)
        // console.log('Обновляем балансы 2', currency[whatCrypto2].balance)
        let precision2 = currentPair.precision[whatCrypto2];
        let pair = currentPair.pair;
        let balance = currency[whatCrypto2].balance;
        
        // console.log('LAST PRICE', newPrice, pairs, currentPair.pair)
        if (side === 'sell') {
          // console.log('IFFFFFFFFFFFFFF 2', currency[whatCrypto2].balance, currentPair.lastPrice, currency[whatCrypto2].balance / currentPair.lastPrice);
          balance = currency[whatCrypto2].balance / newPrice;
        }
        balance = balance / 2;

        const quantityWithCommision = balance - (balance / commision);
        const quantityWithPrecision = quantityWithCommision.toFixed(precision2);

        // console.log("side", side === 'sell' ? 'buy' : 'sell');
        // console.log("precision", precision1);
        // console.log("balance", balance);
        // console.log("quantityWithCommision", quantityWithCommision);
        // console.log("quantityWithPrecision", quantityWithPrecision);
        console.log('============== 2 ОРДЕР ===============')
        console.log('Сторона', side === 'sell' ? 'buy' : 'sell');
        console.log('Символ', side === 'sell' ? currentPair.qoute : currentPair.base);
        console.log('Стал баланс 1', currency[whatCrypto1].balance);
        console.log('Стал баланс 2', currency[whatCrypto2].balance);
        console.log('Делим баланс на 2')
        console.log('Баланс после вычислений', balance);
        console.log('Баланс с комисией', quantityWithCommision)
        console.log('Сумма сделки обрезанна', quantityWithPrecision);

        variableHistory.divider = '=====================================';
        variableHistory.secondOrder = '2 ОРДЕР';
        variableHistory.side2 = side === 'sell' ? 'buy' : 'sell';
        variableHistory.symbol2 = side === 'sell' ? currentPair.qoute : currentPair.base;
        variableHistory.balanceNew1 = currency[whatCrypto1].balance;
        variableHistory.balanceNew2 = currency[whatCrypto2].balance;
        variableHistory.sepa = 'Делим баланс на 2';
        variableHistory.balanceAfterCalc2 = balance;
        variableHistory.balanceWithComision = quantityWithCommision;
        variableHistory.balanceWithPrecis = quantityWithPrecision;

        sendOrder(access_key, secret_key, {
          symbol: pair, // TRXBTC
          side: side === 'sell' ? 'buy' : 'sell', // sell
          type: 'MARKET',
          quantity: quantityWithPrecision,
        }).then(result => {
          
          loadBalances().then(() => {
            console.log('Обновляем балансы')
            console.log('Финиш баланс 1', currency[whatCrypto1].balance);
            console.log('Финиш баланс 2', currency[whatCrypto2].balance);
            console.log('-------------------------------- ФИНИШ ---------------------------', result);

            variableHistory.refreshBalance = 'Обновляем балансы';
            variableHistory.finish1 = currency[whatCrypto1].balance;
            variableHistory.finish2 = currency[whatCrypto2].balance;
            history.push(variableHistory);
            variableHistory = {};

            setTimeout(() => {
              // console.log(222222222222222222222222222222222222)
              getPrice();
            }, 5000)
          });
        })

      });
      
    };
  });
}

export const getData = () => {
  return {
    currency: {...currency},
    pairs: {...pairs},
    history: [...history],
  }
}


