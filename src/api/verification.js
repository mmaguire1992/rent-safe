/**
 * API functions for verification documents
 */
import apiClient from './apiClient';
import { verification } from './routes';

/**
 * Upload documents to S3
 * @param {FormData} formData - FormData with document files
 * @returns {Promise<Object>} Upload results with S3 URLs
 */
export const uploadDocumentsToS3 = async (formData) => {
  try {
    // Don't set Content-Type header - let axios set it automatically with boundary
    // Setting it manually can cause issues with multipart/form-data (missing boundary)
    const response = await apiClient.post(verification.uploadToS3, formData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error uploading documents to S3:', error);
    throw error;
  }
};

/**
 * Store document metadata in database
 * @param {Array} documents - Array of document objects with fileUrl, docType, fileType, mime, metaData
 * @returns {Promise<Object>} Stored documents
 */
export const storeDocuments = async (documents) => {
  try {
    const response = await apiClient.post(verification.storeDocument, {
      documents,
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error storing documents:', error);
    throw error;
  }
};

/**
 * Get current user's documents
 * @returns {Promise<Object>} User documents grouped by type
 */
export const getMyDocuments = async () => {
  try {
    const response = await apiClient.get(verification.getMyDocuments);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching my documents:', error);
    throw error;
  }
};

/**
 * Download document by ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Blob>} Document file
 */
export const downloadDocument = async (documentId) => {
  try {
    const response = await apiClient.get(verification.downloadDocument(documentId), {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
};

/**
 * Delete document by ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteDocument = async (documentId) => {
  try {
    const response = await apiClient.delete(verification.deleteDocument(documentId));
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

