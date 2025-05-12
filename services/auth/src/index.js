require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { sendThankYouEmail } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ CORS configuration
app.use(cors({
  origin: [
    "https://gostream-frontend.fly.dev",
    "https://www.webstream258.online",
    "https://webstream258.online",
    "https://gostream-frontend.fly.dev"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


// ✅ Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscribed: {
    type: Boolean,
    default: false
  },
  plan: {
    type: String,
    enum: [null, 'basic', 'standard', 'premium'],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Validation middleware
const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register Route
app.post('/api/register', validateUser, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    await sendThankYouEmail(user.email, user.name);

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscribed: user.subscribed,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login Attempt:', email);  //  Debug log

    const user = await User.findOne({ email });

    console.log('User From DB:', user);  //  See what’s retrieved

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscribed: user.subscribed,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// JWT verification middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/me', authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      subscribed: req.user.subscribed,
      plan: req.user.plan
    }
  });
});

app.put('/api/users/:userId/subscription', async (req, res) => {
  try {
    const { userId } = req.params;
    const { subscribed, plan } = req.body;

    if (typeof subscribed !== 'boolean') {
      return res.status(400).json({ error: 'subscribed must be a boolean' });
    }
    if (plan && !['basic', 'standard', 'premium'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { subscribed, plan: subscribed ? plan : null },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscribed: user.subscribed,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/users/:id/role', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change user roles' });
    }

    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view users' });
    }

    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/test', (req, res) => {
  res.send('Auth API working!');
});

app.get('/', (req, res) => {
  res.send('Auth service is up and running!');
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Auth service running on port ${PORT}`);
});
