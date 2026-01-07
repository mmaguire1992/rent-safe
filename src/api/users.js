/**
 * User API Functions
 * API calls for user profile management
 */

import apiClient from './apiClient';

/**
 * Get current user profile
 * Fetches complete user profile including userInfo (address, name, profilePicture, etc.)
 * @returns {Promise<Object>} - Complete user profile data with userInfo
 * @returns {Promise<Object.id>} - User ID
 * @returns {Promise<Object.firstName>} - User first name
 * @returns {Promise<Object.lastName>} - User last name
 * @returns {Promise<Object.email>} - User email
 * @returns {Promise<Object.phone>} - User phone number
 * @returns {Promise<Object.userType>} - User type (owner, renter, admin)
 * @returns {Promise<Object.isEmailVerified>} - Email verification status
 * @returns {Promise<Object.userInfo>} - Complete userInfo object with name, address, profilePicture, etc.
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    const userData = response.data?.data || response.data;
    
    // Ensure we have the complete profile structure
    if (!userData) {
      throw new Error('No user data received from server');
    }
    
    // Log in development to help debug
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ User profile fetched:', {
        id: userData.id,
        email: userData.email,
        hasUserInfo: !!userData.userInfo,
        userInfoKeys: userData.userInfo ? Object.keys(userData.userInfo) : [],
      });
    }
    
    return userData;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Re-throw with more context
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.firstName - First name
 * @param {string} profileData.lastName - Last name
 * @param {Object} profileData.userInfo - User info object (name, address, etc.)
 * @returns {Promise<Object>} - Updated user profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/users/me', profileData);
    const updatedData = response.data?.data || response.data;
    
    // Log in development to help debug
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Profile updated:', {
        id: updatedData?.id,
        hasUserInfo: !!updatedData?.userInfo,
        address: updatedData?.userInfo?.address,
      });
    }
    
    return updatedData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Provide more specific error messages
    if (error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      const errorMessage = validationErrors.map(err => `${err.field}: ${err.message}`).join(', ');
      throw new Error(errorMessage || 'Validation failed');
    }
    throw error;
  }
};

/**
 * Upload profile picture
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} - Upload response with image URL
 */
export const uploadProfilePicture = async (file) => {
  try {
    // Validate file before proceeding
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Check if it's actually a File object, not a blob URL string
    if (typeof file === 'string') {
      if (file.startsWith('blob:')) {
        throw new Error('Invalid file: received blob URL instead of File object. Please select the file again.');
      } else {
        throw new Error('Invalid file: received string instead of File object. Please select the file again.');
      }
    }
    
    if (!(file instanceof File) && !(file instanceof Blob)) {
      throw new Error('Invalid file: must be a File object');
    }
    
    const formData = new FormData();
    // Backend expects field name to be 'profileImage' (not 'file')
    formData.append('profileImage', file);
    
    const response = await apiClient.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Delete profile picture
 * @returns {Promise<Object>} - Delete response
 */
export const deleteProfilePicture = async () => {
  try {
    const response = await apiClient.delete('/users/profile-picture');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw error;
  }
};

/**
 * Change password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.email - User email
 * @param {string} passwordData.oldPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} - Success response
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.post('/auth/update-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Request phone update (send OTP)
 * @param {string} phone - New phone number
 * @returns {Promise<Object>} - Success response
 */
export const requestPhoneUpdate = async (phone) => {
  try {
    const response = await apiClient.post('/users/me/phone/request', { phone });
    return response.data;
  } catch (error) {
    console.error('Error requesting phone update:', error);
    throw error;
  }
};

/**
 * Verify phone update (verify OTP)
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} - Success response with updated phone
 */
export const verifyPhoneUpdate = async (otp) => {
  try {
    const response = await apiClient.post('/users/me/phone/verify', { otp });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error verifying phone update:', error);
    throw error;
  }
};

/**
 * Get user by ID (Owner/Admin only)
 * Fetches complete user profile including userInfo
 * @param {string} userId - User ID to fetch
 * @returns {Promise<Object>} - Complete user profile data with userInfo
 */
export const getUserById = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const response = await apiClient.get(`/users/${userId}`);
    const userData = response.data?.data || response.data;
    return userData;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

/**
 * Delete user account
 * Note: This endpoint may not exist yet, but we'll prepare for it
 * @returns {Promise<Object>} - Success response
 */
export const deleteAccount = async () => {
  try {
    // If delete endpoint exists, use it. Otherwise, we might need to soft-delete via update
    const response = await apiClient.delete('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

