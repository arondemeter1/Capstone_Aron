import React, { useState } from 'react';
import PortfolioOverview from './components/PortfolioOverview';
import StockDetail from './components/StockDetail';
import Login from './components/Login';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  const handleLogin = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} onLogout={handleLogout} />} />
        <Route path="/" element={authenticated ? <PortfolioOverview onStockSelect={setSelectedStock} /> : <Navigate replace to="/login" />} />
        <Route path="/stock/:symbol" element={authenticated ? <StockDetail stock={selectedStock} /> : <Navigate replace to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;