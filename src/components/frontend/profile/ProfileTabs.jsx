import React from "react";

const TABS = [
  { id: "edit", label: "Edit Profile" },
  { id: "password", label: "Change Password" },
  { id: "verification", label: "Verification" },
  { id: "property-history", label: "Property History" },
  { id: "delete", label: "Delete Account" },
];

function ProfileTabs({ activeTab, onChange }) {
  return (
    <div className="flex flex-wrap space-x-6  pb-0 pl-4 mb-0">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`pb-2 text-base md:text-lg  relative transition-colors ${
              isActive
                ? "text-[#6B4EFF] font-semibold"
                : "text-[#667085] hover:text-[#6B4EFF] font-normal"
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute left-0 right-0 -bottom-px h-[4px] bg-[#6B4EFF] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default ProfileTabs;
