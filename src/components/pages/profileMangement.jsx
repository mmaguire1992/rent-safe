'use client'

import React, { useState, useEffect } from "react";
import { useSearchParams } from '@/lib/react-router-compat';
import { useAuth } from '@/context/AuthContext';
import { toast } from "react-toastify";
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
  { id: "edit", label: "Edit Profile" },
  { id: "password", label: "Change Password" },
  { id: "verification", label: "Verification" },
  { id: "property-history", label: "Property History" },
  { id: "delete", label: "Delete Account" },
];

// Renter tabs (more comprehensive)
const RENTER_TABS = [
  { id: "edit", label: "Edit Profile" },
  { id: "password", label: "Change Password" },
  { id: "verification", label: "Verification" },
  { id: "property-history", label: "Property History" },
  { id: "delete", label: "Delete Account" },
];

function ProfileManagementPage() {
  const { userType } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("edit");

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

  const renderContent = () => {
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
    return selectedTab ? selectedTab.label : "Edit Profile";
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
