import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ onLogout }) {
  let navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login'); //redirects user to login page
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
}

export default Logout;
