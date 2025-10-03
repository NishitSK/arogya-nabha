import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const notificationSchema = Joi.object({
  recipientId: Joi.string().required(),
  type: Joi.string().valid(
    'appointment_reminder', 'appointment_confirmed', 'appointment_cancelled',
    'prescription_ready', 'prescription_reminder', 'lab_results',
    'teleconsultation_invite', 'teleconsultation_reminder',
    'health_record_updated', 'payment_reminder', 'general'
  ).required(),
  title: Joi.string().max(200).required(),
  message: Joi.string().max(1000).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  data: Joi.object().default({}),
  channels: Joi.object({
    push: Joi.boolean().default(true),
    email: Joi.boolean().default(false),
    sms: Joi.boolean().default(false),
    inApp: Joi.boolean().default(true)
  }).default({
    push: true,
    email: false,
    sms: false,
    inApp: true
  }),
  scheduledFor: Joi.date().greater('now').allow(null),
  expiresAt: Joi.date().greater('now').allow(null)
});

const markReadSchema = Joi.object({
  notificationIds: Joi.array().items(Joi.string()).min(1).required()
});

const preferencesSchema = Joi.object({
  types: Joi.object({
    appointment_reminder: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      sms: Joi.boolean(),
      inApp: Joi.boolean()
    }),
    appointment_confirmed: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      sms: Joi.boolean(),
      inApp: Joi.boolean()
    }),
    appointment_cancelled: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      sms: Joi.boolean(),
      inApp: Joi.boolean()
    }),
    prescription_ready: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      sms: Joi.boolean(),
      inApp: Joi.boolean()
    }),
    prescription_reminder: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      sms: Joi.boolean(),
      inApp: Joi.boolean()
    }),
    lab_results: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      sms: Joi.boolean(),
      inApp: Joi.boolean()
    }),
    teleconsultation_invite: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      sms: Joi.boolean(),
      inApp: Joi.boolean()
    }),
    teleconsultation_reminder: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      sms: Joi.boolean(),
      inApp: Joi.boolean()
    }),
    health_record_updated: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      sms: Joi.boolean(),
      inApp: Joi.boolean()
    }),
    payment_reminder: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      sms: Joi.boolean(),
      inApp: Joi.boolean()
    }),
    general: Joi.object({
      push: Joi.boolean(),
      email: Joi.boolean(),
      sms: Joi.boolean(),
      inApp: Joi.boolean()
    })
  }),
  quietHours: Joi.object({
    enabled: Joi.boolean(),
    startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  }),
  frequency: Joi.object({
    digest: Joi.string().valid('none', 'daily', 'weekly'),
    immediate: Joi.boolean()
  })
});

// Get user's notifications
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    type, 
    priority, 
    unreadOnly = false,
    startDate,
    endDate
  } = req.query;

  // Build filter
  const filter = { recipientId: req.user.id };
  
  if (type && type !== 'all') {
    filter.type = type;
  }
  
  if (priority && priority !== 'all') {
    filter.priority = priority;
  }
  
  if (unreadOnly === 'true') {
    filter.isRead = false;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ 
    recipientId: req.user.id, 
    isRead: false 
  });

  res.json({
    notifications,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalNotifications: total,
      hasNext: skip + parseInt(limit) < total,
      hasPrev: parseInt(page) > 1
    },
    unreadCount,
    summary: {
      total,
      unread: unreadCount,
      read: total - unreadCount
    }
  });
}));

// Get notification by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  if (notification.recipientId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({ notification });
}));

// Mark notifications as read
router.put('/read', authenticateToken, asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = markReadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  const { notificationIds } = value;

  // Update notifications
  const result = await Notification.updateMany(
    { 
      _id: { $in: notificationIds },
      recipientId: req.user.id,
      isRead: false
    },
    { 
      isRead: true,
      readAt: new Date()
    }
  );

  res.json({
    message: `${result.modifiedCount} notifications marked as read`,
    updatedCount: result.modifiedCount
  });
}));

