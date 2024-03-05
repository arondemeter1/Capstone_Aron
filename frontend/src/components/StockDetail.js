import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// will import any additional libraries for charting, e.g. Chart.js

function StockDetail() {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);

  useEffect(() => {
    // Replace 'YOUR_FLASK_SERVER_URL' with the actual base URL of your Flask server
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/stock/${symbol}`);
        setStockData(response.data);
      } catch (error) {
        console.error('Error fetching stock data', error);
        //handle error appropriately
      }
    };

    fetchStockData();
  }, [symbol]); //re-run the effect if the symbol changes

  return (
    <div>
      {stockData ? (
        <>
          <h2>{stockData.company_name} - {symbol}</h2>
          {/* add chart and additional details here using stockData */}
        </>
      ) : (
        <p>Loading...</p> //provides a loading state or error message
      )}
    </div>
  );
}

export default StockDetail;
