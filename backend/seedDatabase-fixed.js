import { User, Doctor, Patient, Appointment, Prescription, Teleconsultation, HealthRecord, Notification } from './models/index.js';
import connectDB from './config/database.js';
import 'dotenv/config';

// Sample data - passwords will be hashed by the User model's pre-save hook
const sampleUsers = [
  {
    username: 'admin_user',
    email: 'admin@arogyamitra.com',
    password: 'admin123', // Will be hashed by model
    name: 'Admin User',
    role: 'admin',
    phone: '9999999999',
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    address: {
      street: '123 Admin Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    }
  },
  {
    username: 'dr_sharma',
    email: 'dr.sharma@hospital.com',
    password: 'doctor123', // Will be hashed by model
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
    email: 'dr.patel@clinic.com',
    password: 'doctor123', // Will be hashed by model
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
    password: 'patient123', // Will be hashed by model
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
    password: 'patient123', // Will be hashed by model
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
    qualifications: [
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
    languages: ['English', 'Hindi'],
    hospital: {
      name: 'Heart Care Clinic',
      address: {
        street: '123 Medical District',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      }
    },
    consultationFee: {
      inPerson: 1500,
      teleconsultation: 1000
    },
    availability: [
      {
        day: 'Monday',
        slots: [
          { startTime: '09:00', endTime: '12:00', isAvailable: true },
          { startTime: '14:00', endTime: '17:00', isAvailable: true }
        ]
      },
      {
        day: 'Tuesday',
        slots: [
          { startTime: '09:00', endTime: '12:00', isAvailable: true },
          { startTime: '14:00', endTime: '17:00', isAvailable: true }
        ]
      },
      {
        day: 'Wednesday',
        slots: [
          { startTime: '09:00', endTime: '12:00', isAvailable: true },
          { startTime: '14:00', endTime: '17:00', isAvailable: true }
        ]
      },
      {
        day: 'Thursday',
        slots: [
          { startTime: '09:00', endTime: '12:00', isAvailable: true },
          { startTime: '14:00', endTime: '17:00', isAvailable: true }
        ]
      },
      {
        day: 'Friday',
        slots: [
          { startTime: '09:00', endTime: '12:00', isAvailable: true },
          { startTime: '14:00', endTime: '17:00', isAvailable: true }
        ]
      },
      {
        day: 'Saturday',
        slots: [
          { startTime: '09:00', endTime: '13:00', isAvailable: true }
        ]
      },
      {
        day: 'Sunday',
        slots: []
      }
    ],
    isVerified: true,
    teleconsultationEnabled: true
  },
  {
    specialization: 'Dermatology',
    medicalLicenseNumber: 'DL-DERM-2019-002',
    experience: 8,
    qualifications: [
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
    languages: ['English', 'Hindi'],
    hospital: {
      name: 'Skin Care Center',
      address: {
        street: '456 Health Avenue',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
      }
    },
    consultationFee: {
      inPerson: 1200,
      teleconsultation: 800
    },
    availability: [
      {
        day: 'Monday',
        slots: [{ startTime: '10:00', endTime: '18:00', isAvailable: true }]
      },
      {
        day: 'Tuesday',
        slots: [{ startTime: '10:00', endTime: '18:00', isAvailable: true }]
      },
      {
        day: 'Wednesday',
        slots: [{ startTime: '10:00', endTime: '18:00', isAvailable: true }]
      },
      {
        day: 'Thursday',
        slots: [{ startTime: '10:00', endTime: '18:00', isAvailable: true }]
      },
      {
        day: 'Friday',
        slots: [{ startTime: '10:00', endTime: '18:00', isAvailable: true }]
      },
      {
        day: 'Saturday',
        slots: [{ startTime: '10:00', endTime: '14:00', isAvailable: true }]
      },
      {
        day: 'Sunday',
        slots: []
      }
    ],
    isVerified: true,
    teleconsultationEnabled: true
  }
];

const samplePatients = [
  {
    dateOfBirth: new Date('1985-06-15'),
    gender: 'Male',
    bloodType: 'O+',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '9123456777',
      relationship: 'spouse'
    },
    medicalHistory: [
      {
        condition: 'Diabetes',
        diagnosedDate: new Date('2020-01-15'),
        severity: 'Moderate',
        status: 'Chronic'
      },
      {
        condition: 'Hypertension',
        diagnosedDate: new Date('2019-06-10'),
        severity: 'Mild',
        status: 'Active'
      }
    ],
    allergies: [
      {
        allergen: 'Penicillin',
        severity: 'Severe',
        reaction: 'Anaphylaxis'
      },
      {
        allergen: 'Pollen',
        severity: 'Mild',
        reaction: 'Sneezing, runny nose'
      }
    ],
    insuranceDetails: {
      provider: 'Star Health Insurance',
      policyNumber: 'SH-123456789',
      validUntil: new Date('2024-12-31')
    }
  },
  {
    dateOfBirth: new Date('1990-03-22'),
    gender: 'Female',
    bloodType: 'A+',
    emergencyContact: {
      name: 'Bob Smith',
      phone: '9123456776',
      relationship: 'brother'
    },
    medicalHistory: [],
    allergies: [
      {
        allergen: 'Shellfish',
        severity: 'Moderate',
        reaction: 'Hives, swelling'
      }
    ],
    insuranceDetails: {
      provider: 'HDFC ERGO Health Insurance',
      policyNumber: 'HE-987654321',
      validUntil: new Date('2024-09-30')
    }
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Teleconsultation.deleteMany({});
    await HealthRecord.deleteMany({});
    await Notification.deleteMany({});

    // Create users first (passwords will be hashed by the model)
    console.log('Creating users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save(); // This will trigger the pre-save hook
      createdUsers.push(user);
    }
    
    const doctorUsers = createdUsers.filter(user => user.role === 'doctor');
    const patientUsers = createdUsers.filter(user => user.role === 'patient');

    // Link doctor profiles to users
    console.log('Creating doctor profiles...');
    const doctorProfiles = sampleDoctors.map((doctor, index) => ({
      ...doctor,
      userId: doctorUsers[index]._id
    }));
    
    const createdDoctors = await Doctor.insertMany(doctorProfiles);

    // Link patient profiles to users
    console.log('Creating patient profiles...');
    const patientProfiles = samplePatients.map((patient, index) => ({
      ...patient,
      userId: patientUsers[index]._id
    }));
    
    const createdPatients = await Patient.insertMany(patientProfiles);

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${createdDoctors.length} doctors`);
    console.log(`Created ${createdPatients.length} patients`);

    console.log('\n📋 Test Credentials:');
    console.log('👨‍⚕️ Doctor: username=dr_sharma, password=doctor123');
    console.log('🏥 Admin: username=admin_user, password=admin123');
    console.log('👤 Patient: username=patient_john, password=patient123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      for (const field in error.errors) {
        console.error(`Validation error in ${field}:`, error.errors[field].message);
      }
    }
    process.exit(1);
  }
};

seedDatabase();