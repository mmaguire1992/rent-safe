'use client'

import { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiDownload, FiFilter } from "react-icons/fi";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import { statusOptions, typeOptions, sortOptions } from "@/constant";
import BlueSearchIcon from "@/svg/blueSearchIcon";
import { GoPlus } from "react-icons/go";
import ButtonDropdown from "@/components/adminDashboard/common/buttonDropdown";
import VerticalFilterIcon from "@/svg/verticalFilterIcon";
import { useAuth } from "@/context/AuthContext";
import VerificationSubscriptionModal from "@/components/common/VerificationSubscriptionModal";
import { useVerificationSubscription } from "@/hooks/useVerificationSubscription";

function PropertiesActionBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  navigate,
  onExport,
}) {
  const { user, userType } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const { checkStatus } = useVerificationSubscription();

  const handleAddProperty = async () => {
    // Only check for owners
    if (userType !== 'owner') {
      navigate("/dashboard/properties/add");
      return;
    }

    try {
      // Check verification and subscription status
      const status = await checkStatus();
      
      // Set modal state based on what's needed
      setNeedsVerification(status.needsVerification);
      setNeedsSubscription(status.needsSubscription);
      
      // If user needs verification or subscription, show modal
      if (status.needsVerification || status.needsSubscription) {
        setShowModal(true);
        return;
      }
      
      // If verified and subscribed, proceed
      navigate("/dashboard/properties/add");
    } catch (error) {
      console.error('Error checking verification and subscription:', error);
      // On error, show modal to be safe
      setNeedsVerification(true);
      setNeedsSubscription(true);
      setShowModal(true);
    }
  };

  const getStatusDisplayText = (value) => {
    if (value === "all") return "All";
    const option = statusOptions.find((opt) => opt.value === value);
    return option ? option.label : "All";
  };

  const getTypeDisplayText = (value) => {
    if (value === "all") return "All";
    const option = typeOptions.find((opt) => opt.value === value);
    return option ? option.label : "All";
  };

  const getSortDisplayText = (value) => {
    const option = sortOptions.find((opt) => opt.value === value);
    return option ? option.label : "Recent";
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Prevent body scroll when filter panel is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFilterOpen]);

  return (
    <div className="block mb-3">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-md">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg md:text-xl">
              <BlueSearchIcon />
            </span>

            <input
              type="text"
              placeholder="Search anything"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-3 h-12 md:pr-4 py-1.5 md:py-2 border border-lightGray rounded-xl focus:outline-none focus:ring-0 text-sm md:text-base"
            />
          </div>
        </div>

        {/* Mobile Filter Button */}

        {/* Mobile Filter Panel - Slides down from top */}
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsFilterOpen(false)}
            />

            {/* Filter Panel */}
            <div
              className={`md:hidden fixed top-0 left-0 right-0 bg-white z-50 shadow-lg transition-transform duration-300 ease-in-out max-h-screen overflow-y-auto ${
                isFilterOpen ? "translate-y-0" : "-translate-y-full"
              }`}
            >
              <div className="p-4 border-b border-lightGray">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-secondary font-nunito">
                    Filters
                  </h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-secondary hover:text-primary transition-colors p-1"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 pb-4">
                  {/* Status Filter */}
                  <div>
                    <ButtonDropdown
                      options={statusOptions}
                      value={statusFilter}
                      onChange={setStatusFilter}
                      placeholder={getStatusDisplayText(statusFilter)}
                      className="h-[40px] w-full"
                      showFilterIcon={true}
                      label="Status"
                    />
                  </div>

                  {/* Type Filter */}
                  <div>
                    <ButtonDropdown
                      options={typeOptions}
                      value={typeFilter}
                      onChange={setTypeFilter}
                      placeholder={getTypeDisplayText(typeFilter)}
                      className="h-[40px] w-full"
                      showFilterIcon={true}
                      label="Type"
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <ButtonDropdown
                      options={sortOptions}
                      value={sortBy}
                      onChange={setSortBy}
                      placeholder={getSortDisplayText(sortBy)}
                      className="h-[40px] w-full"
                      showFilterIcon={true}
                      label="Sort"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Filters and Actions - Desktop */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="md:hidden ">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-[60px] flex items-center justify-center gap-2 px-4 py-2 border border-lightGray rounded-[10px] text-secondary text-sm font-bold font-nunito transition-colors"
            >
              <VerticalFilterIcon size={20} />
            </button>
          </div>
          {/* Status Filter */}
          <div className="w-full hidden md:block sm:w-auto sm:min-w-[150px]">
            <ButtonDropdown
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder={getStatusDisplayText(statusFilter)}
              className="h-[40px]"
              showFilterIcon={true}
              label="Status"
            />
          </div>

          {/* Type Filter */}
          <div className="w-full hidden md:block sm:w-auto sm:min-w-[150px]">
            <ButtonDropdown
              options={typeOptions}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder={getTypeDisplayText(typeFilter)}
              className="h-[40px]"
              showFilterIcon={true}
              label="Type"
            />
          </div>

          {/* Sort */}
          <div className="w-full hidden md:block sm:w-auto sm:min-w-[150px]">
            <ButtonDropdown
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder={getSortDisplayText(sortBy)}
              className="h-[40px]"
              showFilterIcon={true}
              label="Sort"
            />
          </div>
          <button
            onClick={handleAddProperty}
            className="bg-blueGradient text-white px-3  h-[38px] md:px-4 py-1.5 md:py-2 rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base"
          >
            <span>Add Property</span>
            <span>
              <GoPlus className="text-xl md:text-2xl" />
            </span>
          </button>
          <button 
            onClick={onExport}
            className="bg-white border border-[#4A2FCC] h-[38px] text-[#4A2FCC] px-3 md:px-6 py-1.5 md:py-2 rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors flex items-center gap-2 md:gap-3 text-sm md:text-base"
          >
            <span className="inline">Export</span>
            <FiDownload className="text-sm md:text-base" />
          </button>
          {/* Add Property Button */}
        </div>
      </div>

      <VerificationSubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        needsVerification={needsVerification}
        needsSubscription={needsSubscription}
      />
    </div>
  );
}

export default PropertiesActionBar;
