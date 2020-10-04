import { access_key, secret_key } from './keys';
import { getAccountData, getLatestPrice, sendOrder } from './api';

let currency = {
  // TRX: {
  //   balance: '',
  // },
  BTC: {
    balance: '',
  },
  BNB: {
    balance: '',
  },
  // ETH: {
  //   balance: '',
  // },
  // USDT: {
  //   balance: '',
  // },
  // JST: {
  //   balance: '',
  // },
  // USDT: {
  //   balance: '',
  // },
};

const commision = 100; // 1%

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
  // JSTUSDT: {
  //   base: 'JST',
  //   qoute: 'USDT',
  //   pair: 'JSTUSDT',
  //   lastPrice: '',
  //   percent: 1,
  //   precision: {
  //     JST: 1,
  //     USDT: 1,
  //   }
  // },
  BNBBTC: {
    base: 'BNB',
    qoute: 'BTC',
    pair: 'BNBBTC',
    initialPrice: '',
    orderHistoryPrice: [],
    precision: {
      BNB: 2,
      BTC: 2,
    },
    moreThen: false,
    lessThen: false,
  },
};

let isInitialPrice = true;
let history = [];

export const startScript = () => {
  setInterval(() => {
    getPrice();
  }, 5000);
}

export const loadBalances = () => 
  getAccountData(access_key, secret_key, {}).then(account=>{
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

    console.log('lastPrices', lastPrices[0].price)

    checkPrice(lastPrices);
  });
};


const checkPrice = (lastPrices) => {
  let i = 0;
  while (i < lastPrices.length) {

    let currentPair = pairs[lastPrices[i].symbol]; // TRXBTC
    let lastOrderPrice = currentPair.orderHistoryPrice[currentPair.orderHistoryPrice.length - 1] || currentPair.initialPrice;
    let newPrice = lastPrices[i].price; // 0.12345678

    const minPricePositiv = Number(lastOrderPrice) + (lastOrderPrice / 300);
    const minPriceNegativ = Number(lastOrderPrice) - (lastOrderPrice / 300);

    console.log('1 - OrderHistoryPrice', currentPair.orderHistoryPrice[currentPair.orderHistoryPrice.length - 1]);
    console.log('2 - InitialPrice', currentPair.initialPrice);
    console.log('3 - LastOrderPrice', lastOrderPrice);

    console.log('minPricePositiv', minPricePositiv);
    console.log('minPriceNegativ', minPriceNegativ)

    if (newPrice >= minPricePositiv) {
      // SELL
      console.log('SEL')
      if (newPrice > currentPair.initialPrice) {
        console.log('MORE THEN', pairs[lastPrices[i].symbol].moreThen)
        console.log('LESS THEN', pairs[lastPrices[i].symbol].lessThen)
        pairs[lastPrices[i].symbol].moreThen = true;
        pairs[lastPrices[i].symbol].lessThen = false;

      }
      
      console.log('ПАРА', pairs[lastPrices[i].symbol]);

      preparingOrder(currentPair, 'sell', newPrice, minPricePositiv, lastOrderPrice);
      break;
    }
    if (newPrice <= minPriceNegativ) {
      // BUY
      // currentPair.side = 'buy';
      // console.log('BUY')
      // currentPair.lastPrice = newPrice;
      // console.log('Была цена', pairs[lastPrices[i].symbol].lastPrice);
      // console.log('стала цена', newPrice);

      // console.log('newPrice', newPrice)
      // console.log('currentPair.lastPrice', currentPair.lastPrice)
      // console.log('minPricePositiv', minPriceNegativ)
      console.log('BUY')

      if (newPrice < currentPair.initialPrice) {
        console.log('MORE THEN', pairs[lastPrices[i].symbol].moreThen)
        console.log('LESS THEN', pairs[lastPrices[i].symbol].lessThen)
        pairs[lastPrices[i].symbol].moreThen = false;
        pairs[lastPrices[i].symbol].lessThen = true;
      }
      console.log('ПАРА', pairs[lastPrices[i].symbol]);
      preparingOrder(currentPair, 'buy', newPrice, minPriceNegativ, lastOrderPrice);
      break;
    }
    
    i++;
  };
  // console.log('--------------------------------------------------------')
};

