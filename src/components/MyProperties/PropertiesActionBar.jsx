import { FiSearch, FiPlus, FiDownload } from "react-icons/fi";
import CustomDropdown from "@/components/common/CustomDropdown";
import { statusOptions, typeOptions, sortOptions } from "@/constant";
import BlueSearchIcon from "../../svg/blueSearchIcon";
import { GoPlus } from "react-icons/go";
import ButtonDropdown from "../common/buttonDropdown";

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
}) {
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

  return (
    <div className="block mb-3">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg md:text-xl">
              <BlueSearchIcon />
            </span>

            <input
              type="text"
              placeholder="Search anything"
              className="w-full pl-9 md:pl-10 pr-3 h-12 md:pr-4 py-1.5 md:py-2 border border-lightGray rounded-xl focus:outline-none focus:ring-0 text-sm md:text-base"
            />
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <ButtonDropdown
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
            <ButtonDropdown
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
            <ButtonDropdown
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder={getSortDisplayText(sortBy)}
              className="h-[40px]"
              showFilterIcon={true}
            />
          </div>
          <button
            onClick={() => navigate("/dashboard/properties/add")}
            className="bg-blueGradient text-white px-3  h-[38px] md:px-4 py-1.5 md:py-2 rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base"
          >
            <span>Add Property</span>
            <span>
              <GoPlus className="text-xl md:text-2xl" />
            </span>
          </button>
          <button className="bg-white border border-[#4A2FCC] h-[38px] text-[#4A2FCC] px-3 md:px-6 py-1.5 md:py-2 rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors flex items-center gap-2 md:gap-3 text-sm md:text-base">
            <span className="hidden sm:inline">Export</span>
            <FiDownload className="text-sm md:text-base" />
          </button>
          {/* Add Property Button */}
        </div>
      </div>
    </div>
  );
}

export default PropertiesActionBar;
