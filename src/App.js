import React from 'react';
// import axios from 'axios';
// import crypto from 'crypto';

import { startScript, getData, } from './logic3';

import logo from './logo.svg';
import './App.css';

class App extends React.Component {

  state = {
    balance: {},
    pairs: {},
    history: [],
  };

  componentDidMount() {
    // (() => {
      startScript();
    // }, 5000)
    

    setInterval(() => {
      this.setState(() => {
        // console.log('PING_STATE')
        return {
          balance: getData().currency,
          pairs: getData().pairs,
          history: getData().history,
        }
      })
    }, 10000);
    
  }

  allHistory = (history) => history.length && history.map(h => {
    return (
      <div key={h.wasBalance1} style={{margin: '50px 0px'}}>
        {this.oneHistory(h)}
      </div>
    )
  });

  oneHistory = (h) => {
    let omg = Object.keys(h);
    return omg.map(h2 => {
      if (typeof(h[h2]) === 'object') {
        let a = h[h2].join(' / ');
        return <div key={new Date().getTime()+a}>
          <span>{h2}</span> : <span>{a}</span>
        </div>
      }
      return <div key={new Date().getTime()+h2}>
        <span>{h2}</span> : <span>{h[h2]}</span>
      </div>
    })
  }

  render() { 
    const { balance, pairs, history } = this.state;
    console.log('history', balance, pairs, history)
    // JST: 3151.23156197
    // USDT: 119.93938662

    // console.log('STATE:', this.state)
    return (
      <div className="App">
        {/* {this.allHistory(history)} */}
      </div>
    )
  }
}

export default App;
