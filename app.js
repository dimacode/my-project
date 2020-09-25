let express = require('express');
let app = express();

require('dotenv').config();

app.get('/', (req, res) => {
  res.send('Hello NODEJS World!!!!!!!! token:' + process.env.CRYPTO_TOKEN)
})

app.listen(3003, () => {
  console.log('start project port 3003! token:' + process.env.CRYPTO_TOKEN)
})