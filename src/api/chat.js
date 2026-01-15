/**
 * Chat API Functions
 * All chat-related API calls
 */
import { useGetApi, usePostApi, useDeleteApi, usePatchApi } from './apiClient';
import { chat as chatRoutes } from './routes';

/**
 * Create or get chatroom with another user
 * @param {string} memberId - The ID of the user to chat with
 * @param {string} propertyId - The ID of the property (optional) - tracks which property this chat is about
 * @returns {Promise<Object>} - Chatroom data
 */
export async function createOrGetChatroom(memberId, propertyId = null) {
  try {
    if (!memberId) {
      throw new Error('Member ID is required');
    }

    // Ensure memberId is a string
    const memberIdStr = String(memberId || '').trim();
    if (!memberIdStr || memberIdStr === 'undefined' || memberIdStr === 'null') {
      throw new Error('Invalid member ID');
    }

    // Prepare request body
    const requestBody = { memberId: memberIdStr };
    if (propertyId) {
      const propertyIdStr = String(propertyId || '').trim();
      if (propertyIdStr && propertyIdStr !== 'undefined' && propertyIdStr !== 'null') {
        requestBody.propertyId = propertyIdStr;
      }
    }

    const response = await usePostApi(chatRoutes.createOrGetChatroom, true, requestBody);

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

/**
 * Get recent requests - properties with renters who have chatted with the owner
 * @param {number} limit - Maximum number of requests to return (default: 10)
 * @returns {Promise<Array>} - Array of recent requests with property and renter info
 */
export async function getRecentRequests(limit = 10) {
  try {
    const url = `${chatRoutes.getRecentRequests}?limit=${limit}`;
    const response = await useGetApi(url, true);

    if (response && response.success && response.data && response.data.recentRequests) {
      return response.data.recentRequests;
    }

    return [];
  } catch (error) {
    console.error('Error getting recent requests:', error);
  }
}

  /**
 * Delete a chatroom (per-user soft delete)
 * @param {string} chatroomId - The ID of the chatroom to delete
 * @returns {Promise<Object>} - Deleted chatroom data
 */
  export async function deleteChatroom(chatroomId) {
    try {
      if (!chatroomId) {
        throw new Error('Chatroom ID is required');
      }

      const response = await usePatchApi(chatRoutes.updateChatroom(chatroomId), true, { action: 'delete' });

      if (response && response.success && response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      console.error('Error deleting chatroom:', error);
      throw error;
    }
  }

  /**
   * Block or unblock a user in chatroom
   * @param {string} chatroomId - The ID of the chatroom
   * @param {boolean} action - true to block, false to unblock
   * @returns {Promise<Object>} - Updated chatroom data
   */
  export async function blockUnblockChatroom(chatroomId, action) {
    try {
      if (!chatroomId) {
        throw new Error('Chatroom ID is required');
      }

      if (typeof action !== 'boolean') {
        throw new Error('Action must be a boolean (true to block, false to unblock)');
      }

      // Backend expects boolean, not string
      const response = await usePatchApi(chatRoutes.blockUnblockChatroom(chatroomId), true, { action });

      if (response && response.success && response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      console.error('Error blocking/unblocking chatroom:', error);
      throw error;
    }
  }

  /**
   * Update chatroom (delete, block, unblock)
   * @param {string} chatroomId - The ID of the chatroom
   * @param {string} action - Action to perform: 'delete', 'block', or 'unblock'
   * @returns {Promise<Object>} - Updated chatroom data
   */
  export async function updateChatroom(chatroomId, action) {
    try {
      if (!chatroomId) {
        throw new Error('Chatroom ID is required');
      }

      if (!action || !['delete', 'block', 'unblock'].includes(action)) {
        throw new Error('Valid action is required: delete, block, or unblock');
      }

      // Handle block/unblock separately (they use different endpoint)
      if (action === 'block' || action === 'unblock') {
        const blockAction = action === 'block';
        return await blockUnblockChatroom(chatroomId, blockAction);
      }

      // Handle delete (uses updateChatroom endpoint)
      const response = await usePatchApi(chatRoutes.updateChatroom(chatroomId), true, { action: 'delete' });
      
      if (response && response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update chatroom');
    } catch (error) {
      console.error('Error updating chatroom:', error);
      throw error;
    }
  }

