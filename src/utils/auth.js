/**
 * Auth Utility Functions
 * Global functions for authentication and user type-based routing
 */

/**
 * Check if we're on the client side
 */
const isClient = () => typeof window !== 'undefined';

/**
 * Get stored user data from localStorage
 */
export const getUserData = () => {
  if (!isClient()) return null;
  try {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get stored token from localStorage
 */
export const getToken = () => {
  if (!isClient()) return null;
  return localStorage.getItem('userToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  if (!isClient()) return false;
  const token = getToken();
  const userData = getUserData();
  return !!(token && userData);
};

/**
 * Get user type from stored data
 * @returns {string|null} 'owner' | 'renter' | null
 */
export const getUserType = () => {
  const userData = getUserData();
  return userData?.userType || null;
};

/**
 * Global redirect function based on user type
 * Redirects owner to /dashboard and renter to /landing
 * @param {Function} navigate - Navigation function from useNavigate hook
 * @param {string} [currentPath] - Optional current path to avoid unnecessary redirects
 */
export const redirectBasedOnUserType = (navigate, currentPath = null) => {
  if (!isClient()) return; // Don't redirect during SSR
  
  // Ensure currentPath is a string
  const path = typeof currentPath === 'string' ? currentPath : String(currentPath || '');
  
  if (!isAuthenticated()) {
    // Not authenticated - redirect to login
    if (path !== '/login') {
      navigate('/login');
    }
    return;
  }

  // Routes that should be accessible to all authenticated users (no redirect)
  const sharedRoutes = [
    '/profile',
    '/properties',
    '/support',
    '/chat'
  ];
  
  // Check if current path is a shared route or starts with a shared route prefix
  const isSharedRoute = sharedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  ) || path.startsWith('/property/'); // Property detail pages
  
  // Don't redirect from shared routes
  if (isSharedRoute) {
    return;
  }

  const userType = getUserType();
  
  if (userType === 'owner') {
    // Owner should go to dashboard
    if (path !== '/dashboard' && !path.startsWith('/dashboard')) {
      navigate('/dashboard');
    }
  } else if (userType === 'renter') {
    // Renter should go to landing
    if (path !== '/landing' && path !== '/') {
      navigate('/landing');
    }
  } else {
    // Unknown user type - redirect to login
    navigate('/login');
  }
};

/**
 * Check if user can access a route based on user type
 * @param {string} routePath - The route path to check
 * @returns {boolean} - True if user can access the route
 */
export const canAccessRoute = (routePath) => {
  if (!isAuthenticated()) {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/landing', '/', '/forgot-password', '/otp-verification', '/create-password', '/password-success'];
    return publicRoutes.includes(routePath) || routePath.startsWith('/signup');
  }

  const userType = getUserType();
  
  // Owner routes
  if (routePath.startsWith('/dashboard')) {
    return userType === 'owner';
  }
  
  // Renter routes (landing and public routes)
  if (routePath === '/landing' || routePath === '/') {
    return true; // Both can access, but redirect will handle navigation
  }
  
  // Default: allow access if authenticated
  return true;
};

/**
 * Store user data and token after login
 * @param {Object} userData - User data object
 * @param {string} token - JWT token
 */
export const storeAuthData = (userData, token) => {
  if (!isClient()) return;
  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('userToken', token);
};

/**
 * Clear authentication data (logout)
 */
export const clearAuthData = () => {
  if (!isClient()) return;
  localStorage.removeItem('userData');
  localStorage.removeItem('userToken');
};

/**
 * Get user's full name
 * @returns {string} - User's full name or empty string
 */
export const getUserName = () => {
  const userData = getUserData();
  if (!userData) return '';
  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  return `${firstName} ${lastName}`.trim();
};

