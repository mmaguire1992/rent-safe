'use client'

import React, { useState, useEffect } from "react";
import { useSearchParams } from '@/lib/react-router-compat';
import { useAuth } from '@/context/AuthContext';
import { toast } from "react-toastify";
import { getCurrentUser } from "@/api/users";
import { getMyDocuments } from "@/api/verification";
import { getAllRenterReviews } from "@/api/renterReviews";
import ProfileHeader from "@/components/adminDashboard/TenantProfile/ProfileHeader";
import CreditCheck from "@/components/adminDashboard/TenantProfile/CreditCheck";
import IdentityInfo from "@/components/adminDashboard/TenantProfile/IdentityInfo";
import CurrentAddress from "@/components/adminDashboard/TenantProfile/CurrentAddress";
import EmploymentDetails from "@/components/adminDashboard/TenantProfile/EmploymentDetails";
import Header from "@/components/frontend/common/header";
import ProfileTabs from "@/components/frontend/profile/ProfileTabs";
import EditProfileSection from "@/components/frontend/profile/EditProfileSection";
import ChangePasswordSection from "@/components/frontend/profile/ChangePasswordSection";
import VerificationSection from "@/components/frontend/profile/VerificationSection";
import PropertyHistorySection from "@/components/frontend/profile/PropertyHistorySection";
import DeleteAccountSection from "@/components/frontend/profile/DeleteAccountSection";
import PaymentSection from "@/components/frontend/profile/PaymentSection";
import Footer from "@/components/frontend/common/footer";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";

// Owner tabs
const OWNER_TABS = [
  { id: "view", label: "View Profile" },
  { id: "edit", label: "Edit Profile" },
  { id: "password", label: "Change Password" },
  { id: "verification", label: "Verification" },
  { id: "property-history", label: "Property History" },
  { id: "delete", label: "Delete Account" },
];

// Renter tabs (more comprehensive)
const RENTER_TABS = [
  { id: "view", label: "View Profile" },
  { id: "edit", label: "Edit Profile" },
  { id: "password", label: "Change Password" },
  { id: "verification", label: "Verification" },
  { id: "property-history", label: "Property History" },
  { id: "delete", label: "Delete Account" },
];

