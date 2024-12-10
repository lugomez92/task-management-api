import React, { useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize the useNavigate hook

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');

    try {
      // Send a POST request to the backend login route
      const response = await axios.post('http://localhost:4000/auth/login', {
        email,
        password,
      });

      // If login is successful, get the token from the response
      const { token } = response.data;
      localStorage.setItem('token', token); // Store token in localStorage
      console.log("Token received: ", token);
      onLogin(token); // Notify App.js that login is successful

      // Decode the token to get the role
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role; // Extract role from decoded token
      console.log("User Role: ", userRole);

      // Redirect based on the role
      if (userRole === 'admin') {
        navigate('/dashboard'); // Admin goes to Dashboard
      } else {
        navigate('/team-board'); // Manager, PM, Engineer go to TeamBoard
      }
    } catch (err) {
      // If login fails, show an error message
      setError('Invalid credentials');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Row>
        <Col xs={12} md={12}>
          <h3 className="text-center">Login</h3>
          <Form onSubmit={handleSubmit}>
            {/* Email Input */}
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {/* Password Input */}
            <Form.Group controlId="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {/* Error Message */}
            {error && <p className="text-danger">{error}</p>}

            {/* Submit Button */}
            <Button variant="primary" type="submit" block className="w-100 mt-3">
              Login
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginForm;
