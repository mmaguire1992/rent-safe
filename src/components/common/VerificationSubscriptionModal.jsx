'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@/lib/react-router-compat';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useAuth } from '@/context/AuthContext';
import { getCurrentSubscription } from '@/api/subscriptions';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const VerificationSubscriptionModal = ({
  isOpen,
  onClose,
  needsVerification = false,
  needsSubscription = false,
  // Optional props to avoid duplicate API calls
  userData = null,
  subscriptionData = null,
}) => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [subscription, setSubscription] = useState(subscriptionData);
  const [loadingSubscription, setLoadingSubscription] = useState(!subscriptionData);
  useBodyScrollLock(isOpen);

  // Fetch subscription status from backend only if not provided as prop
  useEffect(() => {
    // If subscription data is provided as prop, use it and skip fetching
    if (subscriptionData !== null) {
      setSubscription(subscriptionData);
      setLoadingSubscription(false);
      return;
    }

    // Only fetch if modal is open and user is owner
    if (!isOpen || userType !== 'owner') {
      setLoadingSubscription(false);
        return;
      }
      
    const fetchSubscription = async () => {
      try {
        setLoadingSubscription(true);
        const currentSubscription = await getCurrentSubscription();
        setSubscription(currentSubscription);
      } catch (error) {
        // If 404 or error, user has no subscription
        if (error.response?.status !== 404) {
          console.error('Error fetching subscription:', error);
        }
        setSubscription(null);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [isOpen, userType, subscriptionData]);

  // Check verification status from userData prop or needsVerification prop
  const isVerified = useMemo(() => {
    if (userData?.userInfo?.verificationStatus === 'verified') {
      return true;
    }
    // If userData not provided, rely on needsVerification prop
    return !needsVerification;
  }, [userData, needsVerification]);

  // Check if user has active subscription
  // Handle both 'active' and 'activate' status (backend may use 'activate')
  const hasActiveSubscription = useMemo(() => {
    if (!subscription) return false;
    const isActiveStatus = subscription.status === 'active' || subscription.status === 'activate';
    return isActiveStatus && 
           subscription.remainingProperties !== undefined && 
           subscription.remainingProperties > 0;
  }, [subscription]);

  // Check if subscription limit has expired (has subscription but remainingProperties === 0)
  const hasSubscriptionLimitExpired = useMemo(() => {
    if (!subscription) return false;
    const isActiveStatus = subscription.status === 'active' || subscription.status === 'activate';
    return isActiveStatus && 
           subscription.remainingProperties !== undefined && 
           subscription.remainingProperties === 0;
  }, [subscription]);

  // Determine actual needs based on fetched data
  const actuallyNeedsVerification = useMemo(() => {
    if (userData) {
      // Use actual verification status from userData
      return userData.userInfo?.verificationStatus !== 'verified';
    }
    // Fallback to prop if userData not provided
    return needsVerification;
  }, [userData, needsVerification]);

  const actuallyNeedsSubscription = useMemo(() => {
    return needsSubscription && !hasActiveSubscription && !loadingSubscription;
  }, [needsSubscription, hasActiveSubscription, loadingSubscription]);

  // Don't show modal if loading
  if (!isOpen || loadingSubscription) return null;
  
  // If only subscription was needed and user has active subscription, don't show modal
  if (needsSubscription && !actuallyNeedsVerification && hasActiveSubscription) {
    return null;
  }

  // If nothing is needed, don't show modal
  if (!actuallyNeedsVerification && !actuallyNeedsSubscription) {
    return null;
  }

  const handleGoToVerification = () => {
    // If only subscription is needed and user is verified, go to payments/subscription page
    if (!actuallyNeedsVerification && actuallyNeedsSubscription) {
      navigate('/dashboard/payments');
    } else {
      // Otherwise go to verification page (which may also have subscription options)
      navigate('/dashboard/verification');
    }
    onClose();
  };

  // Determine title and message based on what's actually needed
  const getTitle = () => {
    if (actuallyNeedsVerification && actuallyNeedsSubscription) {
      return 'Verification & Subscription Required';
    } else if (actuallyNeedsVerification) {
      return 'Verification Required';
    } else if (actuallyNeedsSubscription) {
      // Check if subscription limit has expired
      if (hasSubscriptionLimitExpired) {
        return 'Subscription Property Limit Expired';
      }
      return 'Subscription Required';
    }
    return 'Action Required';
  };

  const getDescription = () => {
    if (actuallyNeedsVerification && actuallyNeedsSubscription) {
      return 'To add properties, you need to complete the following:';
    } else if (actuallyNeedsVerification) {
      return 'To add properties, you need to verify your account:';
    } else if (actuallyNeedsSubscription) {
      // Check if subscription limit has expired
      if (hasSubscriptionLimitExpired) {
        return 'Your subscription property limit has been reached. Please upgrade your plan to add more properties.';
      }
      return 'To add properties, you need to subscribe to a plan:';
    }
    return 'To add properties, you need to complete the following:';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0 p-4 !mt-0">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-[#FFF5CC] rounded-full flex items-center justify-center">
            <FiAlertCircle className="text-3xl text-[#FFA500]" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-secondary mb-3 text-center">
          {getTitle()}
        </h2>
        
        <div className="space-y-3 mb-6">
          <p className="text-darkGray text-base text-center">
            {getDescription()}
          </p>
          
          <div className="space-y-2">
            {actuallyNeedsVerification && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <FiAlertCircle className="text-red-500 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-secondary mb-1">
                    Complete Verification
                  </p>
                  <p className="text-xs text-darkGray">
                    Please verify your account by uploading required documents.
                  </p>
                </div>
              </div>
            )}
            
            {actuallyNeedsSubscription && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <FiAlertCircle className="text-red-500 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-secondary mb-1">
                    {hasSubscriptionLimitExpired 
                      ? 'Subscription Property Limit Expired' 
                      : 'Subscribe to a Plan'}
                  </p>
                  <p className="text-xs text-darkGray">
                    {hasSubscriptionLimitExpired
                      ? 'You have reached your property limit. Please upgrade your subscription plan to add more properties.'
                      : 'Please subscribe to a plan to start listing properties.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoToVerification}
            className="w-full px-4 py-3 bg-blueGradient text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            {actuallyNeedsVerification && actuallyNeedsSubscription 
                ? 'Go to Verification' 
              : actuallyNeedsVerification 
                  ? 'Go to Verification' 
                  : hasSubscriptionLimitExpired
                    ? 'Upgrade Plan'
                    : 'Go to Subscription'}
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-darkGray bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationSubscriptionModal;
