import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function PortfolioOverview() {
  const [portfolioData, setPortfolioData] = useState(null);

  // Function to fetch portfolio data
  const fetchPortfolioData = () => {
    axios.get('http://localhost:5000') // update this at deployment
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
    axios.post(`http://localhost:5000${endpoint}`, stockData)
      .then(() => {
        // Refresh the portfolio data after successful stock modification
        fetchPortfolioData();
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
      <div className="portfolio-list">
        <h1>My Stock Portfolio</h1>
        <h2>Total Investment: ${portfolioData.total_portfolio_value.toFixed(2)}</h2>
        <h3>Total ROI: {portfolioData.portfolio_ROI.toFixed(2)}%</h3>
        {Object.entries(portfolioData.portfolio_performance).map(([symbol, stock]) => (
          <div key={symbol}>
            <h4>{stock.company_name} ({symbol})</h4>
            <p>Value: ${stock.current_value.toFixed(2)}</p>
            <p>Percent of Portfolio: {stock.percent_of_portfolio.toFixed(2)}%</p>
            <Link to={`/stock/${symbol}`}>View Details</Link>
          </div>
        ))}
      </div>
      <div className="portfolio-modify">
        {/* Form for adding stocks */}
        <form onSubmit={(e) => onModifyStock(e, true)}>
          <input name="symbol" placeholder="Ticker Symbol" required />
          <input name="shares" placeholder="Number of Shares" type="number" required />
          <input name="purchase_price" placeholder="Purchase Price" type="number" step="0.01" required />
          <button type="submit">Add Stock</button>
        </form>
        {/* Form for removing stocks */}
        <form onSubmit={(e) => onModifyStock(e, false)}>
          <input name="symbol" placeholder="Ticker Symbol" required />
          <input name="shares" placeholder="Number of Shares" type="number" required />
          <button type="submit">Remove Stock</button>
        </form>
      </div>
    </div>
  );
}

export default PortfolioOverview;
