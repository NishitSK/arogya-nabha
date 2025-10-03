import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    unique: true,
    required: true
  },
  recipient: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true
    }
  },
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'system']
    },
    name: String
  },
  type: {
    type: String,
    enum: [
      'appointment_reminder',
      'appointment_confirmed',
      'appointment_cancelled',
      'appointment_rescheduled',
      'medication_reminder',
      'prescription_ready',
      'lab_result_available',
      'teleconsultation_starting',
      'health_record_updated',
      'emergency_alert',
      'system_maintenance',
      'payment_due',
      'payment_received',
      'follow_up_required',
      'test_result_critical',
      'vaccination_due',
      'general'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  // Rich content for notifications
  content: {
    html: String,
    actionButtons: [{
      text: String,
      action: String,
      style: {
        type: String,
        enum: ['primary', 'secondary', 'success', 'warning', 'danger'],
        default: 'primary'
      },
      url: String
    }],
    images: [{
      url: String,
      alt: String,
      caption: String
    }],
    metadata: mongoose.Schema.Types.Mixed
  },
  // Delivery channels
  channels: {
    push: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      deliveryStatus: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'clicked'],
        default: 'pending'
      },
      deviceTokens: [String],
      response: mongoose.Schema.Types.Mixed
    },
    email: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      deliveryStatus: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'bounced', 'opened', 'clicked'],
        default: 'pending'
      },
      emailAddress: String,
      subject: String,
      response: mongoose.Schema.Types.Mixed
    },
    sms: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      deliveryStatus: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'undelivered'],
        default: 'pending'
      },
      phoneNumber: String,
      response: mongoose.Schema.Types.Mixed
    },
    inApp: {
      enabled: { type: Boolean, default: true },
      displayed: { type: Boolean, default: false },
      displayedAt: Date
    }
  },
  // Notification status
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'clicked', 'dismissed', 'failed'],
    default: 'pending'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isClicked: {
    type: Boolean,
    default: false
  },
  clickedAt: Date,
  isDismissed: {
    type: Boolean,
    default: false
  },
  dismissedAt: Date,
  // Related entities
  relatedEntities: {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    healthRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthRecord'
    },
    teleconsultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teleconsultation'
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  },
  // Scheduling
  scheduledFor: Date,
  expiresAt: Date,
  // Retry configuration for failed notifications
  retryConfig: {
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    nextRetryAt: Date,
    lastError: String
  },
  // User preferences override
  userPreferences: {
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  // Tracking and analytics
  analytics: {
    viewCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    firstViewed: Date,
    lastViewed: Date,
    userAgent: String,
    ipAddress: String,
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown'
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ 'recipient.userId': 1, createdAt: -1 });
notificationSchema.index({ notificationId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ isRead: 1, 'recipient.userId': 1 });

// Compound indexes for common queries
notificationSchema.index({ 'recipient.userId': 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, scheduledFor: 1, status: 1 });

// Generate notification ID before saving
notificationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), date.getDate()),
        $lt: new Date(year, date.getMonth(), date.getDate() + 1)
      }
    });
    
    this.notificationId = `NOTIF${year}${month}${day}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Populate sender and recipient details
notificationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'recipient.userId',
    select: 'name email phone profilePicture preferences'
  }).populate({
    path: 'sender.userId',
    select: 'name email phone profilePicture'
  });
  next();
});

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Virtual for checking if notification is due
notificationSchema.virtual('isDue').get(function() {
  if (!this.scheduledFor) return true;
  return new Date() >= this.scheduledFor;
});

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffTime = now - this.createdAt;
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return this.createdAt.toLocaleDateString();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function(userId = null) {
  if (!userId || this.recipient.userId.equals(userId)) {
    this.isRead = true;
    this.readAt = new Date();
    this.status = 'read';
    
    // Update analytics
    this.analytics.viewCount += 1;
    if (!this.analytics.firstViewed) {
      this.analytics.firstViewed = new Date();
    }
    this.analytics.lastViewed = new Date();
    
    return this.save();
  }
  throw new Error('Unauthorized to mark this notification as read');
};

// Method to mark as clicked
notificationSchema.methods.markAsClicked = function(userId = null) {
  if (!userId || this.recipient.userId.equals(userId)) {
    this.isClicked = true;
    this.clickedAt = new Date();
    this.status = 'clicked';
    
    // Update analytics
    this.analytics.clickCount += 1;
    
    return this.save();
  }
  throw new Error('Unauthorized to mark this notification as clicked');
};

// Method to dismiss notification
notificationSchema.methods.dismiss = function(userId = null) {
  if (!userId || this.recipient.userId.equals(userId)) {
    this.isDismissed = true;
    this.dismissedAt = new Date();
    return this.save();
  }
  throw new Error('Unauthorized to dismiss this notification');
};

// Method to update delivery status for a channel
notificationSchema.methods.updateDeliveryStatus = function(channel, status, response = null) {
  if (this.channels[channel]) {
    this.channels[channel].deliveryStatus = status;
    this.channels[channel].sentAt = new Date();
    this.channels[channel].sent = ['sent', 'delivered', 'opened', 'clicked'].includes(status);
    
    if (response) {
      this.channels[channel].response = response;
    }
    
    // Update overall status
    if (status === 'delivered' || status === 'sent') {
      this.status = 'delivered';
    } else if (status === 'failed') {
      this.status = 'failed';
      this.retryConfig.attempts += 1;
      this.retryConfig.lastError = response?.error || 'Delivery failed';
      
      // Schedule retry if within limit
      if (this.retryConfig.attempts < this.retryConfig.maxAttempts) {
        const retryDelay = Math.pow(2, this.retryConfig.attempts) * 60 * 1000; // Exponential backoff
        this.retryConfig.nextRetryAt = new Date(Date.now() + retryDelay);
      }
    }
    
    return this.save();
  }
  throw new Error(`Invalid channel: ${channel}`);
};

// Method to check if notification should be retried
notificationSchema.methods.shouldRetry = function() {
  return this.status === 'failed' && 
         this.retryConfig.attempts < this.retryConfig.maxAttempts &&
         this.retryConfig.nextRetryAt &&
         new Date() >= this.retryConfig.nextRetryAt;
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    'recipient.userId': userId,
    isRead: false,
    isDismissed: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gte: new Date() } }
    ]
  });
};

// Static method to get notifications for user with pagination
notificationSchema.statics.getForUser = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type = null,
    priority = null,
    isRead = null,
    startDate = null,
    endDate = null
  } = options;
  
  const query = {
    'recipient.userId': userId,
    isDismissed: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gte: new Date() } }
    ]
  };
  
  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (isRead !== null) query.isRead = isRead;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('relatedEntities.appointmentId', 'appointmentNumber appointmentDate')
    .populate('relatedEntities.prescriptionId', 'prescriptionNumber')
    .populate('relatedEntities.healthRecordId', 'recordId title');
};

export default mongoose.model('Notification', notificationSchema);