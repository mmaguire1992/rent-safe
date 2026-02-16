'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getCurrentUser } from '@/api/users';
import { getUserVerificationPayment } from '@/api/subscriptions';

const PaymentStatusContext = createContext(null);

export function PaymentStatusProvider({ children }) {
  const { isAuthenticated, userType, user } = useAuth();
  const userId = user?.id || user?._id;
  const [hasPaidVerification, setHasPaidVerification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remainingContacts, setRemainingContacts] = useState(null);
  const [contactLimit, setContactLimit] = useState(5);
  
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);
  const lastUserIdRef = useRef(null);

  // Load payment status on mount + when user logs in/out
  useEffect(() => {
    mountedRef.current = true;
    
    const checkPaymentStatus = async () => {
      // Prevent duplicate concurrent loads
      if (loadingRef.current) return;
      
      // Only check for authenticated renters
      if (!isAuthenticated || userType !== 'renter') {
        if (mountedRef.current) {
          setLoading(false);
          setHasPaidVerification(false);
          setRemainingContacts(null);
          setContactLimit(5);
        }
        lastUserIdRef.current = null;
        return;
      }

      const currentUserId = userId;
      
      // Reset if user changed (new user login)
      if (lastUserIdRef.current !== currentUserId) {
        lastUserIdRef.current = currentUserId;
        loadingRef.current = true;
        setLoading(true);
        setHasPaidVerification(false);
      } else if (lastUserIdRef.current === currentUserId && !loadingRef.current) {
        // Same user and already loaded - skip to prevent unnecessary re-fetches
        return;
      }

      loadingRef.current = true;
      setLoading(true);

      try {
        // Fetch fresh user data
        const userData = await getCurrentUser();
        
        if (userData && mountedRef.current) {
          // Set contacts
          setRemainingContacts(userData.remainingContacts ?? null);
          setContactLimit(userData.chatContactLimit ?? 5);

          // Always check payment record via API to ensure accuracy
          // Even if verificationStatus is 'verified', we need to confirm payment exists
          try {
            const payment = await getUserVerificationPayment();
            // Only set to true if payment exists AND status is 'succeeded'
            if (payment && payment.status === 'succeeded') {
              if (mountedRef.current) {
                setHasPaidVerification(true);
              }
            } else {
              if (mountedRef.current) {
                setHasPaidVerification(false);
              }
            }
          } catch (error) {
            // If 404 or any other error, user hasn't paid
            if (error.response?.status === 404) {
              // No payment found - free user
            } else {
              console.error('Error checking verification payment:', error);
            }
            // Always default to false on error - no payment means not premium
            if (mountedRef.current) {
              setHasPaidVerification(false);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data for payment check:', error);
        if (mountedRef.current) {
          setHasPaidVerification(false);
          setRemainingContacts(null);
          setContactLimit(5);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        loadingRef.current = false;
      }
    };

    checkPaymentStatus();

    return () => {
      mountedRef.current = false;
    };
  }, [isAuthenticated, userType, userId]);

  // Refresh payment status from server
  const refreshPaymentStatus = async () => {
    if (loadingRef.current) return;
    
    // Only check for authenticated renters
    if (!isAuthenticated || userType !== 'renter') {
      setLoading(false);
      setHasPaidVerification(false);
      setRemainingContacts(null);
      setContactLimit(5);
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      // Fetch fresh user data
      const userData = await getCurrentUser();
      
      if (userData) {
        // Set contacts
        setRemainingContacts(userData.remainingContacts ?? null);
        setContactLimit(userData.chatContactLimit ?? 5);

        // Check payment record
        try {
          const payment = await getUserVerificationPayment();
          if (payment && payment.status === 'succeeded') {
            setHasPaidVerification(true);
          } else {
            setHasPaidVerification(false);
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error('Error checking verification payment:', error);
          }
          setHasPaidVerification(false);
        }
      }
    } catch (error) {
      console.error('Error fetching user data for payment check:', error);
      setHasPaidVerification(false);
      setRemainingContacts(null);
      setContactLimit(5);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Update remaining contacts (when user contacts an owner)
  const updateRemainingContacts = (newCount) => {
    setRemainingContacts(newCount);
  };

  const value = {
    hasPaidVerification,
    loading,
    remainingContacts,
    contactLimit,
    refreshPaymentStatus,
    updateRemainingContacts,
  };

  return (
    <PaymentStatusContext.Provider value={value}>
      {children}
    </PaymentStatusContext.Provider>
  );
}

export function usePaymentStatus() {
  const context = useContext(PaymentStatusContext);
  if (!context) {
    throw new Error('usePaymentStatus must be used within a PaymentStatusProvider');
  }
  return context;
}
