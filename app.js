let express = require('express');
let app = express();

require('dotenv').config();

app.get('/123', (req, res) => {
  res.send('Hello NODEJS World!!!!!!!! token:' + process.env.CRYPTO_TOKEN)
  
})

app.listen(4000, () => {
  console.log('start project port 4000! token:' + process.env.CRYPTO_TOKEN)
})