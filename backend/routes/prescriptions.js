import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import Prescription from '../models/Prescription.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const prescriptionSchema = Joi.object({
  patientId: Joi.string().required(),
  appointmentId: Joi.string().allow(''),
  medications: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    genericName: Joi.string().allow(''),
    dosage: Joi.string().required(),
    frequency: Joi.string().required(),
    duration: Joi.string().required(),
    instructions: Joi.string().allow(''),
    quantity: Joi.number().positive(),
    refills: Joi.number().min(0).default(0)
  })).min(1).required(),
  diagnosis: Joi.string().allow(''),
  notes: Joi.string().allow(''),
  validUntil: Joi.date().greater('now'),
  followUpDate: Joi.date().allow('')
});

const adherenceSchema = Joi.object({
  medicationId: Joi.string().required(),
  taken: Joi.boolean().required(),
  takenAt: Joi.date(),
  notes: Joi.string().allow('')
});

// Create prescription (doctors only)
router.post('/', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = prescriptionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  const { patientId, appointmentId, medications, diagnosis, notes, validUntil, followUpDate } = value;

  // Find doctor profile
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  // Verify patient exists
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  // If appointment ID is provided, verify it exists and belongs to the doctor
  if (appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Appointment does not belong to you' });
    }
  }

  // Create prescription
  const prescription = new Prescription({
    patientId,
    doctorId: doctor._id,
    appointmentId: appointmentId || null,
    medications: medications.map(med => ({
      ...med,
      adherence: [] // Initialize empty adherence tracking
    })),
    diagnosis: diagnosis || '',
    notes: notes || '',
    validUntil: validUntil || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default 90 days
    followUpDate: followUpDate || null,
    status: 'active'
  });

  await prescription.save();

  const populatedPrescription = await Prescription.findById(prescription._id)
    .populate({
      path: 'doctorId',
      populate: {
        path: 'userId',
        select: 'name profilePicture'
      }
    })
    .populate({
      path: 'patientId',
      populate: {
        path: 'userId',
        select: 'name profilePicture'
      }
    })
    .populate('appointmentId');

  res.status(201).json({
    message: 'Prescription created successfully',
    prescription: populatedPrescription
  });
}));

// Get prescriptions with filters
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { status, patientId, doctorId, page = 1, limit = 10, active = false } = req.query;

  // Build filter based on user role
  const filter = {};

  if (req.user.role === 'patient') {
    // Patients can only see their own prescriptions
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    filter.patientId = patient._id;
  } else if (req.user.role === 'doctor') {
    // Doctors can only see their own prescriptions
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    filter.doctorId = doctor._id;
  } else if (req.user.role === 'admin') {
    // Admins can filter by doctor or patient
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
  }

  // Apply additional filters
  if (status && status !== 'all') {
    filter.status = status;
  }

  if (active === 'true') {
    filter.status = 'active';
    filter.validUntil = { $gte: new Date() };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const prescriptions = await Prescription.find(filter)
    .populate({
      path: 'doctorId',
      populate: {
        path: 'userId',
        select: 'name profilePicture specialization'
      }
    })
    .populate({
      path: 'patientId',
      populate: {
        path: 'userId',
        select: 'name profilePicture'
      }
    })
    .populate('appointmentId', 'scheduledTime appointmentType')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Prescription.countDocuments(filter);

  res.json({
    prescriptions,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalPrescriptions: total,
      hasNext: skip + parseInt(limit) < total,
      hasPrev: parseInt(page) > 1
    }
  });
}));

// Get prescription by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate({
      path: 'doctorId',
      populate: {
        path: 'userId',
        select: 'name profilePicture phone email'
      }
    })
    .populate({
      path: 'patientId',
      populate: {
        path: 'userId',
        select: 'name profilePicture phone email dateOfBirth'
      }
    })
    .populate('appointmentId');

  if (!prescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  // Check access permissions
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient || prescription.patientId._id.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || prescription.doctorId._id.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
  }

  res.json({ prescription });
}));

// Update prescription status (doctors only)
router.put('/:id/status', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  const { status, reason } = req.body;

  if (!status || !['active', 'completed', 'cancelled', 'expired'].includes(status)) {
    return res.status(400).json({ 
      message: 'Valid status is required (active, completed, cancelled, expired)' 
    });
  }

  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  // Check if doctor owns this prescription
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor || prescription.doctorId.toString() !== doctor._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const previousStatus = prescription.status;
  prescription.status = status;

  // Add to status history
  prescription.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy: req.user.id,
    reason: reason || `Status changed from ${previousStatus} to ${status}`
  });

  await prescription.save();

  res.json({
    message: `Prescription ${status} successfully`,
    prescription: {
      id: prescription._id,
      status: prescription.status,
      statusHistory: prescription.statusHistory
    }
  });
}));

// Add medication adherence (patients only)
router.post('/:id/adherence', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = adherenceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  const { medicationId, taken, takenAt, notes } = value;

  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  // Check if patient owns this prescription
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient || prescription.patientId.toString() !== patient._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Find the medication in the prescription
  const medicationIndex = prescription.medications.findIndex(
    med => med._id.toString() === medicationId
  );

  if (medicationIndex === -1) {
    return res.status(404).json({ message: 'Medication not found in prescription' });
  }

  // Add adherence record
  prescription.medications[medicationIndex].adherence.push({
    taken,
    scheduledTime: takenAt || new Date(),
    actualTime: taken ? new Date() : null,
    notes: notes || ''
  });

  await prescription.save();

  res.json({
    message: 'Adherence recorded successfully',
    medication: prescription.medications[medicationIndex]
  });
}));

