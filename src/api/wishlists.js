/**
 * Wishlist API Functions
 * All wishlist-related API calls
 */
import { useGetApi, usePostApi, useDeleteApi } from './apiClient';
import { wishlists as wishlistRoutes } from './routes';

const normalizePropertyId = (value) => {
  if (value === undefined || value === null) return null;
  const str = String(value);
  if (!str || str === 'undefined' || str === 'null' || str === '[object Object]') return null;
  return str;
};

/**
 * Add property to wishlist
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} Wishlist entry
 */
export async function addToWishlist(propertyId) {
  let normalizedPropertyId = null;
  try {
    normalizedPropertyId = normalizePropertyId(propertyId);
    if (!normalizedPropertyId) {
      throw new Error('Property ID is required');
    }

    const responseData = await usePostApi(
      wishlistRoutes.addToWishlist,
      true, // Requires authentication
      { propertyId: normalizedPropertyId },
      { silent: true }
    );

    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }

    // Some backends return HTTP 200 with success:false and an `error` field.
    // Treat "already in wishlist" as a no-op success to make this idempotent.
    const backendMessage = String(responseData?.message || responseData?.error || '').toLowerCase();
    if (
      responseData &&
      responseData.success === false &&
      (backendMessage.includes('already') ||
        backendMessage.includes('exists') ||
        backendMessage.includes('duplicate'))
    ) {
      return { propertyId: normalizedPropertyId };
    }

    throw new Error(responseData?.message || responseData?.error || 'Failed to add property to wishlist');
  } catch (error) {
    // Make this call idempotent for rapid UI toggles:
    // If the backend says it's already in the wishlist, treat it as success.
    const status = error?.response?.status;
    const msg = String(error?.response?.data?.message || error?.message || '').toLowerCase();
    if (status === 409 || msg.includes('already') || msg.includes('exists') || msg.includes('duplicate')) {
      return { propertyId: normalizedPropertyId || String(propertyId) };
    }

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
  let normalizedPropertyId = null;
  try {
    normalizedPropertyId = normalizePropertyId(propertyId);
    if (!normalizedPropertyId) {
      throw new Error('Property ID is required');
    }

    const responseData = await useDeleteApi(
      wishlistRoutes.removeFromWishlist(normalizedPropertyId),
      true, // Requires authentication
      { silent: true }
    );

    if (responseData && responseData.success) {
      return responseData.data;
    }

    // Some backends return HTTP 200 with success:false and an `error` field.
    // Treat "not in wishlist" as a no-op success to make this idempotent.
    const backendMessage = String(responseData?.message || responseData?.error || '').toLowerCase();
    if (
      responseData &&
      responseData.success === false &&
      (backendMessage.includes('not in your wishlist') ||
        backendMessage.includes('not in wishlist') ||
        backendMessage.includes('not found') ||
        backendMessage.includes('does not exist'))
    ) {
      return { propertyId: normalizedPropertyId };
    }

    throw new Error(responseData?.message || responseData?.error || 'Failed to remove property from wishlist');
  } catch (error) {
    // Make this call idempotent for rapid UI toggles:
    // If the backend says it's not found / not in wishlist, treat it as success.
    const status = error?.response?.status;
    const msg = String(error?.response?.data?.message || error?.message || '').toLowerCase();
    if (status === 404 || msg.includes('not found') || msg.includes('does not exist') || msg.includes('not in wishlist')) {
      return { propertyId: normalizedPropertyId || String(propertyId) };
    }

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
    const normalizedPropertyId = normalizePropertyId(propertyId);
    if (!normalizedPropertyId) {
      return false;
    }

    const responseData = await useGetApi(
      wishlistRoutes.checkWishlist(normalizedPropertyId),
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

