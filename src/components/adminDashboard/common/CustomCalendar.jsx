'use client'

import { useState, useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import GrayCalendarIcon from "@/svg/grayCalendarIcon";

function CustomCalendar({ value, onChange, placeholder = "dd/mm/yyyy", minDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef(null);

  // Parse value to Date object
  const selectedDate = value ? new Date(value) : null;
  
  // Get minimum date object (default to today if not provided)
  // Always calculate fresh to ensure we're using current date
  const getMinDateObj = () => {
    if (minDate) {
      // Parse the minDate string (format: YYYY-MM-DD)
      const [year, month, day] = minDate.split('-').map(Number);
      const min = new Date(year, month - 1, day);
      min.setHours(0, 0, 0, 0);
      return min;
    }
    // Default to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Format date to YYYY-MM-DD
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    // Don't allow navigating to months before minDate
    const minDateObj = getMinDateObj();
    const minMonth = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
    if (newDate >= minMonth) {
      setCurrentDate(newDate);
    }
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Handle date selection
  const handleDateClick = (day) => {
    if (!day || isDisabled(day)) {
      return; // Don't allow selecting disabled dates
    }
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    newDate.setHours(0, 0, 0, 0);
    
    // Double-check that the date is not before minDate
    const minDateToCompare = getMinDateObj();
    if (newDate.getTime() < minDateToCompare.getTime()) {
      return; // Prevent selecting past dates
    }
    
    onChange(formatDateForInput(newDate));
    setIsOpen(false);
  };

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Check if date is disabled (before minDate)
  const isDisabled = (day) => {
    if (!day) return true;
    const dateToCheck = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    dateToCheck.setHours(0, 0, 0, 0);
    
    // Get fresh minDate to ensure it's current
    const minDateToCompare = getMinDateObj();
    
    // Compare dates - disable if dateToCheck is before minDate
    return dateToCheck.getTime() < minDateToCompare.getTime();
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="relative" ref={calendarRef}>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={formatDateForDisplay(value)}
          placeholder={placeholder}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 pr-12 border h-[52px] border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 cursor-pointer"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-[#6B4EFF] transition-colors cursor-pointer z-10"
        >
          <GrayCalendarIcon />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-lightGray rounded-xl shadow-lg z-50 w-[320px] p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              disabled={(() => {
                const minDateObj = getMinDateObj();
                return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) <= new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
              })()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-5 h-5 text-secondary" />
            </button>
            <h3 className="text-base font-bold text-secondary">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiChevronRight className="w-5 h-5 text-secondary" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-darkGray py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const disabled = !day || isDisabled(day);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => day && !disabled && handleDateClick(day)}
                  disabled={disabled}
                  className={`
                    w-10 h-10 rounded-lg text-sm font-medium transition-colors
                    ${
                      disabled
                        ? "cursor-not-allowed opacity-40 text-gray-400"
                        : "cursor-pointer hover:bg-purple-50"
                    }
                    ${
                      isSelected(day)
                        ? "bg-[#6B4EFF] text-white"
                        : isToday(day) && !disabled
                        ? "bg-purple-100 text-[#6B4EFF] font-bold"
                        : !disabled
                        ? "text-secondary hover:bg-gray-50"
                        : ""
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomCalendar;
