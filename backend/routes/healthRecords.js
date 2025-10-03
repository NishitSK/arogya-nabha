import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import HealthRecord from '../models/HealthRecord.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Joi from 'joi';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// Validation schemas
const healthRecordSchema = Joi.object({
  patientId: Joi.string().required(),
  category: Joi.string().valid(
    'general', 'cardiology', 'neurology', 'orthopedics', 'dermatology',
    'laboratory', 'radiology', 'prescription', 'vaccination', 'surgery'
  ).required(),
  title: Joi.string().max(200).required(),
  description: Joi.string().max(2000).required(),
  recordDate: Joi.date().max('now').required(),
  vitalSigns: Joi.object({
    bloodPressure: Joi.object({
      systolic: Joi.number().min(50).max(300),
      diastolic: Joi.number().min(30).max(200)
    }),
    heartRate: Joi.number().min(30).max(300),
    temperature: Joi.number().min(30).max(45),
    respiratoryRate: Joi.number().min(5).max(60),
    oxygenSaturation: Joi.number().min(70).max(100),
    weight: Joi.number().min(0.5).max(500),
    height: Joi.number().min(30).max(300),
    bmi: Joi.number().min(10).max(80)
  }),
  labResults: Joi.array().items(Joi.object({
    testName: Joi.string().required(),
    value: Joi.string().required(),
    unit: Joi.string(),
    referenceRange: Joi.string(),
    status: Joi.string().valid('normal', 'abnormal', 'critical')
  })),
  medications: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    dosage: Joi.string().required(),
    frequency: Joi.string().required(),
    duration: Joi.string()
  })),
  diagnosis: Joi.string().max(1000),
  treatment: Joi.string().max(2000),
  followUpInstructions: Joi.string().max(1000),
  isPrivate: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string())
});

// Create health record (doctors only)
router.post('/', authenticateToken, authorizeRole(['doctor']), upload.array('attachments', 5), asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = healthRecordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  const {
    patientId,
    category,
    title,
    description,
    recordDate,
    vitalSigns,
    labResults,
    medications,
    diagnosis,
    treatment,
    followUpInstructions,
    isPrivate,
    tags
  } = value;

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

  // Handle file uploads if any
  let attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'health-records',
          resource_type: 'auto'
        });

        attachments.push({
          filename: file.originalname,
          url: result.secure_url,
          publicId: result.public_id,
          size: file.size,
          mimetype: file.mimetype
        });
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        // Continue without this file
      }
    }
  }

  // Create health record
  const healthRecord = new HealthRecord({
    patientId,
    createdBy: {
      doctorId: doctor._id,
      role: 'doctor'
    },
    category,
    title,
    description,
    recordDate: new Date(recordDate),
    vitalSigns: vitalSigns || {},
    labResults: labResults || [],
    medications: medications || [],
    diagnosis: diagnosis || '',
    treatment: treatment || '',
    followUpInstructions: followUpInstructions || '',
    attachments,
    isPrivate: isPrivate || false,
    tags: tags || []
  });

  await healthRecord.save();

  const populatedRecord = await HealthRecord.findById(healthRecord._id)
    .populate({
      path: 'createdBy.doctorId',
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
    message: 'Health record created successfully',
    healthRecord: populatedRecord
  });
}));

