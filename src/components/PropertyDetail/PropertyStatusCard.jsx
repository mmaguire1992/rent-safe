import { useState, useRef, useEffect } from "react";
import { FiEye, FiUser } from "react-icons/fi";
import GrayLeadsIcon from "../../svg/grayLeadsIcon";
import DownArrowIcon from "../../svg/downArrowIcon";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "rent-out", label: "Rent Out" },
];

function PropertyStatusCard({ propertyData, onStatusChange }) {
  const [selectedStatus, setSelectedStatus] = useState(
    propertyData.status?.toLowerCase() || "active"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStatusSelect = (value) => {
    setSelectedStatus(value);
    setIsDropdownOpen(false);
    if (onStatusChange) {
      onStatusChange(value);
    }
  };

  const selectedOption = statusOptions.find(
    (opt) => opt.value === selectedStatus
  );
  const displayLabel = selectedOption?.label || "Active";

  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-6">
      <h2 className="text-xl font-bold font-nunito text-secondary mb-4">
        Listing Status
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 justify-between relative">
          <p className="text-base font-normal font-nunito text-darkGray mb-1">
            Status
          </p>
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedStatus === "active"
                    ? "bg-[#DFFFE6] text-[#00893A] hover:bg-green-200"
                    : "bg-gray-100 text-secondary hover:bg-gray-200"
                }`}
              >
                <span>{displayLabel}</span>
              </button>
              <DownArrowIcon className="w-2 h-2 text-darkGray" />
            </div>
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-lightGray z-50 min-w-[110px] py-1 overflow-hidden">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleStatusSelect(option.value)}
                    className={`w-full text-left px-4 py-1 text-sm font-normal transition-colors hover:bg-gray-50 ${
                      selectedStatus === option.value
                        ? "text-[#6B4EFF] font-medium"
                        : "text-secondary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 justify-between">
          <p className="text-base font-normal font-nunito text-darkGray mb-1">
            Date Added
          </p>
          <p className="text-base font-bold text-secondary">
            {propertyData.dateAdded}
          </p>
        </div>
        <div className="flex items-center gap-4 justify-between">
          <p className="text-base font-normal font-nunito text-darkGray mb-1">
            Approved On
          </p>
          <p className="text-base font-bold text-secondary">
            {propertyData.approvedOn}
          </p>
        </div>

        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <FiEye className="text-darkGray" />
            <p className="text-base font-normal font-nunito text-darkGray">
              Views
            </p>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-secondary">
              {propertyData.views}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <GrayLeadsIcon />
            <p className="text-base font-normal font-nunito text-darkGray">
              Leads
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-secondary">
              {propertyData.leads}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyStatusCard;
