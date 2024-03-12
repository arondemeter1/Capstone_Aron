import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ onLogout }) {
  let navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); // This should change the authenticated state to false
    navigate('/login'); // Redirects user to login page
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
}

export default Logout;