// Get health records with filters
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { 
    patientId, 
    category, 
    startDate, 
    endDate, 
    tags,
    page = 1, 
    limit = 10,
    sortBy = 'recordDate',
    sortOrder = 'desc'
  } = req.query;

  // Build filter based on user role
  const filter = {};

  if (req.user.role === 'patient') {
    // Patients can only see their own records (non-private or their own private records)
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    filter.patientId = patient._id;
  } else if (req.user.role === 'doctor') {
    // Doctors can see records of their patients and records they created
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    if (patientId) {
      // Verify doctor has treated this patient
      filter.patientId = patientId;
      // Additional check could be added here to verify doctor-patient relationship
    } else {
      // Show records created by this doctor
      filter['createdBy.doctorId'] = doctor._id;
    }
  } else if (req.user.role === 'admin') {
    // Admins can filter by patient
    if (patientId) filter.patientId = patientId;
  }

  // Apply additional filters
  if (category && category !== 'all') {
    filter.category = category;
  }

  if (startDate || endDate) {
    filter.recordDate = {};
    if (startDate) filter.recordDate.$gte = new Date(startDate);
    if (endDate) filter.recordDate.$lte = new Date(endDate);
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(',');
    filter.tags = { $in: tagArray.map(tag => tag.trim()) };
  }

  // Build sort object
  const sort = {};
  if (sortBy === 'recordDate') {
    sort.recordDate = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'category') {
    sort.category = sortOrder === 'asc' ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const healthRecords = await HealthRecord.find(filter)
    .populate({
      path: 'createdBy.doctorId',
      populate: {
        path: 'userId',
        select: 'name profilePicture specialization'
      }
    })
    .populate({
      path: 'patientId',
      populate: {
        path: 'userId',
        select: 'name profilePicture dateOfBirth'
      }
    })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await HealthRecord.countDocuments(filter);

  res.json({
    healthRecords,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalRecords: total,
      hasNext: skip + parseInt(limit) < total,
      hasPrev: parseInt(page) > 1
    }
  });
}));

// Get health record by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const healthRecord = await HealthRecord.findById(req.params.id)
    .populate({
      path: 'createdBy.doctorId',
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
    });

  if (!healthRecord) {
    return res.status(404).json({ message: 'Health record not found' });
  }

  // Check access permissions
  let hasAccess = false;

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    hasAccess = patient && healthRecord.patientId._id.toString() === patient._id.toString();
    
    // Patients cannot see private records they didn't create
    if (hasAccess && healthRecord.isPrivate && 
        healthRecord.createdBy.role !== 'patient') {
      hasAccess = false;
    }
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    hasAccess = doctor && (
      healthRecord.createdBy.doctorId._id.toString() === doctor._id.toString() ||
      // Doctor can access non-private records of their patients
      (!healthRecord.isPrivate && healthRecord.patientId._id.toString() === patient?._id.toString())
    );
  } else if (req.user.role === 'admin') {
    hasAccess = true;
  }

  if (!hasAccess) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({ healthRecord });
}));

// Update health record (only by creator)
router.put('/:id', authenticateToken, authorizeRole(['doctor']), upload.array('attachments', 5), asyncHandler(async (req, res) => {
  const healthRecord = await HealthRecord.findById(req.params.id);
  if (!healthRecord) {
    return res.status(404).json({ message: 'Health record not found' });
  }

  // Check if doctor created this record
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor || healthRecord.createdBy.doctorId.toString() !== doctor._id.toString()) {
    return res.status(403).json({ message: 'You can only edit records you created' });
  }

  // Validate input (excluding required patientId for updates)
  const updateSchema = healthRecordSchema.fork(['patientId'], schema => schema.optional());
  const { error, value } = updateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  // Handle new file uploads
  let newAttachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'health-records',
          resource_type: 'auto'
        });

        newAttachments.push({
          filename: file.originalname,
          url: result.secure_url,
          publicId: result.public_id,
          size: file.size,
          mimetype: file.mimetype
        });
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
      }
    }
  }

  // Update health record
  Object.assign(healthRecord, value);
  
  // Add new attachments to existing ones
  if (newAttachments.length > 0) {
    healthRecord.attachments.push(...newAttachments);
  }

  healthRecord.updatedAt = new Date();
  
  // Add to edit history
  healthRecord.editHistory.push({
    editedAt: new Date(),
    editedBy: req.user.id,
    changes: Object.keys(value).join(', ')
  });

  await healthRecord.save();

  const populatedRecord = await HealthRecord.findById(healthRecord._id)
    .populate({
      path: 'createdBy.doctorId',
      populate: {
        path: 'userId',
        select: 'name profilePicture'
      }
    });

  res.json({
    message: 'Health record updated successfully',
    healthRecord: populatedRecord
  });
}));

