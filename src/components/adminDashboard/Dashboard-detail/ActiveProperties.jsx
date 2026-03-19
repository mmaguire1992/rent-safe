'use client'

import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
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
import { fetchMyActiveProperties } from '@/redux/slices/propertySlice';
import { useAuth } from "@/context/AuthContext";
import VerificationSubscriptionModal from "@/components/common/VerificationSubscriptionModal";
import { useVerificationSubscription } from "@/hooks/useVerificationSubscription";
import { buildPropertyShareUrl } from "@/utils/propertyShare";

function ActiveProperties() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myActiveProperties: allProperties, loading, error, pagination } = useSelector((state) => state.property);
  const { user, userType } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null); // Store subscription data to pass to modal
  const { checkStatus } = useVerificationSubscription();
  const isProcessingRef = useRef(false); // Prevent multiple simultaneous calls

  const handleAddProperty = async () => {
    // Prevent multiple simultaneous calls
    if (isProcessingRef.current) {
      return;
    }

    // Only check for owners
    if (userType !== 'owner') {
      navigate("/dashboard/properties/add");
      return;
    }

    try {
      isProcessingRef.current = true;

      // Check verification and subscription status
      const status = await checkStatus();

      // Check if subscription limit has expired (has subscription but remainingProperties === 0)
      // Use subscription data from checkStatus to avoid duplicate API call
      let hasSubscriptionLimitExpired = false;
      if (status.hasSubscription && !status.needsSubscription && status.subscription) {
        const subscription = status.subscription;
        const isActiveStatus = subscription?.status === 'active' || subscription?.status === 'activate';
        if (subscription && isActiveStatus &&
          subscription.remainingProperties !== undefined &&
          subscription.remainingProperties === 0) {
          hasSubscriptionLimitExpired = true;
        }
      }

      // Set modal state based on what's needed
      setNeedsVerification(status.needsVerification);
      // If subscription limit expired, also set needsSubscription to true to show modal
      setNeedsSubscription(status.needsSubscription || hasSubscriptionLimitExpired);
      // Pass subscription data to modal to avoid duplicate API call
      setSubscriptionData(status.subscription || null);

      // If user needs verification, subscription, or limit expired, show modal
      if (status.needsVerification || status.needsSubscription || hasSubscriptionLimitExpired) {
        setShowModal(true);
        return;
      }

      // If everything is okay (verified + has active subscription with remaining properties), proceed
      navigate("/dashboard/properties/add");
    } catch (error) {
      console.error('Error checking verification and subscription:', error);
      // On error, show modal to be safe
      setNeedsVerification(true);
      setNeedsSubscription(true);
      setShowModal(true);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [sortBy, setSortBy] = useState(null); // 'title', 'location', 'type', 'rent', 'leads', 'views', 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const dropdownRefs = useRef({});
  const sortDropdownRef = useRef(null);
  const itemsPerPage = 4;

  // Fetch active properties when component mounts, page changes, or sort changes
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add sortBy and sortOrder if sorting is applied
    if (sortBy) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }

    dispatch(fetchMyActiveProperties(params));
  }, [dispatch, currentPage, itemsPerPage, sortBy, sortOrder]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Sort options
  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'rent', label: 'Rent' },
    { value: 'leads', label: 'Leads' },
    { value: 'views', label: 'Views' },
  ];

  // Transform properties (sorting is done on backend)
  const transformedProperties = useMemo(() => {
    if (!allProperties || allProperties.length === 0) return [];

    return allProperties.map((property) => {
      // Extract image URL from primaryImageId or images array
      let imageUrl = null;
      if (property.primaryImageId) {
        if (typeof property.primaryImageId === 'string') {
          imageUrl = property.primaryImageId;
        } else if (property.primaryImageId.url) {
          imageUrl = property.primaryImageId.url;
        }
      }
      // Fallback to images array if primaryImageId is not available
      if (!imageUrl && property.images && property.images.length > 0) {
        const firstImage = property.images[0];
        imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url;
      }
      // Fallback to property.image if exists
      if (!imageUrl && property.image) {
        imageUrl = property.image;
      }

      // Build location string from address
      const locationParts = [];
      if (property.address) {
        if (property.address.city) locationParts.push(property.address.city);
        if (property.address.county) locationParts.push(property.address.county);
        if (property.address.postcode) locationParts.push(property.address.postcode);
      }
      const location = locationParts.length > 0
        ? locationParts.join(", ")
        : property.location || "N/A";

      // Format rent with currency
      const currency = property.currency || "GBP";
      const rentSymbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "USD" ? "$" : "";
      const rent = property.rent
        ? `${rentSymbol}${property.rent.toLocaleString()}`
        : "N/A";

      // Format status (capitalize first letter)
      const status = property.status
        ? property.status.charAt(0).toUpperCase() + property.status.slice(1).replace(/_/g, " ")
        : "Active";

      return {
        id: property._id || property.id,
        image: imageUrl,
        title: property.title || "Untitled Property",
        propertyId: property._id || property.id,
        location: location,
        type: property.propertyType
          ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
          : "N/A",
        rent: rent,
        leads: property.leads || property.leadCount || 0,
        views: property.views || property.viewCount || 0,
        status: status,
        // Keep original property data for reference
        _original: property,
      };
    });
  }, [allProperties]);

  const totalItems = pagination?.total || pagination?.count || transformedProperties.length;
  const totalPages = pagination?.totalPages || Math.ceil(totalItems / itemsPerPage);

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = transformedProperties;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && dropdownRefs.current[openDropdownId]) {
        if (!dropdownRefs.current[openDropdownId].contains(event.target)) {
          setOpenDropdownId(null);
        }
      }
      if (showSortDropdown && sortDropdownRef.current) {
        if (!sortDropdownRef.current.contains(event.target)) {
          setShowSortDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId, showSortDropdown]);

  const handleToggleDropdown = (propertyId) => {
    setOpenDropdownId(openDropdownId === propertyId ? null : propertyId);
  };

  const handleAction = (action, propertyId) => {
    setOpenDropdownId(null);
    if (action === "edit") {
      navigate(`/dashboard/properties/${propertyId}`);
    } else if (action === "delete") {
      console.log("Delete property:", propertyId);
      // TODO: Implement delete functionality
    } else if (action === "share") {
      handleShare(propertyId);
    }
  };

  const handleShare = async (propertyId) => {
    try {
      if (!propertyId) {
        toast.error('Property ID not available');
        return;
      }

      const propertyUrl = buildPropertyShareUrl(propertyId);
      if (!propertyUrl) {
        toast.error('Property link is not available');
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(propertyUrl);
        toast.success('Link copied to clipboard!');
      } else {
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
  };

  const handleSort = (sortField) => {
    if (sortBy === sortField) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with ascending order
      setSortBy(sortField);
      setSortOrder('asc');
    }
    setShowSortDropdown(false);
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    if (!transformedProperties || transformedProperties.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare CSV headers
    const headers = ['Property', 'Location', 'Type', 'Rent', 'Leads', 'Views', 'Status', 'Property ID'];

    // Prepare CSV rows
    const rows = transformedProperties.map(property => [
      property.title || '',
      property.location || '',
      property.type || '',
      property.rent || '',
      property.leads || 0,
      property.views || 0,
      property.status || '',
      property.propertyId || '',
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `active-properties-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white mt-4 sm:mt-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-secondary">
          Active Properties
        </h2>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 sm:gap-2 h-[36px] sm:h-[38px] border border-lightGray rounded-[10px] px-3 sm:px-4 md:px-6 py-1.5 md:py-2 hover:bg-gray-50 transition-colors"
            >
              <span className="text-darkGray text-xs sm:text-sm md:text-base font-bold font-nunito whitespace-nowrap">
                {sortBy ? `Sort by: ${sortOptions.find(opt => opt.value === sortBy)?.label || sortBy}` : 'Sort by'}
              </span>
              <SortingIcon />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-2 w-[6rem] lg:w-48 bg-white border border-lightGray rounded-lg shadow-lg z-50">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors ${sortBy === option.value ? 'bg-blue-50' : ''
                      } ${option.value === sortOptions[0].value ? 'first:rounded-t-lg' : ''} ${option.value === sortOptions[sortOptions.length - 1].value ? 'last:rounded-b-lg' : ''
                      }`}
                  >
                    <span className="text-sm text-secondary font-medium font-nunito">
                      {option.label}
                    </span>
                    {sortBy === option.value && (
                      <span className="text-xs text-[#4A2FCC] font-bold">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleAddProperty}
            className="bg-blueGradient text-white px-3 sm:px-3.5 md:px-4 h-[36px] sm:h-[38px] py-1.5 md:py-2 rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base"
          >
            <span className="whitespace-nowrap">Add Property</span>
            <span>
              <GoPlus className="text-lg sm:text-xl md:text-2xl" />
            </span>
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-white border border-[#4A2FCC] h-[36px] sm:h-[38px] text-[#4A2FCC] px-3 sm:px-4 md:px-6 py-1.5 md:py-2 rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors flex items-center gap-2 md:gap-3 text-xs sm:text-sm md:text-base"
          >
            <span className="inline whitespace-nowrap">Export</span>
            <FiDownload className="text-sm md:text-base" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="border border-red-500 rounded-[20px] p-8 text-center">
          <p className="text-red-600 text-sm sm:text-base">Error loading properties: {error.message || "Unknown error"}</p>
          <button
            onClick={() => dispatch(fetchMyActiveProperties({ page: currentPage, limit: itemsPerPage }))}
            className="mt-4 px-4 py-2 bg-[#6B4EFF] text-white rounded-lg hover:bg-opacity-90 text-sm sm:text-base"
          >
            Retry
          </button>
        </div>
      )}

      {/* Desktop Table */}
      {!error && (
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
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6B4EFF] border-t-transparent"></div>
                        <p className="mt-4 text-darkGray text-sm sm:text-base">Loading active properties...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentProperties.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-darkGray text-base">
                      No active properties found.
                    </td>
                  </tr>
                ) : (
                  currentProperties.map((property, index) => (
                    <tr
                      key={property.id}
                      className="border-b border-lightGray hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-midGray text-base">
                            {startIndex + index + 1}
                          </span>
                          {property.image ? (
                            <img
                              src={property.image}
                              alt={property.title}
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
                          className={`px-3 py-1 rounded-full text-base font-nunito font-normal ${property.status === "Active"
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
                              {/* <button
                            onClick={() => handleAction("edit", property.id)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-secondary hover:bg-gray-50 transition-colors first:rounded-t-lg"
                          >
                            <span className="text-base text-secondary font-medium font-nunito">
                              Edit
                            </span>
                          </button> */}
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
                  ))
                )}
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
      )}

      {/* Mobile Cards */}
      {!error && (
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="border border-lightGray rounded-[20px] p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6B4EFF] border-t-transparent"></div>
                <p className="mt-4 text-darkGray text-sm sm:text-base">Loading active properties...</p>
              </div>
            </div>
          ) : currentProperties.length === 0 ? (
            <div className="border border-lightGray rounded-[20px] p-8 text-center">
              <p className="text-darkGray text-sm sm:text-base">No active properties found.</p>
            </div>
          ) : (
            currentProperties.map((property, index) => (
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
                          alt={property.title}
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
                        className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-nunito font-normal ${property.status === "Active"
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
            ))
          )}

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
      )}

      <VerificationSubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        needsVerification={needsVerification}
        needsSubscription={needsSubscription}
        subscriptionData={subscriptionData}
      />
    </div>
  );
}

export default ActiveProperties;
