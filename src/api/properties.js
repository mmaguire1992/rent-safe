/**
 * Properties API Functions
 * All property-related API calls
 */
import { useGetApi, usePostApi, usePutApi, useDeleteApi } from './apiClient';
import apiClient from './apiClient';
import { properties as propertyRoutes } from './routes';

/**
 * Get all properties (public or filtered)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {string} params.status - Filter by status
 * @param {string} params.city - Filter by city
 * @param {string} params.propertyType - Filter by property type
 * @returns {Promise<Object>} - Properties data with pagination
 */
/**
 * Get properties by city
 * @param {string} city - City name
 * @param {Object} params - Query parameters (page, limit, status)
 * @returns {Promise<Object>} - Properties with pagination
 */
export async function getPropertiesByCity(city, params = {}) {
  try {
    if (!city) {
      throw new Error('City name is required');
    }
    
    const { page = 1, limit = 10, status = 'active' } = params;
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (status) queryParams.append('status', status);
    
    const responseData = await useGetApi(
      `${propertyRoutes.getPropertiesByCity(city)}?${queryParams.toString()}`,
      false // Public route
    );
    
    if (responseData && responseData.success && responseData.data) {
      const { properties = [], count = 0, total = 0 } = responseData.data;
      return {
        properties: Array.isArray(properties) ? properties : [],
        total: count || total || 0,
        page: responseData.data.page || page,
        limit: responseData.data.limit || limit,
        totalPages: responseData.data.totalPages || Math.ceil((count || total || 0) / limit),
      };
    }
    
    return {
      properties: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  } catch (error) {
    console.error('Error in getPropertiesByCity:', error);
    throw error;
  }
}

/**
 * Get city property counts
 * @returns {Promise<Array>} - Array of cities with property counts
 */
export async function getCityPropertyCounts() {
  try {
    const responseData = await useGetApi(
      propertyRoutes.getCityPropertyCounts,
      false // Public route
    );
    
    if (responseData && responseData.success && responseData.data) {
      return responseData.data.cities || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error in getCityPropertyCounts:', error);
    throw error;
  }
}

/**
 * Get recent active properties for landing page
 * @param {number} limit - Number of properties to return (default: 6)
 * @returns {Promise<Array>} - Array of recent active properties
 */
export async function getRecentActiveProperties(limit = 6) {
  try {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit);
    
    const response = await apiClient.get(
      `${propertyRoutes.getRecentActiveProperties}?${queryParams.toString()}`
    );
    
    // Handle response structure
    const responseData = response.data?.data || response.data;
    const properties = responseData?.properties || [];
    
    return properties;
  } catch (error) {
    console.error('Error fetching recent active properties:', error);
    throw error;
  }
}

export async function getAllProperties(params = {}) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      city = '', 
      propertyType = '',
      bedrooms = '',
      priceMin = '',
      priceMax = '',
      amenities = '',
    } = params;
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (city) queryParams.append('city', city);
    if (propertyType && propertyType !== 'all') queryParams.append('propertyType', propertyType);
    if (bedrooms && bedrooms !== 'all') queryParams.append('bedrooms', bedrooms);
    if (priceMin) queryParams.append('priceMin', priceMin);
    if (priceMax) queryParams.append('priceMax', priceMax);
    if (amenities) queryParams.append('amenities', amenities);
    
    const responseData = await useGetApi(
      `${propertyRoutes.getAllProperties}?${queryParams.toString()}`,
      false // Public route, no auth required
    );
    
    // Handle different response structures
    if (responseData && responseData.success && responseData.data) {
      const { properties = [], count = 0, total = 0 } = responseData.data;
      return {
        properties: Array.isArray(properties) ? properties : [],
        total: count || total || 0,
        page: responseData.data.page || page,
        limit: responseData.data.limit || limit,
        totalPages: responseData.data.totalPages || Math.ceil((count || total || 0) / limit),
      };
    }
    
    // Fallback if response structure is different
    if (Array.isArray(responseData)) {
      return {
        properties: responseData,
        total: responseData.length,
        page: 1,
        limit: responseData.length,
        totalPages: 1,
      };
    }
    
    return {
      properties: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  } catch (error) {
    console.error('Error in getAllProperties:', error);
    throw error;
  }
}

