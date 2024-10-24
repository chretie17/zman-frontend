import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Box, 
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Visibility, 
  VisibilityOff, 
  Person, 
  Lock,
  Agriculture 
} from '@mui/icons-material';
import API from '../api';

// Custom styled components
const LoginContainer = styled(Container)(({ theme }) => ({
  height: '100vh',
  background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '40px',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  width: '100%',
  maxWidth: '450px',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '2rem',
  '& .MuiSvgIcon-root': {
    fontSize: '3.5rem',
    color: '#2d6a4f',
    marginBottom: '1rem',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: '1.5rem',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#2d6a4f50',
    },
    '&:hover fieldset': {
      borderColor: '#2d6a4f',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2d6a4f',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#2d6a4f',
  },
  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
    color: '#2d6a4f',
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2d6a4f 30%, #40916c 90%)',
  padding: '12px',
  marginTop: '1rem',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1rem',
  borderRadius: '10px',
  boxShadow: '0 4px 15px rgba(45, 106, 79, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #40916c 30%, #52b788 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(45, 106, 79, 0.4)',
  },
}));

const ErrorMessage = styled(motion.div)(({ theme }) => ({
  color: '#d32f2f',
  background: '#fde8e8',
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '1rem',
  textAlign: 'center',
  fontSize: '0.9rem',
}));

const Login = () => {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.post('/auth/login', credentials);

      if (response.data.token && response.data.userId && response.data.role) {
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('token', response.data.token);

        // Animate before navigation
        await new Promise(resolve => setTimeout(resolve, 500));

        if (response.data.role === 'admin' || response.data.role === 'sales') {
          navigate('/dashboard');
        } else {
          navigate('/products');
        }
      } else {
        setError('Login failed. Invalid response from server.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer maxWidth={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StyledPaper elevation={3}>
          <LogoContainer>
            <Agriculture fontSize="large" />
            <Typography variant="h4" 
              component="h1" 
              sx={{ 
                color: '#2d6a4f',
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: '0.5rem'
              }}
            >
              AgriTech Login
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#4a5568',
                textAlign: 'center',
                marginBottom: '1rem'
              }}
            >
              Welcome back! Please sign in to continue
            </Typography>
          </LogoContainer>

          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </ErrorMessage>
          )}

          <form onSubmit={handleSubmit}>
            <StyledTextField
              label="Username or Email"
              name="identifier"
              fullWidth
              value={credentials.identifier}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
            <StyledTextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={credentials.password}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <LoginButton
              variant="contained"
              fullWidth
              type="submit"
              disabled={isLoading}
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </LoginButton>
          </form>
        </StyledPaper>
      </motion.div>
    </LoginContainer>
  );
};

export default Login;