import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
} from '@mui/material';
import { logout } from '../features/auth/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement profile update
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{ width: 100, height: 100, mr: 3 }}
            alt={user?.name}
            src={user?.avatar}
          />
          <Box>
            <Typography variant="h4" component="h1">
              {user?.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{ mr: 2 }}
              >
                Update Profile
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Grid>
          </Grid>
        </form>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Account Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Member since: {new Date(user?.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Subscription: {user?.subscription?.plan || 'Free'}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 