import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

const TABS = [
  { id: "edit", label: "Edit Profile" },
  { id: "password", label: "Change Password" },
  { id: "verification", label: "Verification" },
  { id: "property-history", label: "Property History" },
  { id: "delete", label: "Delete Account" },
];

function ProfileManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("edit");

  // Check for tab query parameter on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="w-full mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold font-nunito text-secondary md:mb-5 mb-3">
            Profile Management
          </h1>
          <div className="lg:hidden mb-6">
            <CustomDropdown
              options={tabOptions}
              value={activeTab}
              onChange={(value) => setActiveTab(value)}
              placeholder={getSelectedTabLabel()}
              className="w-full h-[52px]"
            />
          </div>
          <div className="bg-white rounded-2xl border border-border p-3 sm:p-6">
            {/* Mobile: Dropdown for tabs */}

            {/* Desktop: Regular tabs */}
            <div className="hidden lg:block">
              <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
            </div>

            <div className="block">{renderContent()}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ProfileManagementPage;
