import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

//register the chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function StockDetail() {
  const { symbol } = useParams();
  const [stockDetails, setStockDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`https://mcsbt-integration-arondemeter.ey.r.appspot.com/stock/${symbol}`) //update with the correct backend URL
      .then(response => {
        setStockDetails(response.data);
      })
      .catch(error => {
        console.error('Error fetching stock details', error);
        setError(error);
      })
      .finally(() => setLoading(false));
  }, [symbol]); //dependency array with symbol to refetch when it changes

  if (loading) {
    return <div>Loading stock details...</div>;
  }

  if (error) {
    return <div>Error fetching stock details. Please try again later.</div>;
  }

  const { company_name, total_value_owned, current_price, roi, monthly_prices } = stockDetails;

  //prepare chart data for monthly prices
  const chartData = {
    labels: monthly_prices.map(data => data.date),
    datasets: [{
      label: 'Monthly Closing Price',
      data: monthly_prices.map(data => parseFloat(data.close)),
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
    <div>
      <h2>{company_name} - {symbol}</h2>
      <p>Current Value: ${total_value_owned.toFixed(2)}</p>
      <p>Current Price: ${current_price.toFixed(2)}</p>
      <p>ROI: {roi.toFixed(2)}%</p>
      
      <Line data={chartData} options={chartOptions} />

      {}
    </div>
  );
}

export default StockDetail;
