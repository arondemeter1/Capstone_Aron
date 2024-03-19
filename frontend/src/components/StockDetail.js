import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function StockDetail() {
  const { symbol } = useParams();
  const [stockDetails, setStockDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define fetchStockDetails as a callback function so it can be re-used and passed around if needed
  const fetchStockDetails = useCallback(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/stock/${symbol}`) // Update this at deployment
      .then(response => {
        setStockDetails(response.data);
        setError(null); // Clear any previous errors
      })
      .catch(error => {
        console.error('Error fetching stock details', error);
        setError(error);
      })
      .finally(() => setLoading(false));
  }, [symbol]);

  // Fetch details on component mount and symbol change
  useEffect(fetchStockDetails, [fetchStockDetails]);

  if (loading) {
    return <div>Loading stock details...</div>;
  }

  if (error) {
    return <div>Error fetching stock details. Please try again later.</div>;
  }

  const { company_name, total_value_owned, current_price, roi, monthly_prices } = stockDetails;

  // CHANGED: Reverse the array to get the correct order for the x-axis
  const reversedMonthlyPrices = [...monthly_prices].reverse(); // Create a new reversed array

  // CHANGED: Use reversedMonthlyPrices to prepare chart data for monthly prices
  const chartData = {
    labels: reversedMonthlyPrices.map(data => data.date), // Use the reversed array for labels
    datasets: [{
      label: 'Monthly Closing Price',
      data: reversedMonthlyPrices.map(data => parseFloat(data.close)), // Use the reversed array for data
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: `Monthly Closing Prices for ${company_name}`,
      },
    },
  };

  return (
    <div className="stock-detail-layout">
      <div className="stock-info">
        <h2>{company_name} - {symbol}</h2>
        <table className="stock-info-table">
          <tbody>
            <tr>
              <th>Current Value:</th>
              <td>${total_value_owned.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Current Price:</th>
              <td>${current_price.toFixed(2)}</td>
            </tr>
            <tr>
              <th>ROI:</th>
              <td>{roi.toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="stock-chart">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default StockDetail;
