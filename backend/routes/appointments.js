import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const bookAppointmentSchema = Joi.object({
  doctorId: Joi.string().required(),
  scheduledTime: Joi.date().greater('now').required(),
  appointmentType: Joi.string().valid('consultation', 'follow-up', 'emergency').default('consultation'),
  symptoms: Joi.string().allow(''),
  notes: Joi.string().allow('')
});

const rescheduleSchema = Joi.object({
  newScheduledTime: Joi.date().greater('now').required(),
  reason: Joi.string().allow('')
});

// Book appointment (patients only)
router.post('/', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = bookAppointmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  const { doctorId, scheduledTime, appointmentType, symptoms, notes } = value;

  // Find patient profile
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }

  // Verify doctor exists and is approved
  const doctor = await Doctor.findById(doctorId).populate('userId');
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  if (!doctor.isApproved) {
    return res.status(400).json({ message: 'Doctor is not approved for appointments' });
  }

  // Check if the time slot is available (no conflicting appointments)
  const scheduledDateTime = new Date(scheduledTime);
  const conflictStart = new Date(scheduledDateTime.getTime() - 30 * 60 * 1000); // 30 min before
  const conflictEnd = new Date(scheduledDateTime.getTime() + 30 * 60 * 1000); // 30 min after

  const conflictingAppointment = await Appointment.findOne({
    doctorId,
    scheduledTime: {
      $gte: conflictStart,
      $lte: conflictEnd
    },
    status: { $in: ['scheduled', 'confirmed'] }
  });

  if (conflictingAppointment) {
    return res.status(409).json({ 
      message: 'Time slot not available',
      suggestedTime: new Date(scheduledDateTime.getTime() + 60 * 60 * 1000) // Suggest 1 hour later
    });
  }

  // Check doctor's availability for the requested day
  const dayOfWeek = scheduledDateTime.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const timeString = scheduledDateTime.toTimeString().substring(0, 5); // HH:MM format

  if (doctor.availability && doctor.availability[dayOfWeek]) {
    const dayAvailability = doctor.availability[dayOfWeek];
    
    if (!dayAvailability.isAvailable) {
      return res.status(400).json({ 
        message: `Doctor is not available on ${dayOfWeek}s` 
      });
    }

    // Check if time is within any available slot
    const isTimeAvailable = dayAvailability.slots.some(slot => {
      return timeString >= slot.start && timeString <= slot.end;
    });

    if (!isTimeAvailable) {
      return res.status(400).json({ 
        message: 'Requested time is outside doctor\'s available hours',
        availableSlots: dayAvailability.slots
      });
    }
  }

  // Create appointment
  const appointment = new Appointment({
    patientId: patient._id,
    doctorId,
    scheduledTime: scheduledDateTime,
    appointmentType,
    symptoms: symptoms || '',
    notes: notes || '',
    status: 'scheduled',
    consultationFee: doctor.consultationFee || 0
  });

  await appointment.save();

  // Populate the appointment with doctor and patient details
  const populatedAppointment = await Appointment.findById(appointment._id)
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
        select: 'name profilePicture phone email'
      }
    });

  res.status(201).json({
    message: 'Appointment booked successfully',
    appointment: populatedAppointment
  });
}));

// Get appointments with filters
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { status, doctorId, patientId, date, upcoming, page = 1, limit = 10 } = req.query;

  // Build filter based on user role
  const filter = {};

  if (req.user.role === 'patient') {
    // Patients can only see their own appointments
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    filter.patientId = patient._id;
  } else if (req.user.role === 'doctor') {
    // Doctors can only see their own appointments
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

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    filter.scheduledTime = {
      $gte: startDate,
      $lt: endDate
    };
  }

  if (upcoming === 'true') {
    filter.scheduledTime = { $gte: new Date() };
    filter.status = { $in: ['scheduled', 'confirmed'] };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const appointments = await Appointment.find(filter)
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
      totalAppointments: total,
      hasNext: skip + parseInt(limit) < total,
      hasPrev: parseInt(page) > 1
    }
  });
}));

// Get appointment by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
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
        select: 'name profilePicture phone email'
      }
    });

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  // Check access permissions
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient || appointment.patientId._id.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
  }

  res.json({ appointment });
}));

// Reschedule appointment
router.put('/:id/reschedule', authenticateToken, asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = rescheduleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  const { newScheduledTime, reason } = value;

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  // Check if user can reschedule this appointment
  let canReschedule = false;
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    canReschedule = patient && appointment.patientId.toString() === patient._id.toString();
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    canReschedule = doctor && appointment.doctorId.toString() === doctor._id.toString();
  } else if (req.user.role === 'admin') {
    canReschedule = true;
  }

  if (!canReschedule) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Check if appointment can be rescheduled
  if (!['scheduled', 'confirmed'].includes(appointment.status)) {
    return res.status(400).json({ 
      message: 'Only scheduled or confirmed appointments can be rescheduled' 
    });
  }

  // Check if new time slot is available
  const newDateTime = new Date(newScheduledTime);
  const conflictStart = new Date(newDateTime.getTime() - 30 * 60 * 1000);
  const conflictEnd = new Date(newDateTime.getTime() + 30 * 60 * 1000);

  const conflictingAppointment = await Appointment.findOne({
    _id: { $ne: appointment._id }, // Exclude current appointment
    doctorId: appointment.doctorId,
    scheduledTime: {
      $gte: conflictStart,
      $lte: conflictEnd
    },
    status: { $in: ['scheduled', 'confirmed'] }
  });

  if (conflictingAppointment) {
    return res.status(409).json({ 
      message: 'New time slot not available' 
    });
  }

  // Update appointment
  appointment.scheduledTime = newDateTime;
  appointment.status = 'scheduled'; // Reset to scheduled
  
  // Add to status history
  appointment.statusHistory.push({
    status: 'rescheduled',
    timestamp: new Date(),
    updatedBy: req.user.id,
    reason: reason || 'Appointment rescheduled'
  });

  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
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
        select: 'name profilePicture phone email'
      }
    });

  res.json({
    message: 'Appointment rescheduled successfully',
    appointment: populatedAppointment
  });
}));

