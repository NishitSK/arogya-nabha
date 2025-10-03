import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  prescriptionNumber: {
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  diagnosis: [{
    condition: {
      type: String,
      required: true
    },
    icd10Code: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  medications: [{
    medicationName: {
      type: String,
      required: true
    },
    genericName: String,
    strength: {
      type: String,
      required: true
    },
    dosageForm: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Cream', 'Drops', 'Inhaler', 'Other'],
      required: true
    },
    dosage: {
      quantity: {
        type: Number,
        required: true
      },
      frequency: {
        type: String,
        enum: ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed', 'Custom'],
        required: true
      },
      customFrequency: String, // For custom frequency
      timing: {
        type: String,
        enum: ['Before meals', 'After meals', 'With meals', 'On empty stomach', 'At bedtime', 'As directed'],
        default: 'As directed'
      }
    },
    duration: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['Days', 'Weeks', 'Months', 'As needed'],
        required: true
      }
    },
    quantity: {
      type: Number,
      required: true
    },
    refills: {
      type: Number,
      default: 0
    },
    instructions: String,
    warnings: [{
      type: String
    }],
    sideEffects: [{
      type: String
    }],
    isGenericAllowed: {
      type: Boolean,
      default: true
    }
  }],
  instructions: {
    general: String,
    dietary: String,
    lifestyle: String,
    followUp: String
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Discontinued', 'Modified'],
    default: 'Active'
  },
  validUntil: {
    type: Date,
    required: true
  },
  // Digital signature and verification
  digitalSignature: {
    doctorSignature: String,
    timestamp: Date,
    verificationHash: String
  },
  // Pharmacy details if dispensed
  pharmacy: {
    name: String,
    licenseNumber: String,
    address: String,
    pharmacistName: String,
    dispensedDate: Date,
    dispensedBy: String
  },
  // Medication reminders
  reminders: [{
    medicationIndex: Number, // Index of medication in medications array
    reminderTimes: [String], // Array of times in HH:MM format
    isActive: {
      type: Boolean,
      default: true
    },
    lastReminded: Date
  }],
  // Lab tests recommended
  labTests: [{
    testName: {
      type: String,
      required: true
    },
    urgency: {
      type: String,
      enum: ['Routine', 'Urgent', 'STAT'],
      default: 'Routine'
    },
    instructions: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    results: {
      fileUrl: String,
      summary: String,
      reportedBy: String,
      reportedDate: Date
    }
  }],
  // Follow-up details
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    suggestedDate: Date,
    instructions: String,
    appointmentBooked: {
      type: Boolean,
      default: false
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  },
  // Insurance and billing
  billing: {
    consultationFee: Number,
    medicationCost: Number,
    totalCost: Number,
    insuranceCovered: {
      type: Boolean,
      default: false
    },
    insuranceAmount: Number,
    patientAmount: Number
  },
  // Prescription sharing and access
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String, // 'pharmacy', 'doctor', 'caregiver'
    sharedAt: {
      type: Date,
      default: Date.now
    },
    permissions: [{
      type: String,
      enum: ['view', 'dispense', 'modify']
    }]
  }],
  // Compliance tracking
  compliance: [{
    medicationIndex: Number,
    date: Date,
    taken: {
      type: Boolean,
      required: true
    },
    time: String,
    notes: String,
    reportedBy: {
      type: String,
      enum: ['Patient', 'Caregiver', 'System'],
      default: 'Patient'
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
prescriptionSchema.index({ prescriptionNumber: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ validUntil: 1 });
prescriptionSchema.index({ appointmentId: 1 });

// Generate prescription number before saving
prescriptionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count prescriptions for today to generate sequence
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), date.getDate()),
        $lt: new Date(year, date.getMonth(), date.getDate() + 1)
      }
    });
    
    this.prescriptionNumber = `RX${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
    
    // Set default valid until date (30 days from creation)
    if (!this.validUntil) {
      this.validUntil = new Date(date.getTime() + (30 * 24 * 60 * 60 * 1000));
    }
  }
  next();
});

// Populate patient and doctor details
prescriptionSchema.pre(/^find/, function(next) {
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

// Virtual for checking if prescription is valid
prescriptionSchema.virtual('isValid').get(function() {
  return new Date() <= this.validUntil && this.status === 'Active';
});

// Virtual for days remaining
prescriptionSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diffTime = this.validUntil - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Method to add medication compliance
prescriptionSchema.methods.addCompliance = function(medicationIndex, taken, time, notes, reportedBy = 'Patient') {
  this.compliance.push({
    medicationIndex,
    date: new Date(),
    taken,
    time,
    notes,
    reportedBy
  });
  return this.save();
};

// Method to calculate compliance rate for a medication
prescriptionSchema.methods.getComplianceRate = function(medicationIndex, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentCompliance = this.compliance.filter(c => 
    c.medicationIndex === medicationIndex && 
    c.date >= cutoffDate
  );
  
  if (recentCompliance.length === 0) return 0;
  
  const takenCount = recentCompliance.filter(c => c.taken).length;
  return Math.round((takenCount / recentCompliance.length) * 100);
};

// Method to get next reminder time
prescriptionSchema.methods.getNextReminder = function(medicationIndex) {
  const medication = this.medications[medicationIndex];
  const reminder = this.reminders.find(r => r.medicationIndex === medicationIndex);
  
  if (!reminder || !reminder.isActive) return null;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  for (const time of reminder.reminderTimes) {
    const [hours, minutes] = time.split(':').map(Number);
    const reminderTime = new Date(today);
    reminderTime.setHours(hours, minutes, 0, 0);
    
    if (reminderTime > now) {
      return reminderTime;
    }
  }
  
  // If no reminder today, return first reminder of next day
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [hours, minutes] = reminder.reminderTimes[0].split(':').map(Number);
  tomorrow.setHours(hours, minutes, 0, 0);
  
  return tomorrow;
};

// Method to mark prescription as dispensed
prescriptionSchema.methods.markAsDispensed = function(pharmacyDetails) {
  this.pharmacy = {
    ...pharmacyDetails,
    dispensedDate: new Date()
  };
  return this.save();
};

export default mongoose.model('Prescription', prescriptionSchema);