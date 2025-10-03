import mongoose from 'mongoose';

const teleconsultationSchema = new mongoose.Schema({
  consultationId: {
    type: String,
    unique: true,
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  status: {
    type: String,
    enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled', 'No-Show', 'Technical-Issue'],
    default: 'Scheduled'
  },
  // Meeting room details
  meetingRoom: {
    roomId: {
      type: String,
      required: true,
      unique: true
    },
    joinUrl: String,
    patientJoinUrl: String,
    doctorJoinUrl: String,
    meetingPassword: String,
    recordingEnabled: {
      type: Boolean,
      default: false
    },
    recordingUrl: String
  },
  // Participants and their connection status
  participants: {
    patient: {
      joined: {
        type: Boolean,
        default: false
      },
      joinedAt: Date,
      leftAt: Date,
      connectionQuality: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        default: 'Good'
      },
      deviceInfo: {
        browser: String,
        os: String,
        camera: Boolean,
        microphone: Boolean
      }
    },
    doctor: {
      joined: {
        type: Boolean,
        default: false
      },
      joinedAt: Date,
      leftAt: Date,
      connectionQuality: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        default: 'Good'
      },
      deviceInfo: {
        browser: String,
        os: String,
        camera: Boolean,
        microphone: Boolean
      }
    }
  },
  // Consultation details
  consultation: {
    chiefComplaint: String,
    symptoms: [String],
    duration: Number, // in minutes
    assessment: String,
    recommendations: String,
    prescriptionGiven: {
      type: Boolean,
      default: false
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date,
    urgentCareRecommended: {
      type: Boolean,
      default: false
    }
  },
  // Chat messages during consultation
  chatMessages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderRole: {
      type: String,
      enum: ['patient', 'doctor'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    fileUrl: String,
    fileName: String
  }],
  // Files shared during consultation
  sharedFiles: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  // Technical issues and logs
  technicalIssues: [{
    reportedBy: {
      type: String,
      enum: ['patient', 'doctor', 'system'],
      required: true
    },
    issueType: {
      type: String,
      enum: ['Audio', 'Video', 'Connection', 'Screen-Share', 'Other'],
      required: true
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolution: String
  }],
  // Quality metrics
  qualityMetrics: {
    overallRating: {
      patient: {
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        feedback: String
      },
      doctor: {
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        feedback: String
      }
    },
    technicalQuality: {
      audioQuality: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor']
      },
      videoQuality: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor']
      },
      connectionStability: {
        type: String,
        enum: ['Very Stable', 'Stable', 'Unstable', 'Very Unstable']
      }
    },
    averageLatency: Number, // in milliseconds
    disconnectionCount: {
      type: Number,
      default: 0
    }
  },
  // Payment details
  payment: {
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    paymentMethod: String,
    transactionId: String,
    paidAt: Date
  },
  // Cancellation details
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'system']
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['Not-Applicable', 'Pending', 'Processed', 'Failed']
    }
  },
  // System metadata
  metadata: {
    platform: {
      type: String,
      enum: ['Web', 'Mobile', 'Desktop'],
      default: 'Web'
    },
    serverRegion: String,
    roomServerUrl: String,
    recordingSettings: {
      recordVideo: { type: Boolean, default: false },
      recordAudio: { type: Boolean, default: false },
      recordScreen: { type: Boolean, default: false }
    }
  },
  // Privacy and consent
  consent: {
    patient: {
      recordingConsent: {
        type: Boolean,
        default: false
      },
      dataShareConsent: {
        type: Boolean,
        default: false
      },
      consentTimestamp: Date
    },
    doctor: {
      recordingConsent: {
        type: Boolean,
        default: false
      },
      dataShareConsent: {
        type: Boolean,
        default: false
      },
      consentTimestamp: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
teleconsultationSchema.index({ appointmentId: 1 });
teleconsultationSchema.index({ patientId: 1, scheduledStartTime: -1 });
teleconsultationSchema.index({ doctorId: 1, scheduledStartTime: -1 });
teleconsultationSchema.index({ consultationId: 1 });
teleconsultationSchema.index({ status: 1 });
teleconsultationSchema.index({ 'meetingRoom.roomId': 1 });

// Generate consultation ID before saving
teleconsultationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count consultations for today
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), date.getDate()),
        $lt: new Date(year, date.getMonth(), date.getDate() + 1)
      }
    });
    
    this.consultationId = `TC${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
    
    // Generate unique room ID
    if (!this.meetingRoom.roomId) {
      this.meetingRoom.roomId = `room_${this.consultationId}_${Date.now()}`;
    }
  }
  next();
});

// Populate related data
teleconsultationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'appointmentId',
    select: 'appointmentNumber appointmentDate appointmentTime'
  }).populate({
    path: 'patientId',
    populate: {
      path: 'userId',
      select: 'name email phone profilePicture'
    }
  }).populate({
    path: 'doctorId',
    populate: {
      path: 'userId',
      select: 'name email phone profilePicture'
    }
  });
  next();
});

// Virtual for consultation duration in minutes
teleconsultationSchema.virtual('actualDuration').get(function() {
  if (this.actualStartTime && this.actualEndTime) {
    return Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  return null;
});

// Virtual for checking if consultation is live
teleconsultationSchema.virtual('isLive').get(function() {
  return this.status === 'In-Progress' && 
         this.participants.patient.joined && 
         this.participants.doctor.joined;
});

// Method to start consultation
teleconsultationSchema.methods.startConsultation = function() {
  this.actualStartTime = new Date();
  this.status = 'In-Progress';
  return this.save();
};

// Method to end consultation
teleconsultationSchema.methods.endConsultation = function(consultationData = {}) {
  this.actualEndTime = new Date();
  this.status = 'Completed';
  
  if (consultationData) {
    this.consultation = { ...this.consultation, ...consultationData };
  }
  
  return this.save();
};

// Method to add chat message
teleconsultationSchema.methods.addChatMessage = function(senderId, senderRole, message, messageType = 'text', fileData = null) {
  const chatMessage = {
    senderId,
    senderRole,
    message,
    messageType,
    timestamp: new Date()
  };
  
  if (fileData) {
    chatMessage.fileUrl = fileData.fileUrl;
    chatMessage.fileName = fileData.fileName;
  }
  
  this.chatMessages.push(chatMessage);
  return this.save();
};

// Method to report technical issue
teleconsultationSchema.methods.reportTechnicalIssue = function(reportedBy, issueType, description) {
  this.technicalIssues.push({
    reportedBy,
    issueType,
    description,
    timestamp: new Date()
  });
  return this.save();
};

// Method to join consultation
teleconsultationSchema.methods.joinConsultation = function(participantRole, deviceInfo = {}) {
  const participant = this.participants[participantRole];
  participant.joined = true;
  participant.joinedAt = new Date();
  participant.deviceInfo = deviceInfo;
  
  // If both participants have joined, start the consultation
  if (this.participants.patient.joined && this.participants.doctor.joined && this.status === 'Scheduled') {
    this.startConsultation();
  }
  
  return this.save();
};

// Method to leave consultation
teleconsultationSchema.methods.leaveConsultation = function(participantRole) {
  const participant = this.participants[participantRole];
  participant.joined = false;
  participant.leftAt = new Date();
  
  return this.save();
};

export default mongoose.model('Teleconsultation', teleconsultationSchema);