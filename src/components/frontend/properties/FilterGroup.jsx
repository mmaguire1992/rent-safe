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
          const isSelected = isMultiSelect
            ? selectedValues.includes(option.value)
            : selectedValue === option.value;

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
