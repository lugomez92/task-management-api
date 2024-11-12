import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginForm from './components/LoginForm'; 
import Dashboard from './components/Dashboard'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (email, password) => {
    // Simulate an authentication check
    if (email === "testuser@example.com" && password === "securepassword123") {
      setIsLoggedIn(true);
    } else {
      // If login fails
      alert("Invalid credentials.");
    }
  };

  return (
    <Router>
      <Routes>
        {/* Redirect to dashboard if logged in, else show login form */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginForm onLogin={handleLogin} />}
        />
        
        {/* If logged in, show Dashboard; otherwise, redirect to login */}
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