function ProfileManagementPage() {
  const { userType, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("view");

  // Get tabs based on user type
  const TABS = userType === 'owner' ? OWNER_TABS : RENTER_TABS;

  // Check for tab query parameter on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }

    // Handle payment success/cancel redirects
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success("Payment successful! Your verification is now active.");
      // Remove the payment parameter from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("payment");
      setSearchParams(newParams, { replace: true });
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment was cancelled. You can try again anytime.");
      // Remove the payment parameter from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("payment");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [profileData, setProfileData] = useState(null);
  const [documentsData, setDocumentsData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch profile data and documents for view tab
  useEffect(() => {
    if (activeTab === "view") {
      const fetchProfileData = async () => {
        try {
          setLoadingProfile(true);
          const userId = user?.id;
          const [userData, docsData, feedback] = await Promise.all([
            getCurrentUser(),
            getMyDocuments().catch(() => null), // Don't fail if documents API fails
            userId ? getAllRenterReviews({ userId, limit: 100 }).catch(() => null) : Promise.resolve(null) // Fetch feedback for current user
          ]);
          setProfileData(userData);
          setDocumentsData(docsData);
          setFeedbackData(feedback);
        } catch (error) {
          console.error('Error fetching profile data:', error);
          toast.error('Failed to load profile data');
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchProfileData();
    }
  }, [activeTab, user?.id]);

  const renderContent = () => {
    if (activeTab === "view") {
      if (loadingProfile) {
        return (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B4EFF]"></div>
            <span className="ml-3 text-darkGray">Loading profile...</span>
          </div>
        );
      }

      const userInfo = profileData?.userInfo || {};
      const name = userInfo.name || {};
      const address = userInfo.address || {};
      const employment = userInfo.employment || {};
      const proofOfIncome = userInfo.proofOfIncome || {};
      const fullName = `${profileData?.firstName || ""} ${profileData?.lastName || ""}`.trim() || profileData?.email || 'User';
      const profileImage = userInfo.profileImage || null;

      // Helper function to extract documents by type
      const getDocumentsByType = (docType) => {
        if (!documentsData?.documents || !Array.isArray(documentsData.documents)) return [];
        const docGroup = documentsData.documents.find((group) => group.docType === docType);
        return docGroup && docGroup.docs ? docGroup.docs : [];
      };

      // Extract credit score documents
      const creditScoreDocs = getDocumentsByType('credit_score');
      const legacyCreditDoc = userInfo.creditScoreDocument;
      const creditScoreDocument = creditScoreDocs.length > 0 ? creditScoreDocs[0].url : legacyCreditDoc;

      // Transform data to match TenantProfile component expectations
      const tenantData = {
        id: profileData?.id || profileData?.userId,
        userId: profileData?.id || profileData?.userId,
        name: fullName,
        profileImage: profileImage,
        description: userInfo.bio || '',
        designation: employment.jobTitle || '',
        location: `${address.city || ''}${address.city && address.country ? ', ' : ''}${address.country || ''}`.trim() || '',
        monthlyIncome: employment.monthlyIncome ? `£${employment.monthlyIncome}` : '',
        verified: userInfo.verificationStatus === 'verified' || profileData?.isEmailVerified || false,
        creditScore: userInfo.creditScore || 0,
        creditMax: 850,
        creditScoreDocument: creditScoreDocument,
      };

      const identityData = {
        fullName: `${name.first || ""} ${name.last || ""}`.trim() || fullName,
        phone: profileData?.phone || '',
        email: profileData?.email || '',
      };

      const currentAddressData = {
        address: address.street || '',
        city: address.city || '',
        country: address.country || '',
        postcode: address.postcode || '',
        livingPeriod: address.livingPeriod || '',
      };

      const employmentData = {
        jobTitle: employment.jobTitle || '',
        company: employment.company || '',
        startDate: employment.startDate ? new Date(employment.startDate).toLocaleDateString() : '',
        employmentType: employment.employmentType || '',
        annualSalary: employment.annualSalary ? `£${employment.annualSalary}` : '',
        workLocation: employment.workLocation || '',
      };

      const proofOfIncomeData = {
        type: proofOfIncome.type || '',
        date: proofOfIncome.date ? new Date(proofOfIncome.date).toLocaleDateString() : '',
        grossMonthly: proofOfIncome.grossMonthly ? `£${proofOfIncome.grossMonthly}` : '',
        netMonthly: proofOfIncome.netMonthly ? `£${proofOfIncome.netMonthly}` : '',
      };

      return (
        <div className="space-y-6">
          {/* Profile Header */}
          <ProfileHeader
            tenantData={tenantData}
            onSendOffer={null}
            onChat={null}
          />

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <CreditCheck tenantData={tenantData} showDocument={true} />
            <IdentityInfo identity={identityData} />
            <CurrentAddress address={currentAddressData} />
          </div>

          {/* Employment Details */}
          <div className="block">
            <EmploymentDetails
              employment={employmentData}
              proofOfIncome={proofOfIncomeData}
            />
          </div>

          {/* Feedback Section */}
          {feedbackData && feedbackData.reviews && feedbackData.reviews.length > 0 && (
            <div className="block">
              <div className="bg-white rounded-lg border border-lightGray p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-[#E8E2FF] rounded-[10px] p-2 flex-shrink-0">
                    <svg className="w-6 h-6 text-[#6B4EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold font-nunito text-secondary mb-0">
                    Feedback ({feedbackData.reviews.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {feedbackData.reviews.map((review, index) => {
                    const fromDate = review.fromDate ? new Date(review.fromDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A';
                    const toDate = review.toDate ? new Date(review.toDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A';
                    const createdAt = review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : '';

                    return (
                      <div
                        key={review._id || review.id || index}
                        className="border border-lightGray rounded-xl p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-secondary">
                                Period: {fromDate} - {toDate}
                              </span>
                            </div>
                            {createdAt && (
                              <p className="text-xs text-darkGray">
                                Submitted on {createdAt}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="bg-white border border-lightGray rounded-lg p-3">
                          <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">
                            "{review.feedback}"
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    if (activeTab === "edit") return <EditProfileSection />;
    if (activeTab === "password") return <ChangePasswordSection />;
    if (activeTab === "verification") return <VerificationSection />;
    if (activeTab === "property-history") return <PropertyHistorySection />;
    if (activeTab === "delete") return <DeleteAccountSection />;
    return <EditProfileSection />;
  };

  const tabOptions = TABS.map((tab) => ({
    value: tab.id,
    label: tab.label,
  }));

  const getSelectedTabLabel = () => {
    const selectedTab = TABS.find((tab) => tab.id === activeTab);
    return selectedTab ? selectedTab.label : "View Profile";
  };

  // Dynamic title and description based on user type
  const getTitle = () => {
    if (userType === 'owner') {
      return 'Profile Management';
    } else if (userType === 'renter') {
      return 'Profile Management';
    }
    return 'Profile Management';
  };

  const getDescription = () => {
    if (userType === 'owner') {
      return 'Manage your profile settings and preferences';
    } else if (userType === 'renter') {
      return 'Complete your profile to increase your chances of finding the perfect rental property. All information is securely stored and helps property owners make informed decisions.';
    }
    return 'Manage your profile settings and preferences';
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="container mx-auto py-4 sm:py-6 lg:py-10 px-4 sm:px-6 lg:px-8">
        <div className="block">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary mb-1 sm:mb-2">
            {getTitle()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-darkGray mb-4 sm:mb-6">
            {getDescription()}
          </p>
          <div className="md:hidden mb-6">
                <CustomDropdown
                  options={tabOptions}
                  value={activeTab}
                  onChange={(value) => {
                    setActiveTab(value);
                    setSearchParams({ tab: value });
                  }}
                  placeholder="Select a tab"
                />
              </div>
          <div className="bg-white rounded-[20px] p-4 sm:p-6 lg:p-8 border border-lightGray">
            <div className="bg-white rounded-[20px] p-4 sm:p-6 lg:p-8 border border-lightGray">
              {/* Mobile: Dropdown for tabs */}
             

              {/* Desktop: Tab buttons */}
              <div className="hidden md:flex gap-2 mb-6 border-b border-lightGray">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchParams({ tab: tab.id });
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                        ? "text-[#4A2FCC] border-b-2 border-[#4A2FCC]"
                        : "text-darkGray hover:text-secondary"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="mt-4 sm:mt-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ProfileManagementPage;
