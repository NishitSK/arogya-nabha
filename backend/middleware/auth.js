import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'No token provided in Authorization header'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Get user from database to ensure they still exist and have current info
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please login again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token is malformed'
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error verifying token'
    });
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access forbidden',
        message: `Role '${req.user.role}' does not have permission for this action`
      });
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid but continue without user
      console.log('Optional auth failed, continuing without user');
    }
  }

  next();
};

// Socket.IO authentication helper
export const authenticateSocketToken = (token) => {
  // Remove 'Bearer ' prefix if present
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
  
  try {
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'fallback_secret');
    return decoded;
  } catch (error) {
    throw new Error('Invalid socket token');
  }
};