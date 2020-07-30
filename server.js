const express = require('express')
var app = express()
const bodyparser = require('body-parser')
const { request, response } = require('express')
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()

app.use(express.json())
app.use(cors({origin:'http://localhost:3000'}))

const path = require('path');
    app.use(express.static('client/build'));

app.post('/api/OVERVIEW', async (request, response)=>{
   
    const ticker = request.body.ticker
    let APIresponse = await axios.get(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${process.env.API_KEY}`)
  
    response.json(APIresponse.data)
})

app.post('/api/BALANCE_SHEET', async (request, response)=>{
    const ticker = request.body.ticker
    let APIresponse = await axios.get(`https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${ticker}&apikey=${process.env.API_KEY}`)
    response.json(APIresponse.data)
})
app.get('*', (req, res) => res.sendFile(path.resolve('client/build', 'index.html')));
const port=process.env.PORT

app.listen(port, ()=>{ //Just verification to make sure the server works 
    console.log(port);
})