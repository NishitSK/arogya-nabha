import { useState, useEffect } from 'react';

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
    'home.title': 'Arogya Connect',
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
  }
};

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('arogya-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('arogya-language', currentLanguage);
  }, [currentLanguage]);

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || key;
  };

  const changeLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};