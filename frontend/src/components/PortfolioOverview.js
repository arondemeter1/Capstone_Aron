import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function PortfolioOverview() {
  const [portfolioData, setPortfolioData] = useState(null);

  useEffect(() => {
    axios.get('https://mcsbt-integration-arondemeter.ey.r.appspot.com/') // i will change this at deployment
      .then(response => {
        setPortfolioData(response.data);
      })
      .catch(error => console.error('Error fetching portfolio data', error));
  }, []);

  if (!portfolioData) {
    return <div>Loading portfolio data...</div>;
  }

  return (
    <div>
      <h1>My Stock Portfolio</h1>
      <h2>Total Investment: ${portfolioData.total_portfolio_value.toFixed(2)}</h2>
      <h3>Total ROI: {portfolioData.portfolio_ROI.toFixed(2)}%</h3>

      <div>
        {Object.entries(portfolioData.portfolio_performance).map(([symbol, stock]) => (
          <div key={symbol}>
            <h4>{stock.company_name} ({symbol})</h4>
            <p>Value: ${stock.current_value.toFixed(2)}</p>
            <p>Percent of Portfolio: {stock.percent_of_portfolio.toFixed(2)}%</p>
            <Link to={`/stock/${symbol}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortfolioOverview;
