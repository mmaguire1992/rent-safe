'use client'

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCurrentUser } from '@/api/users';
import { getUserVerificationPayment } from '@/api/subscriptions';

/**
 * Custom hook to check if user has paid verification fee
 * Caches the result to prevent duplicate API calls
 * @returns {Object} { hasPaidVerification, loading, remainingContacts, contactLimit }
 */
export const usePaymentStatus = () => {
  const { isAuthenticated, userType, user } = useAuth();
  const [hasPaidVerification, setHasPaidVerification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remainingContacts, setRemainingContacts] = useState(null);
  const [contactLimit, setContactLimit] = useState(5);
  
  // Use ref to prevent duplicate checks in the same render cycle
  const checkInProgressRef = useRef(false);
  const lastUserIdRef = useRef(null);
  const hasCompletedCheckRef = useRef(false);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Only check for authenticated renters
      if (!isAuthenticated || userType !== 'renter') {
        setLoading(false);
        setHasPaidVerification(false);
        setRemainingContacts(null);
        setContactLimit(5);
        lastUserIdRef.current = null;
        hasCompletedCheckRef.current = false;
        return;
      }

      const currentUserId = user?.id || user?._id;
      
      // Prevent duplicate checks in the same render cycle
      if (checkInProgressRef.current) {
        return;
      }

      // Reset if user changed (new user login)
      if (lastUserIdRef.current !== currentUserId) {
        lastUserIdRef.current = currentUserId;
        checkInProgressRef.current = false;
        hasCompletedCheckRef.current = false;
        setHasPaidVerification(false);
        setLoading(true);
      } else if (lastUserIdRef.current === currentUserId && hasCompletedCheckRef.current) {
        // Same user and already completed check - skip to prevent unnecessary re-fetches
        return;
      }

      checkInProgressRef.current = true;
      setLoading(true);

      try {
        // Fetch fresh user data
        const userData = await getCurrentUser();
        
        if (userData) {
          // Set contacts
          setRemainingContacts(userData.remainingContacts ?? null);
          setContactLimit(userData.chatContactLimit ?? 5);

          // Always check payment record via API to ensure accuracy
          // Even if verificationStatus is 'verified', we need to confirm payment exists
          try {
            const payment = await getUserVerificationPayment();
            // Only set to true if payment exists AND status is 'succeeded'
            if (payment && payment.status === 'succeeded') {
              console.log('✅ User has paid verification (payment record found) - premium user');
              setHasPaidVerification(true);
            } else {
              // Payment is null, undefined, or status is not 'succeeded'
              // Even if verificationStatus is 'verified', if no payment exists, user is not premium
              console.log('❌ User has not paid verification - free user');
              setHasPaidVerification(false);
            }
          } catch (error) {
            // If 404 or any other error, user hasn't paid
            if (error.response?.status === 404) {
              console.log('ℹ️ No verification payment found (404) - free user');
            } else {
              console.error('Error checking verification payment:', error);
            }
            // Always default to false on error - no payment means not premium
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
        checkInProgressRef.current = false;
        hasCompletedCheckRef.current = true;
      }
    };

    checkPaymentStatus();
  }, [isAuthenticated, userType, user?.id, user?._id]);

  return {
    hasPaidVerification,
    loading,
    remainingContacts,
    contactLimit,
  };
};
