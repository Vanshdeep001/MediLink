'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { Send, User, Paperclip } from 'lucide-react';

interface Message {
  _id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_details?: {
    name: string;
    role: string;
  };
}

interface ChatBoxProps {
  appointmentId: string;
  currentUserId: string;
  receiverId: string;
  receiverName: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ appointmentId, currentUserId, receiverId, receiverName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { socket, isConnected } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch initial chat history
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chat/${appointmentId}`);
        const result = await response.json();
        if (result.success) {
          setMessages(result.data);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    if (appointmentId) {
      fetchHistory();
    }
  }, [appointmentId]);

  useEffect(() => {
    if (socket) {
      // Join the appointment room
      socket.emit('join-chat', appointmentId);

      // Listen for new messages
      socket.on('receive-message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      // Listen for typing
      socket.on('user-typing', ({ user_name }) => {
        setIsTyping(true);
      });

      socket.on('user-stop-typing', () => {
        setIsTyping(false);
      });

      return () => {
        socket.off('receive-message');
        socket.off('user-typing');
        socket.off('user-stop-typing');
      };
    }
  }, [socket, appointmentId]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      sender_id: currentUserId,
      receiver_id: receiverId,
      appointment_id: appointmentId,
      content: newMessage,
      message_type: 'TEXT',
    };

    socket.emit('send-message', messageData);
    setNewMessage('');
    socket.emit('stop-typing', { room: appointmentId });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socket) return;

    if (e.target.value.length > 0) {
      socket.emit('typing', { room: appointmentId, user_name: 'Someone' });
    } else {
      socket.emit('stop-typing', { room: appointmentId });
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md border rounded-lg shadow-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-semibold">{receiverName}</h3>
            <span className="text-xs opacity-80">{isConnected ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex flex-col max-w-[80%] ${
              msg.sender_id === currentUserId ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            <div
              className={`p-3 rounded-2xl text-sm ${
                msg.sender_id === currentUserId
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-gray-800 border rounded-tl-none shadow-sm'
              }`}
            >
              {msg.content}
            </div>
            <span className="text-[10px] text-gray-400 mt-1">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="text-xs text-gray-400 italic bg-gray-100 p-2 rounded-lg self-start">
            {receiverName} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex gap-2 items-center">
        <button type="button" className="text-gray-400 hover:text-blue-600 p-2">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
