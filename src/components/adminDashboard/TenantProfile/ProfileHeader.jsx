'use client'

import { useNavigate } from '@/lib/react-router-compat';
import LargeCheckIcon from "@/svg/largeCheckIcon";
import SmallCheckIcon from "@/svg/smallCheckIcon";
import DesignationIcon from "@/svg/designationIcon";
import BlueLocationIcon from "@/svg/blueLocationIcon";
import BlueIncomeIcon from "@/svg/blueIncomeIcon";
import RedCrossIcon from "@/svg/redCrossIcon";

function ProfileHeader({ tenantData, onSendOffer, onChat }) {
  const navigate = useNavigate();

  // Get initials from name
  const getInitials = (name) => {
    if (!name || name === 'N/A') return 'U';
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] || '') + (nameParts[1][0] || '').toUpperCase();
    }
    return name[0]?.toUpperCase() || 'U';
  };

  const initials = getInitials(tenantData.name);
  const hasValidImage = tenantData.profileImage && 
                        tenantData.profileImage !== '/default-avatar.png' && 
                        tenantData.profileImage !== 'N/A';

  return (
    <div className="bg-lightGrayGradient rounded-[20px] shadow-[0px_0px_40px_0px_#4A4A4A14] border border-lightGray p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative mx-auto md:mx-0">
          {hasValidImage ? (
            <img
              src={tenantData.profileImage}
              alt={tenantData.name}
              className="w-24 h-24 md:w-[150px] mx-auto md:mx-0 md:h-[150px] shadow-[0px_0px_40px_0px_#4A4A4A14] rounded-full object-cover"
              onError={(e) => {
                // Hide image and show initials if image fails to load
                e.target.style.display = 'none';
                const initialsDiv = e.target.nextSibling;
                if (initialsDiv) {
                  initialsDiv.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div
            className={`w-24 h-24 md:w-[150px] md:h-[150px] mx-auto md:mx-0 rounded-full shadow-[0px_0px_40px_0px_#4A4A4A14] flex items-center justify-center text-white font-bold text-2xl md:text-4xl bg-gradient-to-br from-[#6B4EFF] to-[#4A2FCC] ${hasValidImage ? 'hidden' : ''}`}
          >
            {initials}
          </div>
          {tenantData.verified === true && (
            <span className="absolute bottom-0 right-0">
              <LargeCheckIcon />
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <h1 className="text-xl md:text-2xl font-bold text-secondary">
              {tenantData.name}
            </h1>
            {tenantData.verified === true ? (
              <span className="bg-[#DFFFE6] text-[#00893A] font-nunito font-normal text-base px-3 py-1 rounded-full flex items-center gap-1">
                Verified <SmallCheckIcon />
              </span>
            ) : (
              <span className="bg-red-100 text-red-600 font-nunito font-normal text-base px-3 py-1 rounded-full flex items-center gap-1">
                Not Verified <RedCrossIcon />
              </span>
            )}
          </div>
          <p className="text-darkGray text-base font-normal mb-4">
            {tenantData.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-4">
              <span className="bg-[#E8E2FF] rounded-[10px] p-2">
                <DesignationIcon />
              </span>
              <div>
                <p className="text-midGray text-sm font-nunito font-normal mb-0">
                  Designation
                </p>
                <p className="text-secondary text-base font-nunito font-normal">
                  {tenantData.designation && tenantData.designation !== 'N/A' && tenantData.designation.trim() !== '' ? tenantData.designation : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-[#E8E2FF] rounded-[10px] p-2">
                <BlueLocationIcon />
              </span>
              <div>
                <p className="text-midGray text-sm font-nunito font-normal mb-0">
                  Location
                </p>
                <p className="text-secondary text-base font-nunito font-normal">
                  {tenantData.location && tenantData.location !== 'N/A' && tenantData.location.trim() !== '' ? tenantData.location : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-[#E8E2FF] rounded-[10px] p-2">
                <BlueIncomeIcon />
              </span>
              <div>
                <p className="text-midGray text-sm font-nunito font-normal mb-0">
                  Monthly Income
                </p>
                <p className="text-[#4A2FCC] text-base font-nunito font-normal">
                  {tenantData.monthlyIncome && tenantData.monthlyIncome !== 'N/A' && String(tenantData.monthlyIncome).trim() !== '' ? tenantData.monthlyIncome : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
        {(onChat !== null || onSendOffer) && (
          <div className="flex md:flex-col flex-row gap-4">
            {onChat !== null && (
              <button
                onClick={() => {
                  if (onChat) {
                    onChat();
                  } else {
                    navigate("/dashboard/messages");
                  }
                }}
                className="bg-blueGradient text-white px-6 py-2 rounded-[10px] text-base font-nunito font-bold hover:bg-opacity-90 transition-colors shadow-[0px_2px_4px_0px_#FFFFFF33_inset]"
              >
                Chat
              </button>
            )}
            {onSendOffer && (
              <button
                onClick={onSendOffer}
                className="bg-transparent border border-[#4A2FCC] text-[#4A2FCC] px-6 py-2 rounded-[10px] text-base font-nunito font-bold hover:bg-opacity-90 transition-colors"
              >
                Send Offer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;
