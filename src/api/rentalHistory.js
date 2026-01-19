/**
 * Rental History API Functions
 * All rental history related API calls
 */
import { useGetApi, usePostApi } from './apiClient';
import apiClient from './apiClient';

/**
 * Find renter by email
 * @param {string} email - Renter's email address
 * @returns {Promise<Object>} Renter details
 */
export async function findRenterByEmail(email) {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const responseData = await useGetApi(
      `/rental-history/find-renter?email=${encodeURIComponent(email)}`,
      true // Requires authentication
    );

    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }

    throw new Error('Renter not found');
  } catch (error) {
    console.error('Error in findRenterByEmail:', error);
    throw error;
  }
}

/**
 * Create rental history entry
 * @param {Object} rentalData - Rental history data
 * @param {string} rentalData.propertyId - Property ID
 * @param {string} rentalData.renterEmail - Renter's email address
 * @param {string} rentalData.rentedFrom - Date from when renter started renting (ISO string)
 * @returns {Promise<Object>} Created rental history entry
 */
export async function createRentalHistory(rentalData) {
  try {
    const { propertyId, renterEmail, rentedFrom } = rentalData;

    if (!propertyId || !renterEmail || !rentedFrom) {
      throw new Error('Property ID, renter email, and rented from date are required');
    }

    const responseData = await usePostApi(
      '/rental-history',
      true, // Requires authentication
      {
        propertyId,
        renterEmail,
        rentedFrom,
      }
    );

    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }

    return responseData;
  } catch (error) {
    console.error('Error in createRentalHistory:', error);
    throw error;
  }
}

/**
 * Get all rental history entries for the authenticated owner
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Rental history entries with pagination
 */
export async function getAllRentalHistory(params = {}) {
  try {
    const { page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams();

    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);

    const responseData = await useGetApi(
      `/rental-history?${queryParams.toString()}`,
      true // Requires authentication
    );

    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }

    return {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  } catch (error) {
    console.error('Error in getAllRentalHistory:', error);
    throw error;
  }
}

/**
 * Get rental history by ID
 * @param {string} id - Rental history ID
 * @returns {Promise<Object>} Rental history entry
 */
export async function getRentalHistoryById(id) {
  try {
    if (!id) {
      throw new Error('Rental history ID is required');
    }

    const responseData = await useGetApi(
      `/rental-history/${id}`,
      true // Requires authentication
    );

    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }

    return responseData;
  } catch (error) {
    console.error('Error in getRentalHistoryById:', error);
    throw error;
  }
}
