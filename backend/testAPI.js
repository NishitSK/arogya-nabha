// Simple API test script
import fetch from 'node-fetch';

const testAPI = async () => {
  try {
    // Test 1: Login with doctor credentials
    console.log('🔍 Testing login API...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'dr_sharma',
        password: 'doctor123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Error details:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('User:', loginData.user.name, '- Role:', loginData.user.role);
    
    const token = loginData.token;

    // Test 2: Get doctors list
    console.log('\n🔍 Testing doctors API...');
    const doctorsResponse = await fetch('http://localhost:5000/api/doctors', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (doctorsResponse.ok) {
      const doctors = await doctorsResponse.json();
      console.log('✅ Doctors API working!');
      console.log(`Found ${doctors.length} doctors`);
      doctors.forEach((doc, index) => {
        console.log(`${index + 1}. Dr. ${doc.userId?.name || 'Unknown'} - ${doc.specialization}`);
      });
    } else {
      console.log('❌ Doctors API failed:', doctorsResponse.status);
    }

    // Test 3: Get patients list  
    console.log('\n🔍 Testing patients API...');
    const patientsResponse = await fetch('http://localhost:5000/api/patients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (patientsResponse.ok) {
      const patients = await patientsResponse.json();
      console.log('✅ Patients API working!');
      console.log(`Found ${patients.length} patients`);
      patients.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.userId?.name || 'Unknown'} - ${patient.gender}`);
      });
    } else {
      console.log('❌ Patients API failed:', patientsResponse.status);
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Wait a bit for server to start, then run tests
setTimeout(testAPI, 2000);