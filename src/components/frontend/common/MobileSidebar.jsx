'use client'

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from '@/lib/react-router-compat';
import { IoClose } from "react-icons/io5";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";
import WhiteLogout from "@/svg/whiteLogout";
import WhiteHomeIcon from "@/svg/whiteHomeIcon";
import WhitePropertiesIcon from "../../../svg/whitePropertiesIcon";
import WhiteMessageIcon from "../../../svg/whiteMessageIcon";
import { useAuth } from "@/context/AuthContext";

function MobileSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const { isAuthenticated, userName, user, logout, userType } = useAuth();

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const toggleMenu = () => {
    setIsMenuExpanded(!isMenuExpanded);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const isProfilePage =
    location.pathname === "/profileManagement" ||
    location.pathname.startsWith("/profile");

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userName) return 'U';
    const names = userName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return userName[0].toUpperCase();
  };

  const userEmail = user?.email || '';

  return (
    <>
      {/* Overlay/Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-[#6B4EFF] to-[#4A2FCC] text-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <img src="/images/whiteLogo.png" alt="Rent Safe" className="" />
            </div>
            <button
              onClick={onClose}
              className="text-white hover:opacity-80 transition-opacity"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* User Profile Section - Only show if authenticated renter */}
          {isAuthenticated && userType === 'renter' ? (
            <div className="pt-2 pr-6 pl-8 pb-2 ">
              <button
                onClick={toggleMenu}
                className="w-full flex items-center gap-4 transition-opacity"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{getUserInitials()}</span>
                  </div>
                  <div className="absolute -top-0 -right-1">
                    <GreenCheckedIcon />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-semibold text-base font-nunito">
                    {userName || 'User'}
                  </p>
                  <p className="text-[#F9F9FC] text-xs font-normal font-nunito">
                    {userEmail}
                  </p>
                </div>
                {isMenuExpanded ? (
                  <FiChevronUp className="text-white text-xl" />
                ) : (
                  <FiChevronDown className="text-white text-xl" />
                )}
              </button>
            </div>
          ) : null}

          {/* Menu Items - Toggleable - Only show if authenticated renter */}
          {isMenuExpanded && isAuthenticated && userType === 'renter' && (
            <div className="py-4 pr-4 pl-6 space-y-1 border-b border-white/20 pb-4">
              <button
                onClick={() => handleNavigation("/profileManagement")}
                className="w-full text-left px-4 text-sm font-normal font-nunito py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Profile Setting
              </button>
              <button
                onClick={() =>
                  handleNavigation("/profileManagement?tab=property-history")
                }
                className="w-full text-left px-4 py-2 text-sm font-normal font-nunito text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Property History
              </button>
              <button
                onClick={() => handleNavigation("/rent-support")}
                className="w-full text-left px-4 py-2 text-sm font-normal font-nunito text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Support
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm font-normal font-nunito text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>Logout</span>
                <WhiteLogout />
              </button>
            </div>
          )}

          {/* Navigation Items - Always Visible */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-4 pr-4 pl-6 space-y-1">
              {isAuthenticated && userType === 'renter' ? (
                <>
                  <button
                    onClick={() => handleNavigation("/landing")}
                    className="w-full text-left px-4 py-2 text-[#F9F9FC] font-bold font-nunito text-sm rounded-lg transition-colors flex items-center gap-3"
                  >
                    <WhiteHomeIcon />
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => handleNavigation("/properties")}
                    className="w-full text-left px-4 py-2 text-[#F9F9FC] font-bold font-nunito text-sm rounded-lg transition-colors flex items-center gap-3"
                  >
                    <WhitePropertiesIcon />
                    <span>Saved Properties</span>
                  </button>
                  <button
                    onClick={() => handleNavigation("/chat")}
                    className="w-full text-left px-4 py-2 text-[#F9F9FC] font-bold font-nunito text-sm rounded-lg transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <WhiteMessageIcon />
                      <span>Messages</span>
                    </div>
                    <span className="bg-white text-[#4A2FCC] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      3
                    </span>
                  </button>
                </>
              ) : (
                <div className="px-4 space-y-2">
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="w-full px-4 py-2 text-[#4A2FCC] border border-[#4A2FCC] bg-white rounded-xl font-bold text-sm transition-colors hover:bg-[#4A2FCC] hover:text-white"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNavigation("/signup")}
                    className="w-full px-4 py-2 text-white bg-gradient-to-l from-[#4A2FCC] to-[#6B4EFF] rounded-xl font-bold text-sm transition-colors hover:opacity-90"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileSidebar;