// Mark single notification as read
router.put('/:id/read', authenticateToken, asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  if (notification.recipientId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  res.json({
    message: 'Notification marked as read',
    notification: {
      id: notification._id,
      isRead: notification.isRead,
      readAt: notification.readAt
    }
  });
}));

// Mark all notifications as read
router.put('/read/all', authenticateToken, asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { 
      recipientId: req.user.id,
      isRead: false
    },
    { 
      isRead: true,
      readAt: new Date()
    }
  );

  res.json({
    message: `All ${result.modifiedCount} notifications marked as read`,
    updatedCount: result.modifiedCount
  });
}));

// Delete notification
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  if (notification.recipientId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.json({ 
    message: 'Notification deleted successfully',
    deletedId: req.params.id 
  });
}));

// Delete multiple notifications
router.delete('/bulk', authenticateToken, asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({ message: 'Valid notification IDs array is required' });
  }

  const result = await Notification.deleteMany({
    _id: { $in: notificationIds },
    recipientId: req.user.id
  });

  res.json({
    message: `${result.deletedCount} notifications deleted successfully`,
    deletedCount: result.deletedCount
  });
}));

// Get notification statistics
router.get('/stats/summary', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get counts by type
  const typeStats = await Notification.aggregate([
    { $match: { recipientId: require('mongoose').Types.ObjectId(userId) } },
    { $group: { 
      _id: '$type', 
      total: { $sum: 1 },
      unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
    }},
    { $sort: { total: -1 } }
  ]);

  // Get counts by priority
  const priorityStats = await Notification.aggregate([
    { $match: { recipientId: require('mongoose').Types.ObjectId(userId) } },
    { $group: { 
      _id: '$priority', 
      total: { $sum: 1 },
      unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
    }},
    { $sort: { total: -1 } }
  ]);

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentStats = await Notification.aggregate([
    { 
      $match: { 
        recipientId: require('mongoose').Types.ObjectId(userId),
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Total counts
  const totalNotifications = await Notification.countDocuments({ recipientId: userId });
  const unreadNotifications = await Notification.countDocuments({ 
    recipientId: userId, 
    isRead: false 
  });

  res.json({
    summary: {
      total: totalNotifications,
      unread: unreadNotifications,
      read: totalNotifications - unreadNotifications
    },
    byType: typeStats.map(stat => ({
      type: stat._id,
      total: stat.total,
      unread: stat.unread
    })),
    byPriority: priorityStats.map(stat => ({
      priority: stat._id,
      total: stat.total,
      unread: stat.unread
    })),
    recentActivity: recentStats.map(stat => ({
      date: stat._id,
      count: stat.count
    }))
  });
}));

// Get user's notification preferences
router.get('/preferences/me', authenticateToken, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ recipientId: req.user.id });
  
  // If no notification exists, return default preferences
  if (!notification) {
    const defaultPreferences = {
      types: {
        appointment_reminder: { push: true, email: true, sms: false, inApp: true },
        appointment_confirmed: { push: true, email: false, sms: false, inApp: true },
        appointment_cancelled: { push: true, email: true, sms: false, inApp: true },
        prescription_ready: { push: true, email: false, sms: false, inApp: true },
        prescription_reminder: { push: true, email: false, sms: false, inApp: true },
        lab_results: { push: true, email: true, sms: false, inApp: true },
        teleconsultation_invite: { push: true, email: true, sms: false, inApp: true },
        teleconsultation_reminder: { push: true, email: false, sms: false, inApp: true },
        health_record_updated: { push: true, email: false, sms: false, inApp: true },
        payment_reminder: { push: true, email: true, sms: false, inApp: true },
        general: { push: true, email: false, sms: false, inApp: true }
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      },
      frequency: {
        digest: 'none',
        immediate: true
      }
    };

    return res.json({ preferences: defaultPreferences });
  }

  // Get user's actual preferences from User model
  const user = await User.findById(req.user.id);
  const preferences = user.preferences?.notifications || {};

  res.json({ preferences });
}));

