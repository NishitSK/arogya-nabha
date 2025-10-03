import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';
import Prescription from './models/Prescription.js';
import HealthRecord from './models/HealthRecord.js';
import Notification from './models/Notification.js';

dotenv.config();

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@arogyannabha.com',
    password: 'admin123',
    name: 'System Administrator',
    role: 'admin',
    phone: '9999999999',
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true
  },
  {
    username: 'dr_sharma',
    email: 'dr.sharma@arogyannabha.com',
    password: 'doctor123',
    name: 'Dr. Rajesh Sharma',
    role: 'doctor',
    phone: '9876543210',
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    address: {
      street: '123 Medical District',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    }
  },
  {
    username: 'dr_patel',
    email: 'dr.patel@arogyannabha.com',
    password: 'doctor123',
    name: 'Dr. Priya Patel',
    role: 'doctor',
    phone: '9876543211',
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    address: {
      street: '456 Health Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    }
  },
  {
    username: 'patient_john',
    email: 'john.doe@email.com',
    password: 'patient123',
    name: 'John Doe',
    role: 'patient',
    phone: '9123456789',
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    address: {
      street: '789 Residential Area',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    }
  },
  {
    username: 'patient_jane',
    email: 'jane.smith@email.com',
    password: 'patient123',
    name: 'Jane Smith',
    role: 'patient',
    phone: '9123456788',
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    address: {
      street: '321 Colony Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      country: 'India'
    }
  }
];

const sampleDoctors = [
  {
    specialization: 'Cardiology',
    medicalLicenseNumber: 'MH-CARD-2020-001',
    experience: 10,
    education: [
      {
        degree: 'MBBS',
        institution: 'All India Institute of Medical Sciences',
        year: 2008
      },
      {
        degree: 'MD Cardiology',
        institution: 'Post Graduate Institute of Medical Sciences',
        year: 2012
      }
    ],
    certifications: ['Board Certified Cardiologist', 'Advanced Cardiac Life Support'],
    languages: ['english', 'hindi'],
    bio: 'Dr. Sharma is a highly experienced cardiologist with over 10 years of experience in treating heart conditions.',
    consultationFee: {
      inPerson: 1500,
      teleconsultation: 1000
    },
    hospital: {
      name: 'Heart Care Clinic',
      address: '123 Medical District, Mumbai, Maharashtra, 400001'
    },
    isApproved: true,
    clinicAddress: {
      name: 'Heart Care Clinic',
      street: '123 Medical District',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    availability: [
      {
        day: 'monday',
        isAvailable: true,
        slots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ]
      },
      {
        day: 'tuesday',
        isAvailable: true,
        slots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ]
      },
      {
        day: 'wednesday',
        isAvailable: true,
        slots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ]
      },
      {
        day: 'thursday',
        isAvailable: true,
        slots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ]
      },
      {
        day: 'friday',
        isAvailable: true,
        slots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ]
      },
      {
        day: 'saturday',
        isAvailable: true,
        slots: [
          { startTime: '09:00', endTime: '13:00' }
        ]
      },
      {
        day: 'sunday',
        isAvailable: false,
        slots: []
      }
    ]
  },
  {
    specialization: 'Dermatology',
    medicalLicenseNumber: 'DL-DERM-2019-002',
    experience: 8,
    education: [
      {
        degree: 'MBBS',
        institution: 'Lady Hardinge Medical College',
        year: 2010
      },
      {
        degree: 'MD Dermatology',
        institution: 'All India Institute of Medical Sciences',
        year: 2014
      }
    ],
    certifications: ['Board Certified Dermatologist', 'Cosmetic Dermatology Certificate'],
    languages: ['english', 'hindi'],
    bio: 'Dr. Patel specializes in skin conditions and cosmetic dermatology with 8 years of experience.',
    consultationFee: {
      inPerson: 1200,
      teleconsultation: 800
    },
    hospital: {
      name: 'Skin Care Center',
      address: '456 Health Avenue, Delhi, Delhi, 110001'
    },
    isApproved: true,
    clinicAddress: {
      name: 'Skin Care Center',
      street: '456 Health Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    availability: [
      {
        day: 'monday',
        isAvailable: true,
        slots: [{ startTime: '10:00', endTime: '18:00' }]
      },
      {
        day: 'tuesday',
        isAvailable: true,
        slots: [{ startTime: '10:00', endTime: '18:00' }]
      },
      {
        day: 'wednesday',
        isAvailable: true,
        slots: [{ startTime: '10:00', endTime: '18:00' }]
      },
      {
        day: 'thursday',
        isAvailable: true,
        slots: [{ startTime: '10:00', endTime: '18:00' }]
      },
      {
        day: 'friday',
        isAvailable: true,
        slots: [{ startTime: '10:00', endTime: '18:00' }]
      },
      {
        day: 'saturday',
        isAvailable: true,
        slots: [{ startTime: '10:00', endTime: '14:00' }]
      },
      {
        day: 'sunday',
        isAvailable: false,
        slots: []
      }
    ]
  }
];

