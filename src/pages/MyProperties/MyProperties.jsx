import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Pagination from "@/components/common/Pagination";
import PropertiesActionBar from "@/components/MyProperties/PropertiesActionBar";
import PropertiesTable from "@/components/MyProperties/PropertiesTable";
import PropertiesMobileCards from "@/components/MyProperties/PropertiesMobileCards";
import { properties } from "@/constant";

function MyProperties() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

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
        />

        {/* Properties Table */}
        <PropertiesTable
          properties={currentProperties}
          startIndex={startIndex}
          getStatusBadgeClass={getStatusBadgeClass}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={properties.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />

        {/* Properties Mobile Cards */}
        <div className="md:hidden bg-white rounded-lg border border-lightGray overflow-hidden">
          <PropertiesMobileCards
            properties={currentProperties}
            startIndex={startIndex}
            getStatusBadgeClass={getStatusBadgeClass}
          />
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
