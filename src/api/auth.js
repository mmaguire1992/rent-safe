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

