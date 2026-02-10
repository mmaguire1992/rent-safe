/**
 * Renter Reviews API Functions
 * API calls for renter reviews/feedback
 */
import { usePostApi, useGetApi } from './apiClient';
import { renterReviews } from './routes';

/**
 * Create a new renter review/feedback
 * @param {Object} reviewData - Review data
 * @param {string} reviewData.propertyName - Property name
 * @param {string} reviewData.feedback - Feedback text
 * @param {string} reviewData.fromDate - From date (YYYY-MM-DD format)
 * @param {string} reviewData.toDate - To date (YYYY-MM-DD format)
 * @returns {Promise<Object>} Created review
 */
export async function createRenterReview(reviewData) {
  try {
    const { propertyName, feedback, fromDate, toDate } = reviewData;

    if (!propertyName || !feedback || !fromDate || !toDate) {
      throw new Error('Property name, feedback, fromDate, and toDate are required');
    }

    console.log('Submitting renter review:', { propertyName, feedback, fromDate, toDate });

    const responseData = await usePostApi(
      renterReviews.create,
      true, // Requires authentication
      {
        propertyName: propertyName.trim(),
        feedback: feedback.trim(),
        fromDate,
        toDate,
      }
    );

    console.log('Renter review API response:', responseData);

    if (responseData && responseData.success) {
      return responseData.data || responseData;
    }

    // If response doesn't have success flag but has data, return it
    if (responseData && responseData.data) {
      return responseData.data;
    }

    throw new Error(responseData?.message || 'Failed to create renter review');
  } catch (error) {
    console.error('Error in createRenterReview:', error);
    // Re-throw with better error structure
    if (error?.response?.data) {
      const apiError = new Error(error.response.data.message || error.response.data.error || 'Failed to create renter review');
      apiError.response = error.response;
      throw apiError;
    }
    throw error;
  }
}

/**
 * Get all renter reviews
 * @param {Object} queryParams - Query parameters (page, limit, userId)
 * @returns {Promise<Object>} Reviews with pagination
 */
export async function getAllRenterReviews(queryParams = {}) {
  try {
    const { page, limit, userId } = queryParams;
    const queryString = new URLSearchParams();
    
    if (page) queryString.append('page', page);
    if (limit) queryString.append('limit', limit);
    if (userId) queryString.append('userId', userId);

    const url = queryString.toString() 
      ? `${renterReviews.getAll}?${queryString.toString()}`
      : renterReviews.getAll;

    const responseData = await useGetApi(url, true); // Requires authentication

    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }

    throw new Error(responseData?.message || 'Failed to get renter reviews');
  } catch (error) {
    console.error('Error in getAllRenterReviews:', error);
    throw error;
  }
}

/**
 * Get renter review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} Review object
 */
export async function getRenterReviewById(reviewId) {
  try {
    if (!reviewId) {
      throw new Error('Review ID is required');
    }

    const responseData = await useGetApi(
      renterReviews.getById(reviewId),
      true // Requires authentication
    );

    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }

    throw new Error(responseData?.message || 'Failed to get renter review');
  } catch (error) {
    console.error('Error in getRenterReviewById:', error);
    throw error;
  }
}