// Update appointment status
router.put('/:id/status', authenticateToken, asyncHandler(async (req, res) => {
  const { status, reason, diagnosis, treatment, followUpDate } = req.body;

  if (!status || !['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'].includes(status)) {
    return res.status(400).json({ 
      message: 'Valid status is required (scheduled, confirmed, completed, cancelled, no-show)' 
    });
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  // Check permissions
  let canUpdateStatus = false;
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    canUpdateStatus = doctor && appointment.doctorId.toString() === doctor._id.toString();
  } else if (req.user.role === 'patient' && ['cancelled'].includes(status)) {
    const patient = await Patient.findOne({ userId: req.user.id });
    canUpdateStatus = patient && appointment.patientId.toString() === patient._id.toString();
  } else if (req.user.role === 'admin') {
    canUpdateStatus = true;
  }

  if (!canUpdateStatus) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Validate status transitions
  const validTransitions = {
    'scheduled': ['confirmed', 'cancelled', 'no-show'],
    'confirmed': ['completed', 'cancelled', 'no-show'],
    'completed': [], // Cannot change from completed
    'cancelled': ['scheduled'], // Can reschedule cancelled appointments
    'no-show': ['scheduled'] // Can reschedule no-show appointments
  };

  if (!validTransitions[appointment.status].includes(status)) {
    return res.status(400).json({ 
      message: `Cannot change status from ${appointment.status} to ${status}` 
    });
  }

  // Update appointment
  const previousStatus = appointment.status;
  appointment.status = status;

  // Add to status history
  appointment.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: req.user.id,
    reason: reason || `Status changed from ${previousStatus} to ${status}`
  });

  // If completing appointment, add additional details
  if (status === 'completed') {
    if (diagnosis) appointment.diagnosis = diagnosis;
    if (treatment) appointment.treatment = treatment;
    if (followUpDate) appointment.followUpDate = new Date(followUpDate);
    appointment.completedAt = new Date();
  }

  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
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
        select: 'name profilePicture phone email'
      }
    });

  res.json({
    message: `Appointment ${status} successfully`,
    appointment: populatedAppointment
  });
}));

// Cancel appointment
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  // Check permissions
  let canCancel = false;
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    canCancel = patient && appointment.patientId.toString() === patient._id.toString();
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    canCancel = doctor && appointment.doctorId.toString() === doctor._id.toString();
  } else if (req.user.role === 'admin') {
    canCancel = true;
  }

  if (!canCancel) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Check if appointment can be cancelled
  if (['completed', 'cancelled'].includes(appointment.status)) {
    return res.status(400).json({ 
      message: `Cannot cancel ${appointment.status} appointment` 
    });
  }

  // Update appointment status
  appointment.status = 'cancelled';
  
  // Add to status history
  appointment.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    updatedBy: req.user.id,
    reason: reason || 'Appointment cancelled'
  });

  await appointment.save();

  res.json({
    message: 'Appointment cancelled successfully',
    appointment: {
      id: appointment._id,
      status: appointment.status,
      cancelledAt: new Date()
    }
  });
}));

// Get available time slots for a doctor
router.get('/doctors/:doctorId/available-slots', authenticateToken, asyncHandler(async (req, res) => {
  const { date } = req.query; // Format: YYYY-MM-DD

  if (!date) {
    return res.status(400).json({ message: 'Date is required (YYYY-MM-DD format)' });
  }

  const doctor = await Doctor.findById(req.params.doctorId);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const requestedDate = new Date(date);
  const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

  // Check if doctor is available on this day
  if (!doctor.availability || !doctor.availability[dayOfWeek] || !doctor.availability[dayOfWeek].isAvailable) {
    return res.json({
      date,
      availableSlots: [],
      message: `Doctor is not available on ${dayOfWeek}s`
    });
  }

  const dayAvailability = doctor.availability[dayOfWeek];
  
  // Get existing appointments for this date
  const startOfDay = new Date(requestedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(requestedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await Appointment.find({
    doctorId: req.params.doctorId,
    scheduledTime: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'confirmed'] }
  }).select('scheduledTime');

  // Generate available slots
  const availableSlots = [];
  
  dayAvailability.slots.forEach(slot => {
    const [startHour, startMinute] = slot.start.split(':').map(Number);
    const [endHour, endMinute] = slot.end.split(':').map(Number);
    
    let currentTime = new Date(requestedDate);
    currentTime.setHours(startHour, startMinute, 0, 0);
    
    const slotEnd = new Date(requestedDate);
    slotEnd.setHours(endHour, endMinute, 0, 0);
    
    // Generate 30-minute slots
    while (currentTime < slotEnd) {
      const slotEndTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
      
      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(appointment => {
        const appointmentTime = new Date(appointment.scheduledTime);
        return appointmentTime >= currentTime && appointmentTime < slotEndTime;
      });
      
      // Don't show past slots
      const isPastSlot = currentTime <= new Date();
      
      if (!hasConflict && !isPastSlot) {
        availableSlots.push({
          start: currentTime.toTimeString().substring(0, 5),
          end: slotEndTime.toTimeString().substring(0, 5),
          datetime: currentTime.toISOString()
        });
      }
      
      currentTime = slotEndTime;
    }
  });

  res.json({
    date,
    dayOfWeek,
    availableSlots,
    consultationFee: doctor.consultationFee
  });
}));

export default router;