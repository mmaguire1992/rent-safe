import { FiCircle } from "react-icons/fi";
import { getAmenityIcon, getUtilityIcon } from "@/constant";

// Dummy icon component for amenities
const DummyAmenityIcon = () => (
  <FiCircle className="w-5 h-5 text-[#6B4EFF]" strokeWidth="2" />
);

function PropertyDetailsGrid({ propertyData }) {
  // Helper function to format text: replace underscores with spaces and capitalize
  const formatText = (text) => {
    if (!text) return '';
    return text
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getAmenityIconComponent = (amenity) => {
    const Icon = getAmenityIcon(amenity);
    return Icon || DummyAmenityIcon;
  };
  const DummyUtilityIcon = () => (
    <FiCircle className="w-5 h-5 text-yellow-500" strokeWidth="2" />
  );

  const getUtilityIconComponent = (utility) => {
    const Icon = getUtilityIcon(utility);
    return Icon || DummyUtilityIcon;
  };
  return (
    <div className="block">
      {/* Property Details */}
      <div className="mb-4 border border-lightGray rounded-[20px] p-4 sm:p-6">
        <h4 className="text-lg sm:text-xl font-bold font-nunito text-secondary mb-1">
          Property Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-3 sm:gap-4 mt-5">
          <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-2">
            <p className="text-sm sm:text-base font-normal w-[120px] md:w-auto font-nunito text-darkGray">
              Monthly Rent:
            </p>
            <p className="text-sm sm:text-base font-bold font-nunito text-secondary">
              €{propertyData.monthlyRent}
            </p>
          </div>

          <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-2">
            <p className="text-sm sm:text-base font-normal w-[120px] md:w-auto font-nunito text-darkGray">
              Property Type:
            </p>
            <p className="text-sm sm:text-base font-bold font-nunito text-secondary">
              {propertyData.propertyType}
            </p>
          </div>

          <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-2">
            <p className="text-sm sm:text-base font-normal w-[120px] md:w-auto font-nunito text-darkGray">
              Furnished Status:
            </p>
            <p className="text-sm sm:text-base font-bold font-nunito text-secondary capitalize">
              {propertyData.furnishedStatus}
            </p>
          </div>

          <div className="flex sm:flex-row sm:items-center gap-1 sm:gap-2">
            <p className="text-sm sm:text-base font-normal w-[120px] md:w-auto font-nunito text-darkGray">
              Available From:
            </p>
            <p className="text-sm sm:text-base font-bold font-nunito text-secondary">
              {propertyData.availableFrom}
            </p>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-white rounded-[20px] border border-lightGray p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold font-nunito text-secondary mb-4">
          Amenities
        </h2>
        <div className="flex sm:items-center flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
          {propertyData.amenities?.map((amenity, index) => {
            const Icon = getAmenityIconComponent(amenity);
            const displayName = amenity?.replace(/_/g, ' ') || amenity;
            return (
              <div key={index} className="flex items-center gap-3">
                <span className="bg-[#E8E2FF] w-[36px] h-[36px] rounded-[10px] flex items-center justify-center">
                  <Icon />
                </span>
                <span className="text-base font-normal font-nunito text-secondary">
                  {formatText(amenity)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="block mt-4">
          <h2 className="text-lg sm:text-xl font-bold font-nunito text-secondary mb-4">
            Utilities
          </h2>
          <div className="flex sm:items-center flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
            {propertyData.utilities?.map((utility, index) => {
              const Icon = getUtilityIconComponent(utility);
              const displayName = utility?.replace(/_/g, ' ') || utility;
              return (
                <div key={index} className="flex items-center gap-2">
                  <span className="bg-[#FFF5CC] w-[36px] h-[36px] rounded-[10px] flex items-center justify-center">
                    <Icon />
                  </span>
                  <span className="text-base font-normal font-nunito text-secondary">
                    {formatText(utility)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailsGrid;