// Delete health record (only by creator or admin)
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const healthRecord = await HealthRecord.findById(req.params.id);
  if (!healthRecord) {
    return res.status(404).json({ message: 'Health record not found' });
  }

  // Check permissions
  let canDelete = false;
  
  if (req.user.role === 'admin') {
    canDelete = true;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    canDelete = doctor && healthRecord.createdBy.doctorId.toString() === doctor._id.toString();
  }

  if (!canDelete) {
    return res.status(403).json({ message: 'Only creators and admins can delete health records' });
  }

  // Delete attachments from cloudinary
  for (const attachment of healthRecord.attachments) {
    try {
      if (attachment.publicId) {
        await cloudinary.uploader.destroy(attachment.publicId);
      }
    } catch (deleteError) {
      console.error('Error deleting attachment:', deleteError);
    }
  }

  await HealthRecord.findByIdAndDelete(req.params.id);

  res.json({ 
    message: 'Health record deleted successfully',
    deletedId: req.params.id 
  });
}));

// Remove attachment from health record
router.delete('/:id/attachments/:attachmentId', authenticateToken, authorizeRole(['doctor']), asyncHandler(async (req, res) => {
  const healthRecord = await HealthRecord.findById(req.params.id);
  if (!healthRecord) {
    return res.status(404).json({ message: 'Health record not found' });
  }

  // Check if doctor created this record
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor || healthRecord.createdBy.doctorId.toString() !== doctor._id.toString()) {
    return res.status(403).json({ message: 'You can only edit records you created' });
  }

  const attachment = healthRecord.attachments.id(req.params.attachmentId);
  if (!attachment) {
    return res.status(404).json({ message: 'Attachment not found' });
  }

  // Delete from cloudinary
  try {
    if (attachment.publicId) {
      await cloudinary.uploader.destroy(attachment.publicId);
    }
  } catch (deleteError) {
    console.error('Error deleting attachment from cloudinary:', deleteError);
  }

  // Remove from record
  healthRecord.attachments.pull(req.params.attachmentId);
  await healthRecord.save();

  res.json({ 
    message: 'Attachment removed successfully',
    remainingAttachments: healthRecord.attachments.length
  });
}));

// Get health record statistics for a patient
router.get('/patient/:patientId/stats', authenticateToken, asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  // Check access permissions
  let hasAccess = false;
  
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    hasAccess = patient && patient._id.toString() === patientId;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    // Doctor needs to have treated this patient (simplified check)
    hasAccess = doctor !== null;
  } else if (req.user.role === 'admin') {
    hasAccess = true;
  }

  if (!hasAccess) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Get statistics
  const totalRecords = await HealthRecord.countDocuments({ patientId });
  
  const recordsByCategory = await HealthRecord.aggregate([
    { $match: { patientId: require('mongoose').Types.ObjectId(patientId) } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const recentRecords = await HealthRecord.find({ patientId })
    .sort({ recordDate: -1 })
    .limit(5)
    .populate({
      path: 'createdBy.doctorId',
      populate: {
        path: 'userId',
        select: 'name'
      }
    })
    .select('title category recordDate createdBy');

  // Get latest vital signs
  const latestVitals = await HealthRecord.findOne({ 
    patientId,
    'vitalSigns': { $exists: true, $ne: {} }
  })
    .sort({ recordDate: -1 })
    .select('vitalSigns recordDate');

  res.json({
    patientId,
    totalRecords,
    recordsByCategory: recordsByCategory.map(item => ({
      category: item._id,
      count: item.count
    })),
    recentRecords,
    latestVitals: latestVitals?.vitalSigns || null,
    latestVitalsDate: latestVitals?.recordDate || null
  });
}));

// Search health records
router.get('/search/:query', authenticateToken, asyncHandler(async (req, res) => {
  const { query } = req.params;
  const { page = 1, limit = 10, category, dateRange } = req.query;

  // Build base filter based on user role
  let baseFilter = {};
  
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    baseFilter.patientId = patient._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    baseFilter['createdBy.doctorId'] = doctor._id;
  }

  // Build search filter
  const searchFilter = {
    ...baseFilter,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { diagnosis: { $regex: query, $options: 'i' } },
      { treatment: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  };

  // Apply additional filters
  if (category && category !== 'all') {
    searchFilter.category = category;
  }

  if (dateRange) {
    const [startDate, endDate] = dateRange.split(',');
    searchFilter.recordDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const healthRecords = await HealthRecord.find(searchFilter)
    .populate({
      path: 'createdBy.doctorId',
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
    .sort({ recordDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await HealthRecord.countDocuments(searchFilter);

  res.json({
    healthRecords,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalResults: total
    },
    searchQuery: query,
    filters: { category, dateRange }
  });
}));

export default router;