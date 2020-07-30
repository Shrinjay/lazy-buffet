import React from 'react';
import {Form, Input, Label, Col, Row, Container, Jumbotron, Navbar, Button, NavbarBrand, Media} from 'reactstrap';
import logo from './logo.svg';
import './App.css';
const axios = require('axios')


/* Finish this project up in a few days then don't touch it again */

class App extends React.Component{

  constructor(props){
    super(props);
    this.state={
      ticker: null,
      recommendation: null,
      metrics: null
    }
    this.handleChange = this.handleChange.bind(this)
    this.calculateScore = this.calculateScore.bind(this)
    this.displayMetrics = this.displayMetrics.bind(this)
  }

  

  handleChange(event){
    this.setState({ticker: event.target.value})
  }
 
async calculateScore() {
    var companyData = {
        debtRatio: null,
        currentRatio: null,
        LongtoShortDebt: null,
        profitMargin: null,
        PEG: null,
        PE: null,
        PBV: null,
        dividendYield: null,
    }
    this.setState({metrics: null, recommendation: null})
  
    let resOverview = await axios.post('/api/OVERVIEW/', {
      "ticker": this.state.ticker
    })
    console.log(resOverview)
    if (Object.keys(resOverview.data).length==0)
    { 
        this.setState({recommendation: "Invalid Ticker"})
        return
    }
    if (Object.keys(resOverview.data).length==1 && typeof(resOverview.data.Note)=="string")
    {
      this.setState({recommendation: "Too many requests, please try again in 1 minute"})
      return
    }
    companyData.profitMargin = (parseFloat(resOverview.data.ProfitMargin)/0.4)
    companyData.PEG = (1/parseFloat(resOverview.data.PEGRatio))
    companyData.PE = (9/parseFloat(resOverview.data.PERatio))
    companyData.PBV = (1.20/parseFloat(resOverview.data.PriceToBookRatio))
    
    let resBalance = await axios.post(`/api/BALANCE_SHEET`, {
      "ticker": this.state.ticker
    })

    
    companyData.debtRatio = ((parseFloat(resBalance.data.quarterlyReports[1].totalAssets))/(parseFloat(resBalance.data.quarterlyReports[1].shortTermDebt)+parseFloat(resBalance.data.quarterlyReports[1].longTermDebt)))
    companyData.currentRatio = ((parseFloat(resBalance.data.quarterlyReports[2].totalCurrentAssets))/(parseFloat(resBalance.data.quarterlyReports[1].totalCurrentLiabilities))/1.5)

    if (isNaN(parseFloat(resBalance.data.quarterlyReports[1].shortTermDebt)+parseFloat(resBalance.data.quarterlyReports[1].longTermDebt)))
    {
      companyData.debtRatio = 2
    }
    
    Object.entries(companyData).forEach(entry => {
        if (entry[1]==null || entry[1]==Infinity || typeof(entry[1])=='undefined' || isNaN(entry[1]))
        {   
            delete companyData[entry[0]]
        }
        
    })

    var sum = 0
    var divisor = 0;
    Object.values(companyData).forEach(val => {
        sum = sum + val
        divisor++
    })
    
    var score = sum/divisor
    
   this.setState({metrics: companyData})

    if (score>=1)
    {
      this.setState({recommendation: 'BUY'})
      return
    }
    if (0.6<=score && score<1)
    {
      this.setState({recommendation: 'HOLD'})
      return
    }
    if (score<0.6)
    {
      this.setState({recommendation: 'SELL'})
      return
    }
    else {
      console.log('ERR ' + score)
    }

    
}

displayMetrics() {
  console.log(this.state.metrics)
  return Object.keys(this.state.metrics).map(key => 
  <div>{key} is {this.state.metrics[key]>=1 && <b>Good</b>} {this.state.metrics[key]<1 && this.state.metrics[key]>=0.6 ? <b>OK</b>: false} {this.state.metrics[key]<0.6 && <b>Poor</b>}</div>)
  
}



 
  render(){
    return (
      <div>
        <Navbar>
        <Container fluid>
          <Col xs="12">
          <Jumbotron style={{backgroundColor: "#ff8680", color: 'white'}}>
          <Col xs={{size: 10, offset: 2}}>
            <Media>
              <Media object src={require('./img/buffet.png')} style={{maxHeight: "128px", maxWidth: "128px"}}></Media>
            </Media>
            <h2 className="display-3"><b>Lazy-Buffet</b></h2>
          
          <h3 classname="lead">Automated Fundamental Financial Analysis for NYSE-Listed Stocks</h3>
          <h5 className="lead">A project by Shrinjay Mukherjee</h5>
          <h5 className="lead">Art by Cheryl Li</h5>
          <br />
          <span>
         <Row>
         {this.state.ticker!=null && <h4>Our rating for {this.state.ticker} is: </h4>}
         {this.state.recommendation!=null &&<h4 style={{margin: "2px"}}> {this.state.recommendation}</h4>}
         </Row>
         </span>
         {this.state.metrics!=null && this.displayMetrics()}
    
          </Col>
        </Jumbotron>
          </Col>
        </Container>
        </Navbar>
        <Container style={{color: 'white'}}>
         <Row>
         <Col xs={{size: 8, offset: 2}}>
          <Form>
           <Label for="inputTicker"><h5 className="lead">Enter the ticker (1-4 digit) for an NYSE listed stock (ex. Apple: AAPL):</h5></Label>
          <Input type="text" onChange={this.handleChange}></Input>
          <Button style={{margin: "2px"}} color="success" type="button" onClick={this.calculateScore}>Submit</Button>
         
        </Form>
          </Col>
         </Row>
          </Container> 
      
      </div>
      );
  }
}

export default App;
