import { authenticateSocketToken } from '../middleware/auth.js';

// Socket.IO authentication middleware
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = authenticateSocketToken(token);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.username = decoded.username;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

// Main socket handler setup
export const setupSocketHandlers = (io) => {
  // Apply authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.username} (${socket.userRole}) - Socket ID: ${socket.id}`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);
    
    // Join role-based rooms
    socket.join(`role:${socket.userRole}`);

    // Teleconsultation handlers
    handleTeleconsultation(socket, io);
    
    // Appointment handlers
    handleAppointments(socket, io);
    
    // Notification handlers
    handleNotifications(socket, io);
    
    // Chat handlers
    handleChat(socket, io);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${socket.username} - Reason: ${reason}`);
      
      // Handle teleconsultation cleanup
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        username: socket.username
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`🔥 Socket error for user ${socket.username}:`, error);
    });
  });

  console.log('🔌 Socket.IO handlers initialized');
};

// Teleconsultation handlers
const handleTeleconsultation = (socket, io) => {
  // Join consultation room
  socket.on('teleconsultation:join', (data) => {
    const { consultationId } = data;
    socket.join(`consultation:${consultationId}`);
    
    // Notify others in the consultation
    socket.to(`consultation:${consultationId}`).emit('teleconsultation:user_joined', {
      userId: socket.userId,
      username: socket.username,
      role: socket.userRole,
      timestamp: new Date()
    });

    console.log(`📹 ${socket.username} joined consultation: ${consultationId}`);
  });

  // Leave consultation room
  socket.on('teleconsultation:leave', (data) => {
    const { consultationId } = data;
    socket.leave(`consultation:${consultationId}`);
    
    // Notify others in the consultation
    socket.to(`consultation:${consultationId}`).emit('teleconsultation:user_left', {
      userId: socket.userId,
      username: socket.username,
      role: socket.userRole,
      timestamp: new Date()
    });

    console.log(`📹 ${socket.username} left consultation: ${consultationId}`);
  });

  // WebRTC signaling
  socket.on('teleconsultation:webrtc_signal', (data) => {
    const { consultationId, signal, targetUserId } = data;
    
    if (targetUserId) {
      // Send to specific user
      socket.to(`user:${targetUserId}`).emit('teleconsultation:webrtc_signal', {
        signal,
        fromUserId: socket.userId,
        fromUsername: socket.username,
        consultationId
      });
    } else {
      // Broadcast to consultation room
      socket.to(`consultation:${consultationId}`).emit('teleconsultation:webrtc_signal', {
        signal,
        fromUserId: socket.userId,
        fromUsername: socket.username,
        consultationId
      });
    }
  });

  // Chat in consultation
  socket.on('teleconsultation:chat_message', (data) => {
    const { consultationId, message } = data;
    
    const chatMessage = {
      id: Date.now().toString(),
      message,
      senderId: socket.userId,
      senderName: socket.username,
      senderRole: socket.userRole,
      timestamp: new Date(),
      consultationId
    };

    // Broadcast to consultation room
    io.to(`consultation:${consultationId}`).emit('teleconsultation:chat_message', chatMessage);
    
    console.log(`💬 Chat message in consultation ${consultationId}: ${socket.username}`);
  });

  // Screen sharing
  socket.on('teleconsultation:screen_share', (data) => {
    const { consultationId, isSharing } = data;
    
    socket.to(`consultation:${consultationId}`).emit('teleconsultation:screen_share', {
      userId: socket.userId,
      username: socket.username,
      isSharing,
      timestamp: new Date()
    });
  });
};

// Appointment handlers
const handleAppointments = (socket, io) => {
  // Real-time appointment updates
  socket.on('appointment:status_change', (data) => {
    const { appointmentId, status, patientId, doctorId } = data;
    
    // Notify patient
    if (patientId) {
      io.to(`user:${patientId}`).emit('appointment:status_updated', {
        appointmentId,
        status,
        timestamp: new Date(),
        message: `Your appointment status has been updated to: ${status}`
      });
    }
    
    // Notify doctor
    if (doctorId && doctorId !== socket.userId) {
      io.to(`user:${doctorId}`).emit('appointment:status_updated', {
        appointmentId,
        status,
        timestamp: new Date(),
        message: `Appointment status updated to: ${status}`
      });
    }
  });

  // Appointment reminders
  socket.on('appointment:set_reminder', (data) => {
    const { appointmentId, reminderTime } = data;
    // This would typically integrate with a job scheduler
    console.log(`⏰ Reminder set for appointment ${appointmentId} at ${reminderTime}`);
  });
};

// Notification handlers
const handleNotifications = (socket, io) => {
  // Send real-time notification
  socket.on('notification:send', (data) => {
    const { recipientId, notification } = data;
    
    if (recipientId) {
      io.to(`user:${recipientId}`).emit('notification:received', {
        ...notification,
        timestamp: new Date()
      });
    }
  });

  // Mark notification as read
  socket.on('notification:mark_read', (data) => {
    const { notificationId } = data;
    // Update in database and potentially notify sender
    console.log(`📬 Notification ${notificationId} marked as read by ${socket.username}`);
  });
};

// General chat handlers
const handleChat = (socket, io) => {
  // Send message
  socket.on('chat:send_message', (data) => {
    const { recipientId, message } = data;
    
    const chatMessage = {
      id: Date.now().toString(),
      message,
      senderId: socket.userId,
      senderName: socket.username,
      timestamp: new Date()
    };

    // Send to recipient
    if (recipientId) {
      io.to(`user:${recipientId}`).emit('chat:message_received', chatMessage);
    }
    
    // Send back to sender for confirmation
    socket.emit('chat:message_sent', chatMessage);
  });

  // Typing indicators
  socket.on('chat:typing_start', (data) => {
    const { recipientId } = data;
    if (recipientId) {
      io.to(`user:${recipientId}`).emit('chat:typing_start', {
        userId: socket.userId,
        username: socket.username
      });
    }
  });

  socket.on('chat:typing_stop', (data) => {
    const { recipientId } = data;
    if (recipientId) {
      io.to(`user:${recipientId}`).emit('chat:typing_stop', {
        userId: socket.userId,
        username: socket.username
      });
    }
  });
};

// Helper function to broadcast to role-based rooms
export const broadcastToRole = (io, role, event, data) => {
  io.to(`role:${role}`).emit(event, data);
};

// Helper function to send notification to specific user
export const sendNotificationToUser = (io, userId, notification) => {
  io.to(`user:${userId}`).emit('notification:received', {
    ...notification,
    timestamp: new Date()
  });
};

export default setupSocketHandlers;