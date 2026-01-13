/**
 * Subscription API Functions
 * API calls for subscription and plan management
 */

import apiClient from './apiClient';

/**
 * Get all available subscription plans
 * @returns {Promise<Array>} Array of subscription plans
 */
export const getAllPlans = async () => {
  try {
    const response = await apiClient.get('/stripe/subscriptions/plans');
    // Handle different response structures
    let plans = [];
    if (response.data?.message && Array.isArray(response.data.message)) {
      plans = response.data.message;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      plans = response.data.data;
    } else if (Array.isArray(response.data)) {
      plans = response.data;
    }
    return plans;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

/**
 * Get renter subscription plan (active plan for renter user type)
 * @returns {Promise<Object|null>} Renter subscription plan or null
 */
export const getRenterPlan = async () => {
  try {
    const plans = await getAllPlans();
    // Find the active renter plan
    const renterPlan = plans.find(plan => 
      plan.userType === 'renter' && plan.isActive === true
    );
    return renterPlan || null;
  } catch (error) {
    console.error('Error fetching renter plan:', error);
    throw error;
  }
};
