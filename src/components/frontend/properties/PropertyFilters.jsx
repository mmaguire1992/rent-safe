'use client'

import { useState } from "react";
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

function PropertyFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    propertyType: "all",
    amenities: [],
    bhk: "all",
    priceMin: 0,
    priceMax: 10000,
  });

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

  return (
    <div className="bg-white rounded-[20px] py-4 border border-[#E6E8EC]">
      <div className="mb-6 px-4 sm:px-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#2B2F38]">
          Select Filters
        </h2>
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
          selectedValue={filters.bhk}
          onSelect={(value) => updateFilter("bhk", value)}
        />

        <PriceRange
          min={filters.priceMin}
          max={filters.priceMax}
          onChange={(value) => updateFilter("priceMax", value)}
        />
      </div>
    </div>
  );
}

export default PropertyFilters;
