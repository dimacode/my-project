import { access_key, secret_key } from './keys';
const axios = require("axios");
const crypto = require("crypto");

// BASE ENDPOINT
const baseUrl = "https://api.binance.com/";

// ORDERS and ACCOUNT
const accountData = "api/v3/account";
const latestPrice = "api/v3/ticker/price";
const order = "api/v3/order";

let timeOffset = 0;
const recvWindow = 5000;

const buildQuery = data => {
  return Object.keys(data)
    .reduce(function (a, k) {
      a.push(k + "=" + encodeURIComponent(data[k]));
      return a;
    }, [])
    .join("&");
};

// GET ACCOUNT
export const getAccountData = (apiKey, apiSecret, data = {}) => {
  if (!apiKey || !apiSecret) {
    throw new Error(
      "You need to pass an API key and secret to make authenticated calls."
    );
  }
  
  data.timestamp = new Date().getTime() + timeOffset;
  if (typeof data.recvWindow === "undefined") data.recvWindow = recvWindow;

  const query = buildQuery(data);
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(query)
    .digest("hex");
  const url = baseUrl + accountData + "?" + query + "&signature=" + signature;
  return axios
    .get(url, {
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    })
    .then(x=>x.data)
    .then(data => data.balances)
    .catch((err) => console.log("error:", err));
};

// getAccountData(access_key, secret_key, {}).then(account=>{
//     console.log("account", account)
// })

// GET LATEST PRICE
export const getLatestPrice = (pairs = []) => {
  return axios.get(`${baseUrl}${latestPrice}`)
  .then(res => res.data)
  .then(prices => {
    // console.log('pairs', pairs, prices)
    return prices.filter(price => pairs.includes(price.symbol))
  })
}

// SEND ORDER
export const sendOrder = (apiKey, apiSecret, data) => {

  if (!apiKey || !apiSecret) {
    throw new Error(
      "You need to pass an API key and secret to make authenticated calls."
    );
  }
  
  data.timestamp = new Date().getTime() + timeOffset;
  if (typeof data.recvWindow === "undefined") data.recvWindow = recvWindow;

  // data.symbol = 'TRXBTC';
  // data.side = 'sell';
  // data.type = 'MARKET';
  // data.quantity = 500;

  const query = buildQuery(data);
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(query)
    .digest("hex");
  const url = baseUrl + order + "?" + query + "&signature=" + signature;
  return axios
    .post(url, '', {
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    })
    .then(x=>x.data)
    .catch((err) => {console.log("error:", err); return err});
};

// sendOrder(access_key, secret_key, {
//   symbol: 'TRXBTC',
//   side: 'sell',
//   type: 'MARKET',
//   quantity: 500,
// }).then(account=>{
//   console.log("account", account)
// });

