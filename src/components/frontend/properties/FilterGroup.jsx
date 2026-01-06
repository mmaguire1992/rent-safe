import DropdownIcon from "@/svg/websiteSvg/dropdownIcon";
import FilterButton from "./FilterButton";

function FilterGroup({
  title,
  options,
  selectedValue,
  onSelect,
  isMultiSelect = false,
  selectedValues = [],
}) {
  return (
    <div className="border-b border-gray-200 px-4 sm:px-6 pb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold font-nunito text-[#2B2F38] mb-3">
          {title}
        </h3>
        <div className="dropdownIcon">
          <DropdownIcon />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          let isSelected = false;
          
          if (isMultiSelect) {
            // For multi-select, check if value is in selectedValues array
            // Special handling for "all" option - it's selected when array is empty
            if (option.value === 'all') {
              isSelected = !selectedValues || (Array.isArray(selectedValues) && selectedValues.length === 0);
            } else {
              // Convert both to strings for comparison to handle type mismatches
              const optionValueStr = String(option.value);
              isSelected = Array.isArray(selectedValues) && 
                          selectedValues.some(val => String(val) === optionValueStr);
            }
          } else {
            // For single select
            isSelected = String(selectedValue) === String(option.value);
          }

          return (
            <FilterButton
              key={option.value}
              label={option.label}
              isSelected={isSelected}
              onClick={() => onSelect(option.value)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default FilterGroup;
