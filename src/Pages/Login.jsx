import React, { useState } from 'react';
import { TextField, Button, Container, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API from '../API'; // Import the API instance

const Login = () => {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const apiInstance = API.getApiInstance(); // Get the API instance
      const response = await apiInstance.post('/auth/login', credentials);

      // Check if the response contains the token, userId, and role
      if (response.data.token && response.data.userId && response.data.role) {
        // Save user ID, role, and token to local storage
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('token', response.data.token);

        // Redirect based on user role
        if (response.data.role === 'admin' || response.data.role === 'sales') {
          navigate('/dashboard');
        } else {
          navigate('/products');
        }
      } else {
        setError('Login failed. Invalid response from server.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username or Email"
            name="identifier"
            fullWidth
            margin="normal"
            value={credentials.identifier}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={credentials.password}
            onChange={handleInputChange}
            required
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
