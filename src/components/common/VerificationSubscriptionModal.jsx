'use client';

import React from 'react';
import { useNavigate } from '@/lib/react-router-compat';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const VerificationSubscriptionModal = ({
  isOpen,
  onClose,
  needsVerification = false,
  needsSubscription = false,
}) => {
  const navigate = useNavigate();
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleGoToVerification = () => {
    // If only subscription is needed and user is verified, go to payments/subscription page
    if (!needsVerification && needsSubscription) {
      navigate('/dashboard/payments');
    } else {
      // Otherwise go to verification page (which may also have subscription options)
      navigate('/dashboard/verification');
    }
    onClose();
  };

  // Determine title and message based on what's needed
  const getTitle = () => {
    if (needsVerification && needsSubscription) {
      return 'Verification & Subscription Required';
    } else if (needsVerification) {
      return 'Verification Required';
    } else if (needsSubscription) {
      return 'Subscription Required';
    }
    return 'Action Required';
  };

  const getDescription = () => {
    if (needsVerification && needsSubscription) {
      return 'To add properties, you need to complete the following:';
    } else if (needsVerification) {
      return 'To add properties, you need to verify your account:';
    } else if (needsSubscription) {
      return 'To add properties, you need to subscribe to a plan:';
    }
    return 'To add properties, you need to complete the following:';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
            {needsVerification && (
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
            
            {needsSubscription && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <FiAlertCircle className="text-red-500 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-secondary mb-1">
                    Subscribe to a Plan
                  </p>
                  <p className="text-xs text-darkGray">
                    Please subscribe to a plan to start listing properties.
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
            {needsVerification && needsSubscription 
              ? 'Go to Verification' 
              : needsVerification 
                ? 'Go to Verification' 
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
