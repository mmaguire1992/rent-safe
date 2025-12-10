import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CustomDropdown from "@/components/common/CustomDropdown";
import Pagination from "@/components/common/Pagination";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiDownload,
  FiMoreVertical,
} from "react-icons/fi";
import {
  properties,
  statusOptions,
  typeOptions,
  sortOptions,
} from "@/constant";

function MyProperties() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusDisplayText = (value) => {
    if (value === "all") return "Status: All";
    const option = statusOptions.find((opt) => opt.value === value);
    return option ? `Status: ${option.label}` : "Status: All";
  };

  const getTypeDisplayText = (value) => {
    if (value === "all") return "Type: All";
    const option = typeOptions.find((opt) => opt.value === value);
    return option ? `Type: ${option.label}` : "Type: All";
  };

  const getSortDisplayText = (value) => {
    const option = sortOptions.find((opt) => opt.value === value);
    return option ? `Sort: ${option.label}` : "Sort: Recent";
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = properties.slice(startIndex, endIndex);

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">My Properties</h1>
          <p className="text-darkGray">Manage and track your rental listings</p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg border border-lightGray p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-darkGray" />
                <input
                  type="text"
                  placeholder="Search anything"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Status Filter */}
              <div className="w-full sm:w-auto sm:min-w-[150px]">
                <CustomDropdown
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder={getStatusDisplayText(statusFilter)}
                  className="h-[40px]"
                  showFilterIcon={true}
                />
              </div>

              {/* Type Filter */}
              <div className="w-full sm:w-auto sm:min-w-[150px]">
                <CustomDropdown
                  options={typeOptions}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  placeholder={getTypeDisplayText(typeFilter)}
                  className="h-[40px]"
                  showFilterIcon={true}
                />
              </div>

              {/* Sort */}
              <div className="w-full sm:w-auto sm:min-w-[150px]">
                <CustomDropdown
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  placeholder={getSortDisplayText(sortBy)}
                  className="h-[40px]"
                  showFilterIcon={true}
                />
              </div>

              {/* Add Property Button */}
              <button
                onClick={() => navigate("/dashboard/properties/add")}
                className="bg-[#6B4EFF] text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center"
              >
                <FiPlus />
                <span>Add Property</span>
              </button>

              {/* Export Button */}
              <button className="bg-white border border-lightGray text-secondary px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center">
                <FiDownload />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-lg border border-lightGray overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-lightGray">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-darkGray uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-darkGray uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-darkGray uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-darkGray uppercase tracking-wider">
                    Rent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-darkGray uppercase tracking-wider">
                    Leads
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-darkGray uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-darkGray uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-darkGray uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-lightGray">
                {currentProperties.map((property, index) => (
                  <tr
                    key={property.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/properties/${property.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-darkGray text-sm">{index + 1 + startIndex}.</span>
                        <img
                          src={property.image}
                          alt={property.description}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-secondary">
                            {property.description}
                          </p>
                          <p className="text-xs text-darkGray">ID: {property.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-secondary">{property.location}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-secondary">{property.type}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-secondary">{property.rent}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-secondary">{property.leads}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                          property.status
                        )}`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-secondary">{property.views}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle menu actions here
                        }}
                      >
                        <FiMoreVertical className="text-secondary" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-lightGray">
            {currentProperties.map((property, index) => (
              <div
                key={property.id}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/dashboard/properties/${property.id}`)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-darkGray text-sm">{index + 1 + startIndex}.</span>
                  <img
                    src={property.image}
                    alt={property.description}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-secondary mb-1">
                      {property.description}
                    </p>
                    <p className="text-xs text-darkGray mb-1">ID: {property.id}</p>
                    <p className="text-xs text-secondary">{property.location}</p>
                  </div>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <FiMoreVertical className="text-secondary" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 ml-8">
                  <div>
                    <p className="text-xs text-darkGray mb-1">Type</p>
                    <p className="text-sm text-secondary">{property.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Rent</p>
                    <p className="text-sm font-semibold text-secondary">{property.rent}</p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Leads</p>
                    <p className="text-sm text-secondary">{property.leads}</p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Views</p>
                    <p className="text-sm text-secondary">{property.views}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-darkGray mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                        property.status
                      )}`}
                    >
                      {property.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-4 md:px-6 py-4 border-t border-lightGray">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={properties.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="properties"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyProperties;

