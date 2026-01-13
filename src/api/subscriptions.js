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

/**
 * Create Stripe checkout session
 * @param {string} planKey - Plan key (basic, standard, premium)
 * @param {string} userType - User type (owner/renter)
 * @param {string} successUrl - URL to redirect after successful payment
 * @param {string} cancelUrl - URL to redirect if user cancels
 * @returns {Promise<Object>} Checkout session with sessionId and url
 */
export const createCheckoutSession = async (planKey, userType, successUrl, cancelUrl) => {
  try {
    const response = await apiClient.post('/stripe/subscriptions/checkout', {
      planKey,
      userType,
      successUrl,
      cancelUrl,
    });
    
    // Handle different response structures
    // Backend returns: { success: true, message: { url, sessionId, customerId }, data: "..." }
    let result = null;
    if (response.data?.message && typeof response.data.message === 'object') {
      result = response.data.message;
    } else if (response.data?.data && typeof response.data.data === 'object') {
      result = response.data.data;
    } else if (response.data?.url || response.data?.sessionId) {
      result = response.data;
    } else {
      result = response.data;
    }
    
    return result;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Get payment status by checkout session ID
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<Object>} Payment status
 */
export const getPaymentStatus = async (sessionId) => {
  try {
    const response = await apiClient.get(`/stripe/subscriptions/payment-status/${sessionId}`);
    const payment = response.data?.data || response.data;
    return payment;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
};

/**
 * Get user's verification payment (one-time payment for renter verification)
 * @returns {Promise<Object|null>} Verification payment or null if not found
 */
export const getUserVerificationPayment = async () => {
  try {
    const response = await apiClient.get('/stripe/subscriptions/verification-payment');
    const payment = response.data?.data || response.data;
    return payment || null;
  } catch (error) {
    // If 404, user hasn't paid yet - return null
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Get user's current subscription (for owners)
 * @returns {Promise<Object|null>} Current subscription or null if not found
 */
export const getCurrentSubscription = async () => {
  try {
    const response = await apiClient.get('/stripe/subscriptions/current');
    const subscription = response.data?.data || response.data;
    return subscription || null;
  } catch (error) {
    // If 404, user has no subscription - return null
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching current subscription:', error);
    throw error;
  }
};
