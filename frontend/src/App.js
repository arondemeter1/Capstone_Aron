import React, { useState } from 'react';
import PortfolioOverview from './components/PortfolioOverview';
import StockDetail from './components/StockDetail';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Updated import

function App() {
  const [selectedStock, setSelectedStock] = useState(null);

  return (
    <Router>
      <Routes> {/* Replace Switch with Routes */}
        <Route exact path="/" element={<PortfolioOverview onStockSelect={setSelectedStock} />} /> {/* Update Route syntax */}
        <Route path="/stock/:symbol" element={<StockDetail stock={selectedStock} />} /> {/* Update Route syntax */}
      </Routes>
    </Router>
  );
}

export default App;
