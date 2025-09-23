import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { NextApiRequest } from 'next';

// WebSocket server instance
let wss: WebSocketServer | null = null;

// Store active connections
const connections = new Map<string, any>();

// Message types
interface WSMessage {
  type: string;
  from: string;
  to?: string;
  roomId?: string;
  data: any;
  timestamp: number;
  id: string;
}

// Initialize WebSocket server
function initializeWebSocketServer() {
  if (wss) return wss;

  wss = new WebSocketServer({ 
    port: 8080,
    path: '/ws'
  });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');
    
    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        handleMessage(ws, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }));
      }
    });

    // Handle connection close
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      // Remove from connections map
      for (const [userId, connection] of connections.entries()) {
        if (connection === ws) {
          connections.delete(userId);
          break;
        }
      }
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      data: { message: 'Connected to MediLink WebSocket server' }
    }));
  });

  return wss;
}

// Handle incoming messages
function handleMessage(ws: any, message: WSMessage) {
  console.log('Received message:', message.type, 'from:', message.from);

  switch (message.type) {
    case 'register':
      handleRegister(ws, message);
      break;
    case 'chat_message':
      handleChatMessage(message);
      break;
    case 'call_notification':
      handleCallNotification(message);
      break;
    case 'appointment_reminder':
      handleAppointmentReminder(message);
      break;
    case 'emergency_alert':
      handleEmergencyAlert(message);
      break;
    case 'user_online':
    case 'user_offline':
      handleUserStatus(message);
      break;
    case 'typing_start':
    case 'typing_stop':
      handleTypingStatus(message);
      break;
    case 'message_read':
      handleMessageRead(message);
      break;
    case 'call_status_update':
      handleCallStatusUpdate(message);
      break;
    case 'heartbeat':
      handleHeartbeat(ws, message);
      break;
    default:
      console.log('Unknown message type:', message.type);
  }
}

// Handle user registration
function handleRegister(ws: any, message: WSMessage) {
  const { userId } = message.data;
  if (userId) {
    connections.set(userId, ws);
    ws.send(JSON.stringify({
      type: 'registered',
      data: { userId, message: 'Successfully registered' }
    }));
  }
}

// Handle chat messages
function handleChatMessage(message: WSMessage) {
  const { to, roomId } = message;
  
  if (to && connections.has(to)) {
    // Send to specific user
    connections.get(to).send(JSON.stringify(message));
  } else if (roomId) {
    // Broadcast to room (in a real app, you'd manage room subscriptions)
    broadcastToRoom(roomId, message);
  }
}

// Handle call notifications
function handleCallNotification(message: WSMessage) {
  const { to } = message;
  
  if (to && connections.has(to)) {
    connections.get(to).send(JSON.stringify(message));
  }
}

// Handle appointment reminders
function handleAppointmentReminder(message: WSMessage) {
  const { to } = message;
  
  if (to && connections.has(to)) {
    connections.get(to).send(JSON.stringify(message));
  }
}

// Handle emergency alerts
function handleEmergencyAlert(message: WSMessage) {
  const { to } = message;
  
  if (to && connections.has(to)) {
    connections.get(to).send(JSON.stringify(message));
  }
}

// Handle user status updates
function handleUserStatus(message: WSMessage) {
  // Broadcast to all connected users
  broadcastToAll(message);
}

// Handle typing status
function handleTypingStatus(message: WSMessage) {
  const { to, roomId } = message;
  
  if (to && connections.has(to)) {
    connections.get(to).send(JSON.stringify(message));
  } else if (roomId) {
    broadcastToRoom(roomId, message);
  }
}

// Handle message read status
function handleMessageRead(message: WSMessage) {
  const { to, roomId } = message;
  
  if (to && connections.has(to)) {
    connections.get(to).send(JSON.stringify(message));
  } else if (roomId) {
    broadcastToRoom(roomId, message);
  }
}

// Handle call status updates
function handleCallStatusUpdate(message: WSMessage) {
  const { to } = message;
  
  if (to && connections.has(to)) {
    connections.get(to).send(JSON.stringify(message));
  }
}

// Handle heartbeat
function handleHeartbeat(ws: any, message: WSMessage) {
  ws.send(JSON.stringify({
    type: 'heartbeat_response',
    data: { timestamp: Date.now() }
  }));
}

// Broadcast to all connected users
function broadcastToAll(message: WSMessage) {
  connections.forEach((ws) => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify(message));
    }
  });
}

// Broadcast to room (simplified - in production, manage room subscriptions)
function broadcastToRoom(roomId: string, message: WSMessage) {
  // In a real implementation, you'd maintain room subscriptions
  // For now, broadcast to all users
  broadcastToAll(message);
}

// API route handler
export async function GET(request: NextRequest) {
  try {
    // Initialize WebSocket server if not already done
    initializeWebSocketServer();

    return new Response(JSON.stringify({
      message: 'WebSocket server is running',
      connections: connections.size,
      port: 8080
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error initializing WebSocket server:', error);
    return new Response(JSON.stringify({
      error: 'Failed to initialize WebSocket server'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Cleanup function (internal use only)
function cleanup() {
  if (wss) {
    wss.close();
    wss = null;
  }
  connections.clear();
}

