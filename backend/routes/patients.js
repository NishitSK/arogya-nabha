import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import HealthRecord from '../models/HealthRecord.js';
import Appointment from '../models/Appointment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const patientProfileSchema = Joi.object({
  dateOfBirth: Joi.date().max('now').required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  height: Joi.object({
    value: Joi.number().positive(),
    unit: Joi.string().valid('cm', 'ft')
  }),
  weight: Joi.object({
    value: Joi.number().positive(),
    unit: Joi.string().valid('kg', 'lbs')
  }),
  allergies: Joi.array().items(Joi.object({
    allergen: Joi.string().required(),
    severity: Joi.string().valid('Mild', 'Moderate', 'Severe').required(),
    reaction: Joi.string(),
    notes: Joi.string()
  })),
  medications: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    dosage: Joi.string(),
    frequency: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    isActive: Joi.boolean().default(true)
  })),
  medicalHistory: Joi.array().items(Joi.object({
    condition: Joi.string().required(),
    diagnosedDate: Joi.date(),
    severity: Joi.string().valid('Mild', 'Moderate', 'Severe'),
    status: Joi.string().valid('Active', 'Resolved', 'Chronic'),
    notes: Joi.string()
  })),
  emergencyContact: Joi.object({
    name: Joi.string().required(),
    relationship: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    email: Joi.string().email()
  })
});

// Get patient's own profile
router.get('/profile/me', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user.id })
    .populate('userId', 'name profilePicture phone email address preferences');

  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  res.json({ patient });
}));

// Create/Update patient profile
router.post('/profile', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = patientProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  // Check if patient profile already exists
  let patient = await Patient.findOne({ userId: req.user.id });

  if (patient) {
    // Update existing profile
    Object.assign(patient, value);
    await patient.save();
  } else {
    // Create new profile
    patient = new Patient({
      userId: req.user.id,
      ...value
    });
    await patient.save();
  }

  const populatedPatient = await Patient.findById(patient._id)
    .populate('userId', 'name profilePicture phone email address');

  res.json({
    message: patient.isNew ? 'Patient profile created successfully' : 'Patient profile updated successfully',
    patient: populatedPatient
  });
}));

// Get patient by ID (for doctors and admins)
router.get('/:id', authenticateToken, authorizeRole(['doctor', 'admin']), asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate('userId', 'name profilePicture phone email address createdAt')
    .lean();

  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  // Doctors can only see patients they have appointments with
  if (req.user.role === 'doctor') {
    const hasAppointment = await Appointment.findOne({
      patientId: req.params.id,
      'doctor.userId': req.user.id
    });

    if (!hasAppointment) {
      return res.status(403).json({ 
        message: 'Access denied. You can only view patients you have appointments with.' 
      });
    }
  }

  res.json({ patient });
}));

// Get patient's appointments
router.get('/appointments/my', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10, upcoming = false } = req.query;

  // Find patient profile
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  // Build filter
  const filter = { patientId: patient._id };
  
  if (status && status !== 'all') {
    filter.status = status;
  }

  if (upcoming === 'true') {
    filter.scheduledTime = { $gte: new Date() };
    filter.status = { $in: ['scheduled', 'confirmed'] };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const appointments = await Appointment.find(filter)
    .populate('doctorId')
    .populate({
      path: 'doctorId',
      populate: {
        path: 'userId',
        select: 'name profilePicture phone email'
      }
    })
    .sort({ scheduledTime: upcoming === 'true' ? 1 : -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments(filter);

  res.json({
    appointments,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalAppointments: total
    }
  });
}));

// Get patient's health records
router.get('/health-records/my', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;

  // Find patient profile
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  // Build filter
  const filter = { patientId: patient._id };
  
  if (category && category !== 'all') {
    filter.category = category;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const healthRecords = await HealthRecord.find(filter)
    .populate('createdBy.doctorId')
    .populate({
      path: 'createdBy.doctorId',
      populate: {
        path: 'userId',
        select: 'name profilePicture'
      }
    })
    .sort({ recordDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await HealthRecord.countDocuments(filter);

  res.json({
    healthRecords,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalRecords: total
    }
  });
}));

// Add medical condition
router.post('/medical-history', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const { condition, diagnosedDate, status = 'active', notes } = req.body;

  if (!condition) {
    return res.status(400).json({ message: 'Medical condition is required' });
  }

  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  patient.medicalHistory.push({
    condition,
    diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : new Date(),
    status,
    notes: notes || ''
  });

  await patient.save();

  res.json({
    message: 'Medical condition added successfully',
    medicalHistory: patient.medicalHistory
  });
}));

