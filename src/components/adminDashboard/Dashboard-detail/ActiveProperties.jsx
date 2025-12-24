'use client'

import { useState, useRef, useEffect } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import {
  FiFilter,
  FiDownload,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiShare2,
} from "react-icons/fi";
import Pagination from "@/components/adminDashboard/common/Pagination";
import SortingIcon from "@/svg/sortingIcon";
import { FaPlus } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import ThreeDotsIcon from "@/svg/threeDotsIcon";

function ActiveProperties({ activeProperties }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});
  const itemsPerPage = 4;
  const totalItems = activeProperties.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = activeProperties.slice(startIndex, endIndex);

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

  const handleAction = (action, propertyId) => {
    console.log(`${action} clicked for property:`, propertyId);
    setOpenDropdownId(null);
    // Add your action handlers here
  };
  return (
    <div className="bg-white mt-4 sm:mt-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-secondary">
          Active Properties
        </h2>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button className="flex items-center gap-1.5 sm:gap-2 h-[36px] sm:h-[38px] border border-lightGray rounded-[10px] px-3 sm:px-4 md:px-6 py-1.5 md:py-2">
            <span className="text-darkGray text-xs sm:text-sm md:text-base font-bold font-nunito whitespace-nowrap">
              Sort by
            </span>
            <SortingIcon />
          </button>
          <button
            onClick={() => navigate("/dashboard/properties/add")}
            className="bg-blueGradient text-white px-3 sm:px-3.5 md:px-4 h-[36px] sm:h-[38px] py-1.5 md:py-2 rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base"
          >
            <span className="whitespace-nowrap">Add Property</span>
            <span>
              <GoPlus className="text-lg sm:text-xl md:text-2xl" />
            </span>
          </button>
          <button className="bg-white border border-[#4A2FCC] h-[36px] sm:h-[38px] text-[#4A2FCC] px-3 sm:px-4 md:px-6 py-1.5 md:py-2 rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors flex items-center gap-2 md:gap-3 text-xs sm:text-sm md:text-base">
            <span className="hidden sm:inline whitespace-nowrap">Export</span>
            <FiDownload className="text-sm md:text-base" />
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-lightGray rounded-[20px] overflow-x-auto overflow-y-visible">
        <div className="min-w-[1200px]">
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
              {currentProperties.map((property, index) => (
                <tr
                  key={property.id}
                  className="border-b border-lightGray hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-midGray text-base">
                        {startIndex + index + 1}
                      </span>
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold font-nunito text-secondary text-base">
                          {property.title}
                        </p>
                        <p className="text-darkGray text-base font-nunito font-normal">
                          {property.propertyId}
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
                  <td className="py-4 px-4">
                    <div
                      className="relative"
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
                            <span className="text-base text-secondary font-medium font-nunito">
                              Edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleAction("delete", property.id)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left  hover:bg-gray-50  transition-colors"
                          >
                            <span className="text-base text-secondary font-medium font-nunito">
                              Delete
                            </span>
                          </button>
                          <button
                            onClick={() => handleAction("share", property.id)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-secondary hover:bg-gray-50 transition-colors last:rounded-b-lg"
                          >
                            <span className="text-base text-secondary font-medium font-nunito">
                              Share
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="properties"
          />
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {currentProperties.map((property, index) => (
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

        {/* Mobile Pagination */}
        <div className="pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="properties"
          />
        </div>
      </div>
    </div>
  );
}

export default ActiveProperties;
