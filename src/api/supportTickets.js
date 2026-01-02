/**
 * Support Tickets API Functions
 */
import { usePostApi, useGetApi } from './apiClient';
import { supportTickets as supportTicketRoutes } from './routes';
import apiClient from './apiClient';

/**
 * Create a new support ticket
 * @param {Object} ticketData - { subject, description, priority? }
 * @returns {Promise<Object>} Created support ticket
 */
export async function createSupportTicket(ticketData) {
  try {
    const responseData = await usePostApi(supportTicketRoutes.create, true, ticketData);
    return responseData;
  } catch (error) {
    console.error('Error in createSupportTicket:', error);
    throw error;
  }
}

/**
 * Get support ticket by ID
 * @param {string} id - Ticket ID
 * @returns {Promise<Object>} Support ticket data
 */
export async function getSupportTicketById(id) {
  try {
    const responseData = await useGetApi(supportTicketRoutes.getById(id), true);
    return responseData;
  } catch (error) {
    console.error('Error in getSupportTicketById:', error);
    throw error;
  }
}

/**
 * Upload multiple media files for a support ticket
 * @param {string} ticketId - Ticket ID
 * @param {File[]} files - Array of files to upload
 * @returns {Promise<Object>} Upload response
 */
export async function uploadSupportTicketMedia(ticketId, files) {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };

    const response = await apiClient.post(
      supportTicketRoutes.uploadMultipleMedia(ticketId),
      formData,
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error in uploadSupportTicketMedia:', error);
    throw error;
  }
}

