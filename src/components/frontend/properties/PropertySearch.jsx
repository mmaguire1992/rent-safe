import SearchIcon from "@/svg/websiteSvg/searchIcon";
import LocationIcon from "@/svg/websiteSvg/locationIcon";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import { addPropertyTypeOptions } from "@/constant";

// Use addPropertyTypeOptions - flat and apartment are separate options
const propertyTypeOptions = addPropertyTypeOptions;

function PropertySearch({
  value,
  onChange,
  onSearch,
  selectedType,
  onTypeChange,
}) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-6">
      <div className="bg-white rounded-2xl shadow-lg border border-border-search p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
        {/* Mobile: Dropdown and Search in same row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          {/* Property Type Dropdown - Visible on mobile */}
          <div className="w-full sm:hidden">
            <CustomDropdown
              options={propertyTypeOptions}
              value={selectedType || "apartment"}
              onChange={onTypeChange}
              placeholder="Select Property Type"
              className="h-[52px]"
            />
          </div>

          {/* Search Input */}

          <div className="flex items-center w-full justify-between md:flex-1 relative">
            <div className="relative w-full">
              <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
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
            onClick={onSearch}
            className="bg-blueGradient hover:opacity-90 text-white px-6 sm:px-8 py-3 rounded-lg font-bold font-nunito transition-all shadow-md hover:shadow-lg whitespace-nowrap text-sm sm:text-base"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export default PropertySearch;
