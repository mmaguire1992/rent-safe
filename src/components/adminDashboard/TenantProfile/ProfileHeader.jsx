import { useNavigate } from "react-router-dom";
import LargeCheckIcon from "@/svg/largeCheckIcon";
import SmallCheckIcon from "@/svg/smallCheckIcon";
import DesignationIcon from "@/svg/designationIcon";
import BlueLocationIcon from "@/svg/blueLocationIcon";
import BlueIncomeIcon from "@/svg/blueIncomeIcon";

function ProfileHeader({ tenantData, onSendOffer, onChat }) {
  const navigate = useNavigate();

  return (
    <div className="bg-lightGrayGradient rounded-[20px] shadow-[0px_0px_40px_0px_#4A4A4A14] border border-lightGray p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative mx-auto md:mx-0">
          <img
            src={tenantData.profileImage}
            alt={tenantData.name}
            className="w-24 h-24 md:w-[150px] mx-auto md:mx-0 md:h-[150px] shadow-[0px_0px_40px_0px_#4A4A4A14] rounded-full object-cover"
          />
          {tenantData.verified && (
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
            {tenantData.verified && (
              <span className="bg-[#DFFFE6] text-[#00893A] font-nunito font-normal text-base px-3 py-1 rounded-full flex items-center gap-1">
                Verified <SmallCheckIcon />
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
                  {tenantData.designation}
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
                  {tenantData.location}
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
                <p className="text-secondary text-base font-nunito font-normal">
                  {tenantData.monthlyIncome}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex md:flex-col flex-row gap-4">
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
          <button
            onClick={onSendOffer}
            className="bg-transparent border border-[#4A2FCC] text-[#4A2FCC] px-6 py-2 rounded-[10px] text-base font-nunito font-bold hover:bg-opacity-90 transition-colors"
          >
            Send Offer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
