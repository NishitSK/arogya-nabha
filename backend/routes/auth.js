import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  role: Joi.string().valid('patient', 'doctor', 'admin').default('patient'),
  name: Joi.string().max(100).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required()
});

const loginSchema = Joi.object({
  identifier: Joi.string().required(), // username or email
  password: Joi.string().required()
});

// Register
router.post('/register', asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  const { username, email, password, role, name, phone } = value;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }, { phone }]
  });

  if (existingUser) {
    let field = 'User';
    if (existingUser.username === username) field = 'Username';
    else if (existingUser.email === email) field = 'Email';
    else if (existingUser.phone === phone) field = 'Phone number';
    
    return res.status(409).json({ 
      message: `${field} already exists`,
      field: field.toLowerCase()
    });
  }

  // Create new user
  const user = new User({
    username,
    email,
    password, // Will be hashed by the pre-save middleware
    role,
    name,
    phone
  });

  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user._id, 
      username: user.username, 
      email: user.email,
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'fallback_secret', 
    { expiresIn: '24h' }
  );

  // Update last login
  await user.updateLastLogin();

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive
    }
  });
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  const { identifier, password } = value;

  // Find user by username or email
  const user = await User.findOne({
    $or: [
      { username: identifier },
      { email: identifier }
    ]
  });

  if (!user) {
    return res.status(401).json({ 
      message: 'Invalid credentials',
      details: 'User not found'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({ 
      message: 'Account deactivated',
      details: 'Please contact support to reactivate your account'
    });
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ 
      message: 'Invalid credentials',
      details: 'Incorrect password'
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user._id, 
      username: user.username, 
      email: user.email,
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'fallback_secret', 
    { expiresIn: '24h' }
  );

  // Update last login
  await user.updateLastLogin();

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      profilePicture: user.profilePicture,
      preferences: user.preferences,
      lastLogin: user.lastLogin
    }
  });
}));

// Refresh Token
router.post('/refresh', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}));

// Get current user
router.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        preferences: user.preferences,
        address: user.address,
        emergencyContact: user.emergencyContact,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}));

// Logout (optional - mainly for client-side token cleanup)
router.post('/logout', asyncHandler(async (req, res) => {
  // In a more advanced implementation, you might want to blacklist the token
  // For now, we'll just send a success response
  res.json({ 
    message: 'Logout successful',
    note: 'Please remove the token from client storage'
  });
}));

// Change Password
router.put('/change-password', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: 'All password fields are required' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}));

export default router;