/**
 * Get my properties (authenticated user's properties)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - User's properties with pagination
 */
export async function getMyProperties(params = {}) {
  try {
    const { page = 1, limit = 10, search = '', status = '', propertyType = '', sortBy = 'recent' } = params;
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search && search.trim()) queryParams.append('search', search.trim());
    if (status && status !== 'all') queryParams.append('status', status);
    if (propertyType && propertyType !== 'all') queryParams.append('propertyType', propertyType);
    if (sortBy) queryParams.append('sortBy', sortBy);
    
    const responseData = await useGetApi(
      `${propertyRoutes.getMyProperties}?${queryParams.toString()}`,
      true // Requires authentication
    );
    
    if (responseData && responseData.success && responseData.data) {
      const { properties = [], count = 0, total = 0 } = responseData.data;
      return {
        properties: Array.isArray(properties) ? properties : [],
        total: count || total || 0,
        page: responseData.data.page || page,
        limit: responseData.data.limit || limit,
        totalPages: responseData.data.totalPages || Math.ceil((count || total || 0) / limit),
      };
    }
    
    return {
      properties: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  } catch (error) {
    console.error('Error in getMyProperties:', error);
    throw error;
  }
}

/**
 * Get my active properties (for dashboard)
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} - User's active properties with pagination
 */
export async function getMyActiveProperties(params = {}) {
  try {
    const { page = 1, limit = 10, sortBy, sortOrder } = params;
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);
    
    const responseData = await useGetApi(
      `${propertyRoutes.getMyActiveProperties}?${queryParams.toString()}`,
      true // Requires authentication
    );
    
    // Handle response structure
    if (responseData?.data) {
      const { properties, count, total, page: responsePage, limit: responseLimit, totalPages } = responseData.data;
      return {
        properties: Array.isArray(properties) ? properties : [],
        total: count || total || 0,
        page: responsePage || page,
        limit: responseLimit || limit,
        totalPages: totalPages || Math.ceil((count || total || 0) / limit),
      };
    }
    
    // Fallback if response structure is different
    if (Array.isArray(responseData)) {
      return {
        properties: responseData,
        total: responseData.length,
        page: 1,
        limit: responseData.length,
        totalPages: 1,
      };
    }
    
    return {
      properties: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  } catch (error) {
    console.error('Error in getMyActiveProperties:', error);
    throw error;
  }
}

/**
 * Get property by ID
 * @param {string} id - Property ID
 * @returns {Promise<Object>} - Property data
 */
export async function getPropertyById(id, requireAuth = false) {
  try {
    if (!id) {
      throw new Error('Property ID is required');
    }
    
    const responseData = await useGetApi(propertyRoutes.getPropertyById(id), requireAuth);
    
    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }
    
    // Fallback if response structure is different
    if (responseData && !responseData.success) {
      return responseData;
    }
    
    // If responseData is the property object directly
    if (responseData && (responseData._id || responseData.id)) {
      return responseData;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    throw error;
  }
}

/**
 * Create a new property
 * @param {Object} propertyData - Property data
 * @returns {Promise<Object>} - Created property data
 */
export async function createProperty(propertyData) {
  try {
    // Normalize furnished values (UI sometimes uses "semi-furnished")
    const normalizedData =
      propertyData && typeof propertyData === 'object'
        ? {
            ...propertyData,
            furnished:
              propertyData.furnished === 'semi-furnished'
                ? 'partially_furnished'
                : propertyData.furnished,
          }
        : propertyData;

    const responseData = await usePostApi(propertyRoutes.createProperty, true, normalizedData);
    
    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData;
  } catch (error) {
    console.error('Error in createProperty:', error);
    throw error;
  }
}

