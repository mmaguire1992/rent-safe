/**
 * Dashboard API Functions
 * API calls for dashboard statistics
 */

import { useGetApi } from './apiClient';
import { dashboard as dashboardRoutes } from './routes';

/**
 * Get owner dashboard statistics
 * @returns {Promise<Object>} - Owner dashboard statistics
 */
export async function getOwnerDashboardStats() {
  try {
    const response = await useGetApi(dashboardRoutes.getOwnerStats, true);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Error getting owner dashboard stats:', error);
    throw error;
  }
}

