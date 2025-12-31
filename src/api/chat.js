/**
 * Chat API Functions
 * All chat-related API calls
 */
import { useGetApi, usePostApi } from './apiClient';
import { chat as chatRoutes } from './routes';

/**
 * Create or get chatroom with another user
 * @param {string} memberId - The ID of the user to chat with
 * @returns {Promise<Object>} - Chatroom data
 */
export async function createOrGetChatroom(memberId) {
  try {
    if (!memberId) {
      throw new Error('Member ID is required');
    }

    // Ensure memberId is a string
    const memberIdStr = String(memberId || '').trim();
    if (!memberIdStr || memberIdStr === 'undefined' || memberIdStr === 'null') {
      throw new Error('Invalid member ID');
    }

    const response = await usePostApi(chatRoutes.createOrGetChatroom, true, { memberId: memberIdStr });
    
    if (response && response.success && response.data) {
      // Ensure chatroom ID is properly extracted
      const chatroom = response.data;
      if (chatroom && (chatroom._id || chatroom.id)) {
        // Normalize chatroom ID to string
        chatroom._id = String(chatroom._id || chatroom.id);
        chatroom.id = chatroom._id;
      }
      return chatroom;
    }
    
    return response;
  } catch (error) {
    console.error('Error creating/getting chatroom:', error);
    throw error;
  }
}

/**
 * Get all chatrooms for current user
 * @returns {Promise<Array>} - Array of chatrooms
 */
export async function getChatrooms() {
  try {
    const response = await useGetApi(chatRoutes.getChatrooms, true);
    
    if (response && response.success && response.data && response.data.chatrooms) {
      return response.data.chatrooms;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting chatrooms:', error);
    throw error;
  }
}

/**
 * Get messages for a specific chatroom
 * @param {string} chatroomId - The ID of the chatroom
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Messages per page (default: 50)
 * @returns {Promise<Object>} - Messages data with pagination
 */
export async function getChatroomMessages(chatroomId, page = 1, limit = 50) {
  try {
    if (!chatroomId) {
      throw new Error('Chatroom ID is required');
    }

    const url = `${chatRoutes.getChatroomMessages(chatroomId)}?page=${page}&limit=${limit}`;
    const response = await useGetApi(url, true);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return { messages: [], pagination: { page, limit, total: 0, pages: 0 } };
  } catch (error) {
    console.error('Error getting chatroom messages:', error);
    throw error;
  }
}

/**
 * Upload media file for chat messages
 * @param {string} chatroomId - The ID of the chatroom
 * @param {File} file - The file to upload
 * @param {string} messageType - Type of message (image, video, document)
 * @returns {Promise<Object>} - Upload result with file URL and metadata
 */
export async function uploadChatMedia(chatroomId, file, messageType = 'image') {
  try {
    if (!chatroomId) {
      throw new Error('Chatroom ID is required');
    }

    if (!file) {
      throw new Error('File is required');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatroomId', String(chatroomId));
    formData.append('messageType', messageType);

    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${chatRoutes.uploadMedia}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload media');
    }
    
    if (data && data.success && data.data) {
      return data.data;
    }
    
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Error uploading chat media:', error);
    throw error;
  }
}

