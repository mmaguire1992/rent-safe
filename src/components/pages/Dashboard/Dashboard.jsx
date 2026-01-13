'use client'

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import SummaryCards from "@/components/adminDashboard/Dashboard-detail/SummaryCards";
import RecentRequests from "@/components/adminDashboard/Dashboard-detail/RecentRequests";
import ActiveProperties from "@/components/adminDashboard/Dashboard-detail/ActiveProperties";
import ProfileCompletion from "@/components/adminDashboard/Dashboard-detail/ProfileCompletion";
import VerificationSubscriptionModal from "@/components/common/VerificationSubscriptionModal";
import { summaryCards } from "@/constant";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser, getProfileCompletion } from "@/api/users";
import { getCurrentSubscription } from "@/api/subscriptions";

function Dashboard() {
  const { user, userType } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [completionLoading, setCompletionLoading] = useState(true);

  useEffect(() => {
    const checkVerificationAndSubscription = async () => {
      // Only check for owners
      if (userType !== 'owner') {
        setLoading(false);
        return;
      }

      try {
        // Fetch fresh user data
        const userData = await getCurrentUser();
        
        // Check verification status
        const isVerified = userData?.userInfo?.verificationStatus === 'verified';
        setNeedsVerification(!isVerified);

        // Check subscription status
        let hasActiveSubscription = false;
        try {
          const subscription = await getCurrentSubscription();
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
        setNeedsSubscription(!hasActiveSubscription);

        // Show modal if user needs verification or subscription
        // Always check and show on every page load/refresh if needed
        if (!isVerified || !hasActiveSubscription) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error checking verification and subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only run check if user is authenticated and userType is available
    if (userType) {
      checkVerificationAndSubscription();
    }
  }, [userType, user?.id]);

  // Fetch profile completion for owners
  useEffect(() => {
    const fetchProfileCompletion = async () => {
      if (userType !== 'owner') {
        setCompletionLoading(false);
        return;
      }

      try {
        const completion = await getProfileCompletion();
        setProfileCompletion(completion);
      } catch (error) {
        console.error('Error fetching profile completion:', error);
        setProfileCompletion(null);
      } finally {
        setCompletionLoading(false);
      }
    };

    if (userType === 'owner') {
      fetchProfileCompletion();
    }
  }, [userType, user?.id]);

  return (
    <DashboardLayout>
      <div className="block">
        <div className="mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary mb-1 sm:mb-2">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-darkGray">
            Manage and track your rental listings
          </p>
        </div>

        {userType === 'owner' && !completionLoading && profileCompletion && !profileCompletion.isComplete && (
          <ProfileCompletion
            completionPercentage={profileCompletion.completionPercentage}
            pendingTask={profileCompletion.pendingTask || 'complete profile'}
          />
        )}

        <SummaryCards summaryCards={summaryCards} />
        <RecentRequests />
        <ActiveProperties />

        <VerificationSubscriptionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          needsVerification={needsVerification}
          needsSubscription={needsSubscription}
        />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
