'use client'

import { useState, useRef, useEffect } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import SearchIcon from "@/svg/websiteSvg/searchIcon";
import LocationIcon from "@/svg/websiteSvg/locationIcon";
import { addPropertyTypeOptions } from "@/constant";

// Use addPropertyTypeOptions directly - flat and apartment are separate options
// addPropertyTypeOptions includes: apartment, house, studio, flat, bungalow, other
const propertyTypeOptions = addPropertyTypeOptions;

function SearchBar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState(""); // Default to apartment
  const searchTimeoutRef = useRef(null);

  // Debounce search query - wait 500ms after user stops typing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Navigate function - shared by both button click and debounce
  const performSearch = (query, type) => {
    const params = new URLSearchParams();
    if (query && query.trim()) {
      params.set("q", query.trim());
    }
    if (type) {
      params.set("type", type);
    }
    const queryString = params.toString();
    navigate(`/properties${queryString ? `?${queryString}` : ""}`);
  };

  // Handle explicit search button click or Enter key
  const handleSearch = () => {
    // Clear any pending debounce
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Navigate immediately with current search query
    performSearch(searchQuery, propertyType);
  };

  // Auto-navigate after debounce when user stops typing
  // This provides better UX - user can type and it will search automatically after 500ms
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      performSearch(debouncedSearchQuery, propertyType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, propertyType]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 -mt-10 md:-mt-24 lg:-mt-34 relative z-10 pb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-[#7356FF] p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        {/* Dropdown */}
        <div className="min-w-[160px]">
          <CustomDropdown
            options={propertyTypeOptions}
            value={propertyType}
            onChange={(value) => setPropertyType(value)}
            placeholder="Select Property Type"
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
              onChange={(e) => setSearchQuery(e.target.value.replace(/^\s+/, ''))}
              onKeyPress={handleKeyPress}
              placeholder="Enter an address, neighborhood, city, or ZIP code"
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 text-sm sm:text-base border border-border rounded-lg focus:outline-none transition-colors text-text-primary placeholder:text-[#5A5E67]"
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
