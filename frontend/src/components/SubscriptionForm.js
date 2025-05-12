import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import Confetti from 'react-confetti';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, Container, Typography, Grid, Paper, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      ':-webkit-autofill': {
        color: '#fce883',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
};

const SubscriptionForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to subscribe');
      navigate('/login');
      return;
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate, isAuthenticated, user]);

  const plans = {
    basic: {
      name: 'Basic Plan',
      price: '$9.99/month',
      features: ['HD Streaming', '1 Device', 'Basic Content'],
      color: '#2196f3'
    },
    standard: {
      name: 'Standard Plan',
      price: '$14.99/month',
      features: ['Full HD Streaming', '2 Devices', 'All Content'],
      color: '#9c27b0'
    },
    premium: {
      name: 'Premium Plan',
      price: '$19.99/month',
      features: ['4K Streaming', '4 Devices', 'All Content + Early Access'],
      color: '#3f51b5'
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!isAuthenticated || !user) {
      setError('Please log in to subscribe');
      setProcessing(false);
      navigate('/login');
      return;
    }

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found. Please try again.');
      setProcessing(false);
      return;
    }

    try {
      console.log('Creating subscription for user:', user);
      
      const requestData = {
        userId: user.id,
        plan: selectedPlan,
        email: user.email,
        name: user.name
      };

      console.log('Sending subscription request with data:', requestData);

      const response = await axios.post(
        'http://localhost:5003/api/subscription',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Subscription created:', response.data);
      const { clientSecret } = response.data;

      // Log the client secret for debugging
      console.log('Client Secret:', clientSecret);

      // Confirm the payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user.name,
              email: user.email
            }
          }
        }
      );

      if (paymentError) {
        console.error('Payment error:', paymentError);
        if (paymentError.type === 'validation_error') {
          switch (paymentError.code) {
            case 'incomplete_number':
              setError('Please enter a complete card number');
              break;
            case 'incomplete_expiry':
              setError('Please enter a complete expiration date');
              break;
            case 'incomplete_cvc':
              setError('Please enter a complete CVC');
              break;
            default:
              setError(paymentError.message);
          }
        } else if (paymentError.type === 'invalid_request_error') {
          console.error('Stripe configuration error:', paymentError);
          setError('There was an issue with the payment system. Please try again later.');
        } else {
          setError(paymentError.message);
        }
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        setShowConfetti(true);
        toast.success(`🎉 Welcome to ${plans[selectedPlan].name}! You're now a premium user!`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          setShowConfetti(false);
          onSuccess(response.data.subscription);
        }, 5000);
      } else {
        console.log('Payment intent status:', paymentIntent?.status);
        setError('Payment is being processed. Please wait...');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      console.error('Error response:', err.response?.data);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        setError(
          err.response?.data?.details || 
          err.response?.data?.error || 
          'An error occurred while processing your payment. Please try again.'
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  // If user is not logged in, show a message
  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please log in to subscribe
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      <ToastContainer />
      
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Choose Your Perfect Plan
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Unlock premium features and enjoy unlimited streaming
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          {Object.entries(plans).map(([planId, plan]) => (
            <Grid item xs={12} md={4} key={planId}>
              <Paper
                elevation={selectedPlan === planId ? 8 : 2}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  transform: selectedPlan === planId ? 'scale(1.05)' : 'scale(1)',
                  bgcolor: selectedPlan === planId ? plan.color : 'background.paper',
                  color: selectedPlan === planId ? 'white' : 'text.primary',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 8,
                  },
                }}
                onClick={() => setSelectedPlan(planId)}
              >
                {selectedPlan === planId && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -12,
                      right: -12,
                      bgcolor: 'warning.main',
                      color: 'warning.contrastText',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Selected
                  </Box>
                )}
                <Typography variant="h4" component="h2" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h3" component="p" sx={{ mb: 3, fontWeight: 'bold' }}>
                  {plan.price}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  {plan.features.map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        component="span"
                        sx={{
                          mr: 1,
                          color: selectedPlan === planId ? 'white' : 'success.main',
                        }}
                      >
                        ✓
                      </Box>
                      <Typography>{feature}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Payment Details
            </Typography>
            <Box sx={{ mb: 3 }}>
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </Box>

            {error && (
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: 'error.light',
                  color: 'error.contrastText',
                  borderRadius: 1,
                }}
              >
                {error}
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={!stripe || processing}
              onClick={handleSubmit}
              sx={{
                py: 2,
                bgcolor: plans[selectedPlan].color,
                '&:hover': {
                  bgcolor: plans[selectedPlan].color,
                  opacity: 0.9,
                },
              }}
            >
              {processing ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                `Subscribe to ${plans[selectedPlan].name}`
              )}
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default SubscriptionForm; 