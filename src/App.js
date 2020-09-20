import React from 'react';
import axios from 'axios';
import crypto from 'crypto';

import testscript from './testscript';
import { access_key, secret_key } from './keys';


import logo from './logo.svg';
import './App.css';

class App extends React.Component {

  componentDidMount() {

    // GET PRICE

    // setInterval(() => {
    //   axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`)
    //   .then(res => {
    //     console.log(res);
    //     console.log(res.data);
    //   })
    // }, 2000)

    //==========================================================================

    // GET ACCOUNT INFO (balances)

    // let timeOffset = 0;
    // const param = {
    //   baseUrl: "https://api.binance.com/",
    //   getAccountData: "api/v3/account",
    //   recvWindow: 5000,
    //   timestamp: new Date().getTime() + timeOffset,
    // };
    // const $param = `recvWindow=${param.recvWindow}&timestamp=${param.timestamp}`;
    // const apiSecret = '';
    // const signature = crypto
    //   .createHmac('sha256', apiSecret)
    //   .update($param)
    //   .digest('hex');

    // const url = param.baseUrl + param.getAccountData +'?'+ $param +'&'+ 'signature=' + signature;
    // axios.get(url, {
    //   headers: {
    //     'X-MBX-APIKEY': ''
    //     // 'X-MBX-APIKEY': {
    //     //   apiKey: '',
    //     //   secretKey: '',
    //     // }
    //   }
    // })
    // .then((res) => console.log('res', res))

    //================================================================================

    // const apiSecret = secret_key;
    // let timeOffset = 0;
    // const param = {
    //   baseUrl: "https://api.binance.com/",
    //   getAccountData: "api/v3/order/test",
    //   recvWindow: 5000,
    //   timestamp: new Date().getTime() + timeOffset,

    //   symbol: 'TRXBTC',
    //   side: 'sell',
    //   type: 'MARKET',
    //   quantity: 2000,
    // };

    // const $timeAndRec = `timestamp=${param.timestamp}&recvWindow=${param.recvWindow}`;
    // const $orderOptions = `symbol=${param.symbol}&side=${param.side}&type=${param.type}&quantity=${param.quantity}`;
    
    // const signature = crypto
    //   .createHmac('sha256', apiSecret)
    //   .update($timeAndRec)
    //   .digest('hex');

    // const url = param.baseUrl + param.getAccountData +'?'+ $timeAndRec +'&'+ $orderOptions +'&'+ 'signature=' + signature;
    // axios.post(url, '',
    // {
    //   headers: {
    //     'X-MBX-APIKEY': access_key,
    //     // 'X-MBX-APIKEY': {
    //     //   apiKey: '',
    //     //   secretKey: '',
    //     // }
    //   }
    // })
    // .then((res) => console.log('res', res))
    
  }

  render() { 
    return <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </header>
  </div>
  }
}

export default App;