// Update notification preferences
router.put('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = preferencesSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  // Update user preferences
  const user = await User.findById(req.user.id);
  if (!user.preferences) {
    user.preferences = {};
  }
  
  user.preferences.notifications = value;
  await user.save();

  res.json({
    message: 'Notification preferences updated successfully',
    preferences: value
  });
}));

// Test notification (for development)
router.post('/test', authenticateToken, asyncHandler(async (req, res) => {
  const { type = 'general', title, message, priority = 'medium' } = req.body;

  const testNotification = new Notification({
    recipientId: req.user.id,
    type,
    title: title || 'Test Notification',
    message: message || 'This is a test notification sent from the API.',
    priority,
    data: { isTest: true },
    channels: {
      push: true,
      email: false,
      sms: false,
      inApp: true
    }
  });

  await testNotification.save();

  res.status(201).json({
    message: 'Test notification created successfully',
    notification: testNotification
  });
}));

// Create notification (system use - restricted)
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  // This endpoint is typically used by the system, not directly by users
  // Add role-based restrictions if needed
  
  // Validate input
  const { error, value } = notificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  const {
    recipientId,
    type,
    title,
    message,
    priority,
    data,
    channels,
    scheduledFor,
    expiresAt
  } = value;

  // Verify recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return res.status(404).json({ message: 'Recipient not found' });
  }

  // Check if user has permissions to send notifications
  // This might be restricted to admin users or system processes
  if (req.user.role !== 'admin' && recipientId !== req.user.id) {
    return res.status(403).json({ 
      message: 'You can only create notifications for yourself' 
    });
  }

  const notification = new Notification({
    recipientId,
    senderId: req.user.id,
    type,
    title,
    message,
    priority,
    data,
    channels,
    scheduledFor,
    expiresAt
  });

  await notification.save();

  res.status(201).json({
    message: 'Notification created successfully',
    notification
  });
}));

// Get notification types and their descriptions
router.get('/types/info', authenticateToken, asyncHandler(async (req, res) => {
  const notificationTypes = {
    appointment_reminder: {
      name: 'Appointment Reminder',
      description: 'Reminders for upcoming appointments',
      defaultChannels: { push: true, email: true, sms: false, inApp: true }
    },
    appointment_confirmed: {
      name: 'Appointment Confirmed',
      description: 'Confirmation when appointment is booked or confirmed',
      defaultChannels: { push: true, email: false, sms: false, inApp: true }
    },
    appointment_cancelled: {
      name: 'Appointment Cancelled',
      description: 'Notification when appointment is cancelled',
      defaultChannels: { push: true, email: true, sms: false, inApp: true }
    },
    prescription_ready: {
      name: 'Prescription Ready',
      description: 'When prescription is ready for pickup or delivery',
      defaultChannels: { push: true, email: false, sms: false, inApp: true }
    },
    prescription_reminder: {
      name: 'Medication Reminder',
      description: 'Reminders to take prescribed medications',
      defaultChannels: { push: true, email: false, sms: false, inApp: true }
    },
    lab_results: {
      name: 'Lab Results Available',
      description: 'When lab test results are ready',
      defaultChannels: { push: true, email: true, sms: false, inApp: true }
    },
    teleconsultation_invite: {
      name: 'Teleconsultation Invite',
      description: 'Invitation to join teleconsultation session',
      defaultChannels: { push: true, email: true, sms: false, inApp: true }
    },
    teleconsultation_reminder: {
      name: 'Teleconsultation Reminder',
      description: 'Reminder for upcoming teleconsultation',
      defaultChannels: { push: true, email: false, sms: false, inApp: true }
    },
    health_record_updated: {
      name: 'Health Record Updated',
      description: 'When health records are updated by healthcare provider',
      defaultChannels: { push: true, email: false, sms: false, inApp: true }
    },
    payment_reminder: {
      name: 'Payment Reminder',
      description: 'Reminders for pending payments',
      defaultChannels: { push: true, email: true, sms: false, inApp: true }
    },
    general: {
      name: 'General Notification',
      description: 'General system notifications and announcements',
      defaultChannels: { push: true, email: false, sms: false, inApp: true }
    }
  };

  res.json({ notificationTypes });
}));

export default router;