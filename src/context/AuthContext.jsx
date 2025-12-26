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
        setUser(userData);
        setToken(userToken);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Handle redirect based on user type when pathname changes
  // Protect ALL routes - user must be authenticated to access any route
  useEffect(() => {
    if (loading) return;
    
    const currentUserType = getUserType();
    const isAuth = isAuthenticated();
    
    // Define public routes that don't require authentication
    const publicRoutes = [
      '/login',
      '/signup',
      '/forgot-password',
      '/otp-verification',
      '/create-password',
      '/password-success'
    ];
    
    // Check if current route is public (including signup sub-routes)
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/signup');
    
    if (!isAuth) {
      // User is NOT authenticated
      // Block access to ALL routes except public auth routes
      if (!isPublicRoute) {
        navigate('/login');
        return;
      }
    } else {
      // User IS authenticated
      // Redirect from public auth routes to appropriate dashboard/landing
      if (isPublicRoute) {
        redirectBasedOnUserType(navigate, pathname);
        return;
      }
      
      // Check if user is accessing wrong route (owner on landing, renter on dashboard)
      if (currentUserType === 'owner' && (pathname === '/landing' || pathname === '/')) {
        navigate('/dashboard');
      } else if (currentUserType === 'renter' && pathname.startsWith('/dashboard')) {
        navigate('/landing');
      }
    }
  }, [pathname, loading, navigate]);

  const login = async (credentials) => {
    try {
      const { loginUser } = await import('@/api/auth');
      const { user: userData, token: userToken } = await loginUser(credentials);
      
      // Store in localStorage
      storeAuthData(userData, userToken);
      
      // Update state
      setUser(userData);
      setToken(userToken);
      
      // Redirect based on user type
      redirectBasedOnUserType(navigate, pathname);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage (no API call needed)
    clearAuthData();
    setUser(null);
    setToken(null);
    navigate('/login');
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

