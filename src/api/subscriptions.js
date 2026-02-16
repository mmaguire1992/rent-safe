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
    if (response.data?.success && response.data?.data && Array.isArray(response.data.data)) {
      plans = response.data.data;
    } else if (response.data?.message && Array.isArray(response.data.message)) {
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
 * Get owner subscription plans (all active plans for owner user type)
 * @returns {Promise<Array>} Array of owner subscription plans
 */
export const getOwnerPlans = async () => {
  try {
    const plans = await getAllPlans();
    // Filter for active owner plans
    const ownerPlans = plans.filter(plan => 
      plan.userType === 'owner' && plan.isActive === true
    );
    // Sort by displayOrder
    return ownerPlans.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    console.error('Error fetching owner plans:', error);
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
    
    // Check if backend returned success: false (payment not found)
    if (response.data?.success === false) {
      return null;
    }
    
    // Backend returns: { success: true, message: { payment data }, data: "message string" }
    const payment = response.data?.message || response.data?.data || response.data;
    
    // Only return payment if it has a valid status (not just an error message)
    if (payment && typeof payment === 'object' && payment.status) {
      return payment;
    }
    
    return null;
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
    // Backend returns: { success: true, message: { subscription data }, data: "message string" }
    const subscription = response.data?.message || response.data?.data || response.data;
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

/**
 * Get user's payment history
 * @param {Object} params - Query parameters (page, limit, paymentType, status, dateFrom, dateTo)
 * @returns {Promise<Object>} Payment history with pagination
 */
export const getPaymentHistory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.paymentType) queryParams.append('paymentType', params.paymentType);
    if (params.status) queryParams.append('status', params.status);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);

    const url = `/stripe/subscriptions/payment-history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    // Backend returns: { success: true, message: { payments: [...], pagination: {...} }, data: "message string" }
    const result = response.data?.message || response.data?.data || response.data;
    return result || { payments: [], pagination: {} };
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

/**
 * Download invoice PDF for a payment
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Blob|string>} Invoice PDF blob or receipt URL
 */
export const downloadInvoice = async (paymentId) => {
  try {
    // Make request without specifying responseType to check content type
    const response = await apiClient.get(`/stripe/subscriptions/invoice/${paymentId}`, {
      responseType: 'arraybuffer', // Use arraybuffer to handle both JSON and binary
    });
    
    const contentType = response.headers['content-type'] || '';
    
    // Check if response is JSON (receipt URL for one-time payments)
    if (contentType.includes('application/json')) {
      const textDecoder = new TextDecoder();
      const jsonText = textDecoder.decode(response.data);
      const jsonData = JSON.parse(jsonText);
      
      if (jsonData.data?.receiptUrl) {
        // Open receipt URL in new tab
        window.open(jsonData.data.receiptUrl, '_blank');
        return jsonData.data.receiptUrl;
      }
    }
    
    // Otherwise, it's a PDF - create blob and download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${paymentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return blob;
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};
