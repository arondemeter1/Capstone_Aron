import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function PortfolioOverview({ onStockSelect }) {
  //initialize state to match expected structure of the Flask response
  const [portfolioData, setPortfolioData] = useState({ portfolio_performance: {} });

  useEffect(() => {
    //fetch data from Flask API
    axios.get('http://localhost:5000/') 
      .then(response => {
        console.log('Fetched data:', response.data); //log the fetched data
        setPortfolioData(response.data.portfolio_performance); //set the state
      })
      .catch(error => console.error('Error fetching portfolio data', error));
  }, []);

  //log the state right before rendering
  console.log('Portfolio Data at render:', portfolioData);

  return (
    <div>
      <h1>My Stock Portfolio</h1>
      {Object.entries(portfolioData).map(([symbol, stock]) => (
        <div key={symbol}>
          <Link to={`/stock/${symbol}`} onClick={() => onStockSelect(stock)}>
            {stock.company_name} ({symbol})
          </Link>
        </div>
      ))}
    </div>
  );
}

export default PortfolioOverview;
