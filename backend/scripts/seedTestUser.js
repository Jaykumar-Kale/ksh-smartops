require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function seedTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove existing test user if any
    await User.deleteOne({ email: 'test@ksh.com' });

    const user = new User({
      email: 'test@ksh.com',
      password: 'test123', // plain text (WILL BE HASHED)
      role: 'admin',
      isActive: true,
    });

    await user.save(); // triggers bcrypt pre-save hook

    console.log('✅ Test admin user created successfully');
    console.log('Email: test@ksh.com');
    console.log('Password: test123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating test user:', err.message);
    process.exit(1);
  }
}

seedTestUser();
