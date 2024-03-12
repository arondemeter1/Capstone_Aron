import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Navbar = ({ onLogout }) => {
  return (
    <nav>
      <div>
        <Link to="/" className="navbar-logo">
          Stock Portfolio
        </Link>
        <button onClick={onLogout} className="logout-button top-right-corner">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
