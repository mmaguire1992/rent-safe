'use client'

import { useState, useRef, useEffect } from "react";
import { FiFilter } from "react-icons/fi";
import DownArrowIcon from "@/svg/downArrowIcon";
import SortingIcon from "@/svg/sortingIcon";

function CustomDropdown({
  options = [],
  value = "",
  onChange,
  placeholder = "Select an option",
  className = "",
  showFilterIcon = false,
  error = false,
  disabled = false,
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

  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue) => {
    if (disabled) return; // Don't allow selection if disabled
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-1.5 h-[52px] border rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 flex gap-1 items-center justify-between ${
          disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"
        } ${
          error ? "border-red-500" : value ? "border-lightGray" : "border-lightGray"
        } ${className}`}
      >
        {/* {showFilterIcon && (
          <FiFilter className="absolute left-3 text-darkGray" />
        )} */}

        <span className="text-darkGray text-sm md:text-base font-nunito font-medium">
          {displayText}
        </span>
        <div
          className={`transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <DownArrowIcon />
        </div>
      </button>

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-lightGray rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-4 py-1.5 text-left text-sm md:text-base font-nunito font-normal hover:bg-gray-50 transition-colors ${
                value === option.value
                  ? "bg-primary bg-opacity-10 text-primary"
                  : "text-secondary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;
