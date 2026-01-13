'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// Socket event constants (matching backend)
export const SOCKET_EVENTS = {
  // Client to Server
  SEND_MESSAGE: 'send_message',
  JOIN_CHATROOM: 'join_chatroom',
  LEAVE_CHATROOM: 'leave_chatroom',
  GET_MESSAGES: 'get_messages',
  MARK_MESSAGES_READ: 'mark_messages_read',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  
  // Server to Client
  NEW_MESSAGE: 'new_message',
  MESSAGE_SENT: 'message_sent',
  MESSAGES_LIST: 'messages_list',
  MESSAGE_READ: 'message_read',
  MESSAGE_DELIVERED: 'message_delivered',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  ERROR: 'error',
  CHATROOM_UPDATED: 'chatroom_updated',
  NEW_CHATROOM: 'new_chatroom',
};

/**
 * Custom hook for Socket.IO connection
 * Handles connection, authentication, and event management
 */
export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Only connect on client side
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('userToken');
    if (!token) {
      console.warn('No token found, socket will not connect');
      return;
    }

    // Get socket URL from environment or default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // Parse and convert to WebSocket URL
    let socketUrl = 'http://localhost:5000'; // Default fallback
    
    try {
      // Remove trailing /api if present
      let baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
      
      // Remove trailing slash
      baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      
      // Convert HTTP to WebSocket protocol
      if (baseUrl.startsWith('https://')) {
        socketUrl = baseUrl.replace('https://', 'wss://');
      } else if (baseUrl.startsWith('http://')) {
        socketUrl = baseUrl.replace('http://', 'ws://');
      } else {
        // If no protocol, assume https for production
        socketUrl = `wss://${baseUrl}`;
      }
    } catch (error) {
      console.error('Error parsing socket URL, using default. Original:', apiUrl, 'Error:', error);
    }

    console.log('🔌 Connecting to socket:', socketUrl);

    // Initialize socket connection
    const socket = io(socketUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      
      // "transport close" is normal when:
      // - User navigates away (e.g., redirected to Stripe)
      // - Page is refreshed
      // - Browser tab is closed
      // Socket will automatically reconnect when user returns (if reconnection is enabled)
      if (reason === 'transport close') {
        console.log('ℹ️ Transport close is normal - socket will reconnect automatically');
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Send message
  const sendMessage = useCallback((chatroomId, messageText, messageType = 'text', uniqueId, mediaData = null) => {
    if (!socketRef.current || !isConnected) {
      throw new Error('Socket not connected');
    }

    const chatroomIdStr = String(chatroomId || '');
    if (!chatroomIdStr || chatroomIdStr === 'undefined' || chatroomIdStr === 'null') {
      throw new Error('Invalid chatroom ID');
    }

    const messageUniqueId = uniqueId || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const messageData = {
      chatroomId: chatroomIdStr,
      text: messageText || '', // Send plain text, server will encrypt (optional for media messages)
      type: messageType,
      uniqueId: messageUniqueId,
    };

    // Add media fields if provided
    if (mediaData) {
      messageData.fileUrl = mediaData.fileUrl;
      messageData.fileName = mediaData.fileName;
      messageData.fileSize = mediaData.fileSize;
      messageData.mimeType = mediaData.mimeType;
      messageData.thumbnailUrl = mediaData.thumbnailUrl;
    }

    socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, messageData);

    return messageUniqueId;
  }, [isConnected]);

  // Join chatroom
  const joinChatroom = useCallback((chatroomId) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Socket not connected, cannot join chatroom');
      return;
    }

    const chatroomIdStr = String(chatroomId || '');
    if (!chatroomIdStr || chatroomIdStr === 'undefined' || chatroomIdStr === 'null') {
      console.warn('Invalid chatroom ID:', chatroomId);
      return;
    }

    socketRef.current.emit(SOCKET_EVENTS.JOIN_CHATROOM, { chatroomId: chatroomIdStr });
  }, [isConnected]);

  // Leave chatroom
  const leaveChatroom = useCallback((chatroomId) => {
    if (!socketRef.current || !isConnected) return;

    const chatroomIdStr = String(chatroomId || '');
    if (!chatroomIdStr || chatroomIdStr === 'undefined' || chatroomIdStr === 'null') return;

    socketRef.current.emit(SOCKET_EVENTS.LEAVE_CHATROOM, { chatroomId: chatroomIdStr });
  }, [isConnected]);

  // Get messages
  const getMessages = useCallback((chatroomId, page = 1, limit = 50) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Socket not connected, cannot get messages');
      return;
    }

    socketRef.current.emit(SOCKET_EVENTS.GET_MESSAGES, { chatroomId, page, limit });
  }, [isConnected]);

  // Mark messages as read
  const markMessagesAsRead = useCallback((chatroomId) => {
    if (!socketRef.current || !isConnected) return;

    const chatroomIdStr = String(chatroomId || '');
    if (!chatroomIdStr || chatroomIdStr === 'undefined' || chatroomIdStr === 'null') return;

    socketRef.current.emit(SOCKET_EVENTS.MARK_MESSAGES_READ, { chatroomId: chatroomIdStr });
  }, [isConnected]);

  // Typing indicators
  const startTyping = useCallback((chatroomId) => {
    if (!socketRef.current || !isConnected) return;

    const chatroomIdStr = String(chatroomId || '');
    if (!chatroomIdStr || chatroomIdStr === 'undefined' || chatroomIdStr === 'null') return;

    socketRef.current.emit(SOCKET_EVENTS.TYPING_START, { chatroomId: chatroomIdStr });
  }, [isConnected]);

  const stopTyping = useCallback((chatroomId) => {
    if (!socketRef.current || !isConnected) return;

    const chatroomIdStr = String(chatroomId || '');
    if (!chatroomIdStr || chatroomIdStr === 'undefined' || chatroomIdStr === 'null') return;

    socketRef.current.emit(SOCKET_EVENTS.TYPING_STOP, { chatroomId: chatroomIdStr });
  }, [isConnected]);

  // Subscribe to events
  const on = useCallback((event, callback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(event, callback);

    // Return unsubscribe function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  }, []);

  // Unsubscribe from events
  const off = useCallback((event, callback) => {
    if (!socketRef.current) return;

    socketRef.current.off(event, callback);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    sendMessage,
    joinChatroom,
    leaveChatroom,
    getMessages,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    on,
    off,
  };
};

