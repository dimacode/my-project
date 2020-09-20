import { access_key, secret_key } from './keys';
const axios = require("axios");
const crypto = require("crypto");

// BASE ENDPOINT
const baseUrl = "https://api.binance.com/";

// ORDERS and ACCOUNT
const getAccountData = "api/v3/account";
const getLatestPrice = "api/v3/ticker/price";
const sendOrder = "api/v3/order/test";

let timeOffset = 0;
const recvWindow = 5000;

function buildQuery(data) {
  return Object.keys(data)
    .reduce(function (a, k) {
      a.push(k + "=" + encodeURIComponent(data[k]));
      return a;
    }, [])
    .join("&");
}

function getAccount(apiKey, apiSecret, data = {}) {
  if (!apiKey || !apiSecret) {
    throw new Error(
      "You need to pass an API key and secret to make authenticated calls."
    );
  }
  
  data.timestamp = new Date().getTime() + timeOffset;
  if (typeof data.recvWindow === "undefined") data.recvWindow = recvWindow;

  data.symbol = 'TRXBTC';
  data.side = 'sell';
  data.type = 'MARKET';
  data.quantity = 500;

  const query = buildQuery(data);
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(query)
    .digest("hex");
  const url = baseUrl + getAccountData + "?" + query + "&signature=" + signature;
  return axios
    .post(url, '', {
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    })
    .then(x=>x.data)
    .catch((err) => console.log("error:", err));
}

getAccount(access_key, secret_key, {}).then(account=>{
    console.log("account", account)
})
