import React from 'react';
// import axios from 'axios';
// import crypto from 'crypto';

import { loadBalances, startScript, getData, } from './logic2';

import logo from './logo.svg';
import './App.css';

class App extends React.Component {

  state = {
    balance: {},
    pairs: [],
  };

  componentDidMount() {
    loadBalances().then(() => {
      startScript();
    });

    // setInterval(() => {
    //   this.setState(() => {
    //     // console.log('PING_STATE')
    //     return {
    //       balance: getData().currency,
    //       pairs: getData().pairs,
    //     }
    //   })
    // }, 5000)
    
  }

  render() { 
    // JST: 3151.23156197
    // USDT: 119.93938662

    // console.log('STATE:', this.state)
    return <div className="App">
      <div>
        <h1>БЫЛО</h1>
        <br />
        <b>JST: {this.state && this.state.balance && this.state.balance.JST && this.state.balance.JST.balance}</b>
        <br />
        <b>USDT: {this.state && this.state.balance && this.state.balance.USDT && this.state.balance.USDT.balance}</b>
      </div>
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
