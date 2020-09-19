import React from 'react';
import axios from 'axios';
import crypto from 'crypto';

import testscript from './testscript';


import logo from './logo.svg';
import './App.css';

class App extends React.Component {

  componentDidMount() {
    // const user = {
    //   symbol: "TRXBTC"
    // };
    // setInterval(() => {
    //   axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`)
    //   .then(res => {
    //     console.log(res);
    //     console.log(res.data);
    //   })
    // }, 2000)
    let timeOffset = 0;

    const param = {
      baseUrl: "https://api.binance.com/",
      getAccountData: "api/v3/account",
      recvWindow: 5000,
      timestamp: new Date().getTime() + timeOffset,
    };
    const $param = `recvWindow=${param.recvWindow}&timestamp=${param.timestamp}`;

    // const recvWindow = 'recvWindow=5000';
    // const query_string = `timestamp=${Date.now()}&${recvWindow}`;
    const apiSecret = '';

    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update($param)
      .digest('hex');

    // console.log("hashing the string: ");
    // console.log(query_string);
    // console.log("and return:");
    // console.log(signature(query_string));

    // console.log("\n");

    const url = param.baseUrl + param.getAccountData +'?'+ $param +'&'+ 'signature=' + signature;
    axios.get(url, {
      headers: {
        'X-MBX-APIKEY': ''
        // 'X-MBX-APIKEY': {
        //   apiKey: '',
        //   secretKey: '',
        // }
      }
    })
    .then((res) => console.log('res', res))

    
    
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
