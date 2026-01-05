/**
 * Wishlist API Functions
 * All wishlist-related API calls
 */
import { useGetApi, usePostApi, useDeleteApi } from './apiClient';
import { wishlists as wishlistRoutes } from './routes';

/**
 * Add property to wishlist
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} Wishlist entry
 */
export async function addToWishlist(propertyId) {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const responseData = await usePostApi(
      wishlistRoutes.addToWishlist,
      true, // Requires authentication
      { propertyId }
    );

    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }

    throw new Error(responseData?.message || 'Failed to add property to wishlist');
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
}

/**
 * Remove property from wishlist
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} Success message
 */
export async function removeFromWishlist(propertyId) {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const responseData = await useDeleteApi(
      wishlistRoutes.removeFromWishlist(propertyId),
      true // Requires authentication
    );

    if (responseData && responseData.success) {
      return responseData.data;
    }

    throw new Error(responseData?.message || 'Failed to remove property from wishlist');
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
}

/**
 * Get user's wishlist
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} Wishlist with properties
 */
export async function getUserWishlist(params = {}) {
  try {
    const { page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);

    const responseData = await useGetApi(
      `${wishlistRoutes.getUserWishlist}?${queryParams.toString()}`,
      true // Requires authentication
    );

    if (responseData && responseData.success && responseData.data) {
      const { properties = [], total = 0, page: responsePage = page, limit: responseLimit = limit, totalPages = 0 } = responseData.data;
      return {
        properties: Array.isArray(properties) ? properties : [],
        total: total || 0,
        page: responsePage,
        limit: responseLimit,
        totalPages: totalPages || Math.ceil(total / responseLimit),
      };
    }

    throw new Error(responseData?.message || 'Failed to get wishlist');
  } catch (error) {
    console.error('Error getting wishlist:', error);
    throw error;
  }
}

/**
 * Check if property is in wishlist
 * @param {string} propertyId - Property ID
 * @returns {Promise<boolean>} True if property is in wishlist
 */
export async function checkWishlist(propertyId) {
  try {
    if (!propertyId) {
      return false;
    }

    const responseData = await useGetApi(
      wishlistRoutes.checkWishlist(propertyId),
      true // Requires authentication
    );

    if (responseData && responseData.success && responseData.data) {
      return responseData.data.isInWishlist || false;
    }

    return false;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
}

/**
 * Get user's wishlist property IDs (for checking favorites)
 * @returns {Promise<Array>} Array of property IDs
 */
export async function getWishlistPropertyIds() {
  try {
    const responseData = await useGetApi(
      wishlistRoutes.getWishlistPropertyIds,
      true // Requires authentication
    );

    if (responseData && responseData.success && responseData.data) {
      return responseData.data.propertyIds || [];
    }

    return [];
  } catch (error) {
    console.error('Error getting wishlist property IDs:', error);
    return [];
  }
}

