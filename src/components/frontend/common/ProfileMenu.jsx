'use client'

import { useState, useRef, useEffect } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import { useAuth } from '@/context/AuthContext';
import ProfileStatusCheckIcon from "@/svg/websiteSvg/profileStatusCheckIcon";
import LogoutIcon from "@/svg/websiteSvg/logoutIcon";
import { FiChevronDown } from "react-icons/fi";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";
function ProfileMenu({ profileImage }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout, userName, user } = useAuth();
  
  // Debug: Log profileImage prop
  useEffect(() => {
    console.log('ProfileMenu - profileImage prop:', profileImage);
  }, [profileImage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 bg-white rounded-full py-1 pl-1 pr-2 border border-lightGray transition-colors"
      >
        <div className="relative">
          {profileImage ? (
            <img
              src={profileImage}
              alt={userName || 'User'}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#E8E2FF] rounded-full flex items-center justify-center text-primary font-bold text-sm md:text-base">
              {userName ? (userName.trim().split(' ').length >= 2 
                ? (userName.trim().split(' ')[0][0] + userName.trim().split(' ')[userName.trim().split(' ').length - 1][0]).toUpperCase()
                : userName[0].toUpperCase()) : 'U'}
            </div>
          )}
          <span className="absolute -top-1 -right-1">
            <GreenCheckedIcon />
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <span className="text-secondary font-bold text-base font-nunito">
            {userName || 'User'}
          </span>
          <FiChevronDown
            className={`text-darkGray transition-transform ${
              showMenu ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={userName || 'User'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm text-gray-600">
                      {userName ? (userName.trim().split(' ').length >= 2 
                        ? (userName.trim().split(' ')[0][0] + userName.trim().split(' ')[userName.trim().split(' ').length - 1][0]).toUpperCase()
                        : userName[0].toUpperCase()) : 'U'}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <ProfileStatusCheckIcon />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {userName || 'User'}
                </p>
                <p className="text-xs text-text-secondary">
                  {user?.email || ''}
                </p>
              </div>
            </div>
          </div>
          <div className="py-1">
            <button
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50"
              onClick={() => {
                setShowMenu(false);
                navigate("/profile");
              }}
            >
              Profile Settings
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50">
              Property History
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                navigate("/support");
              }}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50"
            >
              Support
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                logout();
              }}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Logout</span>
              <LogoutIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
