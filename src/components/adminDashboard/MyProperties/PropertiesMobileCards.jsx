import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThreeDotsIcon from "@/svg/threeDotsIcon";

function PropertiesMobileCards({
  properties,
  startIndex,
  getStatusBadgeClass,
}) {
  const navigate = useNavigate();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && dropdownRefs.current[openDropdownId]) {
        if (!dropdownRefs.current[openDropdownId].contains(event.target)) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  const handleToggleDropdown = (propertyId) => {
    setOpenDropdownId(openDropdownId === propertyId ? null : propertyId);
  };

  const handleAction = (action, propertyId, e) => {
    if (e) e.stopPropagation();
    console.log(`${action} property:`, propertyId);
    if (action === "Edit") {
      navigate(`/dashboard/properties/${propertyId}`);
    }
    setOpenDropdownId(null);
  };
  return (
    <div className="md:hidden space-y-3">
      {properties.map((property, index) => (
        <div
          key={property.id}
          className="border border-lightGray rounded-[20px] overflow-hidden bg-white"
        >
          <div className="block">
            <div className="flex p-3 sm:p-4 items-start justify-between mb-3 border-b border-lightGray">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold font-nunito text-secondary mb-2 text-base truncate">
                    {property.title}
                  </p>
                  <p className="text-darkGray text-xs sm:text-sm font-nunito font-normal">
                    {property.propertyId}
                  </p>
                </div>
              </div>
              <div
                className="relative flex-shrink-0"
                ref={(el) => (dropdownRefs.current[property.id] = el)}
              >
                <button
                  onClick={() => handleToggleDropdown(property.id)}
                  className="flex items-center justify-center hover:bg-gray-100 rounded-lg p-1 transition-colors"
                >
                  <ThreeDotsIcon />
                </button>
                {openDropdownId === property.id && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-lightGray rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => handleAction("edit", property.id)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-secondary hover:bg-gray-50 transition-colors first:rounded-t-lg"
                    >
                      <span className="text-sm sm:text-base text-secondary font-medium font-nunito">
                        Edit
                      </span>
                    </button>
                    <button
                      onClick={() => handleAction("delete", property.id)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm sm:text-base text-secondary font-medium font-nunito">
                        Delete
                      </span>
                    </button>
                    <button
                      onClick={() => handleAction("share", property.id)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-secondary hover:bg-gray-50 transition-colors last:rounded-b-lg"
                    >
                      <span className="text-sm sm:text-base text-secondary font-medium font-nunito">
                        Share
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 px-4 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm min-w-[60px] font-normal text-darkGray font-nunito">
                  Location:
                </span>
                <p className="text-sm text-secondary font-nunito font-medium text-left flex-1 ml-2 truncate">
                  {property.location}
                </p>
              </div>
              <div className="flex items-center justify-start">
                <span className="text-sm  min-w-[60px] font-normal text-darkGray font-nunito">
                  Type:
                </span>
                <p className="text-sm text-secondary font-nunito font-medium text-left flex-1 ml-2 truncate">
                  {property.type}
                </p>
              </div>
              <div className="flex items-center justify-start">
                <span className="text-sm  min-w-[60px] font-normal text-darkGray font-nunito">
                  Rent:
                </span>
                <p className="font-bold text-sm text-secondary font-nunito  text-left flex-1 ml-2 truncate">
                  {property.rent}
                </p>
              </div>
              <div className="flex items-center justify-start">
                <span className="text-sm  min-w-[60px] font-normal text-darkGray font-nunito">
                  Leads:
                </span>
                <p className="text-sm text-secondary font-nunito font-medium  ml-2">
                  {property.leads}
                </p>
              </div>
              <div className="flex items-center justify-start">
                <span className="text-sm  min-w-[60px] font-normal text-darkGray font-nunito">
                  Views:
                </span>
                <p className="text-sm text-secondary font-nunito font-medium text-left flex-1 ml-2 truncate">
                  {property.views}
                </p>
              </div>
              <div className="flex items-center justify-start">
                <span className="text-sm  min-w-[60px] font-normal text-darkGray font-nunito">
                  Status:
                </span>
                <span
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-nunito font-normal ${
                    property.status === "Active"
                      ? "bg-[#DFFFE6] text-[#00893A]"
                      : "bg-[#FFF5CC] text-[#D19600]"
                  }`}
                >
                  {property.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PropertiesMobileCards;
