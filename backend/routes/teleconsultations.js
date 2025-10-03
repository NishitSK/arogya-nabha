import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import Teleconsultation from '../models/Teleconsultation.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const teleconsultationSchema = Joi.object({
  appointmentId: Joi.string().required(),
  scheduledTime: Joi.date().greater('now').required(),
  duration: Joi.number().min(15).max(120).default(30), // minutes
  type: Joi.string().valid('video', 'audio', 'chat').default('video'),
  notes: Joi.string().allow('')
});

const joinSchema = Joi.object({
  deviceInfo: Joi.object({
    browser: Joi.string(),
    platform: Joi.string(),
    hasCamera: Joi.boolean(),
    hasMicrophone: Joi.boolean()
  })
});

// Create teleconsultation session
router.post('/', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = teleconsultationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  const { appointmentId, scheduledTime, duration, type, notes } = value;

  // Find doctor profile
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  // Verify appointment exists and belongs to doctor
  const appointment = await Appointment.findById(appointmentId)
    .populate('patientId');

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  if (appointment.doctorId.toString() !== doctor._id.toString()) {
    return res.status(403).json({ message: 'Appointment does not belong to you' });
  }

  if (!['scheduled', 'confirmed'].includes(appointment.status)) {
    return res.status(400).json({ 
      message: 'Can only create teleconsultation for scheduled or confirmed appointments' 
    });
  }

  // Check if teleconsultation already exists for this appointment
  const existingConsultation = await Teleconsultation.findOne({ appointmentId });
  if (existingConsultation) {
    return res.status(409).json({ 
      message: 'Teleconsultation already exists for this appointment',
      consultationId: existingConsultation._id
    });
  }

  // Create teleconsultation session
  const teleconsultation = new Teleconsultation({
    appointmentId,
    doctorId: doctor._id,
    patientId: appointment.patientId._id,
    scheduledTime: new Date(scheduledTime),
    duration,
    type,
    notes: notes || '',
    status: 'scheduled'
  });

  await teleconsultation.save();

  const populatedConsultation = await Teleconsultation.findById(teleconsultation._id)
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
    message: 'Teleconsultation session created successfully',
    teleconsultation: populatedConsultation
  });
}));

// Get teleconsultations with filters
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { status, type, date, upcoming, page = 1, limit = 10 } = req.query;

  // Build filter based on user role
  const filter = {};

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    filter.patientId = patient._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    filter.doctorId = doctor._id;
  }

  // Apply additional filters
  if (status && status !== 'all') {
    filter.status = status;
  }

  if (type && type !== 'all') {
    filter.type = type;
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
    filter.status = { $in: ['scheduled', 'in-progress'] };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const teleconsultations = await Teleconsultation.find(filter)
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
    .populate('appointmentId', 'scheduledTime appointmentType symptoms')
    .sort({ scheduledTime: upcoming === 'true' ? 1 : -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Teleconsultation.countDocuments(filter);

  res.json({
    teleconsultations,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalConsultations: total
    }
  });
}));

// Get teleconsultation by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const teleconsultation = await Teleconsultation.findById(req.params.id)
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
    .populate('appointmentId');

  if (!teleconsultation) {
    return res.status(404).json({ message: 'Teleconsultation not found' });
  }

  // Check access permissions
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient || teleconsultation.patientId._id.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || teleconsultation.doctorId._id.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
  }

  res.json({ teleconsultation });
}));

