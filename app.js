let express = require('express');
let app = express();
const { getServerTime, getAccountData } = require('./src/api')

require('dotenv').config();
const fs = require('fs');

app.get('/123', (req, res) => {
  // let rawdata = fs.readFileSync('message.json');
  // let data = `[`+rawdata+`]`;
  // readable.pipe(res);

  let rawdata = fs.readFileSync('message.json'); 
  let student = JSON.parse(rawdata); 
  console.log(student);
  res.json(student)
})

app.listen(4003, () => {
  const fs = require('fs');
  const ACCESS_KEY = process.env.ACCESS_KEY;
  const SECRET_KEY = process.env.SECRET_KEY;
  const stableBalance = 150000;
  const commision = 5000; // 0.01%
  let isInitialPrice = true;
  let history = [];
  let variableHistory = {};

  let currency = {
    TRX: {
      balance: '',
    },
    BTC: {
      balance: '',
    },
  };

  let pairs = {
    TRXBTC: {
      base: 'TRX',
      qoute: 'BTC',
      pair: 'TRXBTC',
      initialPrice: '',
      orderHistoryPrice: [],
      precision: {
        TRX: 8,
        BTC: 8,
      },
    },
  };

  const checkTime = () => {
    // const hours = new Date().getHours();
    // const minutes = new Date().getMinutes();
    // if (hours === 0 && minutes === 0) {
      getServerTime().then(time => {
        // console.log('h / m', hours, ' : ', minutes);
        const hoursExc = new Date(time).getHours();
        const minutesExc = new Date(time).getMinutes();
        // console.log('hoursExc', hoursExc+':'+minutesExc);
        // fs.appendFileSync('message.json', hoursExc+':'+minutesExc + '\n');
  
        loadBalances().then(() => {
          console.log('START SCRIPT')
        //   variableHistory.startTime = hours +':'+minutes;
        //   getPrice();
        });
      })
    // }
  };

  const startScript = () => {
    setInterval(() => {
      checkTime();
    }, 5000);
  };

  const loadBalances = () => 
    getAccountData(ACCESS_KEY, SECRET_KEY, {}).then(account=>{
      variableHistory.loadBalanse = true;
      let currencyKeys = Object.keys(currency);
      let newCurrency = {};
      account.forEach(element => {
        if (currencyKeys.includes(element.asset)) {
          let { asset, free } = element;
          newCurrency = {
            ...newCurrency,
            [asset]: {
              balance: free,
            }
          };
        }
      });
      currency = {...newCurrency};
      fs.appendFileSync('message.json', JSON.stringify(currency)+',' + '\n');
    })

  startScript();
  
})