/**
 * Authentication API Functions
 * API calls for user authentication
 * 
 * @module api/auth
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Handle API response and extract data or throw error
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} - Parsed JSON response
 * @throws {Error} - If response is not ok or invalid
 */
const handleApiResponse = async (response) => {
  let data;
  
  try {
    data = await response.json();
  } catch (parseError) {
    console.error('Failed to parse response:', parseError);
    throw new Error('Invalid response from server. Please try again.');
  }

  // Handle error responses
  if (!response.ok) {
    const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  // Validate success response structure
  if (!data.success) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
};

/**
 * Login user
 * 
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email address
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} - Login response with user data and token
 * @returns {Promise<Object.user>} - User object containing id, firstName, lastName, email, userType, isEmailVerified
 * @returns {Promise<Object.token>} - JWT authentication token
 * 
 * @throws {Error} - If login fails (invalid credentials, network error, etc.)
 * 
 * @example
 * ```javascript
 * try {
 *   const { user, token } = await loginUser({
 *     email: 'user@example.com',
 *     password: 'password123'
 *   });
 *   console.log('Logged in:', user);
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 * ```
 */
export const loginUser = async (credentials) => {
  // Validate input
  if (!credentials || !credentials.email || !credentials.password) {
    throw new Error('Email and password are required');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    });

    const data = await handleApiResponse(response);

    // Validate response structure
    if (!data.data || !data.data.user || !data.data.token) {
      throw new Error('Invalid response structure from server');
    }

    // Return normalized user data
      return {
      user: {
        id: data.data.user.id,
        firstName: data.data.user.firstName,
        lastName: data.data.user.lastName,
        email: data.data.user.email,
        userType: data.data.user.userType,
        isEmailVerified: data.data.user.isEmailVerified,
      },
        token: data.data.token,
      };
  } catch (error) {
    // Re-throw with better error messages
    if (error.message) {
    throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    // Generic error fallback
    console.error('Login API error:', error);
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};

/**
 * Signup user
 * 
 * @param {Object} userData - User signup data
 * @param {string} userData.firstName - User first name
 * @param {string} userData.lastName - User last name
 * @param {string} userData.email - User email address
 * @param {string} userData.password - User password
 * @param {string} userData.userType - User type ('renter' or 'owner')
 * @param {string} [userData.phone] - User phone number (optional)
 * @returns {Promise<Object>} - Signup response with user data and token
 * 
 * @throws {Error} - If signup fails
 */
export const signupUser = async (userData) => {
  // Validate required fields
  if (!userData || !userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.userType) {
    throw new Error('First name, last name, email, password, and user type are required');
  }

  try {
    // Build request body with all fields
    const requestBody = {
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      userType: userData.userType,
    };
    
    // Add optional fields only if they exist and have values
    if (userData.phone) requestBody.phone = userData.phone;
    if (userData.address) requestBody.address = userData.address;
    if (userData.city) requestBody.city = userData.city;
    if (userData.state) requestBody.state = userData.state;
    if (userData.country) requestBody.country = userData.country;
    if (userData.postalCode) requestBody.postalCode = userData.postalCode;
    if (userData.occupation) requestBody.occupation = userData.occupation;
    if (userData.monthlyIncome !== undefined && userData.monthlyIncome !== null && userData.monthlyIncome !== '') {
      requestBody.monthlyIncome = userData.monthlyIncome;
    }
    if (userData.description) requestBody.description = userData.description;
    
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await handleApiResponse(response);

    // Validate response structure
    if (!data.data || !data.data.user || !data.data.token) {
      throw new Error('Invalid response structure from server');
    }

    return {
      user: {
        id: data.data.user.id,
        firstName: data.data.user.firstName,
        lastName: data.data.user.lastName,
        email: data.data.user.email,
        userType: data.data.user.userType,
        isEmailVerified: data.data.user.isEmailVerified,
      },
      token: data.data.token,
      message: data.message || 'User registered successfully. Please verify your email with the OTP sent.',
    };
  } catch (error) {
    // Extract validation errors if present (for fetch API, errors are in error.data)
    if (error.data?.errors && Array.isArray(error.data.errors)) {
      const validationError = new Error(error.data.error || error.message || 'Validation failed');
      validationError.validationErrors = error.data.errors;
      validationError.data = error.data;
      throw validationError;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    console.error('Signup API error:', error);
    throw error;
  }
};

/**
 * Verify OTP for email verification
 * 
 * @param {string} email - User email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<Object>} - Verification response
 * 
 * @throws {Error} - If verification fails
 */
export const verifyOTP = async (email, otp) => {
  if (!email || !otp) {
    throw new Error('Email and OTP are required');
  }

  if (!/^\d{6}$/.test(otp)) {
    throw new Error('OTP must be a 6-digit number');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp: otp,
      }),
    });

    const data = await handleApiResponse(response);

    return {
      success: true,
      message: data.message || 'Email verified successfully',
    };
  } catch (error) {
    if (error.message) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    console.error('Verify OTP API error:', error);
    throw new Error(error.message || 'OTP verification failed. Please try again.');
  }
};