// Join teleconsultation session
router.post('/:id/join', authenticateToken, asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = joinSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  const { deviceInfo } = value;

  const teleconsultation = await Teleconsultation.findById(req.params.id);
  if (!teleconsultation) {
    return res.status(404).json({ message: 'Teleconsultation not found' });
  }

  // Check access permissions
  let canJoin = false;
  let participantType = '';

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    canJoin = patient && teleconsultation.patientId.toString() === patient._id.toString();
    participantType = 'patient';
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    canJoin = doctor && teleconsultation.doctorId.toString() === doctor._id.toString();
    participantType = 'doctor';
  }

  if (!canJoin) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Check if consultation is ready to join
  if (!['scheduled', 'in-progress'].includes(teleconsultation.status)) {
    return res.status(400).json({ 
      message: `Cannot join ${teleconsultation.status} consultation` 
    });
  }

  // Check timing - allow joining 10 minutes before scheduled time
  const now = new Date();
  const scheduledTime = new Date(teleconsultation.scheduledTime);
  const joinWindowStart = new Date(scheduledTime.getTime() - 10 * 60 * 1000); // 10 minutes before

  if (now < joinWindowStart) {
    return res.status(400).json({ 
      message: 'Consultation join window not yet open',
      canJoinAt: joinWindowStart.toISOString()
    });
  }

  // Update participant info
  const participantInfo = {
    userId: req.user.id,
    joinedAt: now,
    deviceInfo: deviceInfo || {}
  };

  if (participantType === 'doctor') {
    teleconsultation.participants.doctor = participantInfo;
  } else {
    teleconsultation.participants.patient = participantInfo;
  }

  // Update status to in-progress if not already
  if (teleconsultation.status === 'scheduled') {
    teleconsultation.status = 'in-progress';
    teleconsultation.actualStartTime = now;
  }

  await teleconsultation.save();

  // Generate session token (for WebRTC signaling)
  const sessionData = {
    consultationId: teleconsultation._id,
    participantType,
    userId: req.user.id,
    sessionId: `${teleconsultation._id}-${participantType}-${Date.now()}`
  };

  res.json({
    message: 'Joined teleconsultation successfully',
    sessionData,
    consultation: {
      id: teleconsultation._id,
      type: teleconsultation.type,
      status: teleconsultation.status,
      duration: teleconsultation.duration,
      participants: teleconsultation.participants
    }
  });
}));

// Leave teleconsultation session
router.post('/:id/leave', authenticateToken, asyncHandler(async (req, res) => {
  const teleconsultation = await Teleconsultation.findById(req.params.id);
  if (!teleconsultation) {
    return res.status(404).json({ message: 'Teleconsultation not found' });
  }

  // Check access permissions
  let canLeave = false;
  let participantType = '';

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    canLeave = patient && teleconsultation.patientId.toString() === patient._id.toString();
    participantType = 'patient';
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    canLeave = doctor && teleconsultation.doctorId.toString() === doctor._id.toString();
    participantType = 'doctor';
  }

  if (!canLeave) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const now = new Date();

  // Update participant info
  if (participantType === 'doctor' && teleconsultation.participants.doctor) {
    teleconsultation.participants.doctor.leftAt = now;
  } else if (participantType === 'patient' && teleconsultation.participants.patient) {
    teleconsultation.participants.patient.leftAt = now;
  }

  // If both participants have left or doctor leaves, mark as completed
  const doctorLeft = teleconsultation.participants.doctor?.leftAt;
  const patientLeft = teleconsultation.participants.patient?.leftAt;

  if (participantType === 'doctor' || (doctorLeft && patientLeft)) {
    teleconsultation.status = 'completed';
    teleconsultation.actualEndTime = now;
    
    // Calculate actual duration
    if (teleconsultation.actualStartTime) {
      teleconsultation.actualDuration = Math.floor(
        (now - teleconsultation.actualStartTime) / (1000 * 60)
      ); // Duration in minutes
    }
  }

  await teleconsultation.save();

  res.json({
    message: 'Left teleconsultation successfully',
    consultation: {
      id: teleconsultation._id,
      status: teleconsultation.status,
      actualDuration: teleconsultation.actualDuration
    }
  });
}));

