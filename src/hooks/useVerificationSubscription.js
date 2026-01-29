import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/api/users';
import { getCurrentSubscription } from '@/api/subscriptions';

/**
 * Custom hook to check verification and subscription status
 * @returns {Object} { needsVerification, needsSubscription, isVerified, hasSubscription, loading, checkStatus }
 */
export const useVerificationSubscription = () => {
  const [needsVerification, setNeedsVerification] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      // Fetch fresh user data
      const userData = await getCurrentUser();
      
      // Check verification status
      const verified = userData?.userInfo?.verificationStatus === 'verified';
      setIsVerified(verified);
      setNeedsVerification(!verified);

      // Check subscription status
      let hasActiveSubscription = false;
      let subscription = null;
      try {
        subscription = await getCurrentSubscription();
        // Check if subscription exists and is active
        if (subscription && subscription.status === 'active') {
          hasActiveSubscription = true;
        }
      } catch (error) {
        // If 404, no subscription exists
        if (error.response?.status !== 404) {
          console.error('Error checking subscription:', error);
        }
      }
      setHasSubscription(hasActiveSubscription);
      setNeedsSubscription(!hasActiveSubscription);

      return {
        isVerified: verified,
        hasSubscription: hasActiveSubscription,
        needsVerification: !verified,
        needsSubscription: !hasActiveSubscription,
        subscription, // Return subscription data to avoid duplicate API calls
      };
    } catch (error) {
      console.error('Error checking verification and subscription:', error);
      return {
        isVerified: false,
        hasSubscription: false,
        needsVerification: true,
        needsSubscription: true,
        subscription: null,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    needsVerification,
    needsSubscription,
    isVerified,
    hasSubscription,
    loading,
    checkStatus,
  };
};
