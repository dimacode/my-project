import { access_key, secret_key } from './keys';
import { getAccountData, getLatestPrice, sendOrder } from './api';

let balances = {};
let pair = ['TRX','BTC'];
let currentPrice = 0;
let basePersent = 1;
let orderSide = 'sell';
let whatCryptoSell = '';

getAccountData(access_key, secret_key, {}, pair).then(account=>{
  account.forEach(element => {
    balances[element.asset] = element.free;
  });

  setInterval(() => {
    getPrice();
  }, 1000);
  // console.log("account", balances)
});




const getPrice = () => {
  getLatestPrice(pair[0]+pair[1]).then(res => {
    if (!currentPrice) {
      currentPrice = res.price;
    }
    checkPrice(res.price);
    console.log('res', res);
  })
};

const checkPrice = (price) => {
  let percent = 0;
  let diff = 0;

  if (price > currentPrice) {
    diff = price - currentPrice;
    percent = diff * 100 / currentPrice;
    whatCryptoSell = 'TRX';
    orderSide = 'sell';
  }

  if (price < currentPrice) {
    diff = currentPrice - price;
    percent = diff * 100 / currentPrice;
    whatCryptoSell = 'BTC';
    orderSide = 'buy';
  }

  checkPersent(percent, currentPrice, price);
};

const checkPersent = (percent, currentPrice, price) => {
  console.log('percent', percent, currentPrice, price)
  console.log({balances, pair, currentPrice, basePersent, orderSide, whatCryptoSell, percent});

  if (percent >= basePersent) {
    currentPrice = price;
    
    sendOrder(access_key, secret_key, {
      symbol: pair[0]+pair[1], // TRXBTC
      side: orderSide, // sell
      type: 'MARKET',
      quantity: whatCryptoSell === 'TRX' ? balances.TRX : balances.BTC,
    }).then(account=>{
      orderSide = '';
      whatCryptoSell = '';
      console.log("account", account);
      // console.log("account", account);
    });
  }
}

