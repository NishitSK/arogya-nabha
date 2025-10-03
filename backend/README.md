# Arogya Nabha - Healthcare Management Backend

A comprehensive healthcare management backend system built with Node.js, Express, MongoDB, and Socket.IO. This backend supports a complete patient portal with appointment booking, health record management, prescriptions, teleconsultations, and real-time data synchronization.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: JWT-based auth with role-based access control (Patient, Doctor, Admin)
- **Real-time Communication**: Socket.IO for live updates and teleconsultations
- **Security**: Helmet, rate limiting, CORS protection, password hashing
- **File Upload**: Cloudinary integration for health record attachments

### Patient Features
- Complete profile management with medical history
- Appointment booking with doctors
- Health record access and management
- Prescription tracking with medication adherence
- Teleconsultation participation
- Real-time notifications
- Dashboard with health statistics

### Doctor Features
- Professional profile with specializations and availability
- Appointment management and scheduling
- Patient health record creation and updates
- Prescription management with medication tracking
- Teleconsultation hosting
- Dashboard with practice analytics
- Patient review system

### Admin Features
- User management and approval
- System monitoring and statistics
- Data oversight and reporting

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, bcrypt, rate limiting
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: Joi
- **Logging**: Winston
- **Task Scheduling**: Cron

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for file uploads)
- Email service credentials (for notifications)

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd my-arogya-nabha/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/arogyannabha
   JWT_SECRET=your-super-secret-jwt-key-here
   CLIENT_URL=http://localhost:5173

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # SMS Configuration (optional)
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=your-twilio-phone
   ```

5. **Seed the database** (optional - for testing):
   ```bash
   npm run seed
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Patients
- `GET /api/patients/profile/me` - Get patient profile
- `POST /api/patients/profile` - Create/update patient profile
- `GET /api/patients/appointments/my` - Get patient appointments
- `GET /api/patients/health-records/my` - Get patient health records
- `POST /api/patients/medications` - Add medication
- `POST /api/patients/allergies` - Add allergy

### Doctors
- `GET /api/doctors` - Get all doctors (with filters)
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors/profile` - Create/update doctor profile
- `GET /api/doctors/profile/me` - Get own profile
- `PUT /api/doctors/availability` - Update availability
- `GET /api/doctors/appointments/my` - Get doctor appointments

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get appointments (role-based)
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment
- `PUT /api/appointments/:id/status` - Update appointment status
- `GET /api/appointments/doctors/:doctorId/available-slots` - Get available slots

### Prescriptions
- `POST /api/prescriptions` - Create prescription (doctors only)
- `GET /api/prescriptions` - Get prescriptions
- `GET /api/prescriptions/:id` - Get prescription details
- `POST /api/prescriptions/:id/adherence` - Record medication adherence
- `GET /api/prescriptions/:id/adherence/stats` - Get adherence statistics
- `POST /api/prescriptions/:id/renew` - Renew prescription

### Teleconsultations
- `POST /api/teleconsultations` - Create teleconsultation session
- `GET /api/teleconsultations` - Get teleconsultations
- `GET /api/teleconsultations/:id` - Get teleconsultation details
- `POST /api/teleconsultations/:id/join` - Join teleconsultation
- `POST /api/teleconsultations/:id/leave` - Leave teleconsultation
- `POST /api/teleconsultations/:id/messages` - Send message in chat

### Health Records
- `POST /api/health-records` - Create health record (doctors only)
- `GET /api/health-records` - Get health records
- `GET /api/health-records/:id` - Get health record details
- `PUT /api/health-records/:id` - Update health record
- `DELETE /api/health-records/:id` - Delete health record
- `GET /api/health-records/search/:query` - Search health records

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/read` - Mark notifications as read
- `GET /api/notifications/preferences/me` - Get notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences

## 🔌 Socket.IO Events

### Real-time Features
- `appointment:updated` - Appointment status changes
- `prescription:new` - New prescription created
- `teleconsultation:invite` - Teleconsultation invitation
- `teleconsultation:started` - Teleconsultation session started
- `teleconsultation:ended` - Teleconsultation session ended
- `notification:new` - New notification received
- `health-record:updated` - Health record updated

## 📊 Database Models

### Core Models
- **User**: Authentication and basic user information
- **Doctor**: Doctor profiles with specializations and availability
- **Patient**: Patient profiles with medical history
- **Appointment**: Appointment booking and management
- **Prescription**: Medication prescriptions and adherence tracking
- **Teleconsultation**: Video/audio consultation sessions
- **HealthRecord**: Medical records and test results
- **Notification**: Multi-channel notification system

## 🧪 Testing

### Sample Login Credentials (after seeding)
```
Admin:
- Username: admin
- Password: admin123

Doctor:
- Username: dr_sharma
- Password: doctor123

Doctor:
- Username: dr_patel
- Password: doctor123

Patient:
- Username: patient_john
- Password: patient123

Patient:
- Username: patient_jane
- Password: patient123
```

### Test the API
1. Start the server: `npm run dev`
2. Use Postman or similar to test endpoints
3. Check health status: `GET http://localhost:5000/api/health`

## 🔧 NPM Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
npm test           # Run tests (when implemented)
```

## 🏗️ Project Structure

```
backend/
├── models/              # Mongoose models
├── routes/              # API route handlers
├── middleware/          # Custom middleware
├── socketHandlers/      # Socket.IO event handlers
├── utils/               # Utility functions
├── uploads/             # Temporary file uploads
├── server.js            # Main server file
├── seedDatabase.js      # Database seeding script
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up Cloudinary for file uploads
4. Configure email service
5. Set secure JWT secret

### Docker (Optional)
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

Built with ❤️ for better healthcare management.