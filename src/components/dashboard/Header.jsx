import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiBell,
  FiChevronDown,
  FiMenu,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import BlueSearchIcon from "../../svg/blueSearchIcon";
import BellIcon from "../../svg/bellIcon";
import GreenCheckedIcon from "../../svg/greenCheckedIcon";

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    // Handle logout logic here
    navigate("/login");
  };

  return (
    <div className="bg-white border-b border-lightGray px-3 sm:px-6 py-3 md:py-4 relative">
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-secondary"
        >
          <FiMenu className="text-xl" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg md:text-xl">
              <BlueSearchIcon />
            </span>

            <input
              type="text"
              placeholder="Search anything"
              className="w-full pl-9 md:pl-10 pr-3 h-12 md:pr-4 py-1.5 md:py-2 border border-lightGray rounded-xl focus:outline-none focus:ring-0 text-sm md:text-base"
            />
          </div>
        </div>

        {/* Center - Plan Info */}
        <div className="hidden lg:flex items-center gap-4 mx-8 border border-lightGray rounded-xl py-1 pr-1 pl-3">
          <div className="flex items-center gap-2">
            <span className="text-midGray text-base font-bold text-nunito">
              Current Plan:
            </span>
            <span className="text-yellow font-bold text-base text-nunito">
              Premium
            </span>
          </div>
          <button className="bg-yellowGradient text-white px-4 py-1.5  rounded-lg text-base font-bold text-nunito hover:bg-opacity-90 transition-colors whitespace-nowrap">
            Upgrade Your Plan
          </button>
        </div>

        {/* Right - Notifications & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <BellIcon />
          </button>
          <div
            className="hidden sm:flex items-center gap-2 md:gap-3 relative"
            ref={dropdownRef}
          >
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 md:gap-3 cursor-pointer border border-lightGray rounded-full p-1"
            >
              <div className="relative">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#E8E2FF] rounded-full flex items-center justify-center text-primary font-bold text-sm md:text-base">
                  JS
                </div>
                <span className="absolute -top-1 -right-1">
                  <GreenCheckedIcon />
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <span className="text-secondary font-bold text-base text-nunito">
                  John Smith
                </span>
                <FiChevronDown
                  className={`text-darkGray transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg border border-lightGray shadow-lg z-50">
                {/* User Info Section */}
                <div className="p-4 border-b border-lightGray">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-[#6B4EFF] rounded-full flex items-center justify-center text-white font-bold">
                        JS
                      </div>
                      <FiCheckCircle className="absolute -bottom-1 -right-1 text-green-600 bg-white rounded-full text-sm" />
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary text-base">
                        John Smith
                      </h3>
                      <p className="text-sm text-darkGray">
                        johnsmith@gmail.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      navigate("/dashboard/profile");
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="font-semibold text-[#6B4EFF] text-base">
                      Profile Setting
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="font-semibold text-[#6B4EFF] text-base">
                      Logout
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Plan Info */}
      <div className="lg:hidden flex items-center justify-between mt-3 pt-3 border-t border-lightGray">
        <div className="flex items-center gap-2">
          <span className="text-secondary text-xs">Current Plan:</span>
          <span className="text-[#D19600] font-bold text-xs">Premium</span>
        </div>
        <button className="bg-[#FF6B35] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-opacity-90 transition-colors">
          Upgrade
        </button>
      </div>
    </div>
  );
}

export default Header;
