import React from 'react';
import { Link } from 'react-router-dom'; //import Link from react-router-dom

const Navbar = ({ onLogout }) => {
  return (
    <nav>
      <div>
        <Link to="/" className="navbar-logo">
          Stock Tracker
        </Link>
        <button onClick={onLogout} className="logout-button top-right-corner">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
