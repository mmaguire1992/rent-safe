'use client'

import { useState, useRef, useEffect } from "react";
import { FiEye, FiUser } from "react-icons/fi";
import GrayLeadsIcon from "@/svg/grayLeadsIcon";
import DownArrowIcon from "@/svg/downArrowIcon";

// Available status options for editing (only active and rented)
const editableStatusOptions = [
  { value: "active", label: "Active" },
  { value: "rented", label: "Rent Out" },
];

// Format status for display
const formatStatus = (status) => {
  if (!status) return 'Draft';
  
  const statusMap = {
    'draft': 'Draft',
    'pending_approval': 'Pending Approval',
    'active': 'Active',
    'inactive': 'Inactive',
    'rented': 'Rent Out',
    'suspended': 'Suspended'
  };
  
  return statusMap[status.toLowerCase()] || status;
};

// Get status badge color
const getStatusBadgeColor = (status) => {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower === 'active') {
    return 'bg-[#DFFFE6] text-[#00893A]';
  } else if (statusLower === 'rented') {
    return 'bg-[#FFF5CC] text-[#D19600]';
  } else if (statusLower === 'pending_approval') {
    return 'bg-blue-100 text-blue-600';
  } else if (statusLower === 'draft') {
    return 'bg-gray-100 text-gray-600';
  } else if (statusLower === 'suspended') {
    return 'bg-red-100 text-red-600';
  } else {
    return 'bg-gray-100 text-secondary';
  }
};

function PropertyStatusCard({ propertyData, onStatusChange }) {
  const currentStatus = propertyData.status?.toLowerCase() || 'draft';
  
  // Determine if status can be edited (only active and rented can be toggled)
  const canEditStatus = currentStatus === 'active' || currentStatus === 'rented';
  
  // Get available options based on current status
  const getAvailableOptions = () => {
    if (currentStatus === 'active') {
      // If active, can only change to rented
      return editableStatusOptions.filter(opt => opt.value === 'rented');
    } else if (currentStatus === 'rented') {
      // If rented, can only change to active
      return editableStatusOptions.filter(opt => opt.value === 'active');
    }
    // For other statuses, show both options (though they might not be selectable)
    return editableStatusOptions;
  };

  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Update selected status when propertyData changes
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

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
    if (!canEditStatus) {
      setIsDropdownOpen(false);
      return;
    }
    
    setSelectedStatus(value);
    setIsDropdownOpen(false);
    if (onStatusChange) {
      onStatusChange(value);
    }
  };

  const availableOptions = getAvailableOptions();
  const selectedOption = editableStatusOptions.find(
    (opt) => opt.value === selectedStatus
  );
  const displayLabel = formatStatus(selectedStatus);

  return (
    <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4">
      <h2 className="md:text-xl text-base font-bold font-nunito text-secondary mb-4">
        Listing Status
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        <div className="flex items-center gap-4 justify-between relative">
          <p className="text-base font-normal font-nunito text-darkGray mb-1">
            Status
          </p>
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(currentStatus)}`}>
                {displayLabel}
              </span>
              {canEditStatus && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Change status"
                  >
                    <DownArrowIcon className="w-3 h-3 text-darkGray" />
                  </button>
                  {isDropdownOpen && availableOptions.length > 0 && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-lightGray z-50 min-w-[120px] py-1 overflow-hidden">
                      {availableOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleStatusSelect(option.value)}
                          className="w-full text-left px-4 py-2 text-sm font-normal transition-colors hover:bg-gray-50 text-secondary"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
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
