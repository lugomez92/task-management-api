import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginForm from './components/LoginForm';
import Dashboard from './components/admin-dashboard/Dashboard';
import TeamDashboard from './components/team-dashboard/TeamDashboard';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in based on the presence of a token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      console.log("Token in local storage: ", storedToken);
      console.log("Decoded Token: ", jwtDecode(storedToken));
    }
  }, []);

  console.log("isLoggedIn: ", isLoggedIn);

  const handleLogin = (token) => {
    setIsLoggedIn(true);
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        {/* Show LoginForm if user is not logged in */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/team-board" /> : <LoginForm onLogin={handleLogin} />} />
        
        {/* Redirect to TeamDashboard or Dashboard depending on role */}
        <Route
          path="/team-board"
          element={
            isLoggedIn ? (
              <TeamDashboard
                token={token}
                role={jwtDecode(token).role}
                teamId={jwtDecode(token).teamId}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Admin Dashboard route */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn && jwtDecode(token).role === 'admin' ? (
              <Dashboard token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
