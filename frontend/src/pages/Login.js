import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, clearError } from '../features/auth/authSlice';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const API_URL = process.env.REACT_APP_AUTH_API_URL || 'http://localhost:5001';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(0, 0, 0, 0.75)',
  borderRadius: theme.shape.borderRadius,
}));

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginStart());
    
    try {
      const response = await axios.post(`${API_URL}/api/login`, formData);
      dispatch(loginSuccess(response.data));
      navigate('/');
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.error || 'Login failed'));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(/images/hero-bg.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <StyledPaper elevation={3}>
          <Typography component="h1" variant="h4" sx={{ mb: 3, color: '#E50914' }}>
            GoStream
          </Typography>
          <Typography component="h2" variant="h5" sx={{ mb: 3, color: 'white' }}>
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#E50914',
                '&:hover': {
                  backgroundColor: '#f40612',
                },
              }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                New to GoStream?{' '}
                <Link component={RouterLink} to="/register" sx={{ color: 'white' }}>
                  Sign up now
                </Link>
              </Typography>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default Login; 