// Update medical condition
router.put('/medical-history/:conditionId', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const { condition, diagnosedDate, status, notes } = req.body;

  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  const conditionIndex = patient.medicalHistory.findIndex(
    item => item._id.toString() === req.params.conditionId
  );

  if (conditionIndex === -1) {
    return res.status(404).json({ message: 'Medical condition not found' });
  }

  // Update the condition
  if (condition) patient.medicalHistory[conditionIndex].condition = condition;
  if (diagnosedDate) patient.medicalHistory[conditionIndex].diagnosedDate = new Date(diagnosedDate);
  if (status) patient.medicalHistory[conditionIndex].status = status;
  if (notes !== undefined) patient.medicalHistory[conditionIndex].notes = notes;

  await patient.save();

  res.json({
    message: 'Medical condition updated successfully',
    medicalHistory: patient.medicalHistory
  });
}));

// Remove medical condition
router.delete('/medical-history/:conditionId', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  patient.medicalHistory = patient.medicalHistory.filter(
    item => item._id.toString() !== req.params.conditionId
  );

  await patient.save();

  res.json({
    message: 'Medical condition removed successfully',
    medicalHistory: patient.medicalHistory
  });
}));

// Add medication
router.post('/medications', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const { name, dosage, frequency, startDate, endDate, isActive = true } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Medication name is required' });
  }

  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  patient.medications.push({
    name,
    dosage: dosage || '',
    frequency: frequency || '',
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : null,
    isActive
  });

  await patient.save();

  res.json({
    message: 'Medication added successfully',
    medications: patient.medications
  });
}));

// Update medication
router.put('/medications/:medicationId', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const { name, dosage, frequency, startDate, endDate, isActive } = req.body;

  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  const medicationIndex = patient.medications.findIndex(
    item => item._id.toString() === req.params.medicationId
  );

  if (medicationIndex === -1) {
    return res.status(404).json({ message: 'Medication not found' });
  }

  // Update the medication
  if (name) patient.medications[medicationIndex].name = name;
  if (dosage !== undefined) patient.medications[medicationIndex].dosage = dosage;
  if (frequency !== undefined) patient.medications[medicationIndex].frequency = frequency;
  if (startDate) patient.medications[medicationIndex].startDate = new Date(startDate);
  if (endDate) patient.medications[medicationIndex].endDate = new Date(endDate);
  if (isActive !== undefined) patient.medications[medicationIndex].isActive = isActive;

  await patient.save();

  res.json({
    message: 'Medication updated successfully',
    medications: patient.medications
  });
}));

// Remove medication
router.delete('/medications/:medicationId', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  patient.medications = patient.medications.filter(
    item => item._id.toString() !== req.params.medicationId
  );

  await patient.save();

  res.json({
    message: 'Medication removed successfully',
    medications: patient.medications
  });
}));

// Add allergy
router.post('/allergies', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const { allergy } = req.body;

  if (!allergy || typeof allergy !== 'string') {
    return res.status(400).json({ message: 'Valid allergy name is required' });
  }

  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  // Check if allergy already exists
  if (patient.allergies.includes(allergy.toLowerCase())) {
    return res.status(400).json({ message: 'Allergy already exists' });
  }

  patient.allergies.push(allergy.toLowerCase());
  await patient.save();

  res.json({
    message: 'Allergy added successfully',
    allergies: patient.allergies
  });
}));

// Remove allergy
router.delete('/allergies/:allergy', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const { allergy } = req.params;

  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  patient.allergies = patient.allergies.filter(
    item => item.toLowerCase() !== allergy.toLowerCase()
  );

  await patient.save();

  res.json({
    message: 'Allergy removed successfully',
    allergies: patient.allergies
  });
}));

// Get patient dashboard statistics
router.get('/dashboard/stats', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Upcoming appointments
  const upcomingAppointments = await Appointment.countDocuments({
    patientId: patient._id,
    scheduledTime: { $gte: today },
    status: { $in: ['scheduled', 'confirmed'] }
  });

  // Appointments this month
  const appointmentsThisMonth = await Appointment.countDocuments({
    patientId: patient._id,
    scheduledTime: { $gte: startOfMonth },
    status: 'completed'
  });

  // Total health records
  const totalHealthRecords = await HealthRecord.countDocuments({
    patientId: patient._id
  });

  // Active medications
  const activeMedications = patient.medications.filter(med => med.isActive).length;

  // Active medical conditions
  const activeConditions = patient.medicalHistory.filter(
    condition => condition.status === 'active' || condition.status === 'chronic'
  ).length;

  res.json({
    upcomingAppointments,
    appointmentsThisMonth,
    totalHealthRecords,
    activeMedications,
    activeConditions,
    totalAllergies: patient.allergies.length
  });
}));

// Update emergency contact
router.put('/emergency-contact', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const { name, relationship, phone, email } = req.body;

  // Validate required fields
  if (!name || !relationship || !phone) {
    return res.status(400).json({ 
      message: 'Name, relationship, and phone are required for emergency contact' 
    });
  }

  // Validate phone format
  if (!/^[0-9]{10}$/.test(phone)) {
    return res.status(400).json({ message: 'Phone number must be 10 digits' });
  }

  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  patient.emergencyContact = {
    name,
    relationship,
    phone,
    email: email || ''
  };

  await patient.save();

  res.json({
    message: 'Emergency contact updated successfully',
    emergencyContact: patient.emergencyContact
  });
}));

export default router;