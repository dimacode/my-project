import React from 'react';
import axios from 'axios';
import './App.css';

class App extends React.Component {

  state = {
    balance: {},
    pairs: {},
    history: [],
  };

  // allHistory = (history) => history.length && history.map(h => {
  //   return (
  //     <div key={h.wasBalance1} style={{margin: '50px 0px'}}>
  //       {this.oneHistory(h)}
  //     </div>
  //   )
  // });

  // oneHistory = (h) => {
  //   let omg = Object.keys(h);
  //   return omg.map(h2 => {
  //     if (typeof(h[h2]) === 'object') {
  //       let a = h[h2].join(' / ');
  //       return <div key={new Date().getTime()+a}>
  //         <span>{h2}</span> : <span>{a}</span>
  //       </div>
  //     }
  //     return <div key={new Date().getTime()+h2}>
  //       <span>{h2}</span> : <span>{h[h2]}</span>
  //     </div>
  //   })
  // }

  getData = () => axios.get('http://207.154.214.146:4002/123')
  .then(d => d.data)
  .then(d => console.log(d));

  render() { 
    // const { balance, pairs, history } = this.state;
    // console.log('history', balance, pairs, history)

    return (
      <div className="App">
        <button onClick={this.getData}>Get data</button>
        {/* {this.allHistory(history)} */}
      </div>
    )
  }
}

export default App;
