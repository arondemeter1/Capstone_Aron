import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function PortfolioOverview() {
  const [portfolioData, setPortfolioData] = useState(null);

  // Function to fetch portfolio data
  const fetchPortfolioData = () => {
    axios.get('https://mcsbt-integration-arondemeter.ey.r.appspot.com')
      .then(response => {
        setPortfolioData(response.data);
      })
      .catch(error => console.error('Error fetching portfolio data', error));
  };

  // Fetch data on component mount
  useEffect(fetchPortfolioData, []);

  const onModifyStock = (event, isAdding) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const symbol = formData.get('symbol').toUpperCase();
    const shares = parseInt(formData.get('shares'), 10);
    const purchase_price = isAdding ? parseFloat(formData.get('purchase_price')) : undefined;

    const stockData = {
      symbol: symbol,
      shares: shares,
      ...(isAdding && { purchase_price: purchase_price })
    };

    const endpoint = isAdding ? '/portfolio/add' : '/portfolio/remove';
    axios.post(`https://mcsbt-integration-arondemeter.ey.r.appspot.com${endpoint}`, stockData)
      .then(() => {
        fetchPortfolioData(); // Refresh the portfolio data
      })
      .catch(error => {
        console.error('Error modifying portfolio', error);
      });
  };

  if (!portfolioData) {
    return <div>Loading portfolio data...</div>;
  }

  return (
    <div className="portfolio-container">
      <h1>My Stock Portfolio</h1>
      <h2>Total Investment: ${portfolioData.total_portfolio_value.toFixed(2)}</h2>
      <h3>Total ROI: {portfolioData.portfolio_ROI.toFixed(2)}%</h3>
      
      {/* Wrapped forms and table in a box container as per your design */}
      <div className="portfolio-box">
        {/* Forms for adding and removing stocks */}
        <div className="portfolio-modify">
          <form onSubmit={(e) => onModifyStock(e, true)}>
            <input name="symbol" placeholder="Ticker Symbol" required />
            <input name="shares" placeholder="Number of Shares" type="number" required />
            <input name="purchase_price" placeholder="Purchase Price" type="number" step="0.01" required />
            <button type="submit">Add Stock</button>
          </form>
          <form onSubmit={(e) => onModifyStock(e, false)}>
            <input name="symbol" placeholder="Ticker Symbol" required />
            <input name="shares" placeholder="Number of Shares" type="number" required />
            <button type="submit">Remove Stock</button>
          </form>
        </div>

        {/* Table container for the stock details */}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
                <th>Percent of Portfolio</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(portfolioData.portfolio_performance).map(([symbol, stock]) => (
                <tr key={symbol}>
                  <td>{stock.company_name} ({symbol})</td>
                  <td>${stock.current_value.toFixed(2)}</td>
                  <td>{stock.percent_of_portfolio.toFixed(2)}%</td>
                  <td><Link to={`/stock/${symbol}`}>View Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PortfolioOverview;