const samplePatients = [
  {
    dateOfBirth: new Date('1990-05-15'),
    gender: 'male',
    bloodGroup: 'O+',
    height: { value: 175, unit: 'cm' },
    weight: { value: 70, unit: 'kg' },
    allergies: ['peanuts', 'shellfish'],
    medications: [
      {
        name: 'Vitamin D3',
        dosage: '1000 IU',
        frequency: 'Once daily',
        startDate: new Date('2024-01-01'),
        isActive: true
      }
    ],
    medicalHistory: [
      {
        condition: 'Hypertension',
        diagnosedDate: new Date('2023-06-01'),
        status: 'active',
        notes: 'Under medication control'
      }
    ],
    emergencyContact: {
      name: 'Mary Doe',
      relationship: 'Wife',
      phone: '9123456790',
      email: 'mary.doe@email.com'
    }
  },
  {
    dateOfBirth: new Date('1985-08-22'),
    gender: 'female',
    bloodGroup: 'A+',
    height: { value: 160, unit: 'cm' },
    weight: { value: 55, unit: 'kg' },
    allergies: ['sulfa drugs'],
    medications: [],
    medicalHistory: [
      {
        condition: 'Migraine',
        diagnosedDate: new Date('2022-03-15'),
        status: 'chronic',
        notes: 'Managed with lifestyle changes'
      }
    ],
    emergencyContact: {
      name: 'Robert Smith',
      relationship: 'Husband',
      phone: '9123456787',
      email: 'robert.smith@email.com'
    }
  }
];

// Clear existing data
const clearDatabase = async () => {
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
  await Appointment.deleteMany({});
  await Prescription.deleteMany({});
  await HealthRecord.deleteMany({});
  await Notification.deleteMany({});
  console.log('🗑️  Database cleared');
};

// Seed users
const seedUsers = async () => {
  const users = [];
  
  for (const userData of sampleUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    await user.save();
    users.push(user);
  }
  
  console.log('👥 Users seeded');
  return users;
};

// Seed doctors
const seedDoctors = async (users) => {
  const doctors = [];
  const doctorUsers = users.filter(user => user.role === 'doctor');
  
  for (let i = 0; i < doctorUsers.length; i++) {
    const doctor = new Doctor({
      userId: doctorUsers[i]._id,
      ...sampleDoctors[i]
    });
    await doctor.save();
    doctors.push(doctor);
  }
  
  console.log('👨‍⚕️ Doctors seeded');
  return doctors;
};

// Seed patients
const seedPatients = async (users) => {
  const patients = [];
  const patientUsers = users.filter(user => user.role === 'patient');
  
  for (let i = 0; i < patientUsers.length; i++) {
    const patient = new Patient({
      userId: patientUsers[i]._id,
      ...samplePatients[i]
    });
    await patient.save();
    patients.push(patient);
  }
  
  console.log('🤒 Patients seeded');
  return patients;
};

