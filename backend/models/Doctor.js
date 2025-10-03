import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  medicalLicenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true,
    enum: [
      'General Medicine',
      'Cardiology',
      'Dermatology',
      'Pediatrics',
      'Orthopedics',
      'Gynecology',
      'Neurology',
      'Psychiatry',
      'Oncology',
      'Ophthalmology',
      'ENT',
      'Dentistry',
      'Emergency Medicine',
      'Other'
    ]
  },
  subSpecialization: {
    type: String,
    default: null
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  qualifications: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  hospital: {
    name: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    department: String
  },
  consultationFee: {
    inPerson: {
      type: Number,
      required: true,
      min: 0
    },
    teleconsultation: {
      type: Number,
      required: true,
      min: 0
    }
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    slots: [{
      startTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
      },
      endTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
      },
      isAvailable: {
        type: Boolean,
        default: true
      }
    }]
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isAvailableForEmergency: {
    type: Boolean,
    default: false
  },
  teleconsultationEnabled: {
    type: Boolean,
    default: true
  },
  languages: [{
    type: String,
    enum: ['English', 'Hindi', 'Punjabi', 'Other']
  }],
  awards: [{
    title: String,
    organization: String,
    year: Number
  }],
  publications: [{
    title: String,
    journal: String,
    year: Number,
    doi: String
  }],
  statistics: {
    totalPatients: {
      type: Number,
      default: 0
    },
    totalConsultations: {
      type: Number,
      default: 0
    },
    totalTeleconsultations: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
doctorSchema.index({ 'userId': 1 });
doctorSchema.index({ 'specialization': 1 });
doctorSchema.index({ 'hospital.name': 1 });
doctorSchema.index({ 'rating.average': -1 });
doctorSchema.index({ 'isVerified': 1 });

// Populate user data automatically
doctorSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'userId',
    select: 'name email phone profilePicture isActive'
  });
  next();
});

// Update rating when review is added
doctorSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
  this.rating.count = this.reviews.length;
};

export default mongoose.model('Doctor', doctorSchema);