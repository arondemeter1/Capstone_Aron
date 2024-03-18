import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; //import useNavigate hook from react-router-dom

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); //initialize the useNavigate hook

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post('https://mcsbt-integration-arondemeter.ey.r.appspot.com/login', { username, password }, { withCredentials: true }) // Ensure to include credentials
      .then(response => {
        if (response.data.status === 'success') {
          onLogin(); //this should update the parent component's state
          navigate('/'); //redirects the user to the root path
        } else {
          setError('Login failed: ' + response.data.message); //shows error message
        }
      })
      .catch(error => {
        setError('Login error: ' + error.message);
        console.error('Login error', error);
      });
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome to the Stock Tracker</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>
          <div className="input-container">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <div className="button-container">
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