// Seed appointments
const seedAppointments = async (doctors, patients) => {
  const appointments = [];
  
  // Create some sample appointments
  const sampleAppointments = [
    {
      patientId: patients[0]._id,
      doctorId: doctors[0]._id,
      scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      appointmentType: 'consultation',
      symptoms: 'Chest pain and shortness of breath',
      status: 'scheduled',
      consultationFee: 1500
    },
    {
      patientId: patients[1]._id,
      doctorId: doctors[1]._id,
      scheduledTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      appointmentType: 'follow-up',
      symptoms: 'Skin rash follow-up',
      status: 'confirmed',
      consultationFee: 1200
    },
    {
      patientId: patients[0]._id,
      doctorId: doctors[0]._id,
      scheduledTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      appointmentType: 'consultation',
      symptoms: 'Regular checkup',
      status: 'completed',
      consultationFee: 1500,
      diagnosis: 'Hypertension under control',
      treatment: 'Continue current medication',
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];
  
  for (const appointmentData of sampleAppointments) {
    const appointment = new Appointment(appointmentData);
    await appointment.save();
    appointments.push(appointment);
  }
  
  console.log('📅 Appointments seeded');
  return appointments;
};

// Seed prescriptions
const seedPrescriptions = async (doctors, patients, appointments) => {
  const prescriptions = [];
  
  const samplePrescription = {
    patientId: patients[0]._id,
    doctorId: doctors[0]._id,
    appointmentId: appointments[2]._id, // The completed appointment
    medications: [
      {
        name: 'Amlodipine',
        genericName: 'Amlodipine Besylate',
        dosage: '5mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with food in the morning',
        quantity: 30,
        refills: 2,
        adherence: []
      },
      {
        name: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        dosage: '75mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take after meals',
        quantity: 30,
        refills: 2,
        adherence: []
      }
    ],
    diagnosis: 'Hypertension',
    notes: 'Regular blood pressure monitoring required',
    status: 'active',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };
  
  const prescription = new Prescription(samplePrescription);
  await prescription.save();
  prescriptions.push(prescription);
  
  console.log('💊 Prescriptions seeded');
  return prescriptions;
};

// Seed health records
const seedHealthRecords = async (doctors, patients) => {
  const healthRecords = [];
  
  const sampleHealthRecord = {
    patientId: patients[0]._id,
    createdBy: {
      doctorId: doctors[0]._id,
      role: 'doctor'
    },
    category: 'cardiology',
    title: 'Cardiac Evaluation Report',
    description: 'Comprehensive cardiac evaluation including ECG and echocardiogram results.',
    recordDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    vitalSigns: {
      bloodPressure: { systolic: 140, diastolic: 90 },
      heartRate: 78,
      temperature: 36.5,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 70,
      height: 175,
      bmi: 22.9
    },
    labResults: [
      {
        testName: 'Total Cholesterol',
        value: '220',
        unit: 'mg/dL',
        referenceRange: '<200 mg/dL',
        status: 'abnormal'
      },
      {
        testName: 'HDL Cholesterol',
        value: '45',
        unit: 'mg/dL',
        referenceRange: '>40 mg/dL',
        status: 'normal'
      }
    ],
    diagnosis: 'Hypertension with mild hypercholesterolemia',
    treatment: 'Antihypertensive medication, dietary modifications',
    followUpInstructions: 'Follow up in 4 weeks for blood pressure monitoring',
    tags: ['hypertension', 'cardiology', 'routine-checkup']
  };
  
  const healthRecord = new HealthRecord(sampleHealthRecord);
  await healthRecord.save();
  healthRecords.push(healthRecord);
  
  console.log('📋 Health records seeded');
  return healthRecords;
};

// Seed notifications
const seedNotifications = async (users) => {
  const notifications = [];
  const patientUsers = users.filter(user => user.role === 'patient');
  
  const sampleNotifications = [
    {
      recipientId: patientUsers[0]._id,
      type: 'appointment_reminder',
      title: 'Upcoming Appointment Reminder',
      message: 'You have an appointment with Dr. Sharma tomorrow at 10:00 AM.',
      priority: 'medium',
      data: { appointmentId: 'sample-id' },
      channels: { push: true, email: true, sms: false, inApp: true }
    },
    {
      recipientId: patientUsers[0]._id,
      type: 'prescription_reminder',
      title: 'Medication Reminder',
      message: 'Time to take your Amlodipine 5mg.',
      priority: 'medium',
      data: { medicationName: 'Amlodipine' },
      channels: { push: true, email: false, sms: false, inApp: true }
    }
  ];
  
  for (const notificationData of sampleNotifications) {
    const notification = new Notification(notificationData);
    await notification.save();
    notifications.push(notification);
  }
  
  console.log('🔔 Notifications seeded');
  return notifications;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await clearDatabase();
    
    const users = await seedUsers();
    const doctors = await seedDoctors(users);
    const patients = await seedPatients(users);
    const appointments = await seedAppointments(doctors, patients);
    const prescriptions = await seedPrescriptions(doctors, patients, appointments);
    const healthRecords = await seedHealthRecords(doctors, patients);
    const notifications = await seedNotifications(users);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Seeding Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`👨‍⚕️ Doctors: ${doctors.length}`);
    console.log(`🤒 Patients: ${patients.length}`);
    console.log(`📅 Appointments: ${appointments.length}`);
    console.log(`💊 Prescriptions: ${prescriptions.length}`);
    console.log(`📋 Health Records: ${healthRecords.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);
    
    console.log('\n🔑 Sample Login Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Doctor: dr_sharma / doctor123');
    console.log('Doctor: dr_patel / doctor123');
    console.log('Patient: patient_john / patient123');
    console.log('Patient: patient_jane / patient123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Connect to database and seed
const connectAndSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arogyannabha', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for seeding');
    await seedDatabase();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

connectAndSeed();