// Update consultation status
router.put('/:id/status', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  const { status, reason, diagnosis, prescription, followUpRecommendations } = req.body;

  if (!status || !['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'].includes(status)) {
    return res.status(400).json({ 
      message: 'Valid status is required' 
    });
  }

  const teleconsultation = await Teleconsultation.findById(req.params.id);
  if (!teleconsultation) {
    return res.status(404).json({ message: 'Teleconsultation not found' });
  }

  // Check if doctor owns this consultation
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor || teleconsultation.doctorId.toString() !== doctor._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const previousStatus = teleconsultation.status;
  teleconsultation.status = status;

  // Handle status-specific updates
  if (status === 'completed') {
    teleconsultation.actualEndTime = teleconsultation.actualEndTime || new Date();
    if (teleconsultation.actualStartTime && !teleconsultation.actualDuration) {
      teleconsultation.actualDuration = Math.floor(
        (teleconsultation.actualEndTime - teleconsultation.actualStartTime) / (1000 * 60)
      );
    }

    // Add consultation summary
    if (diagnosis || prescription || followUpRecommendations) {
      teleconsultation.summary = {
        diagnosis: diagnosis || '',
        prescription: prescription || '',
        followUpRecommendations: followUpRecommendations || '',
        completedAt: new Date()
      };
    }
  }

  // Add to status history
  teleconsultation.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: req.user.id,
    reason: reason || `Status changed from ${previousStatus} to ${status}`
  });

  await teleconsultation.save();

  res.json({
    message: `Teleconsultation ${status} successfully`,
    teleconsultation: {
      id: teleconsultation._id,
      status: teleconsultation.status,
      summary: teleconsultation.summary
    }
  });
}));

// Add message to consultation chat
router.post('/:id/messages', authenticateToken, asyncHandler(async (req, res) => {
  const { message, type = 'text' } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  const teleconsultation = await Teleconsultation.findById(req.params.id);
  if (!teleconsultation) {
    return res.status(404).json({ message: 'Teleconsultation not found' });
  }

  // Check access permissions
  let canMessage = false;
  let senderRole = '';

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    canMessage = patient && teleconsultation.patientId.toString() === patient._id.toString();
    senderRole = 'patient';
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    canMessage = doctor && teleconsultation.doctorId.toString() === doctor._id.toString();
    senderRole = 'doctor';
  }

  if (!canMessage) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!['in-progress'].includes(teleconsultation.status)) {
    return res.status(400).json({ 
      message: 'Can only send messages during active consultation' 
    });
  }

  // Add message to chat history
  const newMessage = {
    sender: req.user.id,
    senderRole,
    message: message.trim(),
    type,
    timestamp: new Date()
  };

  teleconsultation.chatHistory.push(newMessage);
  await teleconsultation.save();

  res.json({
    message: 'Message sent successfully',
    chatMessage: newMessage
  });
}));

// Get consultation chat history
router.get('/:id/messages', authenticateToken, asyncHandler(async (req, res) => {
  const teleconsultation = await Teleconsultation.findById(req.params.id);
  if (!teleconsultation) {
    return res.status(404).json({ message: 'Teleconsultation not found' });
  }

  // Check access permissions
  let hasAccess = false;

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    hasAccess = patient && teleconsultation.patientId.toString() === patient._id.toString();
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    hasAccess = doctor && teleconsultation.doctorId.toString() === doctor._id.toString();
  } else if (req.user.role === 'admin') {
    hasAccess = true;
  }

  if (!hasAccess) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({
    consultationId: teleconsultation._id,
    chatHistory: teleconsultation.chatHistory,
    totalMessages: teleconsultation.chatHistory.length
  });
}));

// Get teleconsultation statistics (for doctors)
router.get('/stats/dashboard', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Today's teleconsultations
  const todayConsultations = await Teleconsultation.countDocuments({
    doctorId: doctor._id,
    scheduledTime: {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lte: new Date(today.setHours(23, 59, 59, 999))
    }
  });

  // Active consultations
  const activeConsultations = await Teleconsultation.countDocuments({
    doctorId: doctor._id,
    status: 'in-progress'
  });

  // Completed consultations this month
  const completedThisMonth = await Teleconsultation.countDocuments({
    doctorId: doctor._id,
    status: 'completed',
    scheduledTime: { $gte: startOfMonth }
  });

  // Average consultation duration this month
  const consultationsWithDuration = await Teleconsultation.find({
    doctorId: doctor._id,
    status: 'completed',
    actualDuration: { $exists: true },
    scheduledTime: { $gte: startOfMonth }
  }).select('actualDuration');

  const averageDuration = consultationsWithDuration.length > 0
    ? consultationsWithDuration.reduce((sum, c) => sum + c.actualDuration, 0) / consultationsWithDuration.length
    : 0;

  res.json({
    todayConsultations,
    activeConsultations,
    completedThisMonth,
    averageDuration: Math.round(averageDuration),
    totalPatients: await Teleconsultation.distinct('patientId', { doctorId: doctor._id }).then(arr => arr.length)
  });
}));

export default router;