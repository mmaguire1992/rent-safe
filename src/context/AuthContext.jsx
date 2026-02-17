'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, usePathname } from '@/lib/react-router-compat';
import { 
  getUserData, 
  getToken, 
  isAuthenticated, 
  getUserType,
  storeAuthData,
  clearAuthData,
  redirectBasedOnUserType,
  getUserName
} from '@/utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const pathname = usePathname();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      if (isAuthenticated()) {
        const userData = getUserData();
        const userToken = getToken();
        
        // Just set the user and token - email verification check will happen in route protection
        setUser(userData);
        setToken(userToken);
      }
      setLoading(false);
    };

    initAuth();
  }, []); // Empty dependency array - only run once on mount

  // Handle redirect based on user type when pathname changes
  // Protect ALL routes - user must be authenticated to access any route
  useEffect(() => {
    if (loading) return;
    
    const currentUserType = getUserType();
    const isAuth = isAuthenticated();
    
    // Define public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/landing',
      '/login',
      '/signup',
      '/forgot-password',
      '/otp-verification',
      '/create-password',
      '/password-success',
      '/properties',
      '/support'
    ];
    
    // Ensure pathname is a string
    const currentPath = typeof pathname === 'string' ? pathname : String(pathname || '');
    
    // Check if current route is public (including signup sub-routes and public routes)
    const isPublicRoute = publicRoutes.includes(currentPath) || 
                         currentPath.startsWith('/signup') || 
                         currentPath.startsWith('/properties') ||
                         currentPath.startsWith('/property/') || // Property detail pages (singular)
                         currentPath.startsWith('/support');
    
    // Profile route should be accessible to authenticated users only
    const isProfileRoute = currentPath.startsWith('/profile');
    
    if (!isAuth) {
      // User is NOT authenticated
      // Block access to ALL routes except public auth routes
      // Profile requires authentication
      if (!isPublicRoute && !isProfileRoute) {
        navigate('/login');
        return;
      }
      // If trying to access profile without auth, redirect to login
      if (isProfileRoute) {
        navigate('/login');
        return;
      }
    } else {
      // User IS authenticated
      // Check if email is verified
      const userData = getUserData();
      if (userData && !userData.isEmailVerified) {
        // Email not verified - redirect to OTP verification
        // Only redirect if NOT already on an OTP verification or success page
        const isOTPPage = currentPath.includes('/verify-account') || 
                         currentPath === '/otp-verification' ||
                         currentPath.includes('/signup/') && currentPath.includes('/success');
        
        if (!isOTPPage) {
          const email = userData.email;
          const userType = userData.userType || currentUserType;
          
          if (email && userType) {
            // Store email in localStorage for OTP screen
            localStorage.setItem('signup_email', email);
            
            // Redirect to appropriate OTP verification route
            if (userType === 'owner') {
              navigate('/signup/owner/verify-account', { 
                state: { email, userType },
                replace: true 
              });
            } else if (userType === 'renter') {
              navigate('/signup/renter/verify-account', { 
                state: { email, userType },
                replace: true 
              });
            } else {
              navigate('/otp-verification', { 
                state: { email, userType },
                replace: true 
              });
            }
          }
        }
        return;
      }
      
      // Don't redirect from property detail pages, properties list, support pages, or profile
      const isPropertyOrSupportRoute = currentPath.startsWith('/property/') || 
                                       currentPath.startsWith('/properties') ||
                                       currentPath.startsWith('/support') ||
                                       isProfileRoute;
      
      // Redirect from public auth routes to appropriate dashboard/landing
      // But allow property detail pages, properties list, support, and profile to be accessible
      if (isPublicRoute && !isPropertyOrSupportRoute) {
        redirectBasedOnUserType(navigate, currentPath);
        return;
      }
      
      // Check if user is accessing wrong route (owner on landing, renter on dashboard)
      // But don't redirect from profile page
      if (!isProfileRoute) {
        if (currentUserType === 'owner' && (currentPath === '/landing' || currentPath === '/')) {
        navigate('/dashboard');
        } else if (currentUserType === 'renter' && currentPath.startsWith('/dashboard')) {
        navigate('/landing');
        }
      }
    }
  }, [pathname, loading, navigate]);

  /**
   * Login user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} - { success: true } on success
   * @throws {Error} - If login fails
   */
  const login = async (credentials) => {
    try {
      // Validate input
      if (!credentials || !credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      // Import and call login API
      const { loginUser } = await import('@/api/auth');
      const { user: userData, token: userToken } = await loginUser(credentials);
      
      // Validate response data
      if (!userData || !userToken) {
        throw new Error('Invalid response from server');
      }

      // Ensure user data has required fields
      if (!userData.userType || !userData.email) {
        throw new Error('Invalid user data received from server');
      }
      
      // Check if email is verified
      if (!userData.isEmailVerified) {
        // Email not verified - redirect to OTP verification
        const email = userData.email;
        const userType = userData.userType;
        
        // Store email in localStorage for OTP screen
        localStorage.setItem('signup_email', email);
        
        // Redirect to appropriate OTP verification route
        if (userType === 'owner') {
          navigate('/signup/owner/verify-account', { 
            state: { email, userType },
            replace: true 
          });
        } else if (userType === 'renter') {
          navigate('/signup/renter/verify-account', { 
            state: { email, userType },
            replace: true 
          });
        } else {
          navigate('/otp-verification', { 
            state: { email, userType },
            replace: true 
          });
        }
        
        throw new Error('Email not verified. Please verify your email to continue.');
      }
      
      // Store in localStorage
      storeAuthData(userData, userToken);
      
      // Update state
      setUser(userData);
      setToken(userToken);
      
      // Redirect based on user type
      const currentPath = typeof pathname === 'string' ? pathname : String(pathname || '');
      redirectBasedOnUserType(navigate, currentPath);
      
      return { success: true };
    } catch (error) {
      // Check if this is an email verification error with OTP sent
      if (error.requiresVerification && error.otpSent) {
        const email = error.email;
        const userType = error.userType;
        
        // Store email in localStorage for OTP screen
        localStorage.setItem('signup_email', email);
        
        // Redirect to appropriate OTP verification route
        if (userType === 'owner') {
          navigate('/signup/owner/verify-account', { 
            state: { email, userType },
            replace: true 
          });
        } else if (userType === 'renter') {
          navigate('/signup/renter/verify-account', { 
            state: { email, userType },
            replace: true 
          });
        } else {
          navigate('/otp-verification', { 
            state: { email, userType },
            replace: true 
          });
        }
        
        // Don't throw error - redirect is happening
        return { success: false, requiresVerification: true };
      }
      
      // Log error for debugging
      console.error('Login error:', error);
      
      // Re-throw with user-friendly message
      const errorMessage = error.message || 'Login failed. Please check your credentials and try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // Defer clearing auth data until after navigation is allowed.
    // This lets pages like Add/Edit Property block navigation with a confirmation modal.
    navigate('/', {
      __afterNavigate: () => {
        clearAuthData();
        setUser(null);
        setToken(null);
      },
    });
  };

  /**
   * Update stored user data (e.g. after profile edit) so UI reflects changes immediately.
   * Keeps localStorage and in-memory context state in sync.
   * @param {Object} updates - Partial user object to merge into current user.
   */
  const updateUser = (updates) => {
    if (!updates || typeof updates !== 'object') return;
    setUser((prev) => {
      const merged = { ...(prev || {}), ...updates };
      // Keep localStorage in sync; prefer current token state, fallback to stored token.
      storeAuthData(merged, token || getToken());
      return merged;
    });
  };

  // Only compute these values on client side to avoid SSR issues
  const authValue = {
    user,
    token,
    isAuthenticated: loading ? false : isAuthenticated(),
    userType: loading ? null : getUserType(),
    userName: loading ? '' : getUserName(),
    login,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

