import { access_key, secret_key } from './keys';
import { getAccountData, getLatestPrice, sendOrder } from './api';

let balances = {};
let pair = ['TRX','BTC'];
let currentPrice = 0;
let basePersent = 1;
let orderSide = 'sell';
let whatCryptoSell = '';

getAccountData(access_key, secret_key, {}, pair).then(account=>{
  // account.forEach(element => {
  //   balances[element.asset] = element.free;
  // });

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
    // checkPrice(res.price);
    console.log('res', res);
  })
};


