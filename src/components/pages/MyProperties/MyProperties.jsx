'use client'

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Pagination from "@/components/adminDashboard/common/Pagination";
import PropertiesActionBar from "@/components/adminDashboard/MyProperties/PropertiesActionBar";
import PropertiesTable from "@/components/adminDashboard/MyProperties/PropertiesTable";
import PropertiesMobileCards from "@/components/adminDashboard/MyProperties/PropertiesMobileCards";
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import { fetchMyProperties } from '@/redux/slices/propertySlice';
import { getMyProperties } from '@/api/properties';
import { toast } from 'react-toastify';

function MyProperties() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myProperties: allProperties, loading, error, pagination } = useSelector((state) => state.property);
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 5;
  
  // Build API query parameters - all filtering done on backend
  const apiParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add status filter (skip if "all")
    if (statusFilter && statusFilter !== "all") {
      params.status = statusFilter;
    }

    // Add property type filter (skip if "all")
    if (typeFilter && typeFilter !== "all") {
      params.propertyType = typeFilter;
    }

    // Add search query
    if (searchQuery && searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    // Add sort parameter
    if (sortBy) {
      params.sortBy = sortBy;
    }

    return params;
  }, [currentPage, statusFilter, typeFilter, searchQuery, sortBy, itemsPerPage]);

  // Fetch properties when filters or page change
  useEffect(() => {
    dispatch(fetchMyProperties(apiParams));
  }, [dispatch, apiParams]);

  // Reset to page 1 when filters change (except page changes)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, searchQuery, sortBy]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Transform properties to match table component expectations
  // No client-side filtering - all done on backend
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
      
      // Format status (capitalize first letter and replace underscores)
      const status = property.status 
        ? property.status.charAt(0).toUpperCase() + property.status.slice(1).replace(/_/g, " ")
        : "Draft";
      
      return {
        id: property._id || property.id,
        image: imageUrl,
        description: property.title || property.description || "Untitled Property",
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

  // All filtering and sorting is done on the backend
  // Use the properties directly from the API response
  const currentProperties = transformedProperties;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const effectiveTotalItems = pagination?.total || pagination?.count || transformedProperties.length;
  const effectiveTotalPages = pagination?.totalPages || Math.ceil(effectiveTotalItems / itemsPerPage);

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-[#DFFFE6] text-[#00893A]";
      case "pending":
        return "bg-[#FFF5CC] text-[#D19600]";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Export properties to CSV
  const handleExportCSV = async () => {
    try {
      // Show loading toast
      toast.info('Preparing export...', { autoClose: 1000 });

      // Fetch ALL properties with current filters (no pagination limit)
      const exportParams = {
        page: 1,
        limit: 10000, // Very high limit to get all properties
        search: searchQuery && searchQuery.trim() ? searchQuery.trim() : '',
        status: statusFilter && statusFilter !== 'all' ? statusFilter : '',
        propertyType: typeFilter && typeFilter !== 'all' ? typeFilter : '',
        sortBy: sortBy || 'recent',
      };

      const exportData = await getMyProperties(exportParams);
      const propertiesToExport = exportData?.properties || [];

      if (!propertiesToExport || propertiesToExport.length === 0) {
        toast.error('No properties to export');
        return;
      }

      // Define CSV headers
      const headers = [
        'Title',
        'Property Type',
        'Bedrooms',
        'Bathrooms',
        'Rent',
        'Currency',
        'Deposit',
        'Status',
        'Location',
        'City',
        'Postcode',
        'Country',
        'Leads',
        'Views',
        'Date Added',
        'Approved On'
      ];

      // Convert properties to CSV rows
      const csvRows = propertiesToExport.map((property) => {
        // Build address parts
        const address = property.address || {};
        const city = address.city || '';
        const postcode = address.postcode || '';
        const country = address.country || '';
        const fullAddress = [
          address.address,
          city,
          address.county,
          postcode,
          country
        ].filter(Boolean).join(', ');

        // Format dates
        const formatDate = (dateString) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
          } catch (e) {
            return '';
          }
        };

        // Format currency symbol
        const currency = property.currency || 'GBP';
        const rentValue = property.rent || 0;

        // Format status
        const status = property.status 
          ? property.status.charAt(0).toUpperCase() + property.status.slice(1).replace(/_/g, ' ')
          : 'Draft';

        return [
          `"${(property.title || 'Untitled Property').replace(/"/g, '""')}"`,
          `"${(property.propertyType || '').charAt(0).toUpperCase() + (property.propertyType || '').slice(1)}"`,
          property.bedrooms || 0,
          property.bathrooms || 0,
          rentValue,
          currency,
          property.deposit || 0,
          `"${status}"`,
          `"${fullAddress.replace(/"/g, '""')}"`,
          `"${city.replace(/"/g, '""')}"`,
          `"${postcode.replace(/"/g, '""')}"`,
          `"${country.replace(/"/g, '""')}"`,
          property.leadsCount || property.leads || 0,
          property.views || property.viewCount || 0,
          `"${formatDate(property.createdAt)}"`,
          `"${formatDate(property.approvedAt)}"`
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `properties_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Properties exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export properties');
    }
  };

  return (
    <DashboardLayout>
      <div className="block">
        {/* Page Header */}
        <div className="mb-3">
          <h1 className="text-xl md:text-2xl font-bold text-secondary mb-2">
            My Properties
          </h1>
          <p className="text-sm md:text-base text-darkGray">
            Manage and track your rental listings
          </p>
        </div>

        {/* Action Bar */}
        <PropertiesActionBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          navigate={navigate}
          onExport={handleExportCSV}
        />

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-lg border border-red-500 p-8 text-center">
            <p className="text-red-600 text-sm sm:text-base">Error loading properties: {error.message || "Unknown error"}</p>
            <button
              onClick={() => dispatch(fetchMyProperties(apiParams))}
              className="mt-4 px-4 py-2 bg-[#6B4EFF] text-white rounded-lg hover:bg-opacity-90 text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        )}

        {/* Properties Table */}
        {!error && (
          <>
            <PropertiesTable
              properties={currentProperties}
              startIndex={startIndex}
              getStatusBadgeClass={getStatusBadgeClass}
              currentPage={currentPage}
              totalPages={effectiveTotalPages}
              totalItems={effectiveTotalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              loading={loading}
            />

            {/* Properties Mobile Cards */}
            <div className="md:hidden bg-white rounded-lg border border-lightGray overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6B4EFF] border-t-transparent"></div>
                    <p className="mt-4 text-darkGray text-sm sm:text-base">Loading properties...</p>
                  </div>
                </div>
              ) : currentProperties.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 flex items-center justify-center overflow-visible">
                      <div className="text-[#9FA3AA] scale-150" style={{ overflow: 'visible' }}>
                        <HouseIcon isFilled={false} />
                      </div>
                    </div>
                    <p className="text-darkGray text-sm sm:text-base">No properties found. Try adjusting your filters or add a new property.</p>
                  </div>
                </div>
              ) : (
                <>
                  <PropertiesMobileCards
                    properties={currentProperties}
                    startIndex={startIndex}
                    getStatusBadgeClass={getStatusBadgeClass}
                  />
                  <div className="px-4 md:px-6 py-4 border-t border-lightGray">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={effectiveTotalPages}
                      totalItems={effectiveTotalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                      itemName="properties"
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}

export default MyProperties;
