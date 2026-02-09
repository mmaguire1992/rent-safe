'use client'

import { useState, useEffect } from "react";
import { addPropertyTypeOptions, amenitiesList } from "@/constant";
import {
  bhkOptions,
} from "@/websitedata/filterOptions";
import FilterGroup from "./FilterGroup";
import PriceRange from "./PriceRange";

// Map frontend amenity display names to backend format
const mapAmenityToBackend = (amenity) => {
  const amenityMap = {
    "Wardrobes": "wardrobes",
    "Bed(s)": "beds",
    "Wooden flooring": "wooden_flooring",
    "Carpet flooring": "carpet_flooring",
    "Fireplace": "fireplace",
    "Underfloor heating": "underfloor_heating",
    "Heating controls": "heating_controls",
    "Dishwasher": "dishwasher",
    "Washing machine": "washing_machine",
    "Dryer / Washer-dryer": "dryer",
    "Microwave": "microwave",
    "Hob & oven": "hob_oven",
    "Fridge-freezer": "fridge_freezer",
    "Pantry / separate storage": "pantry",
    "Residents' parking": "residents_parking",
    "Sprinkler system": "sprinkler_system",
    "Bicycle storage": "bicycle_storage",
    "Smoke alarms": "smoke_alarms",
    "CCTV in communal areas": "cctv",
    "Recycling bins area": "recycling_bins",
    "Lift": "lift",
    "Gas Safety Certificate": "gas_safety_certificate",
    "Electrical Safety Certificate": "electrical_safety_certificate",
    "EV charging point": "ev_charging_point",
    "TV point": "tv_point",
    "Garage": "garage",
  };
  return amenityMap[amenity] || amenity.toLowerCase().replace(/\s+/g, "_");
};

// Convert amenitiesList to filter options format
const amenityOptions = amenitiesList.map((amenity) => ({
  value: mapAmenityToBackend(amenity),
  label: amenity,
}));

function PropertyFilters({ onFilterChange, initialFilters = null }) {
  const [filters, setFilters] = useState(initialFilters || {
    propertyType: "all",
    amenities: [],
    bhk: [],
    priceMin: 0,
    priceMax: 10000,
  });

  // Sync filters when initialFilters prop changes (e.g., from URL params)
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };


  const toggleAmenity = (value) => {
    const amenities = filters.amenities.includes(value)
      ? filters.amenities.filter((a) => a !== value)
      : [...filters.amenities, value];
    updateFilter("amenities", amenities);
  };

  const toggleBhk = (value) => {
    // Handle "all" option - clear all selections
    if (value === 'all') {
      updateFilter("bhk", []);
      return;
    }
    
    // Toggle the selected BHK value
    const bhk = filters.bhk.includes(value)
      ? filters.bhk.filter((b) => b !== value)
      : [...filters.bhk, value];
    updateFilter("bhk", bhk);
  };

  return (
    <div className="bg-white rounded-[20px] py-4 border border-[#E6E8EC]">
      <div className="mb-6 px-4 sm:px-6 flex justify-between items-center gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-[#2B2F38]">
          Select Filters
        </h2>
        <button class="bg-blueGradient hover:opacity-90 text-white px-4 lg:px-8 py-2 rounded-lg font-bold font-nunito transition-all shadow-md hover:shadow-lg whitespace-nowrap text-sm sm:text-base">Apply</button>
      </div>

      <div className="space-y-6">
        <FilterGroup
          title="Property by Type"
          options={[
            { value: 'all', label: 'All' },
            ...addPropertyTypeOptions
          ]}
          selectedValue={filters.propertyType}
          onSelect={(value) => updateFilter("propertyType", value)}
        />

        <FilterGroup
          title="Amenities"
          options={amenityOptions}
          isMultiSelect={true}
          selectedValues={filters.amenities}
          onSelect={toggleAmenity}
        />

        <FilterGroup
          title="BHK Type"
          options={bhkOptions}
          isMultiSelect={true}
          selectedValues={filters.bhk}
          onSelect={toggleBhk}
        />

        <PriceRange
          min={filters.priceMin}
          max={filters.priceMax}
          onChangeMin={(value) => updateFilter("priceMin", value)}
          onChangeMax={(value) => updateFilter("priceMax", value)}
        />
      </div>
    </div>
  );
}

export default PropertyFilters;