const preparingOrder = (currentPair, side, newPrice, minPrice, lastOrderPrice) => {

  let whatCrypto1 = side === 'sell' ? currentPair.base : currentPair.qoute; // TRX or BTC
  let precision = currentPair.precision[whatCrypto1]; // 8
  let pair = currentPair.pair; // TRXBTC
  let balance = currency[whatCrypto1].balance;

  const moreThen = pairs[pair].moreThen;
  const lessThen = pairs[pair].lessThen;

  console.log('side -', side);
  console.log('pair - ', pair)
  console.log('balance - ', balance)
  console.log('moreThen - ', moreThen)
  console.log('lessThen - ', lessThen)
  

  if (moreThen) {
    console.log('MORE THEN - ACTIVE')
    // Если BUY то кол-во Битка делим на цену = кол-во TRX
    if (side === 'buy') { // whatCrypto1 !== currentPair.base
      // console.log('BALANCES', currency)
      // console.log('BUY', currency[whatCrypto1].balance, newPrice, currency[whatCrypto1].balance / newPrice)
      console.log('if side BUY')

      balance = currency[currentPair.qoute].balance / newPrice;
      console.log('balance делим на цену', balance)

      console.log('Ордер хистори БЫЛ', pairs[pair].orderHistoryPrice)
      pairs[pair].orderHistoryPrice.pop();
      console.log('Ордер хистори СТАЛ', pairs[pair].orderHistoryPrice)
    }
    if (side === 'sell') {
      console.log('if side SELL')
      console.log('Ордер хистори БЫЛ', pairs[pair].orderHistoryPrice)
      pairs[pair].orderHistoryPrice.push(newPrice);
      console.log('Ордер хистори СТАЛ', pairs[pair].orderHistoryPrice)
    }
  }

  if (lessThen) {
    console.log('LESS THEN - ACTIVE')

    if (side === 'buy') {
      console.log('if side BUY')

      balance = currency[currentPair.qoute].balance / newPrice;
      console.log('balance делим на цену', balance)

      console.log('Ордер хистори БЫЛ', pairs[pair].orderHistoryPrice)
      pairs[pair].orderHistoryPrice.push(newPrice);
      console.log('Ордер хистори СТАЛ', pairs[pair].orderHistoryPrice)
    }
    if (side === 'sell') {
      console.log('if side SELL')
      console.log('Ордер хистори БЫЛ', pairs[pair].orderHistoryPrice)
      pairs[pair].orderHistoryPrice.pop();
      console.log('Ордер хистори СТАЛ', pairs[pair].orderHistoryPrice)
    }
  }

  const order = balance / 100;
  const quantityWithCommision = order - (order / commision);
  const quantityWithPrecision = quantityWithCommision.toFixed(precision);

  // console.log('FIRST==========================')
  // console.log('currentPair', currentPair)
  // console.log("side", side);
  // console.log("precision", precision);
  // console.log("balance", balance);
  // console.log("quantityWithCommision", quantityWithCommision);
  // console.log("quantityWithPrecision", quantityWithPrecision);
  // console.log('newPrice', newPrice)
  console.log('============== 1 ОРДЕР ===============')
  // console.log('CURRENCY', currency);
  // console.log('Сторона', side === 'sell' ? 'sell' : 'buy');
  // console.log('Символ', side === 'sell' ? currentPair.base : currentPair.qoute);
  
  // console.log('Предыдущая Макс. цена', currentPair.lastPrice);
  // console.log('Текущая цена', newPrice);
  // console.log('Минимальная цена', minPrice);

  // console.log('Был баланс 1', currency[currentPair.base].balance);
  // console.log('Был баланс 2', currency[currentPair.qoute].balance);
  // console.log('Баланс после вычислений', balance);
  console.log('Баланс с комисией', quantityWithCommision)
  console.log('Сумма сделки обрезанна', quantityWithPrecision);
  

  
  sendOrder(access_key, secret_key, {
    symbol: pair, // TRXBTC
    side: side, // sell
    type: 'MARKET',
    quantity: quantityWithPrecision,
  }).then(res => {
    loadBalances().then(() => {
      console.log('Обновляем балансы')
      console.log('Финиш баланс 1', currency[whatCrypto1].balance);
      // console.log('Финиш баланс 2', currency[whatCrypto2].balance);
      console.log('-------------------------------- ФИНИШ ---------------------------');
    });
  })
}

export const getData = () => {
  return {
    currency: currency,
    pairs: pairs,
  }
}


