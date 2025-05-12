import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Create the Stripe instance outside of the component
const stripePromise = loadStripe('pk_test_51RGwD8P12tNcNeMOXt7eFJtkmIOk7MZuMjqzfVuYfujiO7QxtPPo7h6ssDUPRckAQyM3bmCOCLHOMvlPxRL30xOT0021nSQloZ');

const StripeProvider = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider; 