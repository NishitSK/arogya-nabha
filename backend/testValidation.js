// Test script to verify the fixed APIs
import fetch from 'node-fetch';

const testRegistrationAndLogin = async () => {
  try {
    console.log('🧪 Testing Registration API...');
    
    // Test registration
    const registerData = {
      username: 'test_patient_new',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      name: 'Test Patient',
      phone: '9876543210',
      role: 'patient'
    };

    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData)
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.log('❌ Registration failed:', registerResponse.status);
      console.log('Error details:', errorText);
      return;
    }

    const registerResult = await registerResponse.json();
    console.log('✅ Registration successful!');
    console.log('User:', registerResult.user.name, '- Role:', registerResult.user.role);

    // Test login with the new user
    console.log('\n🔍 Testing Login API...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test_patient_new',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', loginResponse.status);
      console.log('Error details:', errorText);
      return;
    }

    const loginResult = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('Token received:', loginResult.token ? 'Yes' : 'No');
    console.log('User:', loginResult.user.name, '- Role:', loginResult.user.role);

    // Test existing user login
    console.log('\n🔍 Testing Login with existing user...');
    const existingLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'dr_sharma',
        password: 'doctor123'
      })
    });

    if (existingLoginResponse.ok) {
      const existingLoginResult = await existingLoginResponse.json();
      console.log('✅ Existing user login successful!');
      console.log('User:', existingLoginResult.user.name, '- Role:', existingLoginResult.user.role);
    } else {
      const errorText = await existingLoginResponse.text();
      console.log('❌ Existing user login failed:', existingLoginResponse.status);
      console.log('Error details:', errorText);
    }

    console.log('\n🎉 API testing completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testRegistrationAndLogin();