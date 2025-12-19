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
import BlueSearchIcon from "@/svg/blueSearchIcon";
import BellIcon from "@/svg/bellIcon";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";
import LogoutIcon from "@/svg/logoutIcon";

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
    <div className="bg-white  px-3 sm:px-6 py-3 md:py-4 relative">
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-secondary"
        >
          <FiMenu className="text-xl" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md">
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

        {/* Right - Notifications & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-4  border border-lightGray rounded-xl py-1 pr-1 pl-3">
            <div className="flex items-center gap-2">
              <span className="text-midGray text-base font-bold font-nunito">
                Current Plan:
              </span>
              <span className="text-yellow font-bold text-base font-nunito">
                Premium
              </span>
            </div>
            <button
              onClick={() => navigate("/dashboard/payments")}
              className="bg-yellowGradient text-white px-4 py-1.5  rounded-lg text-base font-bold font-nunito hover:bg-opacity-90 transition-colors whitespace-nowrap"
            >
              Upgrade Your Plan
            </button>
          </div>

          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <BellIcon />
          </button>
          <div
            className="flex items-center gap-2 md:gap-3 relative"
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
                <span className="text-secondary font-bold text-base font-nunito">
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
              <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-lg border border-lightGray shadow-lg z-50">
                {/* User Info Section */}
                <div className="p-4 border-b border-lightGray">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-[#6B4EFF] rounded-full flex items-center justify-center text-white font-bold">
                        JS
                      </div>
                      <span className="absolute -top-1 -right-1">
                        <GreenCheckedIcon />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold font-nunito text-secondary text-base">
                        John Smith
                      </h3>
                      <p className="text-xs text-[#52525B] font-normal">
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
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="font-normal text-[#343C6A] text-base lg:text-lg font-nunito">
                      Profile Setting
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="font-normal text-[#343C6A] text-base lg:text-lg font-nunito">
                      Logout
                    </span>
                    <LogoutIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex  w-full md:hidden mt-3">
        <div className="relative w-full">
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
      {/* Mobile Plan Info */}
      {/* <div className="lg:hidden flex items-center justify-between mt-3 pt-3 border-t border-lightGray">
        <div className="flex items-center gap-2">
          <span className="text-secondary text-xs">Current Plan:</span>
          <span className="text-[#D19600] font-bold text-xs">Premium</span>
        </div>
        <button className="bg-[#FF6B35] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-opacity-90 transition-colors">
          Upgrade
        </button>
      </div> */}
    </div>
  );
}

export default Header;
