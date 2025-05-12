import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

const SubscriptionDialog = ({ open, onClose, onSubscribe }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribeClick = async (plan) => {
    try {
      setLoading(true);
      setError(null);
      await onSubscribe(plan);
    } catch (err) {
      setError('Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Basic',
      price: '$4.99',
      period: 'month',
      features: [
        'HD Quality',
        'Watch on 1 device',
        'Limited content access',
        'Basic support'
      ]
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      features: [
        '4K Quality',
        'Watch on 4 devices',
        'Full content access',
        'Priority support',
        'Download videos'
      ]
    },
    {
      name: 'Family',
      price: '$14.99',
      period: 'month',
      features: [
        '4K Quality',
        'Watch on 6 devices',
        'Full content access',
        '24/7 support',
        'Download videos',
        'Family profiles'
      ]
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h4" align="center" gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          Select the perfect plan for your streaming needs
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.name}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s ease-in-out'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h4" component="div" gutterBottom>
                    {plan.price}
                    <Typography variant="subtitle1" color="text.secondary" component="span">
                      /{plan.period}
                    </Typography>
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {plan.features.map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => handleSubscribeClick(plan)}
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Subscribe'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionDialog; 