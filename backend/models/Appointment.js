import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentNumber: {
    type: String,
    unique: true,
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
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    start: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    end: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    }
  },
  type: {
    type: String,
    enum: ['In-Person', 'Teleconsultation'],
    required: true,
    default: 'In-Person'
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled', 'No-Show'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Emergency'],
    default: 'Normal'
  },
  reasonForVisit: {
    type: String,
    required: true,
    maxlength: 500
  },
  symptoms: [{
    type: String,
    maxlength: 200
  }],
  duration: {
    type: Number, // in minutes
    default: 30
  },
  consultationFee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Insurance'],
    default: null
  },
  // For teleconsultation
  meetingDetails: {
    roomId: String,
    joinUrl: String,
    meetingId: String,
    password: String
  },
  // Appointment notes and consultation details
  consultation: {
    chiefComplaint: String,
    presentIllness: String,
    physicalExamination: String,
    diagnosis: [{
      condition: String,
      icd10Code: String,
      isPrimary: Boolean
    }],
    treatmentPlan: String,
    followUpInstructions: String,
    nextAppointmentSuggested: Date,
    vitalSigns: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      weight: Number,
      height: Number,
      oxygenSaturation: Number
    }
  },
  // Reminders and notifications
  reminders: [{
    type: {
      type: String,
      enum: ['SMS', 'Email', 'Push'],
      required: true
    },
    scheduledTime: Date,
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  // Cancellation details
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['Pending', 'Processed', 'Failed'],
      default: 'Pending'
    }
  },
  // Reschedule history
  rescheduleHistory: [{
    oldDate: Date,
    oldTime: {
      start: String,
      end: String
    },
    newDate: Date,
    newTime: {
      start: String,
      end: String
    },
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rescheduledAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  // Files and documents
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Rating and feedback
  rating: {
    patientRating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      ratedAt: Date
    },
    doctorRating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      ratedAt: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1, 'appointmentTime.start': 1 });
appointmentSchema.index({ appointmentNumber: 1 });

// Generate appointment number before saving
appointmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count appointments for today to generate sequence
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), date.getDate()),
        $lt: new Date(year, date.getMonth(), date.getDate() + 1)
      }
    });
    
    this.appointmentNumber = `APT${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Populate patient and doctor details
appointmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'patientId',
    populate: {
      path: 'userId',
      select: 'name email phone'
    }
  }).populate({
    path: 'doctorId',
    populate: {
      path: 'userId',
      select: 'name email phone'
    }
  });
  next();
});

// Virtual for appointment status color
appointmentSchema.virtual('statusColor').get(function() {
  const colors = {
    'Pending': '#f59e0b',
    'Confirmed': '#10b981',
    'In-Progress': '#3b82f6',
    'Completed': '#059669',
    'Cancelled': '#ef4444',
    'No-Show': '#6b7280'
  };
  return colors[this.status] || '#6b7280';
});

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.start.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  return appointmentDateTime > now;
};

// Method to check if appointment is today
appointmentSchema.methods.isToday = function() {
  const today = new Date();
  const appointmentDate = new Date(this.appointmentDate);
  
  return today.toDateString() === appointmentDate.toDateString();
};

// Method to reschedule appointment
appointmentSchema.methods.reschedule = function(newDate, newTime, rescheduledBy, reason) {
  // Add to reschedule history
  this.rescheduleHistory.push({
    oldDate: this.appointmentDate,
    oldTime: this.appointmentTime,
    newDate,
    newTime,
    rescheduledBy,
    reason
  });
  
  // Update appointment details
  this.appointmentDate = newDate;
  this.appointmentTime = newTime;
  this.status = 'Confirmed';
  
  return this.save();
};

export default mongoose.model('Appointment', appointmentSchema);