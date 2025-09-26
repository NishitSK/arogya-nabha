const express = require('express');
const Patient = require('../models/Patient');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate and get user id from token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Get or create patient profile for logged-in user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    let patient = await Patient.findOne({ user: req.userId });
    if (!patient) {
      // Create empty patient profile for new user
      patient = new Patient({ user: req.userId });
      await patient.save();
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update patient profile for logged-in user
router.post('/me', authMiddleware, async (req, res) => {
  try {
    let patient = await Patient.findOne({ user: req.userId });
    if (!patient) {
      patient = new Patient({ user: req.userId });
    }
    Object.assign(patient, req.body);
    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
