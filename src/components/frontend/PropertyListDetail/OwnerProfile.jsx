import ChatWhiteIcon from "../../../svg/websiteSvg/chatWhiteIcon";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";
import RemainingIcon from "../../../svg/websiteSvg/remainingIcon";
function OwnerProfile({
  ownerName = "Sarah Mitchell",
  propertiesCount = 12,
  freeContacts = 3,
  onContactClick,
}) {
  const initials = ownerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-lightGray">
      <h3 className="text-lg sm:text-xl font-bold text-secondary mb-4 sm:mb-3">Owner Profile</h3>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
        <div className="flex items-center gap-3 sm:gap-4 mb-0 w-full lg:w-auto">
          <div className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] bg-[#DBEAFE] rounded-full flex items-center justify-center shrink-0">
            <span className="text-lg sm:text-xl font-bold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0">
              <span className="text-sm sm:text-base font-bold text-[#0F172B] truncate">
                {ownerName}
              </span>
              <GreenCheckedIcon />
            </div>
            <p className="text-text-secondary text-xs sm:text-sm">
              {propertiesCount} properties listed
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <div className="bg-[#FFF5CC] border border-[#FFE699] rounded-lg px-3 py-2 sm:py-2.5 mb-0 flex items-center gap-2">
            <RemainingIcon />
            <p className="text-xs text-[#973C00] font-normal">
              You have 3 free contacts remaining
            </p>
          </div>
          <button 
            onClick={onContactClick}
            className="flex items-center justify-center gap-2 bg-blueGradient text-white py-2 px-4 sm:px-6 text-sm sm:text-base rounded-[10px] font-bold hover:bg-opacity-90 transition-colors whitespace-nowrap"
          >
            <ChatWhiteIcon />
            Contact Owner
          </button>
        </div>
      </div>
    </div>
  );
}

export default OwnerProfile;