/**
 * Resend OTP for email verification
 * 
 * @param {string} email - User email address
 * @returns {Promise<Object>} - Resend response
 * 
 * @throws {Error} - If resend fails
 */
export const resendOTP = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
      }),
    });

    const data = await handleApiResponse(response);

    return {
      success: true,
      message: data.message || 'OTP has been resent to your email',
    };
  } catch (error) {
    if (error.message) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    console.error('Resend OTP API error:', error);
    throw new Error(error.message || 'Failed to resend OTP. Please try again.');
  }
};

/**
 * Forgot Password - Request password reset OTP
 * 
 * @param {string} email - User email address
 * @returns {Promise<Object>} - Forgot password response
 * 
 * @throws {Error} - If request fails
 */
export const forgotPassword = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
      }),
    });

    const data = await handleApiResponse(response);

    return {
      success: true,
      message: data.message || 'Password reset OTP has been sent to your email',
    };
  } catch (error) {
    if (error.message) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    console.error('Forgot password API error:', error);
    throw new Error(error.message || 'Failed to send password reset OTP. Please try again.');
  }
};

/**
 * Reset Password - Reset password using OTP
 * 
 * @param {string} email - User email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} password - New password
 * @returns {Promise<Object>} - Reset password response
 * 
 * @throws {Error} - If reset fails
 */
/**
 * Verify Password Reset OTP - Verify password reset OTP before allowing password reset
 * 
 * @param {string} email - User email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<Object>} - Verification response
 * 
 * @throws {Error} - If verification fails
 */
export const verifyPasswordResetOTP = async (email, otp) => {
  if (!email || !otp) {
    throw new Error('Email and OTP are required');
  }

  if (!/^\d{6}$/.test(otp)) {
    throw new Error('OTP must be a 6-digit number');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-password-reset-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp: otp,
      }),
    });

    const data = await handleApiResponse(response);

    return {
      success: true,
      message: data.message || 'OTP verified successfully',
    };
  } catch (error) {
    if (error.message) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    console.error('Verify password reset OTP API error:', error);
    throw new Error(error.message || 'Failed to verify OTP. Please try again.');
  }
};

export const resetPassword = async (email, otp, password) => {
  if (!email || !otp || !password) {
    throw new Error('Email, OTP, and password are required');
  }

  if (!/^\d{6}$/.test(otp)) {
    throw new Error('OTP must be a 6-digit number');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp: otp,
        password: password,
      }),
    });

    const data = await handleApiResponse(response);

    return {
      success: true,
      message: data.message || 'Password reset successfully',
    };
  } catch (error) {
    if (error.message) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    console.error('Reset password API error:', error);
    throw new Error(error.message || 'Failed to reset password. Please try again.');
  }
};

