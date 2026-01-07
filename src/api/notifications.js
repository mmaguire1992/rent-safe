/**
 * Notifications API Functions
 * API calls for notification management
 */

import { useGetApi, usePatchApi } from './apiClient';
import { notifications as notificationRoutes } from './routes';

/**
 * Get notifications for the authenticated user
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {boolean} params.isRead - Filter by read status (optional)
 * @returns {Promise<Object>} - Notifications data with pagination and unreadCount
 */
export const getNotifications = async (params = {}) => {
  try {
    const { page = 1, limit = 20, isRead } = params;
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (isRead !== undefined) queryParams.append('isRead', isRead);
    
    const responseData = await useGetApi(
      `${notificationRoutes.getNotifications}?${queryParams.toString()}`,
      true // Requires authentication
    );
    
    if (responseData && responseData.success && responseData.data) {
      return {
        notifications: responseData.data.notifications || [],
        pagination: responseData.data.pagination || {},
        unreadCount: responseData.data.unreadCount || 0,
      };
    }
    
    return {
      notifications: [],
      pagination: {},
      unreadCount: 0,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark notification(s) as read
 * @param {Object} options - Mark options
 * @param {string} options.notificationId - Specific notification ID to mark as read (optional)
 * @param {boolean} options.markAll - Mark all notifications as read (optional, default: false)
 * @returns {Promise<Object>} - Success response
 */
export const markNotificationAsRead = async (options = {}) => {
  try {
    const { notificationId, markAll = false } = options;
    
    const requestBody = {};
    if (notificationId) {
      requestBody.notificationId = notificationId;
    }
    if (markAll) {
      requestBody.markAll = true;
    }
    
    const responseData = await usePatchApi(
      notificationRoutes.markAsRead,
      true, // Requires authentication
      requestBody
    );
    
    return responseData;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

