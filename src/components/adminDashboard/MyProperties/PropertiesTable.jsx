'use client'

import { useEffect, useRef, useState } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import Pagination from "@/components/adminDashboard/common/Pagination";
import ThreeDotsIcon from "@/svg/threeDotsIcon";
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
      <div className="border border-lightGray rounded-[20px] overflow-x-auto overflow-y-visible">
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
                  <td colSpan="8" className="py-8 text-center text-darkGray text-base">
                    No properties found.
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
                          : "bg-[#FFF5CC] text-[#D19600]"
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
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              handleAction("Delete", property.id, e);
                            }}
                            className="flex items-center gap-2 w-full text-left px-4 py-1 text-base text-darkGray font-nunito font-medium hover:bg-gray-50"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              handleAction("Share", property.id, e);
                            }}
                            className="flex items-center gap-2 w-full text-left px-4 py-1 text-base text-darkGray font-nunito font-medium hover:bg-gray-50"
                          >
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
        <div className="px-4 pb-4 sticky bottom-0 bg-white border-t border-lightGray">
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
