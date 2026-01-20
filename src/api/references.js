/**
 * References API Functions
 * Owner references/feedback related API calls
 */
import { useGetApi, usePostApi } from './apiClient';

/**
 * Get all owner references for a property
 * @param {string} propertyId - Property ID
 * @returns {Promise<Array>} List of references
 */
export async function getPropertyReferences(propertyId) {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    // Shared endpoint for owner + admin.
    // Owner will only see their references; admin would see all.
    const queryParams = new URLSearchParams({
      page: '1',
      limit: '100',
      propertyId: String(propertyId),
    });

    const responseData = await useGetApi(`/references?${queryParams.toString()}`, true);

    if (responseData?.success && responseData?.data?.references) {
      return responseData.data.references;
    }

    return responseData?.data || [];
  } catch (error) {
    console.error('Error in getPropertyReferences:', error);
    throw error;
  }
}

/**
 * Create owner reference/feedback about renter
 * @param {Object} referenceData - Reference data
 * @param {string} referenceData.rentalHistoryId - Rental history ID
 * @param {string} referenceData.referenceText - Reference text (max 200 characters)
 * @returns {Promise<Object>} Created reference
 */
export async function createOwnerReference(referenceData) {
  try {
    const { rentalHistoryId, referenceText } = referenceData;

    if (!rentalHistoryId || !referenceText) {
      throw new Error('Rental history ID and reference text are required');
    }

    // Disallow leading spaces (UX requirement)
    if (/^\s/.test(referenceText)) {
      throw new Error('Reference cannot start with a space');
    }

    // Max 200 characters, not counting spaces
    const nonSpaceCount = String(referenceText).replace(/\s/g, '').length;
    if (nonSpaceCount > 200) {
      throw new Error('Reference must be 200 characters or less (spaces not counted)');
    }

    const responseData = await usePostApi(
      '/references',
      true, // Requires authentication
      {
        rentalHistoryId,
        referenceText: String(referenceText).trim(),
      }
    );

    if (responseData && responseData.success && responseData.data) {
      return responseData.data;
    }

    throw new Error(responseData?.message || 'Failed to create reference');
  } catch (error) {
    console.error('Error in createOwnerReference:', error);
    throw error;
  }
}
