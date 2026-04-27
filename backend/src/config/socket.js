import { Server } from 'socket.io';
import Message from '../models/message.model.js';

const userSocketMap = new Map(); // userId -> socketId

export const getOnlineUserIds = () => {
  return Array.from(userSocketMap.keys());
};

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  console.log('🔌 Socket.io initialized');


  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // Track user identity
    socket.on('identify', (userId) => {
      userSocketMap.set(userId, socket.id);
      console.log(`🆔 User ${userId} identified with socket ${socket.id}`);
    });

    // Join a private room for a specific conversation (usually appointment_id)
    socket.on('join-chat', (room) => {
      socket.join(room);
      console.log(`🚪 User ${socket.id} joined room: ${room}`);
    });

    // Handle sending message
    socket.on('send-message', async (data) => {
      try {
        const { sender_id, receiver_id, appointment_id, content, message_type } = data;

        // Save to database
        const newMessage = await Message.create({
          sender_id,
          receiver_id,
          appointment_id,
          content,
          message_type,
        });

        // Emit to the room
        io.to(appointment_id).emit('receive-message', newMessage);
        
        // Notify receiver specifically if needed
        const receiverSocketId = userSocketMap.get(receiver_id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new-notification', {
            type: 'NEW_MESSAGE',
            sender_id,
            content: content.substring(0, 50),
          });
        }

      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    });

    // Typing indication
    socket.on('typing', (data) => {
      const { room, user_name } = data;
      socket.to(room).emit('user-typing', { user_name });
    });

    socket.on('stop-typing', (data) => {
      const { room } = data;
      socket.to(room).emit('user-stop-typing');
    });

    // --- WebRTC Signaling ---
    socket.on('call:offer', ({ to, offer }) => {
      const targetSocketId = userSocketMap.get(to) || to; // Fallback to socket ID if provided
      console.log(`📹 Relay offer from ${socket.id} to ${targetSocketId}`);
      io.to(targetSocketId).emit('call:offer', { from: socket.id, offer });
    });

    socket.on('call:answer', ({ to, answer }) => {
      const targetSocketId = userSocketMap.get(to) || to;
      console.log(`📹 Relay answer from ${socket.id} to ${targetSocketId}`);
      io.to(targetSocketId).emit('call:answer', { from: socket.id, answer });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
      const targetSocketId = userSocketMap.get(to) || to;
      io.to(targetSocketId).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('call:initiate', ({ to, callerName }) => {
      const targetSocketId = userSocketMap.get(to);
      console.log(`📞 Call initiated for user ${to} (Socket: ${targetSocketId}) from ${callerName}`);
      
      if (targetSocketId) {
        io.to(targetSocketId).emit(`call:incoming-${to}`, { from: socket.id, callerName });
      } else {
        // Broadcast to all if user not identified (fallback for development)
        io.emit(`call:incoming-${to}`, { from: socket.id, callerName });
      }
    });

    socket.on('call:accepted', ({ to }) => {
      const targetSocketId = userSocketMap.get(to) || to;
      io.to(targetSocketId).emit('call:accepted', { from: socket.id });
    });

    socket.on('call:rejected', ({ to }) => {
      const targetSocketId = userSocketMap.get(to) || to;
      io.to(targetSocketId).emit(`call:rejected-${to}`);
    });

    socket.on('call:ended', ({ to }) => {
      const targetSocketId = userSocketMap.get(to) || to;
      io.to(targetSocketId).emit('call:ended', { from: socket.id });
    });


    socket.on('disconnect', () => {
      // Find and remove from map
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          console.log(`👋 User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};
