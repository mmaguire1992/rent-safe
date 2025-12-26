/**
 * Authentication API Functions
 * API calls for user authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { user, token }
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error response
      const errorMessage = data.message || data.error || 'Login failed';
      throw new Error(errorMessage);
    }

    if (data.success && data.data) {
      return {
        user: data.data.user,
        token: data.data.token,
      };
    }

    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

