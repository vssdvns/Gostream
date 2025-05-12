const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://remoteUser:1234567890@10.117.187.86:27017/gostream-auth?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

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
  }
});

const User = mongoose.model('User', userSchema);

// Function to make a user admin
async function makeUserAdmin(email) {
  try {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }

    console.log('✅ Success!');
    console.log(`User ${user.email} is now an admin`);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('❌ Please provide an email address as an argument');
  console.log('Usage: node makeAdmin.js user@example.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.log('❌ Invalid email format');
  process.exit(1);
}

console.log('🔍 Searching for user:', email);
makeUserAdmin(email); 