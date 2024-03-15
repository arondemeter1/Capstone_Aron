import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // make sure to install react-hook-form if not already installed

function PortfolioOverview() {
  const [portfolioData, setPortfolioData] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    axios.get('https://mcsbt-integration-arondemeter.ey.r.appspot.com/') // update this at deployment
      .then(response => {
        setPortfolioData(response.data);
      })
      .catch(error => console.error('Error fetching portfolio data', error));
  }, []);

  const onModifyStock = (data, isAdding) => {
    // Construct endpoint and validate form data
    const endpoint = isAdding ? '/portfolio/add' : '/portfolio/remove';
    const symbol = data.symbol;
    const shares = parseInt(data.shares);
    const purchase_price = parseFloat(data.purchase_price);

    // Validate the form data
    if (!symbol || isNaN(shares) || isNaN(purchase_price)) {
      console.error('Form data is invalid:', data);
      return; // Do not proceed with the API call
    }

    const stockData = {
      symbol: symbol,
      shares: shares,
      purchase_price: purchase_price,
    };

    console.log('Form data before sending:', stockData); // Log the validated and structured data

    axios.post(`https://mcsbt-integration-arondemeter.ey.r.appspot.com/${endpoint}`, stockData)
      .then(response => {
        setPortfolioData(response.data); // Update state with the new portfolio data
        reset(); // reset the form fields after submission
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
        <form onSubmit={handleSubmit(data => onModifyStock(data, true))} style={{ marginBottom: '1rem' }}>
          <input {...register('symbol')} placeholder="Ticker Symbol" required />
          <input {...register('shares')} placeholder="Number of Shares" type="number" required />
          <input {...register('purchase_price')} placeholder="Purchase Price" type="number" step="0.01" required />
          <button type="submit">Add Stock</button>
        </form>
        {/* Form for removing stocks */}
        <form onSubmit={handleSubmit(data => onModifyStock(data, false))}>
          <input {...register('symbol')} placeholder="Ticker Symbol" required />
          <input {...register('shares')} placeholder="Number of Shares" type="number" required />
          <button type="submit">Remove Stock</button>
        </form>
      </div>
    </div>
  );
}

export default PortfolioOverview;