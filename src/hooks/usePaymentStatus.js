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

  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Only check for authenticated renters
      if (!isAuthenticated || userType !== 'renter') {
        setLoading(false);
        setHasPaidVerification(false);
        setRemainingContacts(null);
        setContactLimit(5);
        return;
      }

      // Reset if user changed
      if (lastUserIdRef.current !== user?.id) {
        lastUserIdRef.current = user?.id;
        checkInProgressRef.current = false;
        setHasPaidVerification(false);
        setLoading(true);
      }

      // Prevent duplicate checks in the same render cycle
      if (checkInProgressRef.current) {
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

          // Method 1: Check userInfo.verificationStatus first (fastest, no API call)
          const isVerified = userData.userInfo?.verificationStatus === 'verified';
          
          if (isVerified) {
            setHasPaidVerification(true);
            setLoading(false);
            checkInProgressRef.current = false;
            return;
          }

          // Method 2: Check payment record via API (only if not verified in userInfo)
          try {
            const payment = await getUserVerificationPayment();
            if (payment && payment.status === 'succeeded') {
              console.log('✅ User has paid verification (payment record found) - premium user');
              setHasPaidVerification(true);
            } else {
              console.log('❌ User has not paid verification - free user');
              setHasPaidVerification(false);
            }
          } catch (error) {
            // If 404, user hasn't paid
            if (error.response?.status === 404) {
              console.log('ℹ️ No verification payment found - free user');
              setHasPaidVerification(false);
            } else {
              console.error('Error checking verification payment:', error);
              // On error, default to false but don't block UI
              setHasPaidVerification(false);
            }
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
      }
    };

    checkPaymentStatus();
  }, [isAuthenticated, userType, user?.id]);

  return {
    hasPaidVerification,
    loading,
    remainingContacts,
    contactLimit,
  };
};
