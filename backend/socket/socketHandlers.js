import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const connectedUsers = new Map(); // userId -> socketId
const activeConsultations = new Map(); // consultationId -> {doctor, patient, roomId}

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userName = user.name;
    
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
};

export const setupSocketHandlers = (io) => {
  // Authentication middleware for all socket connections
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userName} (${socket.userRole}) - ${socket.id}`);
    
    // Store user connection
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      role: socket.userRole,
      name: socket.userName,
      lastSeen: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Join role-based room
    socket.join(`${socket.userRole}s`);

    // Emit online status to relevant users
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      role: socket.userRole,
      name: socket.userName
    });

    // Handle appointment booking real-time updates
    socket.on('appointment_request', (data) => {
      const { doctorId, appointmentData } = data;
      
      // Notify doctor about new appointment request
      socket.to(`user_${doctorId}`).emit('new_appointment_request', {
        appointmentData,
        patientId: socket.userId,
        patientName: socket.userName
      });
      
      console.log(`Appointment request from ${socket.userName} to doctor ${doctorId}`);
    });

    // Handle appointment status updates
    socket.on('appointment_status_update', (data) => {
      const { appointmentId, status, patientId, message } = data;
      
      // Notify patient about appointment status change
      socket.to(`user_${patientId}`).emit('appointment_status_changed', {
        appointmentId,
        status,
        message,
        doctorName: socket.userName
      });
      
      console.log(`Appointment ${appointmentId} status updated to ${status}`);
    });

    // Handle teleconsultation requests
    socket.on('start_consultation', (data) => {
      const { consultationId, participantId, roomId } = data;
      
      // Create or join consultation room
      socket.join(`consultation_${consultationId}`);
      
      // Store active consultation
      if (!activeConsultations.has(consultationId)) {
        activeConsultations.set(consultationId, {
          roomId,
          participants: new Set()
        });
      }
      
      const consultation = activeConsultations.get(consultationId);
      consultation.participants.add(socket.userId);
      
      // Notify other participant
      socket.to(`user_${participantId}`).emit('consultation_started', {
        consultationId,
        roomId,
        initiator: {
          id: socket.userId,
          name: socket.userName,
          role: socket.userRole
        }
      });
      
      console.log(`Teleconsultation ${consultationId} started by ${socket.userName}`);
    });

    // Handle video call signaling
    socket.on('video_signal', (data) => {
      const { consultationId, signal, to } = data;
      
      socket.to(`consultation_${consultationId}`).emit('video_signal', {
        signal,
        from: socket.userId,
        fromName: socket.userName
      });
    });

    // Handle prescription updates
    socket.on('prescription_updated', (data) => {
      const { patientId, prescriptionData } = data;
      
      // Notify patient about new/updated prescription
      socket.to(`user_${patientId}`).emit('new_prescription', {
        prescription: prescriptionData,
        doctorName: socket.userName,
        timestamp: new Date()
      });
      
      console.log(`Prescription updated for patient ${patientId} by Dr. ${socket.userName}`);
    });

    // Handle health record updates
    socket.on('health_record_updated', (data) => {
      const { patientId, recordData } = data;
      
      // Notify patient about health record update
      socket.to(`user_${patientId}`).emit('health_record_updated', {
        record: recordData,
        updatedBy: socket.userName,
        timestamp: new Date()
      });
      
      console.log(`Health record updated for patient ${patientId} by ${socket.userName}`);
    });

    // Handle emergency alerts
    socket.on('emergency_alert', (data) => {
      const { location, message, severity } = data;
      
      // Broadcast to all doctors and emergency responders
      socket.to('doctors').emit('emergency_alert', {
        patientId: socket.userId,
        patientName: socket.userName,
        location,
        message,
        severity,
        timestamp: new Date()
      });
      
      console.log(`Emergency alert from ${socket.userName}: ${message}`);
    });

    // Handle medication reminders
    socket.on('medication_reminder_ack', (data) => {
      const { reminderId, status } = data;
      
      console.log(`Medication reminder ${reminderId} acknowledged by ${socket.userName} with status: ${status}`);
      
      // You can emit to healthcare providers if needed
      socket.to('doctors').emit('medication_compliance_update', {
        patientId: socket.userId,
        patientName: socket.userName,
        reminderId,
        status,
        timestamp: new Date()
      });
    });

    // Handle chat messages during consultation
    socket.on('consultation_message', (data) => {
      const { consultationId, message, timestamp } = data;
      
      socket.to(`consultation_${consultationId}`).emit('consultation_message', {
        message,
        from: {
          id: socket.userId,
          name: socket.userName,
          role: socket.userRole
        },
        timestamp
      });
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { consultationId } = data;
      socket.to(`consultation_${consultationId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName
      });
    });

    socket.on('typing_stop', (data) => {
      const { consultationId } = data;
      socket.to(`consultation_${consultationId}`).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userName} - Reason: ${reason}`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Clean up active consultations
      for (const [consultationId, consultation] of activeConsultations) {
        if (consultation.participants.has(socket.userId)) {
          consultation.participants.delete(socket.userId);
          
          // Notify other participants about disconnection
          socket.to(`consultation_${consultationId}`).emit('participant_disconnected', {
            userId: socket.userId,
            userName: socket.userName
          });
          
          // Remove empty consultations
          if (consultation.participants.size === 0) {
            activeConsultations.delete(consultationId);
          }
        }
      }
      
      // Emit offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        role: socket.userRole,
        name: socket.userName
      });
    });

    // Handle explicit consultation end
    socket.on('end_consultation', (data) => {
      const { consultationId } = data;
      
      // Notify all participants
      socket.to(`consultation_${consultationId}`).emit('consultation_ended', {
        endedBy: {
          id: socket.userId,
          name: socket.userName,
          role: socket.userRole
        },
        timestamp: new Date()
      });
      
      // Clean up consultation
      activeConsultations.delete(consultationId);
      
      console.log(`Consultation ${consultationId} ended by ${socket.userName}`);
    });
  });

  // Utility functions for sending notifications
  io.sendToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
  };

  io.sendToRole = (role, event, data) => {
    io.to(`${role}s`).emit(event, data);
  };

  io.getConnectedUsers = () => {
    return Array.from(connectedUsers.entries()).map(([userId, userInfo]) => ({
      userId,
      ...userInfo
    }));
  };

  io.getActiveConsultations = () => {
    return Array.from(activeConsultations.entries()).map(([id, consultation]) => ({
      consultationId: id,
      participantCount: consultation.participants.size,
      roomId: consultation.roomId
    }));
  };

  console.log('✅ Socket.IO handlers configured successfully');
};