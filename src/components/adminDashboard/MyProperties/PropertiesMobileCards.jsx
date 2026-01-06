'use client'

import { useState, useRef, useEffect } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import { toast } from 'react-toastify';
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

  // Handle share button click - copy property link to clipboard
  const handleShare = async (propertyId, e) => {
    if (e) e.stopPropagation();
    
    try {
      if (!propertyId) {
        toast.error('Property ID not available');
        setOpenDropdownId(null);
        return;
      }

      // Construct property detail URL (public route for renters to view)
      const propertyUrl = `${window.location.origin}/properties/${propertyId}`;
      
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(propertyUrl);
        toast.success('Link copied to clipboard!');
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = propertyUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            toast.success('Link copied to clipboard!');
          } else {
            throw new Error('execCommand failed');
          }
        } catch (err) {
          document.body.removeChild(textArea);
          throw err;
        }
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link. Please copy manually.');
    }
    
    setOpenDropdownId(null);
  };

  const handleAction = (action, propertyId, e) => {
    if (e) e.stopPropagation();
    
    if (action === "edit") {
      navigate(`/dashboard/properties/${propertyId}`);
      setOpenDropdownId(null);
    } else if (action === "share") {
      handleShare(propertyId, e);
    } else if (action === "delete") {
      // Delete functionality can be added here
      console.log(`Delete property:`, propertyId);
    setOpenDropdownId(null);
    }
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
                {property.image ? (
                <img
                  src={property.image}
                    alt={property.description || property.title}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                    }}
                />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-500">No Image</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold font-nunito text-secondary mb-2 text-base truncate">
                    {property.description || property.title}
                  </p>
                  <p className="text-darkGray text-xs sm:text-sm font-nunito font-normal">
                    ID: {property.id}
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
