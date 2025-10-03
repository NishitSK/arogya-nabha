import mongoose from 'mongoose';
import crypto from 'crypto';

const healthRecordSchema = new mongoose.Schema({
  recordId: {
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
  recordType: {
    type: String,
    enum: [
      'Consultation', 'Lab-Report', 'Imaging', 'Prescription', 
      'Vaccination', 'Surgery', 'Emergency', 'Vital-Signs', 
      'Allergy', 'Chronic-Condition', 'Other'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000
  },
  // Medical details
  medical: {
    chiefComplaint: String,
    presentingSymptoms: [String],
    physicalExamination: String,
    diagnosis: [{
      condition: String,
      icd10Code: String,
      severity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe'],
        default: 'Mild'
      },
      status: {
        type: String,
        enum: ['Active', 'Resolved', 'Chronic', 'Under-Treatment'],
        default: 'Active'
      }
    }],
    treatmentPlan: String,
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    procedures: [{
      name: String,
      date: Date,
      description: String,
      outcome: String
    }],
    referrals: [{
      specialty: String,
      doctorName: String,
      reason: String,
      urgency: {
        type: String,
        enum: ['Routine', 'Urgent', 'Emergency'],
        default: 'Routine'
      }
    }]
  },
  // Vital signs
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: {
        type: String,
        default: 'mmHg'
      }
    },
    heartRate: {
      value: Number,
      unit: {
        type: String,
        default: 'bpm'
      }
    },
    temperature: {
      value: Number,
      unit: {
        type: String,
        enum: ['°C', '°F'],
        default: '°C'
      }
    },
    respiratoryRate: {
      value: Number,
      unit: {
        type: String,
        default: 'breaths/min'
      }
    },
    oxygenSaturation: {
      value: Number,
      unit: {
        type: String,
        default: '%'
      }
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      }
    },
    height: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm'
      }
    },
    bmi: Number
  },
  // Lab results
  labResults: [{
    testName: {
      type: String,
      required: true
    },
    value: String,
    unit: String,
    referenceRange: String,
    status: {
      type: String,
      enum: ['Normal', 'Abnormal', 'Critical', 'Pending'],
      default: 'Normal'
    },
    notes: String
  }],
  // Imaging results
  imaging: [{
    type: {
      type: String,
      enum: ['X-Ray', 'CT-Scan', 'MRI', 'Ultrasound', 'ECG', 'Other']
    },
    bodyPart: String,
    findings: String,
    impression: String,
    recommendations: String,
    imageUrl: String,
    reportUrl: String
  }],
  // Files and attachments
  attachments: [{
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
  // Record status and metadata
  status: {
    type: String,
    enum: ['Draft', 'Final', 'Amended', 'Corrected', 'Cancelled'],
    default: 'Final'
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Critical'],
    default: 'Normal'
  },
  confidentiality: {
    type: String,
    enum: ['Normal', 'Restricted', 'Very-Restricted'],
    default: 'Normal'
  },
  // Sharing and access control
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['doctor', 'specialist', 'nurse', 'pharmacist', 'patient', 'caregiver']
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: [{
      type: String,
      enum: ['view', 'edit', 'share', 'download']
    }],
    expiresAt: Date
  }],
  // Validation and verification
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    digitalSignature: String,
    verificationHash: String
  },
  // Amendment history
  amendments: [{
    amendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amendedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      required: true
    },
    changes: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }],
    notes: String
  }],
  // Follow-up information
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    dueDate: Date,
    instructions: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    nextRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthRecord'
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
healthRecordSchema.index({ patientId: 1, createdAt: -1 });
healthRecordSchema.index({ doctorId: 1, createdAt: -1 });
healthRecordSchema.index({ recordType: 1 });
healthRecordSchema.index({ status: 1 });
healthRecordSchema.index({ recordId: 1 });
healthRecordSchema.index({ appointmentId: 1 });

// Generate record ID before saving
healthRecordSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count records for today
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), date.getDate()),
        $lt: new Date(year, date.getMonth(), date.getDate() + 1)
      }
    });
    
    // Generate record ID based on type
    const typePrefix = {
      'Consultation': 'CON',
      'Lab-Report': 'LAB',
      'Imaging': 'IMG',
      'Prescription': 'PRE',
      'Vaccination': 'VAC',
      'Surgery': 'SUR',
      'Emergency': 'EMR',
      'Vital-Signs': 'VIT',
      'Allergy': 'ALL',
      'Chronic-Condition': 'CHR',
      'Other': 'OTH'
    };
    
    const prefix = typePrefix[this.recordType] || 'REC';
    this.recordId = `${prefix}${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Populate patient and doctor details
healthRecordSchema.pre(/^find/, function(next) {
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

// Virtual for record age
healthRecordSchema.virtual('recordAge').get(function() {
  const now = new Date();
  const diffTime = now - this.createdAt;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

// Method to add amendment
healthRecordSchema.methods.addAmendment = function(amendedBy, reason, changes, notes) {
  this.amendments.push({
    amendedBy,
    reason,
    changes,
    notes,
    amendedAt: new Date()
  });
  
  this.status = 'Amended';
  return this.save();
};

// Method to share record
healthRecordSchema.methods.shareWith = function(userId, role, permissions, sharedBy, expiresAt) {
  // Remove existing share if present
  this.sharedWith = this.sharedWith.filter(share => 
    !share.userId.equals(userId)
  );
  
  // Add new share
  this.sharedWith.push({
    userId,
    role,
    permissions,
    sharedBy,
    expiresAt,
    sharedAt: new Date()
  });
  
  return this.save();
};

// Method to verify record
healthRecordSchema.methods.verify = function(verifiedBy, digitalSignature) {
  this.verification.isVerified = true;
  this.verification.verifiedBy = verifiedBy;
  this.verification.verifiedAt = new Date();
  this.verification.digitalSignature = digitalSignature;
  
  // Generate verification hash
  this.verification.verificationHash = crypto.createHash('sha256')
    .update(JSON.stringify({
      recordId: this.recordId,
      patientId: this.patientId,
      doctorId: this.doctorId,
      verifiedBy,
      verifiedAt: this.verification.verifiedAt
    }))
    .digest('hex');
  
  return this.save();
};

// Method to check if user has access
healthRecordSchema.methods.hasAccess = function(userId, permission = 'view') {
  // Doctor who created the record always has access
  if (this.doctorId.equals(userId)) return true;
  
  // Patient always has view access to their own records
  if (this.patientId.userId.equals(userId) && permission === 'view') return true;
  
  // Check shared permissions
  const share = this.sharedWith.find(s => 
    s.userId.equals(userId) && 
    s.permissions.includes(permission) &&
    (!s.expiresAt || s.expiresAt > new Date())
  );
  
  return !!share;
};

export default mongoose.model('HealthRecord', healthRecordSchema);