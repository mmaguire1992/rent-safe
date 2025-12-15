import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
import EditProfileTab from "@/components/ProfileSettings/EditProfileTab";
import ChangePasswordTab from "@/components/ProfileSettings/ChangePasswordTab";
import DeleteAccountTab from "@/components/ProfileSettings/DeleteAccountTab";
import DeleteAccountModal from "@/components/ProfileSettings/DeleteAccountModal";
import PasswordSuccessModal from "@/components/ProfileSettings/PasswordSuccessModal";
import { profileSettingsData } from "@/constant";

function ProfileSettings() {
  const [activeTab, setActiveTab] = useState("edit");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordSuccessModalOpen, setIsPasswordSuccessModalOpen] = useState(false);

  const handleSaveProfile = (data) => {
    console.log("Saving profile:", data);
    // Handle profile save logic
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb />

        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h1 className="text-2xl font-bold font-nunito text-secondary mb-6">
            Profile Setting
          </h1>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-lightGray mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 text-base font-semibold font-nunito transition-colors relative ${
                  activeTab === tab.id
                    ? "text-[#6B4EFF]"
                    : "text-darkGray hover:text-secondary"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B4EFF]"></div>
                )}
              </button>
            ))}
          </div>

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
    </DashboardLayout>
  );
}

export default ProfileSettings;





