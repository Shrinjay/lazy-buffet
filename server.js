//Imports
const express = require('express')
var app = express()
const bodyparser = require('body-parser')
const { request, response } = require('express')
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()

//Use express, allow cors from testing frontend port.
app.use(express.json())
app.use(cors({origin:'http://localhost:3000'}))

const path = require('path');
    app.use(express.static('client/build'));

//Get data from AlphaVantage API
function getData (func, ticker, request, response) {
    axios.get(`https://www.alphavantage.co/query?function=${func}&symbol=${ticker}&apikey=${process.env.API_KEY}`)
    .then((res)=>response.json(res.data))
    .catch((err)=>response.json(err))
}

//Get financial overview statement
app.post('/api/OVERVIEW', async (request, response)=>{
    const ticker = request.body.ticker
    getData("OVERVIEW", ticker, request, response)
})

//Get balance statement
app.post('/api/BALANCE_SHEET', async (request, response)=>{
    const ticker = request.body.ticker
    getData("BALANCE_SHEET", ticker, request, response)
})

//Serve index.html on all endpoints
app.get('*', (req, res) => res.sendFile(path.resolve('client/build', 'index.html')));
const port=process.env.PORT

app.listen(port, ()=>{ //Just verification to make sure the server works 
    console.log(port);
})