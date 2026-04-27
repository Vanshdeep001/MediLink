'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(socketInstance);
  const [isConnected, setIsConnected] = useState(socketInstance?.connected || false);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to socket server');
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from socket server');
      });
    }

    setSocket(socketInstance);
    setIsConnected(socketInstance.connected);

    // No disconnect on unmount to keep the singleton alive across components
    // This ensures all components share the same socket ID
  }, []);

  return { socket, isConnected };
};