/**
 * Update an existing property
 * @param {string} id - Property ID
 * @param {Object} propertyData - Updated property data
 * @returns {Promise<Object>} - Updated property data
 */
export async function updateProperty(id, propertyData) {
  try {
    if (!id) {
      throw new Error('Property ID is required');
    }
    
    // Normalize furnished values (UI sometimes uses "semi-furnished")
    const normalizedData =
      propertyData && typeof propertyData === 'object'
        ? {
            ...propertyData,
            furnished:
              propertyData.furnished === 'semi-furnished'
                ? 'partially_furnished'
                : propertyData.furnished,
          }
        : propertyData;

    const responseData = await usePutApi(propertyRoutes.updateProperty(id), true, normalizedData);
    
    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData;
  } catch (error) {
    console.error('Error in updateProperty:', error);
    throw error;
  }
}

/**
 * Delete a property
 * @param {string} id - Property ID
 * @returns {Promise<Object>} - Deletion response
 */
export async function deleteProperty(id) {
  try {
    if (!id) {
      throw new Error('Property ID is required');
    }
    
    const responseData = await useDeleteApi(propertyRoutes.deleteProperty(id), true);
    
    if (responseData && responseData.success) {
      return responseData;
    }
    if (response.data?.success === false) {
    throw new Error(response.data.error || "Failed to delete property");
  }
    return responseData;
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    throw error;
  }
}

/**
 * Upload multiple property media files
 * @param {string} propertyId - Property ID
 * @param {FormData} formData - FormData containing files and metadata
 * @returns {Promise<Object>} - Upload response
 */
export async function uploadMultiplePropertyMedia(propertyId, formData) {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    if (!token) {
      throw new Error('Authentication token is required');
    }

    const response = await apiClient.post(
      propertyRoutes.uploadMultiplePropertyMedia(propertyId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error in uploadMultiplePropertyMedia:', error);
    throw error;
  }
}

/**
 * Delete property media
 * @param {string} propertyId - Property ID
 * @param {string} mediaId - Media ID
 * @returns {Promise<Object>} - Deletion response
 */
export async function deletePropertyMedia(propertyId, mediaId) {
  try {
    if (!propertyId || !mediaId) {
      throw new Error('Property ID and Media ID are required');
    }

    const responseData = await useDeleteApi(propertyRoutes.deletePropertyMedia(propertyId, mediaId), true);

    if (responseData && responseData.success) {
      return responseData;
    }

    return responseData;
  } catch (error) {
    console.error('Error in deletePropertyMedia:', error);
    throw error;
  }
}

/**
 * Approve property (Admin only)
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} - Updated property data
 */
export async function approveProperty(propertyId) {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const responseData = await usePutApi(`/properties/${propertyId}/approve`, true);

    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }

    return responseData;
  } catch (error) {
    console.error('Error in approveProperty:', error);
    throw error;
  }
}

/**
 * Reject property (Admin only)
 * @param {string} propertyId - Property ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} - Updated property data
 */
export async function rejectProperty(propertyId, reason) {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    if (!reason || !reason.trim()) {
      throw new Error('Rejection reason is required');
    }

    const responseData = await usePutApi(`/properties/${propertyId}/reject`, true, { reason: reason.trim() });

    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }

    return responseData;
  } catch (error) {
    console.error('Error in rejectProperty:', error);
    throw error;
  }
}


/**
 * Record a property view
 * @param {string} propertyId - The property ID
 * @param {string} [userId] - Optional: authenticated user ID
 * @returns {Promise<Object>} - API response
 */
export async function recordPropertyView(propertyId, userId = null) {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const payload = {
      property_id: propertyId,
      ...(userId && { user_id: userId }),  
    };

    // Use public route → no auth required
    const response = await usePostApi(
      propertyRoutes.recordPropertyView,   
      false,                             
      payload
    );

    return response;
  } catch (error) {
    console.error('Error recording property view:', error);
    return null;
  }
}