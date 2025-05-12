require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://remoteUser:1234567890@10.117.187.86:27017/gostream-subscription?authSource=admin';
process.env.AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:5001/api';
process.env.CONTENT_API_URL = process.env.CONTENT_API_URL || 'http://localhost:5003/api';
process.env.SUBSCRIPTION_API_URL = process.env.SUBSCRIPTION_API_URL || 'http://localhost:5002/api';

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors({
  origin: [
  'https://webstream258.online',
  'https://www.webstream258.online',
  'https://gostream-frontend.fly.dev',
  'https://subscription.webstream258.online'
],
credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Health check route
app.get('/', (req, res) => {
  res.send('Subscription service is healthy.');
});

app.get('/api/subscription/test', (req, res) => {
  res.send('Subscription API working!');
});

const requiredEnvVars = {
  MONGODB_URI: process.env.MONGODB_URI,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_BASIC_PRICE_ID: process.env.STRIPE_BASIC_PRICE_ID,
  STRIPE_STANDARD_PRICE_ID: process.env.STRIPE_STANDARD_PRICE_ID,
  STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
  AUTH_API_URL: process.env.AUTH_API_URL
};

if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') && !process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
  console.error('Invalid Stripe secret key format. Key should start with sk_test_ or sk_live_');
  process.exit(1);
}

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value && key !== 'AUTH_API_URL')
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

console.log('Environment check:', Object.fromEntries(
  Object.entries(requiredEnvVars).map(([key, value]) => [key, value ? 'Set' : 'Not set'])
));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10
})
.then(() => {
  console.log('Connected to MongoDB');
  mongoose.connection.on('error', err => console.error('MongoDB connection error:', err));
  mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  stripeCustomerId: { type: String, required: true },
  stripeSubscriptionId: { type: String, required: true },
  plan: { type: String, required: true, enum: ['basic', 'standard', 'premium'] },
  status: { type: String, required: true, enum: ['active', 'canceled', 'past_due'], default: 'active' },
  currentPeriodEnd: Date,
  createdAt: { type: Date, default: Date.now }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

const STRIPE_PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID,
  standard: process.env.STRIPE_STANDARD_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID
};

console.log('Available plans and price IDs:', STRIPE_PRICE_IDS);

async function createStripeCustomer(email, name, userId) {
  try {
    return await stripe.customers.create({ email, name, metadata: { userId } });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

app.post('/api/subscription', async (req, res) => {
  try {
    const { userId, plan, email, name } = req.body;
    if (!userId || !plan || !email || !name) return res.status(400).json({ error: 'Missing required fields' });
    if (!['basic', 'standard', 'premium'].includes(plan) || !STRIPE_PRICE_IDS[plan]) {
      return res.status(400).json({ error: 'Invalid or missing Stripe plan ID' });
    }

    let customer;
    const existing = await Subscription.findOne({ userId });
    if (existing) {
      customer = await stripe.customers.retrieve(existing.stripeCustomerId);
    } else {
      customer = await createStripeCustomer(email, name, userId);
    }

    const stripeSub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: STRIPE_PRICE_IDS[plan] }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    const dbSub = await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: stripeSub.id,
        plan,
        status: stripeSub.status,
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000)
      },
      { upsert: true, new: true }
    );

    try {
      await axios.put(`${process.env.AUTH_API_URL}/api/users/${userId}/subscription`, {
        subscribed: true,
        plan
      });
    } catch (err) {
      console.error('Auth sync failed:', err.response?.data || err.message);
    }

    res.json({ subscription: dbSub, clientSecret: stripeSub.latest_invoice.payment_intent.client_secret });
  } catch (error) {
    console.error('Subscription creation failed:', error);
    res.status(500).json({ error: 'Error creating subscription', details: error.message });
  }
});

app.get('/api/subscription/:userId', async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.params.userId });
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    if (stripeSub.status !== sub.status) {
      sub.status = stripeSub.status;
      sub.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
      await sub.save();
    }
    res.json(sub);
  } catch (err) {
    console.error('Fetch subscription error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/subscription/:userId/cancel', async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.params.userId });
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    await stripe.subscriptions.del(sub.stripeSubscriptionId);
    sub.status = 'canceled';
    await sub.save();
    try {
      await axios.put(`${process.env.AUTH_API_URL}/api/users/${req.params.userId}/subscription`, {
        subscribed: false,
        plan: null
      });
    } catch (err) {
      console.error('Auth cancel sync failed:', err.response?.data || err.message);
    }
    res.json({ message: 'Subscription canceled' });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (['customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
    const stripeSub = event.data.object;
    try {
      const sub = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
      if (sub) {
        sub.status = stripeSub.status;
        sub.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
        await sub.save();
        await axios.put(`${process.env.AUTH_API_URL}/api/users/${sub.userId}/subscription`, {
          subscribed: stripeSub.status === 'active',
          plan: stripeSub.status === 'active' ? sub.plan : null
        });
      }
    } catch (err) {
      console.error('Webhook handling failed:', err);
    }
  }
  res.json({ received: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Subscription service running on port ${PORT}`);
});
