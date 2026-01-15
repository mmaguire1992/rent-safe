'use client'

import { useState, useRef, useEffect } from "react";
import DownArrowIcon from "@/svg/downArrowIcon";
import { FiX } from "react-icons/fi";

function MultiSelectDropdown({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
  className = "",
  error = false,
  disabled = false,
  getIcon = null, // Function to get icon for an option: (option) => IconComponent
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedValues = Array.isArray(value) ? value : [];
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value));
  
  // Display text: show count or selected items
  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    if (selectedValues.length === 1) {
      return selectedOptions[0]?.label || placeholder;
    }
    return `${selectedValues.length} selected`;
  };

  const handleToggle = (optionValue) => {
    if (disabled) return;
    
    const currentValues = [...selectedValues];
    const index = currentValues.indexOf(optionValue);
    
    if (index > -1) {
      // Remove if already selected
      currentValues.splice(index, 1);
    } else {
      // Add if not selected
      currentValues.push(optionValue);
    }
    
    onChange(currentValues);
  };

  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    const currentValues = selectedValues.filter(val => val !== optionValue);
    onChange(currentValues);
  };

  const isSelected = (optionValue) => {
    return selectedValues.includes(optionValue);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-1.5 min-h-[52px] border rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 flex gap-1 items-center justify-between ${
          disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"
        } ${
          error ? "border-red-500" : selectedValues.length > 0 ? "border-lightGray" : "border-lightGray"
        } ${className}`}
      >
        <div className="flex-1 flex items-center gap-2 flex-wrap py-1">
          {selectedValues.length === 0 ? (
            <span className="text-darkGray text-sm md:text-base font-nunito font-medium">
              {placeholder}
            </span>
          ) : selectedValues.length === 1 ? (
            <span className="text-darkGray text-sm md:text-base font-nunito font-medium">
              {selectedOptions[0]?.label || placeholder}
            </span>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedOptions.slice(0, 2).map((option) => {
                const Icon = getIcon ? getIcon(option) : null;
                return (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#E8E2FF] text-[#6B4EFF] rounded text-sm font-medium"
                  >
                    {Icon && <span className="flex items-center"><Icon /></span>}
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => handleRemove(option.value, e)}
                      className="hover:text-[#6B4EFF] opacity-70 hover:opacity-100"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              {selectedValues.length > 2 && (
                <span className="text-darkGray text-sm md:text-base font-nunito font-medium">
                  +{selectedValues.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={`transform transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <DownArrowIcon />
        </div>
      </button>

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-lightGray rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => {
            const selected = isSelected(option.value);
            const Icon = getIcon ? getIcon(option) : null;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleToggle(option.value)}
                className={`w-full px-4 py-2 text-left text-sm md:text-base font-nunito font-normal hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                  selected
                    ? "bg-primary bg-opacity-10 text-primary"
                    : "text-secondary"
                }`}
              >
                <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                  selected
                    ? "bg-[#6B4EFF] border-[#6B4EFF]"
                    : "bg-white border-lightGray"
                }`}>
                  {selected && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
                {Icon && (
                  <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <Icon />
                  </span>
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MultiSelectDropdown;

