const axios = require("axios");
const crypto = require("crypto");

const baseUrl = "https://api.binance.com/";
const getAccountData = "api/v3/account";
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
  const query = buildQuery(data);
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(query)
    .digest("hex");
  const url = baseUrl + getAccountData + "?" + query + "&signature=" + signature;
  return axios
    .get(url, {
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    })
    .then(x=>x.data)
    .catch((err) => console.log("error:", err));
}

const access_key =
  "3FWycCmnJzwbIoLrJwQtUuUBi4MjyQrUr021a0GnwaRvLvlxhFKyKulfCWzH3ci3";
const secret_key =
  "aiaSKJc3F4yzXeUT1PYk2VcHSL3Qdo6IisNIjBIDda8YkutAmnTtTVwYPwJEBFCj";

getAccount(access_key, secret_key, {}).then(account=>{
    console.log("account", account)
})