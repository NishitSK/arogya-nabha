import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const doctorProfileSchema = Joi.object({
  specialization: Joi.string().required(),
  licenseNumber: Joi.string().required(),
  experience: Joi.number().min(0).required(),
  education: Joi.array().items(Joi.object({
    degree: Joi.string().required(),
    institution: Joi.string().required(),
    year: Joi.number().min(1950).max(new Date().getFullYear()).required()
  })),
  certifications: Joi.array().items(Joi.string()),
  languages: Joi.array().items(Joi.string()),
  bio: Joi.string().max(1000),
  consultationFee: Joi.number().min(0),
  availability: Joi.object({
    monday: Joi.object({
      isAvailable: Joi.boolean(),
      slots: Joi.array().items(Joi.object({
        start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }))
    }),
    tuesday: Joi.object({
      isAvailable: Joi.boolean(),
      slots: Joi.array().items(Joi.object({
        start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }))
    }),
    wednesday: Joi.object({
      isAvailable: Joi.boolean(),
      slots: Joi.array().items(Joi.object({
        start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }))
    }),
    thursday: Joi.object({
      isAvailable: Joi.boolean(),
      slots: Joi.array().items(Joi.object({
        start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }))
    }),
    friday: Joi.object({
      isAvailable: Joi.boolean(),
      slots: Joi.array().items(Joi.object({
        start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }))
    }),
    saturday: Joi.object({
      isAvailable: Joi.boolean(),
      slots: Joi.array().items(Joi.object({
        start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }))
    }),
    sunday: Joi.object({
      isAvailable: Joi.boolean(),
      slots: Joi.array().items(Joi.object({
        start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      }))
    })
  })
});

// Get all doctors with filters
router.get('/', asyncHandler(async (req, res) => {
  const {
    specialization,
    location,
    minRating,
    maxFee,
    availability,
    page = 1,
    limit = 10,
    sortBy = 'rating',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = { isApproved: true };
  
  if (specialization) {
    filter.specialization = { $regex: specialization, $options: 'i' };
  }
  
  if (location) {
    filter['clinicAddress.city'] = { $regex: location, $options: 'i' };
  }
  
  if (minRating) {
    filter['rating.average'] = { $gte: parseFloat(minRating) };
  }
  
  if (maxFee) {
    filter.consultationFee = { $lte: parseFloat(maxFee) };
  }

  // Build sort object
  const sort = {};
  if (sortBy === 'rating') {
    sort['rating.average'] = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'experience') {
    sort.experience = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'fee') {
    sort.consultationFee = sortOrder === 'asc' ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const doctors = await Doctor.find(filter)
    .populate('userId', 'name profilePicture phone email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Doctor.countDocuments(filter);

  // If availability filter is provided, check actual availability
  let filteredDoctors = doctors;
  if (availability) {
    const day = availability.toLowerCase();
    filteredDoctors = doctors.filter(doctor => 
      doctor.availability?.[day]?.isAvailable === true
    );
  }

  res.json({
    doctors: filteredDoctors,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalDoctors: total,
      hasNext: skip + parseInt(limit) < total,
      hasPrev: parseInt(page) > 1
    }
  });
}));

// Get doctor by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('userId', 'name profilePicture phone email address createdAt')
    .lean();

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  // Get recent reviews (last 10)
  const recentReviews = doctor.reviews
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  res.json({
    ...doctor,
    reviews: recentReviews
  });
}));

// Create/Update doctor profile (for doctors only)
router.post('/profile', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = doctorProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  // Check if doctor profile already exists
  let doctor = await Doctor.findOne({ userId: req.user.id });

  if (doctor) {
    // Update existing profile
    Object.assign(doctor, value);
    await doctor.save();
  } else {
    // Create new profile
    doctor = new Doctor({
      userId: req.user.id,
      ...value
    });
    await doctor.save();
  }

  const populatedDoctor = await Doctor.findById(doctor._id)
    .populate('userId', 'name profilePicture phone email');

  res.json({
    message: doctor.isNew ? 'Doctor profile created successfully' : 'Doctor profile updated successfully',
    doctor: populatedDoctor
  });
}));

