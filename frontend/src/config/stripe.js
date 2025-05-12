import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe('pk_test_51RGwD8P12tNcNeMOXt7eFJtkmIOk7MZuMjqzfVuYfujiO7QxtPPo7h6ssDUPRckAQyM3bmCOCLHOMvlPxRL30xOT0021nSQloZ');

export default stripePromise; 