import React, { useState } from 'react';
import PortfolioOverview from './components/PortfolioOverview';
import StockDetail from './components/StockDetail';
import { HashRouter as Router, Route, Routes } from 'react-router-dom'; // i should have hash router instead of browser router

function App() {
  const [selectedStock, setSelectedStock] = useState(null);

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<PortfolioOverview onStockSelect={setSelectedStock} />} />
        <Route path="/stock/:symbol" element={<StockDetail stock={selectedStock} />} />
      </Routes>
    </Router>
  );
}

export default App;
