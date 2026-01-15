'use client'

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import { useAuth } from '@/context/AuthContext';
import { getCurrentUser } from "@/api/users";
import { getNotifications } from "@/api/notifications";
import { getCurrentSubscription } from "@/api/subscriptions";
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
import NotificationDropdown from "../common/NotificationDropdown";

// Cache keys
const CACHE_KEYS = {
  SUBSCRIPTION: 'header_subscription_cache',
  SUBSCRIPTION_TIMESTAMP: 'header_subscription_timestamp',
  PROFILE_IMAGE: 'header_profile_image_cache',
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Helper functions for cache
const getCachedSubscription = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.SUBSCRIPTION);
    const timestamp = localStorage.getItem(CACHE_KEYS.SUBSCRIPTION_TIMESTAMP);
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      if (age < CACHE_DURATION) {
        return JSON.parse(cached);
      }
    }
  } catch (e) {
    // Ignore cache errors
  }
  return null;
};

const setCachedSubscription = (subscription) => {
  try {
    localStorage.setItem(CACHE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
    localStorage.setItem(CACHE_KEYS.SUBSCRIPTION_TIMESTAMP, Date.now().toString());
  } catch (e) {
    // Ignore cache errors
  }
};

const clearSubscriptionCache = () => {
  try {
    localStorage.removeItem(CACHE_KEYS.SUBSCRIPTION);
    localStorage.removeItem(CACHE_KEYS.SUBSCRIPTION_TIMESTAMP);
  } catch (e) {
    // Ignore cache errors
  }
};

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { logout, userName, user, isAuthenticated, userType } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(() => {
    // Initialize from user context immediately
    return user?.userInfo?.profileImage || null;
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentSubscription, setCurrentSubscription] = useState(() => {
    // Initialize from cache immediately for instant render
    if (userType === 'owner') {
      return getCachedSubscription();
    }
    return null;
  });
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const subscriptionFetchedRef = useRef(false);
  const profileImageFetchedRef = useRef(false);

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

  // Initialize profile image from user context first, then fetch if needed (only once)
  useEffect(() => {
    if (!isAuthenticated) {
      setProfileImage(null);
      profileImageFetchedRef.current = false;
      return;
    }

    // Use profile image from context if available (immediate render)
    if (user?.userInfo?.profileImage) {
      setProfileImage(user.userInfo.profileImage);
    }

    // Only fetch once per session if we don't have it from context
    if (!profileImageFetchedRef.current && !user?.userInfo?.profileImage) {
      profileImageFetchedRef.current = true;
      
      // Fetch profile image in background (non-blocking)
      const fetchProfileImage = async () => {
        try {
          const userData = await getCurrentUser();
          if (userData?.userInfo?.profileImage) {
            setProfileImage(userData.userInfo.profileImage);
          } else {
            setProfileImage(null);
          }
        } catch (err) {
          console.error('Error fetching profile image:', err);
        }
      };
      
      fetchProfileImage();
    }

    // Listen for profile image updates
    const handleProfileImageUpdate = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData?.userInfo?.profileImage) {
          // Add cache-busting parameter to force image refresh
          const imageUrl = userData.userInfo.profileImage + (userData.userInfo.profileImage.includes('?') ? '&' : '?') + '_t=' + Date.now();
          setProfileImage(imageUrl);
        } else {
          setProfileImage(null);
        }
      } catch (err) {
        console.error('Error refreshing profile image:', err);
      }
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);

    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, [isAuthenticated]); // Removed user?.userInfo?.profileImage from deps to prevent re-fetching

  // Fetch notifications count on mount and periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotificationCount = async () => {
      try {
        const data = await getNotifications({ page: 1, limit: 1 });
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();
    
    // Refresh notification count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Fetch current subscription for owners
  useEffect(() => {
    if (!isAuthenticated || userType !== 'owner') return;

    const fetchSubscription = async () => {
      try {
        setLoadingSubscription(true);
        const subscription = await getCurrentSubscription();
        setCurrentSubscription(subscription);
      } catch (error) {
        // If 404, user has no subscription - that's fine
        if (error.response?.status !== 404) {
          console.error('Error fetching subscription:', error);
        }
        setCurrentSubscription(null);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [isAuthenticated, userType]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userName) return 'U';
    const names = userName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return userName[0].toUpperCase();
  };

  const displayName = userName || 'User';
  const displayEmail = user?.email || '';

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
          {/* Show subscription info and upgrade button only for owners */}
          {userType === 'owner' && (
            <div className="hidden lg:flex items-center gap-4 border border-lightGray rounded-xl py-1 pr-1 pl-3">
              {loadingSubscription ? (
                /* Loading state - show placeholder */
                <div className="flex items-center gap-2">
                  <span className="text-midGray text-base font-bold font-nunito">
                    Current Plan:
                  </span>
                  <span className="text-midGray text-base font-nunito animate-pulse">
                    Loading...
                  </span>
                </div>
              ) : currentSubscription && currentSubscription.plan ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-midGray text-base font-bold font-nunito">
                      Current Plan:
                    </span>
                    <span className="text-yellow font-bold text-base font-nunito">
                      {currentSubscription.plan.name || 'Unknown Plan'}
                    </span>
                  </div>
                  {/* Show upgrade button only if subscription is expired or property limit reached */}
                  {(currentSubscription.status === 'expired' || 
                    (currentSubscription.remainingProperties !== undefined && currentSubscription.remainingProperties === 0)) && (
                    <button
                      onClick={() => navigate("/dashboard/payments")}
                      className="bg-yellowGradient text-white px-4 py-1.5 rounded-lg text-base font-bold font-nunito hover:bg-opacity-90 transition-colors whitespace-nowrap"
                    >
                      Upgrade Your Plan
                    </button>
                  )}
                </>
              ) : (
                /* No subscription - show upgrade button */
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-midGray text-base font-bold font-nunito">
                      Current Plan:
                    </span>
                    <span className="text-midGray text-base font-nunito">
                      No Plan
                    </span>
                  </div>
                  <button
                    onClick={() => navigate("/dashboard/payments")}
                    className="bg-yellowGradient text-white px-4 py-1.5 rounded-lg text-base font-bold font-nunito hover:bg-opacity-90 transition-colors whitespace-nowrap"
                  >
                    Upgrade Your Plan
                  </button>
                </>
              )}
            </div>
          )}

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                navigate('/dashboard/notifications');
                setNotificationDropdownOpen(false);
                setDropdownOpen(false);
              }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={notificationDropdownOpen}
              onClose={() => setNotificationDropdownOpen(false)}
              onUnreadCountChange={(count) => setUnreadCount(count)}
            />
          </div>
          <div
            className="flex items-center gap-2 md:gap-3 relative"
            ref={dropdownRef}
          >
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 md:gap-3 cursor-pointer border border-lightGray rounded-full p-1"
            >
              <div className="relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#E8E2FF] rounded-full flex items-center justify-center text-primary font-bold text-sm md:text-base">
                    {getUserInitials()}
                  </div>
                )}
                <span className="absolute -top-1 -right-1">
                  <GreenCheckedIcon />
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <span className="text-secondary font-bold text-base font-nunito">
                  {displayName}
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
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#6B4EFF] rounded-full flex items-center justify-center text-white font-bold">
                          {getUserInitials()}
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1">
                        <GreenCheckedIcon />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold font-nunito text-secondary text-base">
                        {displayName}
                      </h3>
                      <p className="text-xs text-[#52525B] font-normal">
                        {displayEmail}
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
