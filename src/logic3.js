import { access_key, secret_key } from './keys';
import { getAccountData, getLatestPrice, sendOrder, getServerTime } from './api';

const stableBalance = 150000;

let currency = {
  TRX: {
    balance: '',
  },
  BTC: {
    balance: '',
  },
};

const commision = 5000; // 0.01%

let pairs = {
  TRXBTC: {
    base: 'TRX',
    qoute: 'BTC',
    pair: 'TRXBTC',
    initialPrice: '',
    orderHistoryPrice: [],
    precision: {
      TRX: 8,
      BTC: 8,
    },
  },
};

let isInitialPrice = true;
let history = [];
let variableHistory = {};

const checkTime = () => {

  getServerTime().then((time) => {
    const hours = new Date(time).getHours();
    const minutes = new Date(time).getMinutes();

    console.log('server', hours, minutes);
    console.log('my', new Date().getHours(), new Date().getMinutes());

    if (hours === 0 && minutes === 0) {
      console.log('h / m', hours, ' : ', minutes);

      loadBalances().then(() => {
        console.log('START SCRIPT')
        variableHistory.startTime = hours +':'+minutes;
        getPrice();
      });
    }

  });
};

export const startScript = () => {
  setInterval(() => {
    checkTime();
  }, 5000);
};

export const loadBalances = () => 
  getAccountData(access_key, secret_key, {}).then(account=>{
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


    if (newPrice >= minPricePositiv) {
      // BUY
      console.log('BUY')
      variableHistory.side = 'BUY';

      pairs[lastPrices[i].symbol].orderHistoryPrice.push(newPrice);
      variableHistory.orderHistoryPrice = pairs[lastPrices[i].symbol].orderHistoryPrice;
      preparingOrder(currentPair, 'buy', newPrice);
      break;
    }

    if (newPrice <= minPriceNegativ) {
      // SELL
      console.log('SEL')
      variableHistory.side = 'SELL';

      pairs[lastPrices[i].symbol].orderHistoryPrice.push(newPrice);
      variableHistory.orderHistoryPrice = pairs[lastPrices[i].symbol].orderHistoryPrice;
      preparingOrder(currentPair, 'sell', newPrice);
      break;
    }
    
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
    console.log('ВТС конвертирован в ТRХ = ', balance);
    variableHistory.btcConverted = balance;
  }
  if (side === 'sell') {
    balance -= stableBalance; // TRX minus stable balance
    console.log('ТRХ = ', balance);
    variableHistory.trxConverted = balance;
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
      console.log('-------------------------------- ФИНИШ ---------------------------');

      history.push(variableHistory);
      variableHistory = {};
    });
  })
}

export const getData = () => {
  return {
    currency: currency,
    pairs: pairs,
    history: [...history],
  }
}


