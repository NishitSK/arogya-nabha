// Quick debug script to test the auth route logic
import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config';

const testAuth = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database:', process.env.MONGODB_URI);
    
    const identifier = 'dr_sharma';
    console.log('Looking for user with identifier:', identifier);
    
    // Find user by username or email (same logic as in auth route)
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      console.log('❌ User not found');
      
      // Let's see what users exist
      const allUsers = await User.find({}, 'username email role').limit(10);
      console.log('Available users:', allUsers);
    } else {
      console.log('✅ User found:', {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
      
      // Test password comparison
      const isPasswordValid = await user.comparePassword('doctor123');
      console.log('Password valid:', isPasswordValid);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAuth();