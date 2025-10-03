import { useState, useEffect } from 'react';

// Global language state & subscribers so all components re-render without page refresh
let globalLanguage: Language | undefined = undefined;
const languageSubscribers: Array<(lang: Language) => void> = [];

const getInitialLanguage = (): Language => {
  if (globalLanguage) return globalLanguage;
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('arogya-language') : null;
    globalLanguage = (saved as Language) || 'en';
  } catch {
    globalLanguage = 'en';
  }
  return globalLanguage as Language;
};

export type Language = 'en' | 'hi' | 'pa';

interface Translations {
  [key: string]: string;
}

interface LanguageData {
  [key: string]: Translations;
}

const translations: LanguageData = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.patient': 'Patient',
    'nav.doctor': 'Doctor',
    'nav.hospitals': 'Hospitals',
    'nav.volunteer': 'Volunteer',
    'nav.emergency': 'Emergency',
    
    // Homepage
  'home.title': 'Nabha Health',
    'home.subtitle': 'Rural Healthcare Platform',
    'home.description': 'Connecting rural communities in Nabha, Punjab with quality healthcare services. Bridging the gap between patients and medical professionals through technology.',
    'home.getStarted': 'Get Started',
    'home.emergency': 'Emergency',
    'home.quickAccess': 'Quick Access Services',
    'home.quickAccessDesc': 'Essential healthcare services at your fingertips',
    'home.bookAppt': 'Book Appointment',
    'home.bookApptDesc': 'Schedule consultation with doctors',
    'home.healthRecords': 'Health Records',
    'home.healthRecordsDesc': 'Access your medical history',
    'home.teleconsult': 'Teleconsultation', 
    'home.teleconsultDesc': 'Connect with doctors online',
    'home.findHospitals': 'Find Hospitals',
    'home.findHospitalsDesc': 'Locate nearby healthcare facilities',
    'home.excellence': 'Healthcare Excellence',
    'home.excellenceDesc': 'Comprehensive medical services designed for rural communities',
    'home.patientCare': 'Patient Care',
    'home.patientCareDesc': 'Comprehensive medical services',
    'home.expertDoctors': 'Expert Doctors',
    'home.expertDoctorsDesc': 'Qualified healthcare professionals',
    'home.medicineDelivery': 'Medicine Delivery',
    'home.medicineDeliveryDesc': 'Doorstep prescription delivery',
    'home.healthMonitoring': 'Health Monitoring',
    'home.healthMonitoringDesc': 'Regular health checkups',
    'home.joinRevolution': 'Join the Healthcare Revolution',
    'home.joinDesc': 'Experience modern healthcare services tailored for rural communities. Quality care, right at your doorstep.',
    'home.startPatient': 'Start as Patient',
    'home.providerLogin': 'Healthcare Provider Login',
    
    // Emergency
    'emergency.services': 'Emergency Services',
    'emergency.location': 'Current Location',
    'emergency.quickDial': 'Quick Dial',
    'emergency.firstAid': 'First Aid Reminder:',
    'emergency.firstAidText': 'Keep patient calm, check breathing, call for help immediately.',
    'emergency.callInitiated': 'Emergency Call Initiated',
    'emergency.calling': 'Calling',
    
    // Common
    'common.ambulance': 'Ambulance',
    'common.police': 'Police',
    'common.fire': 'Fire Brigade',
    'common.hospital': 'Nabha Civil Hospital',
    
    // Hospital Locator
    'hospitals.findNearby': 'Find Nearby Hospitals',
    'hospitals.locateHealthcare': 'Locate healthcare facilities in Nabha, Punjab',
    'hospitals.nabhaCivil': 'Nabha Civil Hospital',
    'hospitals.maxSuperSpeciality': 'Max Super Speciality Hospital',
    'hospitals.gurudwaraSahib': 'Gurudwara Sahib Dispensary',
    'hospitals.drSharmaClinic': 'Dr. Sharma\'s Clinic',
    'hospitals.searchPlaceholder': 'Search hospitals, doctors, or services...',
    'hospitals.filters': 'Filters',
    'hospitals.allHospitals': 'All Hospitals',
    'hospitals.government': 'Government',
    'hospitals.private': 'Private',
    'hospitals.charitable': 'Charitable',
    'hospitals.clinics': 'Clinics',
    'hospitals.mapView': 'Map View',
    'hospitals.showingFacilities': 'Showing {{count}} facilities in Nabha',
    'hospitals.selected': 'Selected',
    'hospitals.dataSource': 'Data source: OpenStreetMap · Marker click to view details.',
    'hospitals.healthcareFacilities': 'Healthcare Facilities ({{count}})',
    'hospitals.services': 'Services',
    'hospitals.directions': 'Directions',
    'hospitals.call': 'Call',
    'hospitals.emergencyAssistance': 'For immediate medical assistance, call these emergency numbers:',
    'hospitals.ambulance': 'Ambulance',
    'hospitals.civilHospitalEmergency': 'Civil Hospital Emergency',
  // Hospital timing/common
  'hospital.timing.24x7': '24/7',
  'hospital.timing.daylong': '6:00 AM - 10:00 PM',
  'hospital.timing.standardClinic': '9:00 AM - 8:00 PM',
  // Address segments (optional future use)
  'address.civilLinesNabha': 'Civil Lines, Nabha, Punjab 147201',
  'address.gtRoadNabha': 'GT Road, Nabha, Punjab 147201',
  'address.gurBazaarNabha': 'Gur Bazaar, Nabha, Punjab 147201',
  'address.modelTownNabha': 'Model Town, Nabha, Punjab 147201',
    
    // Medical Services
    'services.emergency': 'Emergency',
    'services.generalMedicine': 'General Medicine',
    'services.surgery': 'Surgery',
    'services.pediatrics': 'Pediatrics',
    'services.cardiology': 'Cardiology',
    'services.neurology': 'Neurology',
    'services.oncology': 'Oncology',
    'services.icu': 'ICU',
    'services.freeMedicines': 'Free Medicines',
    'services.basicSurgery': 'Basic Surgery',
    'services.familyMedicine': 'Family Medicine',
    'services.diabetesCare': 'Diabetes Care',
    'services.hypertension': 'Hypertension',
    
    // Patient Dashboard
    'patient.dashboard': 'Patient Dashboard',
    'patient.welcome': 'Welcome, {{name}}',
    'patient.welcome.guest': 'Welcome to your health portal',
    'patient.quickActions': 'Quick Actions',
    'patient.viewAll': 'View All',
    'patient.recentActivities': 'Recent Activities',
    'patient.upcomingAppointments': 'Upcoming Appointments',
    'patient.bookAppointment': 'Book Appointment',
    'patient.healthRecords': 'Health Records',
    'patient.teleconsultation': 'Teleconsultation',
    'patient.prescriptions': 'Prescriptions',
    'patient.reminders': 'Reminders',
    'patient.labResults': 'Lab Results',
    'patient.vitals': 'Vitals',
    'patient.medicationReminders': 'Medication Reminders',
    'patient.healthTips': 'Health Tips',
    'patient.with': 'with',
    'patient.noAppointments': 'No upcoming appointments',
    'patient.viewAppointments': 'View All Appointments',
    'patient.healthSummary': 'Health Summary',
    'patient.viewProfile': 'View Profile',
    'patient.appointment': 'Appointment',
    'patient.scheduled': 'scheduled with',
    'patient.prescription': 'New prescription available',
    'patient.consultation': 'Teleconsultation completed',
    'patient.scanQR': 'Scan QR Code',
    'patient.scanQRDesc': 'to share your medical profile with healthcare providers',
    'patient.updateProfile': 'Update Profile',
    'patient.fullName': 'Full Name',
    'patient.age': 'Age',
    'patient.gender': 'Gender',
    'patient.address': 'Address',
    'patient.phone': 'Phone Number',
    'patient.save': 'Save Changes',
    'patient.male': 'Male',
    'patient.female': 'Female',
    'patient.other': 'Other',
    
    // Health metrics
    'health.bloodPressure': 'Blood Pressure',
    'health.heartRate': 'Heart Rate',
    'health.temperature': 'Temperature',
    'health.bmiStatus': 'BMI Status',
    'health.normal': 'Normal',
    
  // Dates / relative
  'date.tomorrow': 'Tomorrow',
  'month.march': 'March',
    
    // Medications
    'medicine.paracetamol': 'Paracetamol',
    'medicine.vitaminD': 'Vitamin D',
    'medicine.onceDaily': 'Once daily',
    'medicine.next': 'Next: {{time}}',
    
    // Health tips
    'tips.drinkWater': 'Drink at least 8 glasses of water daily',
    'tips.walk': 'Take a 30-minute walk after dinner',
    'tips.sleep': 'Get 7-8 hours of sleep for better health',
    
    // Time references
    'time.hoursAgo': '{{count}} hours ago',
    'time.daysAgo': '{{count}} day ago',
    'time.daysAgo_plural': '{{count}} days ago',
    
    // Activities
    'activity.appointmentScheduled': 'Appointment scheduled with {{doctor}}',
    
    // Appointment
    'appointment.dateTime': '{{date}} at {{time}}',
    'appointment.teleconsultation': 'Teleconsultation',
  'appointment.inPerson': 'In-person',

  // Doctor names
  'doctor.name.rajeshSharma': 'Dr. Rajesh Sharma',
  'doctor.name.priyaSingh': 'Dr. Priya Singh',
  'doctor.short.rajeshSharma': 'Dr. Sharma',
  'doctor.short.priyaSingh': 'Dr. Singh',
    
    // Doctor Dashboard
    'doctor.dashboard': 'Doctor Dashboard',
    'doctor.welcome': 'Welcome, Dr. {{name}}',
    'doctor.specialty': '- {{specialty}}',
    'doctor.todayAppointments': 'Today\'s Appointments',
    'doctor.totalPatients': 'Total Patients',
    'doctor.pendingReviews': 'Pending Reviews',
    'doctor.teleconsults': 'Teleconsults',
    'doctor.startTeleconsult': 'Start Teleconsult',
    'doctor.emergencyCall': 'Emergency Call',
  'doctor.todaysSchedule': "Today's Schedule",
  'doctor.viewCalendar': 'View Calendar',
    'doctor.goToDashboard': 'Go to Dashboard',
    'doctor.editProfile': 'Edit Profile',
    'doctor.recentPatients': 'Recent Patients',
    'doctor.upcomingAppointments': 'Upcoming Appointments',
    'doctor.viewAll': 'View All',
    'doctor.dailyActivity': 'Daily Activity',
    'doctor.patientInsights': 'Patient Insights',
    'doctor.noAppointments': 'No appointments to show',
    'doctor.appointment': 'Appointment with',
    'doctor.at': 'at',
    'doctor.accept': 'Accept',
    'doctor.reject': 'Reject',
  'doctor.start': 'Start',
  'doctor.unassigned': 'Unassigned',
    'doctor.confirmed': 'Confirmed',
    'doctor.rejected': 'Rejected',
    'doctor.requested': 'Requested',
    'doctor.appointmentType': 'Appointment Type',
    'doctor.lastVisit': 'Last Visit:',
    'doctor.condition': 'Condition:',
  'doctor.quickPatientActions': 'Quick Patient Actions',
  'doctor.writePrescription': 'Write Prescription',
  'doctor.viewVitals': 'View Vitals',
  'doctor.sendMessage': 'Send Message',
  'doctor.healthReports': 'Health Reports',
  'doctor.viewAllPatients': 'View All Patients',
  'doctor.pendingTasks': 'Pending Tasks',
  'doctor.labReportReviews': 'Lab Report Reviews',
  'doctor.prescriptionApprovals': 'Prescription Approvals',
  'doctor.followUpCalls': 'Follow-up Calls',
  'doctor.emergencyAlerts': 'Emergency Alerts',
  'doctor.highPriorityPatient': 'High Priority Patient',
  'doctor.attendNow': 'Attend Now',

  // Conditions & common
  'condition.hypertension': 'Hypertension',
  'condition.backPain': 'Back Pain',
  'condition.regularCheckup': 'Regular Checkup',
  'condition.chestPain': 'Chest Pain',
  // Relative weeks
  'time.weeksAgo': '{{count}} week ago',
  'time.weeksAgo_plural': '{{count}} weeks ago',
  // Person / patient names
  'person.name.priyaSingh': 'Priya Singh',
  'person.name.amitGupta': 'Amit Gupta',
  'person.name.sunitaKaur': 'Sunita Kaur',
  'person.name.rameshChandra': 'Ramesh Chandra',
  'common.loading': 'Loading...',
  'common.patient': 'Patient',
    
    // Volunteer Registration
    'volunteer.registration': 'Local Volunteer Registration',
    'volunteer.joinCommunity': 'Join our community of healthcare volunteers in Nabha, Punjab. Help us provide emergency assistance to those in need.',
    'volunteer.information': 'Volunteer Information',
    'volunteer.fullName': 'Full Name',
    'volunteer.enterFullName': 'Enter your full name',
    'volunteer.mobileNumber': 'Mobile Number',
    'volunteer.mobileHint': '10-digit mobile number',
    'volunteer.vehicleQuestion': 'Do you have a vehicle available for emergencies?',
    'volunteer.yesVehicle': 'Yes, I have a vehicle',
    'volunteer.noVehicle': 'No, I don\'t have a vehicle',
    'volunteer.registerButton': 'Register as Volunteer',
    'volunteer.emergencyResponse': 'Emergency Response',
    'volunteer.emergencyResponseDesc': 'Receive SMS alerts when someone nearby needs emergency assistance. Your quick response can save lives.',
    'volunteer.communityImpact': 'Community Impact',
    'volunteer.communityImpactDesc': 'Join a network of local volunteers working together to make healthcare accessible in rural areas.',
    'volunteer.incompleteForm': 'Incomplete Form',
    'volunteer.fillAllFields': 'Please fill in all required fields',
    'volunteer.invalidMobile': 'Invalid Mobile Number',
    'volunteer.validMobileNumber': 'Please enter a valid 10-digit mobile number',
    'volunteer.registrationSuccess': 'Registration Successful!',
    'volunteer.thankYou': 'Thank you {{name}}! You\'re now registered as a volunteer.',
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.patient': 'मरीज़',
    'nav.doctor': 'डॉक्टर',
    'nav.hospitals': 'अस्पताल',
    'nav.volunteer': 'स्वयंसेवक',
    'nav.emergency': 'आपातकाल',
    
    // Homepage
    'home.title': 'आरोग्य कनेक्ट',
    'home.subtitle': 'ग्रामीण स्वास्थ्य सेवा मंच',
    'home.description': 'नाभा, पंजाब के ग्रामीण समुदायों को गुणवत्तापूर्ण स्वास्थ्य सेवाओं से जोड़ना। प्रौद्योगिकी के माध्यम से मरीजों और चिकित्सा पेशेवरों के बीच अंतर को पाटना।',
    'home.getStarted': 'शुरू करें',
    'home.emergency': 'आपातकाल',
    'home.quickAccess': 'त्वरित पहुंच सेवाएं',
    'home.quickAccessDesc': 'आवश्यक स्वास्थ्य सेवाएं आपकी उंगलियों पर',
    'home.bookAppt': 'अपॉइंटमेंट बुक करें',
    'home.bookApptDesc': 'डॉक्टरों के साथ परामर्श निर्धारित करें',
    'home.healthRecords': 'स्वास्थ्य रिकॉर्ड',
    'home.healthRecordsDesc': 'अपना चिकित्सा इतिहास देखें',
    'home.teleconsult': 'टेली-परामर्श',
    'home.teleconsultDesc': 'डॉक्टरों से ऑनलाइन जुड़ें',
    'home.findHospitals': 'अस्पताल खोजें',
    'home.findHospitalsDesc': 'पास की स्वास्थ्य सुविधाओं का पता लगाएं',
    'home.excellence': 'स्वास्थ्य सेवा उत्कृष्टता',
    'home.excellenceDesc': 'ग्रामीण समुदायों के लिए व्यापक चिकित्सा सेवाएं',
    'home.patientCare': 'मरीज़ देखभाल',
    'home.patientCareDesc': 'व्यापक चिकित्सा सेवाएं',
    'home.expertDoctors': 'विशेषज्ञ डॉक्टर',
    'home.expertDoctorsDesc': 'योग्य स्वास्थ्य पेशेवर',
    'home.medicineDelivery': 'दवा डिलीवरी',
    'home.medicineDeliveryDesc': 'दरवाजे पर नुस्खा डिलीवरी',
    'home.healthMonitoring': 'स्वास्थ्य निगरानी',
    'home.healthMonitoringDesc': 'नियमित स्वास्थ्य जांच',
    'home.joinRevolution': 'स्वास्थ्य क्रांति में शामिल हों',
    'home.joinDesc': 'ग्रामीण समुदायों के लिए आधुनिक स्वास्थ्य सेवाओं का अनुभव करें। गुणवत्तापूर्ण देखभाल, आपके दरवाजे पर।',
    'home.startPatient': 'मरीज़ के रूप में शुरू करें',
    'home.providerLogin': 'स्वास्थ्य प्रदाता लॉगिन',
    
    // Emergency
    'emergency.services': 'आपातकालीन सेवाएं',
    'emergency.location': 'वर्तमान स्थान',
    'emergency.quickDial': 'त्वरित डायल',
    'emergency.firstAid': 'प्राथमिक चिकित्सा अनुस्मारक:',
    'emergency.firstAidText': 'मरीज़ को शांत रखें, सांस की जांच करें, तुरंत मदद के लिए कॉल करें।',
    'emergency.callInitiated': 'आपातकालीन कॉल शुरू',
    'emergency.calling': 'कॉल कर रहे हैं',
    
    // Common
    'common.ambulance': 'एम्बुलेंस',
    'common.police': 'पुलिस',
    'common.fire': 'दमकल',
    'common.hospital': 'नाभा सिविल अस्पताल',
    
    // Hospital Locator
    'hospitals.findNearby': 'आस-पास के अस्पताल खोजें',
    'hospitals.locateHealthcare': 'नाभा, पंजाब में स्वास्थ्य सुविधाएं खोजें',
    'hospitals.nabhaCivil': 'नाभा सिविल हॉस्पिटल',
    'hospitals.maxSuperSpeciality': 'मैक्स सुपर स्पेशलिटी हॉस्पिटल',
    'hospitals.gurudwaraSahib': 'गुरुद्वारा साहिब डिस्पेंसरी',
    'hospitals.drSharmaClinic': 'डॉ. शर्मा क्लिनिक',
    'hospitals.searchPlaceholder': 'अस्पताल, डॉक्टर, या सेवाएं खोजें...',
    'hospitals.filters': 'फिल्टर',
    'hospitals.allHospitals': 'सभी अस्पताल',
    'hospitals.government': 'सरकारी',
    'hospitals.private': 'निजी',
    'hospitals.charitable': 'चैरिटेबल',
    'hospitals.clinics': 'क्लिनिक',
    'hospitals.mapView': 'मानचित्र दृश्य',
    'hospitals.showingFacilities': 'नाभा में {{count}} सुविधाएं दिखा रहा है',
    'hospitals.selected': 'चयनित',
    'hospitals.dataSource': 'डेटा स्रोत: OpenStreetMap · विवरण देखने के लिए मार्कर पर क्लिक करें।',
    'hospitals.healthcareFacilities': 'स्वास्थ्य सुविधाएं ({{count}})',
    'hospitals.services': 'सेवाएं',
    'hospitals.directions': 'दिशा-निर्देश',
    'hospitals.call': 'कॉल करें',
    'hospitals.emergencyAssistance': 'तत्काल चिकित्सा सहायता के लिए, इन आपातकालीन नंबरों पर कॉल करें:',
    'hospitals.ambulance': 'एम्बुलेंस',
    'hospitals.civilHospitalEmergency': 'सिविल अस्पताल आपातकाल',
  'hospital.timing.24x7': '24/7',
  'hospital.timing.daylong': 'सुबह 6:00 - रात 10:00',
  'hospital.timing.standardClinic': 'सुबह 9:00 - रात 8:00',
  'address.civilLinesNabha': 'सिविल लाइन्स, नाभा, पंजाब 147201',
  'address.gtRoadNabha': 'जीटी रोड, नाभा, पंजाब 147201',
  'address.gurBazaarNabha': 'गुर बाज़ार, नाभा, पंजाब 147201',
  'address.modelTownNabha': 'मॉडल टाउन, नाभा, पंजाब 147201',
    
    // Medical Services
    'services.emergency': 'आपातकालीन',
    'services.generalMedicine': 'सामान्य चिकित्सा',
    'services.surgery': 'शल्य चिकित्सा',
    'services.pediatrics': 'बाल रोग',
    'services.cardiology': 'हृदय रोग',
    'services.neurology': 'तंत्रिका विज्ञान',
    'services.oncology': 'कैंसर विज्ञान',
    'services.icu': 'आईसीयू',
    'services.freeMedicines': 'मुफ्त दवाएं',
    'services.basicSurgery': 'मूल शल्य चिकित्सा',
    'services.familyMedicine': 'परिवार चिकित्सा',
    'services.diabetesCare': 'मधुमेह देखभाल',
    'services.hypertension': 'उच्च रक्तचाप',
    
    // Patient Dashboard
    'patient.dashboard': 'रोगी डैशबोर्ड',
    'patient.welcome': 'स्वागत है, {{name}}',
    'patient.welcome.guest': 'आपके स्वास्थ्य पोर्टल में स्वागत है',
    'patient.quickActions': 'त्वरित कार्रवाइयां',
    'patient.viewAll': 'सभी देखें',
    'patient.recentActivities': 'हाल की गतिविधियां',
    'patient.upcomingAppointments': 'आगामी अपॉइंटमेंट',
    'patient.bookAppointment': 'अपॉइंटमेंट बुक करें',
    'patient.healthRecords': 'स्वास्थ्य रिकॉर्ड',
    'patient.teleconsultation': 'टेली-परामर्श',
    'patient.prescriptions': 'दवाइयाँ',
    'patient.reminders': 'रिमाइंडर्स',
    'patient.labResults': 'लैब परिणाम',
    'patient.vitals': 'वाइटल्स',
    'patient.with': 'के साथ',
    'patient.noAppointments': 'कोई आगामी अपॉइंटमेंट नहीं',
    'patient.viewAppointments': 'सभी अपॉइंटमेंट देखें',
    'patient.healthSummary': 'स्वास्थ्य सारांश',
    'patient.viewProfile': 'प्रोफाइल देखें',
    'patient.appointment': 'अपॉइंटमेंट',
    'patient.scheduled': 'के साथ निर्धारित',
    'patient.prescription': 'नई दवाई उपलब्ध है',
    'patient.consultation': 'टेली-परामर्श पूरा हुआ',
    'patient.scanQR': 'QR कोड स्कैन करें',
    'patient.scanQRDesc': 'स्वास्थ्य सेवा प्रदाताओं के साथ अपनी मेडिकल प्रोफाइल साझा करने के लिए',
    'patient.updateProfile': 'प्रोफाइल अपडेट करें',
    'patient.fullName': 'पूरा नाम',
    'patient.age': 'उम्र',
    'patient.gender': 'लिंग',
    'patient.address': 'पता',
    'patient.phone': 'फोन नंबर',
    'patient.save': 'परिवर्तन सहेजें',
    'patient.male': 'पुरुष',
    'patient.female': 'महिला',
    'patient.other': 'अन्य',
    'patient.medicationReminders': 'दवा रिमाइंडर',
    'patient.healthTips': 'स्वास्थ्य सुझाव',
    
    // Health metrics
    'health.bloodPressure': 'रक्तचाप',
    'health.heartRate': 'हृदय गति',
    'health.temperature': 'तापमान',
    'health.bmiStatus': 'बीएमआई स्थिति',
    'health.normal': 'सामान्य',
    
  // Dates / relative
  'date.tomorrow': 'कल',
  'month.march': 'मार्च',
    
    // Medications
    'medicine.paracetamol': 'पैरासिटामोल',
    'medicine.vitaminD': 'विटामिन डी',
    'medicine.onceDaily': 'दिन में एक बार',
    'medicine.next': 'अगला: {{time}}',
    
    // Health tips
    'tips.drinkWater': 'रोजाना कम से कम 8 गिलास पानी पिएं',
    'tips.walk': 'रात के खाने के बाद 30 मिनट की सैर करें',
    'tips.sleep': 'बेहतर स्वास्थ्य के लिए 7-8 घंटे की नींद लें',
    
    // Time references
    'time.hoursAgo': '{{count}} घंटे पहले',
    'time.daysAgo': '{{count}} दिन पहले',
    'time.daysAgo_plural': '{{count}} दिन पहले',
    
    // Activities
    'activity.appointmentScheduled': '{{doctor}} के साथ अपॉइंटमेंट निर्धारित',
    
    // Appointment
    'appointment.dateTime': '{{date}} को {{time}}',
    'appointment.teleconsultation': 'टेलीकंसल्टेशन',
  'appointment.inPerson': 'क्लिनिक विज़िट',

  // Doctor names
  'doctor.name.rajeshSharma': 'डॉ. राजेश शर्मा',
  'doctor.name.priyaSingh': 'डॉ. प्रिया सिंह',
  'doctor.short.rajeshSharma': 'डॉ. शर्मा',
  'doctor.short.priyaSingh': 'डॉ. सिंह',
    
    // Doctor Dashboard
    'doctor.dashboard': 'डॉक्टर डैशबोर्ड',
    'doctor.welcome': 'स्वागत है, डॉ. {{name}}',
    'doctor.specialty': '- {{specialty}}',
    'doctor.todayAppointments': 'आज के अपॉइंटमेंट',
    'doctor.totalPatients': 'कुल मरीज़',
    'doctor.pendingReviews': 'लंबित समीक्षाएँ',
    'doctor.teleconsults': 'टेली-परामर्श',
    'doctor.startTeleconsult': 'टेली-परामर्श शुरू करें',
    'doctor.emergencyCall': 'आपातकालीन कॉल',
  'doctor.todaysSchedule': 'आज का शेड्यूल',
  'doctor.viewCalendar': 'कैलेंडर देखें',
    'doctor.goToDashboard': 'डैशबोर्ड पर जाएं',
    'doctor.editProfile': 'प्रोफाइल संपादित करें',
    'doctor.recentPatients': 'हाल के मरीज़',
    'doctor.upcomingAppointments': 'आगामी अपॉइंटमेंट',
    'doctor.viewAll': 'सभी देखें',
    'doctor.dailyActivity': 'दैनिक गतिविधि',
    'doctor.patientInsights': 'मरीज़ अंतर्दृष्टि',
    'doctor.noAppointments': 'दिखाने के लिए कोई अपॉइंटमेंट नहीं',
    'doctor.appointment': 'अपॉइंटमेंट',
    'doctor.at': 'समय',
    'doctor.accept': 'स्वीकार करें',
    'doctor.reject': 'अस्वीकार करें',
  'doctor.start': 'प्रारंभ',
  'doctor.unassigned': 'असाइन नहीं',
    'doctor.confirmed': 'पुष्टि की गई',
    'doctor.rejected': 'अस्वीकृत',
    'doctor.requested': 'अनुरोध किया गया',
    'doctor.appointmentType': 'अपॉइंटमेंट प्रकार',
    'doctor.lastVisit': 'पिछला दौरा:',
    'doctor.condition': 'स्थिति:',
  'doctor.quickPatientActions': 'त्वरित मरीज़ क्रियाएं',
  'doctor.writePrescription': 'नुस्खा लिखें',
  'doctor.viewVitals': 'वाइटल्स देखें',
  'doctor.sendMessage': 'संदेश भेजें',
  'doctor.healthReports': 'स्वास्थ्य रिपोर्ट',
  'doctor.viewAllPatients': 'सभी मरीज़ देखें',
  'doctor.pendingTasks': 'लंबित कार्य',
  'doctor.labReportReviews': 'लैब रिपोर्ट समीक्षा',
  'doctor.prescriptionApprovals': 'नुस्खा अनुमोदन',
  'doctor.followUpCalls': 'फॉलो-अप कॉल',
  'doctor.emergencyAlerts': 'आपातकालीन अलर्ट',
  'doctor.highPriorityPatient': 'उच्च प्राथमिकता मरीज़',
  'doctor.attendNow': 'अभी जाएं',

  // Conditions & common
  'condition.hypertension': 'हाइपरटेंशन',
  'condition.backPain': 'पीठ दर्द',
  'condition.regularCheckup': 'नियमित जांच',
  'condition.chestPain': 'सीने में दर्द',
  'time.weeksAgo': '{{count}} सप्ताह पहले',
  'time.weeksAgo_plural': '{{count}} सप्ताह पहले',
  // Person / patient names
  'person.name.priyaSingh': 'प्रिया सिंह',
  'person.name.amitGupta': 'अमित गुप्ता',
  'person.name.sunitaKaur': 'सुनीता कौर',
  'person.name.rameshChandra': 'रमेश चन्द्र',
  'common.loading': 'लोड हो रहा है...',
  'common.patient': 'मरीज़',
    
    // Volunteer Registration
    'volunteer.registration': 'स्थानीय स्वयंसेवक पंजीकरण',
    'volunteer.joinCommunity': 'नाभा, पंजाब में स्वास्थ्य सेवा स्वयंसेवकों के समुदाय में शामिल हों। जरूरतमंदों को आपातकालीन सहायता प्रदान करने में हमारी मदद करें।',
    'volunteer.information': 'स्वयंसेवक जानकारी',
    'volunteer.fullName': 'पूरा नाम',
    'volunteer.enterFullName': 'अपना पूरा नाम दर्ज करें',
    'volunteer.mobileNumber': 'मोबाइल नंबर',
    'volunteer.mobileHint': '10-अंकों का मोबाइल नंबर',
    'volunteer.vehicleQuestion': 'क्या आपके पास आपातकाल के लिए वाहन उपलब्ध है?',
    'volunteer.yesVehicle': 'हां, मेरे पास वाहन है',
    'volunteer.noVehicle': 'नहीं, मेरे पास वाहन नहीं है',
    'volunteer.registerButton': 'स्वयंसेवक के रूप में पंजीकरण करें',
    'volunteer.emergencyResponse': 'आपातकालीन प्रतिक्रिया',
    'volunteer.emergencyResponseDesc': 'जब आस-पास किसी को आपातकालीन सहायता की आवश्यकता होती है तो एसएमएस अलर्ट प्राप्त करें। आपकी त्वरित प्रतिक्रिया जीवन बचा सकती है।',
    'volunteer.communityImpact': 'सामुदायिक प्रभाव',
    'volunteer.communityImpactDesc': 'ग्रामीण क्षेत्रों में स्वास्थ्य सेवा को सुलभ बनाने के लिए एक साथ काम करने वाले स्थानीय स्वयंसेवकों के नेटवर्क में शामिल हों।',
    'volunteer.incompleteForm': 'अधूरा फॉर्म',
    'volunteer.fillAllFields': 'कृपया सभी आवश्यक फ़ील्ड भरें',
    'volunteer.invalidMobile': 'अमान्य मोबाइल नंबर',
    'volunteer.validMobileNumber': 'कृपया एक वैध 10-अंक का मोबाइल नंबर दर्ज करें',
    'volunteer.registrationSuccess': 'पंजीकरण सफल!',
    'volunteer.thankYou': 'धन्यवाद {{name}}! आप अब एक स्वयंसेवक के रूप में पंजीकृत हैं।',
  },
  pa: {
    // Navigation
    'nav.home': 'ਘਰ',
    'nav.patient': 'ਮਰੀਜ਼',
    'nav.doctor': 'ਡਾਕਟਰ',
    'nav.hospitals': 'ਹਸਪਤਾਲ',
    'nav.volunteer': 'ਸਵੈਸੇਵਕ',
    'nav.emergency': 'ਐਮਰਜੈਂਸੀ',
    
    // Homepage
    'home.title': 'ਆਰੋਗਿਆ ਕਨੈਕਟ',
    'home.subtitle': 'ਪਿੰਡੂ ਸਿਹਤ ਸੇਵਾ ਪਲੇਟਫਾਰਮ',
    'home.description': 'ਨਾਭਾ, ਪੰਜਾਬ ਦੇ ਪਿੰਡੂ ਕਮਿਊਨਿਟੀਆਂ ਨੂੰ ਗੁਣਵੱਤਾ ਸਿਹਤ ਸੇਵਾਵਾਂ ਨਾਲ ਜੋੜਨਾ। ਤਕਨੀਕ ਰਾਹੀਂ ਮਰੀਜ਼ਾਂ ਅਤੇ ਮੈਡੀਕਲ ਪੇਸ਼ੇਵਰਾਂ ਵਿੱਚ ਪੁਲ ਬਣਾਉਣਾ।',
    'home.getStarted': 'ਸ਼ੁਰੂ ਕਰੋ',
    'home.emergency': 'ਐਮਰਜੈਂਸੀ',
    'home.quickAccess': 'ਤੇਜ਼ ਪਹੁੰਚ ਸੇਵਾਵਾਂ',
    'home.quickAccessDesc': 'ਜ਼ਰੂਰੀ ਸਿਹਤ ਸੇਵਾਵਾਂ ਤੁਹਾਡੀ ਉਂਗਲੀਆਂ ਉੱਤੇ',
    'home.bookAppt': 'ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰੋ',
    'home.bookApptDesc': 'ਡਾਕਟਰਾਂ ਨਾਲ ਸਲਾਹ ਤੈਅ ਕਰੋ',
    'home.healthRecords': 'ਸਿਹਤ ਰਿਕਾਰਡ',
    'home.healthRecordsDesc': 'ਆਪਣਾ ਮੈਡੀਕਲ ਇਤਿਹਾਸ ਦੇਖੋ',
    'home.teleconsult': 'ਟੈਲੀ-ਸਲਾਹ',
    'home.teleconsultDesc': 'ਡਾਕਟਰਾਂ ਨਾਲ ਔਨਲਾਈਨ ਜੁੜੋ',
    'home.findHospitals': 'ਹਸਪਤਾਲ ਲੱਭੋ',
    'home.findHospitalsDesc': 'ਨੇੜਲੀਆਂ ਸਿਹਤ ਸਹੂਲਤਾਂ ਲੱਭੋ',
    'home.excellence': 'ਸਿਹਤ ਸੇਵਾ ਉੱਤਮਤਾ',
    'home.excellenceDesc': 'ਪਿੰਡੂ ਕਮਿਊਨਿਟੀਆਂ ਲਈ ਵਿਆਪਕ ਮੈਡੀਕਲ ਸੇਵਾਵਾਂ',
    'home.patientCare': 'ਮਰੀਜ਼ ਦੇਖਭਾਲ',
    'home.patientCareDesc': 'ਵਿਆਪਕ ਮੈਡੀਕਲ ਸੇਵਾਵਾਂ',
    'home.expertDoctors': 'ਮਾਹਰ ਡਾਕਟਰ',
    'home.expertDoctorsDesc': 'ਯੋਗ ਸਿਹਤ ਪੇਸ਼ੇਵਰ',
    'home.medicineDelivery': 'ਦਵਾਈ ਡਿਲੀਵਰੀ',
    'home.medicineDeliveryDesc': 'ਘਰ ਤੱਕ ਨੁਸਖਾ ਡਿਲੀਵਰੀ',
    'home.healthMonitoring': 'ਸਿਹਤ ਨਿਗਰਾਨੀ',
    'home.healthMonitoringDesc': 'ਨਿਯਮਿਤ ਸਿਹਤ ਜਾਂਚ',
    'home.joinRevolution': 'ਸਿਹਤ ਕ੍ਰਾਂਤੀ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ',
    'home.joinDesc': 'ਪਿੰਡੂ ਕਮਿਊਨਿਟੀਆਂ ਲਈ ਆਧੁਨਿਕ ਸਿਹਤ ਸੇਵਾਵਾਂ ਦਾ ਅਨੁਭਵ ਕਰੋ। ਗੁਣਵੱਤਾ ਦੇਖਭਾਲ, ਤੁਹਾਡੇ ਦਰਵਾਜ਼ੇ ਤੇ।',
    'home.startPatient': 'ਮਰੀਜ਼ ਵਜੋਂ ਸ਼ੁਰੂ ਕਰੋ',
    'home.providerLogin': 'ਸਿਹਤ ਪ੍ਰਦਾਤਾ ਲਾਗਇਨ',
    
    // Emergency
    'emergency.services': 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ',
    'emergency.location': 'ਮੌਜੂਦਾ ਸਥਾਨ',
    'emergency.quickDial': 'ਤੇਜ਼ ਡਾਇਲ',
    'emergency.firstAid': 'ਪਹਿਲੀ ਸਹਾਇਤਾ ਯਾਦਦਾਸ਼ਤ:',
    'emergency.firstAidText': 'ਮਰੀਜ਼ ਨੂੰ ਸ਼ਾਂਤ ਰੱਖੋ, ਸਾਹ ਦੀ ਜਾਂਚ ਕਰੋ, ਤੁਰੰਤ ਮਦਦ ਲਈ ਕਾਲ ਕਰੋ।',
    'emergency.callInitiated': 'ਐਮਰਜੈਂਸੀ ਕਾਲ ਸ਼ੁਰੂ',
    'emergency.calling': 'ਕਾਲ ਕਰ ਰਹੇ ਹਾਂ',
    
    // Common
    'common.ambulance': 'ਐਂਬੂਲੈਂਸ',
    'common.police': 'ਪੁਲਿਸ',
    'common.fire': 'ਫਾਇਰ ਬ੍ਰਿਗੇਡ',
    'common.hospital': 'ਨਾਭਾ ਸਿਵਲ ਹਸਪਤਾਲ',
    
    // Hospital Locator
    'hospitals.findNearby': 'ਨੇੜਲੇ ਹਸਪਤਾਲ ਲੱਭੋ',
    'hospitals.locateHealthcare': 'ਨਾਭਾ, ਪੰਜਾਬ ਵਿੱਚ ਸਿਹਤ ਸੰਭਾਲ ਸਹੂਲਤਾਂ ਲੱਭੋ',
    'hospitals.nabhaCivil': 'ਨਾਭਾ ਸਿਵਲ ਹਸਪਤਾਲ',
    'hospitals.maxSuperSpeciality': 'ਮੈਕਸ ਸੁਪਰ ਸਪੈਸ਼ਲਟੀ ਹਸਪਤਾਲ',
    'hospitals.gurudwaraSahib': 'ਗੁਰਦੁਆਰਾ ਸਾਹਿਬ ਡਿਸਪੈਂਸਰੀ',
    'hospitals.drSharmaClinic': 'ਡਾ. ਸ਼ਰਮਾ ਕਲੀਨਿਕ',
    'hospitals.searchPlaceholder': 'ਹਸਪਤਾਲ, ਡਾਕਟਰ, ਜਾਂ ਸੇਵਾਵਾਂ ਖੋਜੋ...',
    'hospitals.filters': 'ਫਿਲਟਰ',
    'hospitals.allHospitals': 'ਸਾਰੇ ਹਸਪਤਾਲ',
    'hospitals.government': 'ਸਰਕਾਰੀ',
    'hospitals.private': 'ਨਿੱਜੀ',
    'hospitals.charitable': 'ਦਾਨੀ',
    'hospitals.clinics': 'ਕਲੀਨਿਕ',
    'hospitals.mapView': 'ਨਕਸ਼ਾ ਦ੍ਰਿਸ਼',
    'hospitals.showingFacilities': 'ਨਾਭਾ ਵਿੱਚ {{count}} ਸਹੂਲਤਾਂ ਦਿਖਾ ਰਿਹਾ ਹੈ',
    'hospitals.selected': 'ਚੁਣਿਆ ਗਿਆ',
    'hospitals.dataSource': 'ਡਾਟਾ ਸਰੋਤ: OpenStreetMap · ਵੇਰਵੇ ਵੇਖਣ ਲਈ ਮਾਰਕਰ ਤੇ ਕਲਿੱਕ ਕਰੋ।',
    'hospitals.healthcareFacilities': 'ਸਿਹਤ ਸੰਭਾਲ ਸਹੂਲਤਾਂ ({{count}})',
    'hospitals.services': 'ਸੇਵਾਵਾਂ',
    'hospitals.directions': 'ਦਿਸ਼ਾਵਾਂ',
    'hospitals.call': 'ਕਾਲ ਕਰੋ',
    'hospitals.emergencyAssistance': 'ਤੁਰੰਤ ਮੈਡੀਕਲ ਸਹਾਇਤਾ ਲਈ, ਇਹਨਾਂ ਐਮਰਜੈਂਸੀ ਨੰਬਰਾਂ ਤੇ ਕਾਲ ਕਰੋ:',
    'hospitals.ambulance': 'ਐਂਬੂਲੈਂਸ',
    'hospitals.civilHospitalEmergency': 'ਸਿਵਲ ਹਸਪਤਾਲ ਐਮਰਜੈਂਸੀ',
  'hospital.timing.24x7': '24/7',
  'hospital.timing.daylong': 'ਸਵੇਰੇ 6:00 - ਰਾਤ 10:00',
  'hospital.timing.standardClinic': 'ਸਵੇਰੇ 9:00 - ਰਾਤ 8:00',
  'address.civilLinesNabha': 'ਸਿਵਲ ਲਾਈਨਜ਼, ਨਾਭਾ, ਪੰਜਾਬ 147201',
  'address.gtRoadNabha': 'ਜੀਟੀ ਰੋਡ, ਨਾਭਾ, ਪੰਜਾਬ 147201',
  'address.gurBazaarNabha': 'ਗੁਰ ਬਾਜ਼ਾਰ, ਨਾਭਾ, ਪੰਜਾਬ 147201',
  'address.modelTownNabha': 'ਮਾਡਲ ਟਾਊਨ, ਨਾਭਾ, ਪੰਜਾਬ 147201',
    
    // Medical Services
    'services.emergency': 'ਐਮਰਜੈਂਸੀ',
    'services.generalMedicine': 'ਆਮ ਦਵਾਈ',
    'services.surgery': 'ਸਰਜਰੀ',
    'services.pediatrics': 'ਬਾਲ ਰੋਗ',
    'services.cardiology': 'ਦਿਲ ਦੇ ਰੋਗ',
    'services.neurology': 'ਨਿਊਰੋਲੋਜੀ',
    'services.oncology': 'ਕੈਂਸਰ ਵਿਗਿਆਨ',
    'services.icu': 'ਆਈਸੀਯੂ',
    'services.freeMedicines': 'ਮੁਫਤ ਦਵਾਈਆਂ',
    'services.basicSurgery': 'ਮੁੱਢਲੀ ਸਰਜਰੀ',
    'services.familyMedicine': 'ਪਰਿਵਾਰਕ ਦਵਾਈ',
    'services.diabetesCare': 'ਸ਼ੂਗਰ ਦੀ ਦੇਖਭਾਲ',
    'services.hypertension': 'ਹਾਈ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ',
    
    // Patient Dashboard
    'patient.dashboard': 'ਮਰੀਜ਼ ਡੈਸ਼ਬੋਰਡ',
    'patient.welcome': 'ਜੀ ਆਇਆਂ ਨੂੰ, {{name}}',
    'patient.welcome.guest': 'ਤੁਹਾਡੇ ਸਿਹਤ ਪੋਰਟਲ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ',
    'patient.quickActions': 'ਤੇਜ਼ ਕਾਰਵਾਈਆਂ',
    'patient.viewAll': 'ਸਾਰੇ ਵੇਖੋ',
    'patient.recentActivities': 'ਹਾਲੀਆ ਗਤੀਵਿਧੀਆਂ',
    'patient.upcomingAppointments': 'ਆਉਣ ਵਾਲੀਆਂ ਮੁਲਾਕਾਤਾਂ',
    'patient.bookAppointment': 'ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰੋ',
    'patient.healthRecords': 'ਸਿਹਤ ਰਿਕਾਰਡ',
    'patient.teleconsultation': 'ਟੈਲੀ-ਸਲਾਹ',
    'patient.prescriptions': 'ਨੁਸਖੇ',
    'patient.reminders': 'ਰਿਮਾਈਂਡਰ',
    'patient.labResults': 'ਲੈਬ ਨਤੀਜੇ',
    'patient.vitals': 'ਵਾਈਟਲਜ਼',
    'patient.with': 'ਨਾਲ',
    'patient.noAppointments': 'ਕੋਈ ਆਉਣ ਵਾਲੀ ਮੁਲਾਕਾਤ ਨਹੀਂ',
    'patient.viewAppointments': 'ਸਾਰੀਆਂ ਮੁਲਾਕਾਤਾਂ ਵੇਖੋ',
    'patient.healthSummary': 'ਸਿਹਤ ਸੰਖੇਪ',
    'patient.viewProfile': 'ਪ੍ਰੋਫਾਈਲ ਵੇਖੋ',
    'patient.appointment': 'ਮੁਲਾਕਾਤ',
    'patient.scheduled': 'ਨਾਲ ਨਿਰਧਾਰਤ',
    'patient.prescription': 'ਨਵਾਂ ਨੁਸਖਾ ਉਪਲਬਧ ਹੈ',
    'patient.consultation': 'ਟੈਲੀ-ਸਲਾਹ ਪੂਰੀ ਹੋਈ',
    'patient.scanQR': 'QR ਕੋਡ ਸਕੈਨ ਕਰੋ',
    'patient.scanQRDesc': 'ਸਿਹਤ ਸੰਭਾਲ ਪ੍ਰਦਾਤਾਵਾਂ ਨਾਲ ਆਪਣੀ ਮੈਡੀਕਲ ਪ੍ਰੋਫਾਈਲ ਸਾਂਝੀ ਕਰਨ ਲਈ',
    'patient.updateProfile': 'ਪ੍ਰੋਫਾਈਲ ਅੱਪਡੇਟ ਕਰੋ',
    'patient.fullName': 'ਪੂਰਾ ਨਾਮ',
    'patient.age': 'ਉਮਰ',
    'patient.gender': 'ਲਿੰਗ',
    'patient.address': 'ਪਤਾ',
    'patient.phone': 'ਫੋਨ ਨੰਬਰ',
    'patient.save': 'ਬਦਲਾਅ ਸੰਭਾਲੋ',
    'patient.male': 'ਪੁਰਸ਼',
    'patient.female': 'ਔਰਤ',
    'patient.other': 'ਹੋਰ',
    'patient.medicationReminders': 'ਦਵਾਈ ਰਿਮਾਈਂਡਰ',
    'patient.healthTips': 'ਸਿਹਤ ਸੁਝਾਅ',
    
    // Health metrics
    'health.bloodPressure': 'ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ',
    'health.heartRate': 'ਦਿਲ ਦੀ ਧੜਕਣ',
    'health.temperature': 'ਤਾਪਮਾਨ',
    'health.bmiStatus': 'ਬੀਐਮਆਈ ਸਥਿਤੀ',
    'health.normal': 'ਸਧਾਰਨ',
    
  // Dates / relative
  'date.tomorrow': 'ਕੱਲ੍ਹ',
  'month.march': 'ਮਾਰਚ',
    
    // Medications
    'medicine.paracetamol': 'ਪੈਰਾਸੀਟਾਮੋਲ',
    'medicine.vitaminD': 'ਵਿਟਾਮਿਨ ਡੀ',
    'medicine.onceDaily': 'ਦਿਨ ਵਿੱਚ ਇੱਕ ਵਾਰ',
    'medicine.next': 'ਅਗਲੀ: {{time}}',
    
    // Health tips
    'tips.drinkWater': 'ਰੋਜ਼ਾਨਾ ਘੱਟੋ-ਘੱਟ 8 ਗਲਾਸ ਪਾਣੀ ਪੀਓ',
    'tips.walk': 'ਰਾਤ ਦੇ ਖਾਣੇ ਤੋਂ ਬਾਅਦ 30 ਮਿੰਟ ਦੀ ਸੈਰ ਕਰੋ',
    'tips.sleep': 'ਬਿਹਤਰ ਸਿਹਤ ਲਈ 7-8 ਘੰਟੇ ਦੀ ਨੀਂਦ ਲਓ',
    
    // Time references
    'time.hoursAgo': '{{count}} ਘੰਟੇ ਪਹਿਲਾਂ',
    'time.daysAgo': '{{count}} ਦਿਨ ਪਹਿਲਾਂ',
    'time.daysAgo_plural': '{{count}} ਦਿਨ ਪਹਿਲਾਂ',
    
    // Activities
    'activity.appointmentScheduled': '{{doctor}} ਨਾਲ ਮੁਲਾਕਾਤ ਨਿਰਧਾਰਤ',
    
    // Appointment
    'appointment.dateTime': '{{date}} ਨੂੰ {{time}}',
    'appointment.teleconsultation': 'ਟੈਲੀਕੰਸਲਟੇਸ਼ਨ',
  'appointment.inPerson': 'ਕਲੀਨਿਕ ਵਿਜ਼ਟ',

  // Doctor names
  'doctor.name.rajeshSharma': 'ਡਾ. ਰਾਜੇਸ਼ ਸ਼ਰਮਾ',
  'doctor.name.priyaSingh': 'ਡਾ. ਪ੍ਰੀਆ ਸਿੰਘ',
  'doctor.short.rajeshSharma': 'ਡਾ. ਸ਼ਰਮਾ',
  'doctor.short.priyaSingh': 'ਡਾ. ਸਿੰਘ',
    
    // Doctor Dashboard
    'doctor.dashboard': 'ਡਾਕਟਰ ਡੈਸ਼ਬੋਰਡ',
    'doctor.welcome': 'ਜੀ ਆਇਆਂ ਨੂੰ, ਡਾ. {{name}}',
    'doctor.specialty': '- {{specialty}}',
    'doctor.todayAppointments': 'ਅੱਜ ਦੀਆਂ ਮੁਲਾਕਾਤਾਂ',
    'doctor.totalPatients': 'ਕੁੱਲ ਮਰੀਜ਼',
    'doctor.pendingReviews': 'ਬਕਾਇਆ ਸਮੀਖਿਆਵਾਂ',
    'doctor.teleconsults': 'ਟੈਲੀ-ਸਲਾਹ',
    'doctor.startTeleconsult': 'ਟੈਲੀ-ਸਲਾਹ ਸ਼ੁਰੂ ਕਰੋ',
    'doctor.emergencyCall': 'ਐਮਰਜੈਂਸੀ ਕਾਲ',
  'doctor.todaysSchedule': 'ਅੱਜ ਦਾ ਸ਼ਡਿਊਲ',
  'doctor.viewCalendar': 'ਕੈਲੰਡਰ ਵੇਖੋ',
    'doctor.goToDashboard': 'ਡੈਸ਼ਬੋਰਡ ਤੇ ਜਾਓ',
    'doctor.editProfile': 'ਪ੍ਰੋਫਾਈਲ ਸੰਪਾਦਿਤ ਕਰੋ',
    'doctor.recentPatients': 'ਹਾਲੀਆ ਮਰੀਜ਼',
    'doctor.upcomingAppointments': 'ਆਉਣ ਵਾਲੀਆਂ ਮੁਲਾਕਾਤਾਂ',
    'doctor.viewAll': 'ਸਾਰੇ ਵੇਖੋ',
    'doctor.dailyActivity': 'ਰੋਜ਼ਾਨਾ ਗਤੀਵਿਧੀ',
    'doctor.patientInsights': 'ਮਰੀਜ਼ ਅੰਤਰਦ੍ਰਿਸ਼ਟੀ',
    'doctor.noAppointments': 'ਦਿਖਾਉਣ ਲਈ ਕੋਈ ਮੁਲਾਕਾਤਾਂ ਨਹੀਂ',
    'doctor.appointment': 'ਮੁਲਾਕਾਤ',
    'doctor.at': 'ਸਮੇਂ',
    'doctor.accept': 'ਸਵੀਕਾਰ ਕਰੋ',
    'doctor.reject': 'ਰੱਦ ਕਰੋ',
  'doctor.start': 'ਸ਼ੁਰੂ ਕਰੋ',
  'doctor.unassigned': 'ਅਸਾਈਨ ਨਹੀਂ',
    'doctor.confirmed': 'ਪੁਸ਼ਟੀ ਕੀਤੀ',
    'doctor.rejected': 'ਰੱਦ ਕੀਤੀ',
    'doctor.requested': 'ਬੇਨਤੀ ਕੀਤੀ',
    'doctor.appointmentType': 'ਮੁਲਾਕਾਤ ਦੀ ਕਿਸਮ',
    'doctor.lastVisit': 'ਆਖਰੀ ਵਿਜ਼ਟ:',
    'doctor.condition': 'ਹਾਲਤ:',
  'doctor.quickPatientActions': 'ਤੇਜ਼ ਮਰੀਜ਼ ਕਾਰਵਾਈਆਂ',
  'doctor.writePrescription': 'ਨੁਸਖਾ ਲਿਖੋ',
  'doctor.viewVitals': 'ਵਾਈਟਲਜ਼ ਵੇਖੋ',
  'doctor.sendMessage': 'ਸੁਨੇਹਾ ਭੇਜੋ',
  'doctor.healthReports': 'ਸਿਹਤ ਰਿਪੋਰਟਾਂ',
  'doctor.viewAllPatients': 'ਸਾਰੇ ਮਰੀਜ਼ ਵੇਖੋ',
  'doctor.pendingTasks': 'ਬਕਾਇਆ ਕੰਮ',
  'doctor.labReportReviews': 'ਲੈਬ ਰਿਪੋਰਟ ਸਮੀਖਿਆ',
  'doctor.prescriptionApprovals': 'ਨੁਸਖਾ ਮਨਜ਼ੂਰੀਆਂ',
  'doctor.followUpCalls': 'ਫਾਲੋ-ਅੱਪ ਕਾਲਾਂ',
  'doctor.emergencyAlerts': 'ਐਮਰਜੈਂਸੀ ਅਲਰਟ',
  'doctor.highPriorityPatient': 'ਉੱਚ ਤਰਜੀਹ ਮਰੀਜ਼',
  'doctor.attendNow': 'ਹੁਣ ਹਾਜ਼ਰ ਹੋਵੋ',

  // Conditions & common
  'condition.hypertension': 'ਹਾਈ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ',
  'condition.backPain': 'ਪੀਠ ਦਰਦ',
  'condition.regularCheckup': 'ਨਿਯਮਤ ਜਾਂਚ',
  'condition.chestPain': 'ਛਾਤੀ ਦਰਦ',
  'time.weeksAgo': '{{count}} ਹਫ਼ਤਾ ਪਹਿਲਾਂ',
  'time.weeksAgo_plural': '{{count}} ਹਫ਼ਤੇ ਪਹਿਲਾਂ',
  // Person / patient names
  'person.name.priyaSingh': 'ਪ੍ਰੀਆ ਸਿੰਘ',
  'person.name.amitGupta': 'ਅਮਿਤ ਗੁਪਤਾ',
  'person.name.sunitaKaur': 'ਸੁਨੀਤਾ ਕੌਰ',
  'person.name.rameshChandra': 'ਰਮੇਸ਼ ਚੰਦਰ',
  'common.loading': 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
  'common.patient': 'ਮਰੀਜ਼',
    
    // Volunteer Registration
    'volunteer.registration': 'ਸਥਾਨਕ ਵਲੰਟੀਅਰ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    'volunteer.joinCommunity': 'ਨਾਭਾ, ਪੰਜਾਬ ਵਿੱਚ ਸਿਹਤ ਸੇਵਾ ਵਲੰਟੀਅਰਾਂ ਦੇ ਭਾਈਚਾਰੇ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ। ਲੋੜਵੰਦਾਂ ਨੂੰ ਐਮਰਜੈਂਸੀ ਸਹਾਇਤਾ ਪ੍ਰਦਾਨ ਕਰਨ ਵਿੱਚ ਸਾਡੀ ਮਦਦ ਕਰੋ।',
    'volunteer.information': 'ਵਲੰਟੀਅਰ ਜਾਣਕਾਰੀ',
    'volunteer.fullName': 'ਪੂਰਾ ਨਾਮ',
    'volunteer.enterFullName': 'ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ',
    'volunteer.mobileNumber': 'ਮੋਬਾਈਲ ਨੰਬਰ',
    'volunteer.mobileHint': '10-ਅੰਕ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ',
    'volunteer.vehicleQuestion': 'ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਐਮਰਜੈਂਸੀ ਲਈ ਵਾਹਨ ਉਪਲਬਧ ਹੈ?',
    'volunteer.yesVehicle': 'ਹਾਂ, ਮੇਰੇ ਕੋਲ ਵਾਹਨ ਹੈ',
    'volunteer.noVehicle': 'ਨਹੀਂ, ਮੇਰੇ ਕੋਲ ਵਾਹਨ ਨਹੀਂ ਹੈ',
    'volunteer.registerButton': 'ਵਲੰਟੀਅਰ ਵਜੋਂ ਰਜਿਸਟਰ ਕਰੋ',
    'volunteer.emergencyResponse': 'ਐਮਰਜੈਂਸੀ ਪ੍ਰਤੀਕਿਰਿਆ',
    'volunteer.emergencyResponseDesc': 'ਜਦੋਂ ਆਸ-ਪਾਸ ਕਿਸੇ ਨੂੰ ਐਮਰਜੈਂਸੀ ਸਹਾਇਤਾ ਦੀ ਲੋੜ ਹੋਵੇ ਤਾਂ SMS ਅਲਰਟ ਪ੍ਰਾਪਤ ਕਰੋ। ਤੁਹਾਡੀ ਤੁਰੰਤ ਪ੍ਰਤੀਕਿਰਿਆ ਜੀਵਨ ਬਚਾ ਸਕਦੀ ਹੈ।',
    'volunteer.communityImpact': 'ਭਾਈਚਾਰਕ ਪ੍ਰਭਾਵ',
    'volunteer.communityImpactDesc': 'ਸਥਾਨਕ ਵਲੰਟੀਅਰਾਂ ਦੇ ਨੈਟਵਰਕ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ ਜੋ ਪਿੰਡੂ ਖੇਤਰਾਂ ਵਿੱਚ ਸਿਹਤ ਸੇਵਾਵਾਂ ਨੂੰ ਪਹੁੰਚਯੋਗ ਬਣਾਉਣ ਲਈ ਮਿਲ ਕੇ ਕੰਮ ਕਰ ਰਹੇ ਹਨ।',
    'volunteer.incompleteForm': 'ਅਧੂਰਾ ਫਾਰਮ',
    'volunteer.fillAllFields': 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਲੋੜੀਂਦੇ ਖੇਤਰ ਭਰੋ',
    'volunteer.invalidMobile': 'ਅਵੈਧ ਮੋਬਾਈਲ ਨੰਬਰ',
    'volunteer.validMobileNumber': 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ 10-ਅੰਕ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ',
    'volunteer.registrationSuccess': 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲ!',
    'volunteer.thankYou': 'ਧੰਨਵਾਦ {{name}}! ਤੁਸੀਂ ਹੁਣ ਇੱਕ ਵਲੰਟੀਅਰ ਵਜੋਂ ਰਜਿਸਟਰ ਹੋ ਗਏ ਹੋ।',
  }
};

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    const subscriber = (lang: Language) => setCurrentLanguage(lang);
    languageSubscribers.push(subscriber);
    return () => {
      const idx = languageSubscribers.indexOf(subscriber);
      if (idx >= 0) languageSubscribers.splice(idx, 1);
    };
  }, []);

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || key;
  };

  // Force English for certain identity keys (e.g., doctor full names) regardless of UI language
  const tEnglish = (key: string): string => {
    return translations['en']?.[key] || key;
  };

  // Add interpolation support for variables like {{name}}
  const tFormat = (key: string, vars: Record<string, string | number>): string => {
    const template = t(key);
    return template.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
      return String(vars[varName] !== undefined ? vars[varName] : '');
    });
  };

  const changeLanguage = (lang: Language) => {
    if (lang === globalLanguage) return;
    globalLanguage = lang;
    try { localStorage.setItem('arogya-language', lang); } catch {}
    // Notify all subscribers
    languageSubscribers.forEach(fn => fn(lang));
  };

  // Basic pluralization helper: looks for key or key_plural based on count
  const tCount = (key: string, count: number): string => {
    const pluralKey = `${key}_plural`;
    let template = t(count === 1 ? key : pluralKey);
    // Fallback if plural not defined
    if (template === pluralKey) template = t(key);
    return template.replace(/\{\{count\}\}/g, String(count));
  };

  return {
    currentLanguage,
    changeLanguage,
  t,
  tEnglish,
    tFormat,
    tCount
  };
};