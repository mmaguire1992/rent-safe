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

/**
 * TEMPORARY ACCESS LOCK (easy rollback):
 * - Keep this true while you want login required for all routes.
 * - Set to false to restore normal access flow.
 */
const TEMP_FORCE_LOGIN_LOCK = true;

/**
 * Routes still allowed without login while lock is enabled.
 * Keep minimal to enforce strict login wall.
 */
const TEMP_AUTH_ALLOWLIST_EXACT = [
  '/login',
  '/forgot-password',
  '/create-password',
  '/otp-verification',
  '/password-success',
  '/terms',
  '/privacy',
];
const TEMP_AUTH_ALLOWLIST_PREFIX = ['/signup'];
const TEMP_LOGOUT_REDIRECT_FLAG = 'rentsafe:logoutRedirect';

const isTempAllowedWithoutAuthRoute = (path) => {
  const safePath = typeof path === 'string' ? path : String(path || '');
  return (
    TEMP_AUTH_ALLOWLIST_EXACT.includes(safePath) ||
    TEMP_AUTH_ALLOWLIST_PREFIX.some((prefix) => safePath.startsWith(prefix))
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const pathname = usePathname();
  const currentPath = typeof pathname === 'string' ? pathname : String(pathname || '');

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

    // Clear one-time logout flag once we have reached login page.
    if (typeof window !== 'undefined' && currentPath === '/login') {
      try {
        sessionStorage.removeItem(TEMP_LOGOUT_REDIRECT_FLAG);
      } catch {
        // ignore
      }
    }
    
    const currentUserType = getUserType();
    const isAuth = isAuthenticated();
    
    // TEMP lock: only allow explicitly whitelisted auth routes before login.
    const isTempAllowedWithoutAuth = isTempAllowedWithoutAuthRoute(currentPath);
    
    // Profile route should be accessible to authenticated users only
    const isProfileRoute = currentPath.startsWith('/profile');
    
    if (!isAuth) {
      // User is NOT authenticated
      if (TEMP_FORCE_LOGIN_LOCK) {
        if (!isTempAllowedWithoutAuth) {
          const shouldForceCleanLogin =
            typeof window !== 'undefined' &&
            sessionStorage.getItem(TEMP_LOGOUT_REDIRECT_FLAG) === '1';
          if (shouldForceCleanLogin) {
            navigate('/login', { replace: true });
            return;
          }

          const nextPath =
            typeof window !== 'undefined'
              ? `${window.location.pathname}${window.location.search}${window.location.hash}`
              : currentPath || '/';
          navigate(`/login?next=${encodeURIComponent(nextPath || '/')}`, { replace: true });
          return;
        }
      } else {
        // TEMPORARILY DISABLED (kept for rollback): existing public-route behavior.
        /*
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
        const isPublicRoute = publicRoutes.includes(currentPath) || 
                             currentPath.startsWith('/signup') || 
                             currentPath.startsWith('/properties') ||
                             currentPath.startsWith('/property/') ||
                             currentPath.startsWith('/support');
        if (!isPublicRoute && !isProfileRoute) {
          navigate('/login');
          return;
        }
        if (isProfileRoute) {
          navigate('/login');
          return;
        }
        */
        const legacyPublicRoutes = [
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
        const isLegacyPublicRoute = legacyPublicRoutes.includes(currentPath) ||
          currentPath.startsWith('/signup') ||
          currentPath.startsWith('/properties') ||
          currentPath.startsWith('/property/') ||
          currentPath.startsWith('/support');
        if (!isLegacyPublicRoute && !isProfileRoute) {
          navigate('/login');
          return;
        }
        if (isProfileRoute) {
          navigate('/login');
          return;
        }
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
      // TEMPORARILY DISABLED (kept for rollback): original public-route redirect branching.
      /*
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
      const isPublicRoute = publicRoutes.includes(currentPath) || 
                           currentPath.startsWith('/signup') || 
                           currentPath.startsWith('/properties') ||
                           currentPath.startsWith('/property/') ||
                           currentPath.startsWith('/support');
      */
      const isPublicRoute = !TEMP_FORCE_LOGIN_LOCK && (
        currentPath === '/' ||
        currentPath === '/landing' ||
        currentPath === '/login' ||
        currentPath.startsWith('/signup') ||
        currentPath === '/forgot-password' ||
        currentPath === '/otp-verification' ||
        currentPath === '/create-password' ||
        currentPath === '/password-success' ||
        currentPath.startsWith('/properties') ||
        currentPath.startsWith('/property/') ||
        currentPath.startsWith('/support')
      );
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
      
      // TEMP lock behavior: return user to intended route after successful login.
      // Fallback to existing role-based redirect if no valid "next" target is present.
      const nextPath = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('next')
        : null;
      const shouldIgnoreNextFromLogout =
        typeof window !== 'undefined' &&
        sessionStorage.getItem(TEMP_LOGOUT_REDIRECT_FLAG) === '1';
      const isValidNextPath =
        !shouldIgnoreNextFromLogout &&
        typeof nextPath === 'string' &&
        nextPath.startsWith('/') &&
        !nextPath.startsWith('//') &&
        !nextPath.startsWith('/login') &&
        !(
          userData.userType === 'renter' &&
          nextPath.startsWith('/dashboard')
        );
      if (TEMP_FORCE_LOGIN_LOCK && isValidNextPath) {
        navigate(nextPath, { replace: true });
      } else {
        const currentPath = typeof pathname === 'string' ? pathname : String(pathname || '');
        redirectBasedOnUserType(navigate, currentPath);
      }
      
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
    // TEMP lock compatibility:
    // Force a clean logout target so no old protected route is carried via ?next.
    // Also bypass blockers so logout always succeeds from any page.
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(TEMP_LOGOUT_REDIRECT_FLAG, '1');
      } catch {
        // ignore
      }
    }
    navigate('/login', {
      replace: true,
      __bypassBlocker: true,
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

  // While temporary lock is enabled, don't render protected pages for unauthenticated users.
  // This prevents brief flashes of public/protected content before redirect to login.
  const shouldHideChildrenForTempLock =
    TEMP_FORCE_LOGIN_LOCK &&
    !isTempAllowedWithoutAuthRoute(currentPath) &&
    (loading || !isAuthenticated());

  return (
    <AuthContext.Provider value={authValue}>
      {shouldHideChildrenForTempLock ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