// Get doctor's own profile
router.get('/profile/me', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user.id })
    .populate('userId', 'name profilePicture phone email address');

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  res.json({ doctor });
}));

// Update availability
router.put('/availability', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user.id });

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  doctor.availability = req.body.availability;
  await doctor.save();

  res.json({
    message: 'Availability updated successfully',
    availability: doctor.availability
  });
}));

// Get doctor's appointments
router.get('/appointments/my', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  const { status, date, page = 1, limit = 10 } = req.query;

  // Find doctor profile
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  // Build filter
  const filter = { doctorId: doctor._id };
  
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

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const appointments = await Appointment.find(filter)
    .populate('patientId', 'userId')
    .populate({
      path: 'patientId',
      populate: {
        path: 'userId',
        select: 'name profilePicture phone email'
      }
    })
    .sort({ scheduledTime: 1 })
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

// Get doctor statistics
router.get('/stats/dashboard', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // Today's appointments
  const todayAppointments = await Appointment.countDocuments({
    doctorId: doctor._id,
    scheduledTime: { $gte: startOfDay, $lte: endOfDay }
  });

  // Pending appointments
  const pendingAppointments = await Appointment.countDocuments({
    doctorId: doctor._id,
    status: 'scheduled'
  });

  // Completed appointments this month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const completedThisMonth = await Appointment.countDocuments({
    doctorId: doctor._id,
    status: 'completed',
    scheduledTime: { $gte: startOfMonth }
  });

  // Total patients
  const totalPatients = await Appointment.distinct('patientId', {
    doctorId: doctor._id
  });

  res.json({
    todayAppointments,
    pendingAppointments,
    completedThisMonth,
    totalPatients: totalPatients.length,
    rating: {
      average: doctor.rating.average,
      total: doctor.rating.count
    }
  });
}));

// Add review (patients only)
router.post('/:id/review', authenticateToken, authorizeRole(['patient']), asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  // Validate input
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  // Check if patient has had an appointment with this doctor
  const hasAppointment = await Appointment.findOne({
    doctorId: doctor._id,
    patientId: req.user.id, // This should be patient ID, you might need to find patient by userId
    status: 'completed'
  });

  if (!hasAppointment) {
    return res.status(403).json({ 
      message: 'You can only review doctors you have had appointments with' 
    });
  }

  // Check if user already reviewed this doctor
  const existingReviewIndex = doctor.reviews.findIndex(
    review => review.patientId.toString() === req.user.id
  );

  if (existingReviewIndex !== -1) {
    // Update existing review
    doctor.reviews[existingReviewIndex] = {
      patientId: req.user.id,
      rating,
      comment: comment || '',
      createdAt: new Date()
    };
  } else {
    // Add new review
    doctor.reviews.push({
      patientId: req.user.id,
      rating,
      comment: comment || '',
      createdAt: new Date()
    });
  }

  // Recalculate average rating
  const totalRating = doctor.reviews.reduce((sum, review) => sum + review.rating, 0);
  doctor.rating = {
    average: totalRating / doctor.reviews.length,
    count: doctor.reviews.length
  };

  await doctor.save();

  res.json({
    message: 'Review submitted successfully',
    rating: doctor.rating
  });
}));

// Search doctors
router.get('/search/:query', asyncHandler(async (req, res) => {
  const { query } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const searchFilter = {
    isApproved: true,
    $or: [
      { specialization: { $regex: query, $options: 'i' } },
      { 'education.degree': { $regex: query, $options: 'i' } },
      { 'education.institution': { $regex: query, $options: 'i' } },
      { languages: { $in: [new RegExp(query, 'i')] } },
      { bio: { $regex: query, $options: 'i' } }
    ]
  };

  // Also search in user names
  const users = await User.find({
    name: { $regex: query, $options: 'i' },
    role: 'doctor'
  }).select('_id');

  if (users.length > 0) {
    searchFilter.$or.push({
      userId: { $in: users.map(user => user._id) }
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const doctors = await Doctor.find(searchFilter)
    .populate('userId', 'name profilePicture phone email')
    .sort({ 'rating.average': -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Doctor.countDocuments(searchFilter);

  res.json({
    doctors,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalResults: total
    },
    searchQuery: query
  });
}));

export default router;