// Get adherence statistics for a prescription (patients and doctors)
router.get('/:id/adherence/stats', authenticateToken, asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  // Check access permissions
  let hasAccess = false;
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    hasAccess = patient && prescription.patientId.toString() === patient._id.toString();
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    hasAccess = doctor && prescription.doctorId.toString() === doctor._id.toString();
  } else if (req.user.role === 'admin') {
    hasAccess = true;
  }

  if (!hasAccess) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Calculate adherence statistics
  const medicationStats = prescription.medications.map(med => {
    const totalRecords = med.adherence.length;
    const takenRecords = med.adherence.filter(record => record.taken).length;
    const adherenceRate = totalRecords > 0 ? (takenRecords / totalRecords) * 100 : 0;

    // Calculate streak (consecutive days taken)
    let currentStreak = 0;
    const sortedRecords = med.adherence.sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));
    
    for (const record of sortedRecords) {
      if (record.taken) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      medicationId: med._id,
      medicationName: med.name,
      totalRecords,
      takenRecords,
      missedRecords: totalRecords - takenRecords,
      adherenceRate: Math.round(adherenceRate * 100) / 100,
      currentStreak,
      lastTaken: sortedRecords.find(record => record.taken)?.actualTime || null
    };
  });

  // Overall prescription adherence
  const totalRecords = medicationStats.reduce((sum, med) => sum + med.totalRecords, 0);
  const totalTaken = medicationStats.reduce((sum, med) => sum + med.takenRecords, 0);
  const overallAdherence = totalRecords > 0 ? (totalTaken / totalRecords) * 100 : 0;

  res.json({
    prescriptionId: prescription._id,
    overallAdherence: Math.round(overallAdherence * 100) / 100,
    totalMedications: prescription.medications.length,
    medicationStats,
    generatedAt: new Date()
  });
}));

// Get adherence calendar for a prescription (patients and doctors)
router.get('/:id/adherence/calendar', authenticateToken, asyncHandler(async (req, res) => {
  const { year, month } = req.query; // Optional filters

  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  // Check access permissions
  let hasAccess = false;
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    hasAccess = patient && prescription.patientId.toString() === patient._id.toString();
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    hasAccess = doctor && prescription.doctorId.toString() === doctor._id.toString();
  } else if (req.user.role === 'admin') {
    hasAccess = true;
  }

  if (!hasAccess) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Build date filter
  let dateFilter = {};
  if (year && month) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
    dateFilter = { $gte: startDate, $lte: endDate };
  }

  // Generate calendar data
  const calendarData = {};

  prescription.medications.forEach(med => {
    med.adherence.forEach(record => {
      const recordDate = new Date(record.scheduledTime);
      
      // Apply date filter if specified
      if (Object.keys(dateFilter).length > 0) {
        if (recordDate < dateFilter.$gte || recordDate > dateFilter.$lte) {
          return;
        }
      }

      const dateKey = recordDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          date: dateKey,
          medications: []
        };
      }

      calendarData[dateKey].medications.push({
        medicationId: med._id,
        medicationName: med.name,
        taken: record.taken,
        scheduledTime: record.scheduledTime,
        actualTime: record.actualTime,
        notes: record.notes
      });
    });
  });

  // Convert to array and sort by date
  const sortedCalendar = Object.values(calendarData).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  res.json({
    prescriptionId: prescription._id,
    calendarData: sortedCalendar,
    filters: { year: year || 'all', month: month || 'all' }
  });
}));

// Renew prescription (doctors only)
router.post('/:id/renew', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  const { validUntil, modifications } = req.body;

  const originalPrescription = await Prescription.findById(req.params.id);
  if (!originalPrescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  // Check if doctor owns this prescription
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor || originalPrescription.doctorId.toString() !== doctor._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (originalPrescription.status !== 'active') {
    return res.status(400).json({ message: 'Only active prescriptions can be renewed' });
  }

  // Create renewed prescription
  const renewedPrescription = new Prescription({
    patientId: originalPrescription.patientId,
    doctorId: originalPrescription.doctorId,
    appointmentId: null, // New prescription, not tied to specific appointment
    medications: modifications?.medications || originalPrescription.medications.map(med => ({
      name: med.name,
      genericName: med.genericName,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions,
      quantity: med.quantity,
      refills: med.refills,
      adherence: [] // Reset adherence tracking
    })),
    diagnosis: modifications?.diagnosis || originalPrescription.diagnosis,
    notes: modifications?.notes || originalPrescription.notes,
    validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    followUpDate: modifications?.followUpDate || null,
    status: 'active',
    previousPrescriptionId: originalPrescription._id
  });

  await renewedPrescription.save();

  // Mark original prescription as completed
  originalPrescription.status = 'completed';
  originalPrescription.statusHistory.push({
    status: 'completed',
    changedAt: new Date(),
    changedBy: req.user.id,
    reason: 'Prescription renewed'
  });
  await originalPrescription.save();

  const populatedPrescription = await Prescription.findById(renewedPrescription._id)
    .populate({
      path: 'doctorId',
      populate: {
        path: 'userId',
        select: 'name profilePicture'
      }
    })
    .populate({
      path: 'patientId',
      populate: {
        path: 'userId',
        select: 'name profilePicture'
      }
    });

  res.status(201).json({
    message: 'Prescription renewed successfully',
    prescription: populatedPrescription,
    originalPrescriptionId: originalPrescription._id
  });
}));

export default router;