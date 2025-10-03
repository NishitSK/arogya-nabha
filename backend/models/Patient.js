import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: null
  },
  height: {
    value: Number,
    unit: {
      type: String,
      enum: ['cm', 'ft'],
      default: 'cm'
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
  medicalHistory: [{
    condition: {
      type: String,
      required: true
    },
    diagnosedDate: Date,
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe'],
      default: 'Mild'
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved', 'Chronic'],
      default: 'Active'
    },
    notes: String
  }],
  allergies: [{
    allergen: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe'],
      required: true
    },
    reaction: String,
    notes: String
  }],
  currentMedications: [{
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  }],
  vitals: [{
    type: {
      type: String,
      enum: ['Blood Pressure', 'Heart Rate', 'Temperature', 'Weight', 'Height', 'BMI', 'Blood Sugar', 'Oxygen Saturation'],
      required: true
    },
    value: {
      type: String,
      required: true
    },
    unit: String,
    recordedDate: {
      type: Date,
      default: Date.now
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  labReports: [{
    testName: String,
    reportDate: Date,
    results: mongoose.Schema.Types.Mixed,
    normalRange: String,
    interpretation: String,
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    fileUrl: String
  }],
  immunizations: [{
    vaccine: String,
    dateGiven: Date,
    nextDue: Date,
    batchNumber: String,
    administeredBy: String,
    location: String
  }],
  surgicalHistory: [{
    procedure: String,
    date: Date,
    surgeon: String,
    hospital: String,
    complications: String,
    notes: String
  }],
  familyHistory: [{
    relationship: {
      type: String,
      enum: ['Father', 'Mother', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Other']
    },
    condition: String,
    ageOfOnset: Number,
    notes: String
  }],
  lifestyle: {
    smokingStatus: {
      type: String,
      enum: ['Never', 'Former', 'Current'],
      default: 'Never'
    },
    alcoholConsumption: {
      type: String,
      enum: ['Never', 'Occasional', 'Moderate', 'Heavy'],
      default: 'Never'
    },
    exerciseFrequency: {
      type: String,
      enum: ['None', 'Occasional', 'Regular', 'Daily'],
      default: 'None'
    },
    dietaryPreferences: [{
      type: String,
      enum: ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Gluten-Free', 'Diabetic', 'Low-Sodium', 'Other']
    }]
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    effectiveDate: Date,
    expirationDate: Date
  },
  preferences: {
    preferredLanguage: {
      type: String,
      enum: ['English', 'Hindi', 'Punjabi'],
      default: 'English'
    },
    preferredDoctorGender: {
      type: String,
      enum: ['Male', 'Female', 'No Preference'],
      default: 'No Preference'
    },
    notifications: {
      appointmentReminders: { type: Boolean, default: true },
      medicationReminders: { type: Boolean, default: true },
      healthTips: { type: Boolean, default: true }
    }
  },
  primaryDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
patientSchema.index({ userId: 1 });
patientSchema.index({ 'medicalHistory.condition': 1 });
patientSchema.index({ bloodType: 1 });
patientSchema.index({ primaryDoctor: 1 });

// Virtual for age calculation
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for BMI calculation
patientSchema.virtual('bmi').get(function() {
  if (!this.height?.value || !this.weight?.value) return null;
  
  let heightInM = this.height.value;
  if (this.height.unit === 'ft') {
    heightInM = this.height.value * 0.3048; // Convert ft to meters
  } else {
    heightInM = this.height.value / 100; // Convert cm to meters
  }
  
  let weightInKg = this.weight.value;
  if (this.weight.unit === 'lbs') {
    weightInKg = this.weight.value * 0.453592; // Convert lbs to kg
  }
  
  return Math.round((weightInKg / (heightInM * heightInM)) * 10) / 10;
});

// Populate user data automatically
patientSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'userId',
    select: 'name email phone profilePicture'
  });
  next();
});

// Method to add vital signs
patientSchema.methods.addVital = function(vitalData) {
  this.vitals.push(vitalData);
  return this.save();
};

// Method to update medication status
patientSchema.methods.updateMedication = function(medicationId, updates) {
  const medication = this.currentMedications.id(medicationId);
  if (medication) {
    Object.assign(medication, updates);
    return this.save();
  }
  return null;
};

export default mongoose.model('Patient', patientSchema);
