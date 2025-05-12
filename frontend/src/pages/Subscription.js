import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSubscribe = async (planId) => {
    try {
      setLoading(true);
      // TODO: Implement Stripe checkout
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      // Redirect to Stripe checkout
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99',
      features: [
        'HD streaming',
        'Watch on 1 device',
        'Limited content access',
        'No ads',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$14.99',
      features: [
        '4K streaming',
        'Watch on 4 devices',
        'Full content access',
        'No ads',
        'Download content',
      ],
    },
    {
      id: 'family',
      name: 'Family',
      price: '$19.99',
      features: [
        '4K streaming',
        'Watch on 6 devices',
        'Full content access',
        'No ads',
        'Download content',
        'Kids profile',
      ],
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Choose Your Plan
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Select the plan that best fits your needs
      </Typography>

      <Grid container spacing={4}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: user?.subscription?.plan === plan.id ? '2px solid #E50914' : 'none',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h4" component="div" gutterBottom>
                  {plan.price}
                  <Typography component="span" variant="subtitle1" color="text.secondary">
                    /month
                  </Typography>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
                  {plan.features.map((feature, index) => (
                    <Box
                      component="li"
                      key={index}
                      sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                    >
                      <Typography variant="body1">{feature}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || user?.subscription?.plan === plan.id}
                >
                  {user?.subscription?.plan === plan.id ? 'Current Plan' : 'Subscribe'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Subscription; 