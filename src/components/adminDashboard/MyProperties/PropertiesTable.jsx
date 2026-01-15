'use client'

import { useEffect, useRef, useState } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import Pagination from "@/components/adminDashboard/common/Pagination";
import ThreeDotsIcon from "@/svg/threeDotsIcon";
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import { FiEdit, FiTrash2, FiShare2 } from "react-icons/fi";

function PropertiesTable({
  properties,
  startIndex,
  getStatusBadgeClass,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false,
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
    <div className="bg-white hidden md:block">
      <div className="border border-lightGray rounded-[20px] overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-visible">
          <div className="min-w-[1100px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lightGray">
                  <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                    Property
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                    Rent
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                    Leads
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                    Views
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6B4EFF] border-t-transparent"></div>
                        <p className="mt-4 text-darkGray text-sm sm:text-base">Loading properties...</p>
                      </div>
                    </td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="mb-3 flex items-center justify-center overflow-visible">
                          <div className="text-[#9FA3AA] scale-150" style={{ overflow: 'visible' }}>
                            <HouseIcon isFilled={false} />
                          </div>
                        </div>
                        <p className="text-darkGray text-base">No properties found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  properties.map((property, index) => (
                    <tr
                      key={property.id}
                      className="border-b border-lightGray hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        navigate(`/dashboard/properties/${property.id}`)
                      }
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-midGray text-base">
                            {startIndex + index + 1}.
                          </span>
                          {property.image ? (
                            <img
                              src={property.image}
                              alt={property.description}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/48x48?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">No Image</span>
                            </div>
                          )}
                          <div>
                            <p className="font-bold font-nunito text-secondary text-base">
                              {property.description}
                            </p>
                            <p className="text-darkGray text-base font-nunito font-normal">
                              ID: {property.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-secondary  text-base font-nunito font-normal">
                          {property.location}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-secondary  text-base font-nunito font-normal">
                          {property.type}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-secondary text-base font-nunito">
                          {property.rent}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-secondary text-base font-nunito font-normal">
                          {property.leads}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-base font-nunito font-normal ${
                            property.status === "Active"
                              ? "bg-[#DFFFE6] text-[#00893A]"
                              : property.status === "Pending Approval" || property.status === "pending_approval"
                              ? "bg-gray-100 text-blue-600"
                              : property.status === "Rent Out" || property.status === "rented"
                              ? "bg-[#FFF5CC] text-[#D19600]"
                              : property.status === "Draft" || property.status === "draft"
                              ? "bg-[#E8E2FF] text-[#6B4EFF]"
                              : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {property.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-secondary text-base font-nunito font-normal">
                          {property.views}
                        </p>
                      </td>
                      <td className="py-4 px-4 relative">
                        <div
                          className="relative"
                          ref={(el) => (dropdownRefs.current[property.id] = el)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleDropdown(property.id);
                            }}
                            className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <ThreeDotsIcon />
                          </button>
                          {openDropdownId === property.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border border-lightGray rounded-lg shadow-lg z-10">
                              <button
                                onClick={(e) => {
                                  handleAction("Edit", property.id, e);
                                }}
                                className="flex items-center gap-2 w-full text-left px-4 py-1 text-base text-darkGray font-nunito font-medium hover:bg-gray-50"
                              >
                                <FiEdit size={16} />
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  handleAction("Delete", property.id, e);
                                }}
                                className="flex items-center gap-2 w-full text-left px-4 py-1 text-base text-darkGray font-nunito font-medium hover:bg-gray-50"
                              >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M13.6478 7.34375C13.6478 7.34375 13.2922 11.7539 13.0859 13.6115C13.0806 13.8072 13.0362 13.9999 12.9552 14.1781C12.8742 14.3563 12.7583 14.5165 12.6144 14.6492C12.4705 14.7819 12.3014 14.8844 12.1172 14.9507C11.933 15.0169 11.7374 15.0456 11.5419 15.0351C9.83376 15.0656 8.12495 15.0656 6.41548 15.0351C6.22383 15.0416 6.0328 15.0101 5.85343 14.9423C5.67407 14.8745 5.50993 14.7718 5.37052 14.6401C5.23112 14.5085 5.11923 14.3504 5.04131 14.1752C4.9634 14 4.92102 13.8111 4.91663 13.6194C4.70906 11.7453 4.35547 7.34703 4.35547 7.34703" stroke="#62748E" stroke-linecap="round" stroke-linejoin="round" />
                                  <path d="M14.5534 5.23438H3.44922" stroke="#62748E" stroke-linecap="round" stroke-linejoin="round" />
                                  <path d="M12.4129 5.22991C12.1636 5.22978 11.9221 5.14336 11.7293 4.98532C11.5365 4.82727 11.4044 4.60736 11.3554 4.36295L11.1963 3.56672C11.1485 3.3884 11.0433 3.23083 10.8968 3.11847C10.7503 3.0061 10.5709 2.94524 10.3863 2.94531H7.61451C7.42991 2.94524 7.25044 3.0061 7.10398 3.11847C6.95752 3.23083 6.85225 3.3884 6.80451 3.56672L6.64539 4.36295C6.59638 4.60736 6.46427 4.82727 6.27149 4.98532C6.07871 5.14336 5.83717 5.22978 5.58789 5.22991" stroke="#62748E" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                Delete
                              </button>
                              <button
                                onClick={(e) => {
                                  handleAction("Share", property.id, e);
                                }}
                                className="flex items-center gap-2 w-full text-left px-4 py-1 text-base text-darkGray font-nunito font-medium hover:bg-gray-50"
                              >
                                <FiShare2 size={16} />
                                Share
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="px-4 pb-4 bg-white border-t border-lightGray flex-shrink-0">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            itemName="properties"
          />
        </div>
      </div>
    </div>
  );
}

export default PropertiesTable;
