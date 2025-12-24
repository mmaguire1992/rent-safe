'use client'

import { useState } from "react";
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Breadcrumb from "@/components/adminDashboard/common/Breadcrumb";
import EditProfileTab from "@/components/adminDashboard/ProfileSettings/EditProfileTab";
import ChangePasswordTab from "@/components/adminDashboard/ProfileSettings/ChangePasswordTab";
import DeleteAccountTab from "@/components/adminDashboard/ProfileSettings/DeleteAccountTab";
import DeleteAccountModal from "@/components/adminDashboard/ProfileSettings/DeleteAccountModal";
import PasswordSuccessModal from "@/components/adminDashboard/ProfileSettings/PasswordSuccessModal";
import ProfileOtpModal from "@/components/adminDashboard/ProfileSettings/ProfileOtpModal";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import { profileSettingsData } from "@/constant";

function ProfileSettings() {
  const [activeTab, setActiveTab] = useState("edit");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordSuccessModalOpen, setIsPasswordSuccessModalOpen] =
    useState(false);
  const [isProfileOtpOpen, setIsProfileOtpOpen] = useState(false);

  const handleSaveProfile = (data) => {
    console.log("Saving profile:", data);
    // After save, open OTP verification modal
    setIsProfileOtpOpen(true);
  };

  const handleSavePassword = (data) => {
    console.log("Saving password:", data);
    // Handle password save logic
    setIsPasswordSuccessModalOpen(true);
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log("Deleting account");
    setIsDeleteModalOpen(false);
    // Handle account deletion logic
  };

  const tabs = [
    { id: "edit", label: "Edit Profile" },
    { id: "password", label: "Change Password" },
    { id: "delete", label: "Delete Account" },
  ];

  const tabOptions = tabs.map((tab) => ({
    value: tab.id,
    label: tab.label,
  }));

  const getSelectedTabLabel = () => {
    const selectedTab = tabs.find((tab) => tab.id === activeTab);
    return selectedTab ? selectedTab.label : "Edit Profile";
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb />

        <div className="block">
          <h1 className="text-xl sm:text-2xl font-bold font-nunito text-secondary mb-4 sm:mb-6">
            Profile Setting
          </h1>

          {/* Mobile: Dropdown for tabs */}
          <div className="md:hidden mb-4">
            <CustomDropdown
              options={tabOptions}
              value={activeTab}
              onChange={handleTabChange}
              placeholder={getSelectedTabLabel()}
              className="w-full h-[52px]"
            />
          </div>

          {/* Desktop: Tabs */}
          <div className="hidden md:flex gap-4 mb-0 pl-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-2 text-base lg:text-lg font-medium font-nunito transition-colors relative ${
                  activeTab === tab.id
                    ? "text-[#4A2FCC] font-semibold"
                    : "text-darkGray hover:text-secondary"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#4A2FCC]"></div>
                )}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-lightGray p-4">
            {/* Tab Content */}
            <div>
              {activeTab === "edit" && (
                <EditProfileTab
                  profileData={profileSettingsData}
                  onSave={handleSaveProfile}
                />
              )}
              {activeTab === "password" && (
                <ChangePasswordTab
                  onSave={handleSavePassword}
                  onSuccess={() => setIsPasswordSuccessModalOpen(true)}
                />
              )}
              {activeTab === "delete" && (
                <DeleteAccountTab onDelete={handleDeleteAccount} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <PasswordSuccessModal
        isOpen={isPasswordSuccessModalOpen}
        onClose={() => setIsPasswordSuccessModalOpen(false)}
      />
      <ProfileOtpModal
        isOpen={isProfileOtpOpen}
        onClose={() => setIsProfileOtpOpen(false)}
        onVerify={(otp) => {
          console.log("Verified profile change OTP:", otp);
        }}
      />
    </DashboardLayout>
  );
}

export default ProfileSettings;
