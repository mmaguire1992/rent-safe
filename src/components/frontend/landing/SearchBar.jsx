'use client'

import { useState } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import SearchIcon from "@/svg/websiteSvg/searchIcon";
import LocationIcon from "@/svg/websiteSvg/locationIcon";

// Property type options for search
const propertyTypeOptions = [
  { value: "flat/apartment", label: "Flat/Apartment" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
  { value: "villa", label: "Villa" },
  { value: "penthouse", label: "Penthouse" },
  { value: "floor", label: "Independent Floor" },
  { value: "plot", label: "Plot/Land" },
];

function SearchBar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("flat/apartment");

  const handleSearch = () => {
    // Navigate to properties page with search query as URL parameter
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    if (propertyType && propertyType !== "flat/apartment") {
      params.set("type", propertyType);
    }
    const queryString = params.toString();
    navigate(`/properties${queryString ? `?${queryString}` : ""}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 -mt-10 md:-mt-24 lg:-mt-34 relative z-10 pb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-border-search p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        {/* Dropdown */}
        <div className="min-w-[160px]">
          <CustomDropdown
            options={propertyTypeOptions}
            value={propertyType}
            onChange={(value) => setPropertyType(value)}
            placeholder="Flat/Apartment"
            className="h-[52px]"
          />
        </div>
        <div className="h-12 w-[1px] bg-[#DFDFDF] mx-3 hidden sm:block"></div>
        {/* Search Input */}
        <div className="flex items-center justify-between md:flex-1 relative">
          <div className="relative w-full">
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter an address, neighborhood, city, or ZIP code"
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 text-sm sm:text-base border border-border rounded-lg focus:outline-none transition-colors text-text-primary placeholder:text-text-secondary"
            />
          </div>
          <div className="relative ml-2 md:ml-0 md:absolute md:right-4 md:top-1/2 md:-translate-y-1/2 text-text-secondary cursor-pointer">
            <LocationIcon />
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-blueGradient hover:opacity-90 text-white px-6 sm:px-8 py-3 rounded-lg font-bold font-nunito transition-all shadow-md hover:shadow-lg whitespace-nowrap text-sm sm:text-base"
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
