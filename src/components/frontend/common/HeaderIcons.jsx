'use client'

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from '@/lib/react-router-compat';
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import HeartIcon from "@/svg/websiteSvg/heartIcon";
import ChatIcon from "@/svg/websiteSvg/chatIcon";
import BellIcon from "@/svg/bellIcon";
import { useAuth } from "@/context/AuthContext";
import { getNotifications } from "@/api/notifications";
import NotificationDropdown from "@/components/adminDashboard/common/NotificationDropdown";

function HeaderIcons({
  favoriteCount = 0,
  onHeartClick,
  isSavedView = false,
  onHomeClick,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType, isAuthenticated } = useAuth();
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  
  // Determine fill state based on current route
  const isHouseFilled = location.pathname === "/properties";
  const isChatFilled = location.pathname === "/chat";
  
  // Determine notifications view all path based on user type
  const notificationsViewAllPath = userType === 'owner' ? '/dashboard/notifications' : '/notifications';

  const handleHouseClick = () => {
    // Navigate to landing page
    navigate("/landing");
  };

  const handleChatClick = async () => {
    // Removed verification check for renters - renters can access chat regardless of verification status
    
    // Navigate to chat
    navigate("/chat");
  };

  const handleHeartClick = () => {
    if (onHeartClick) {
      onHeartClick();
    }
  };

  // Fetch notification unread count (for the bell badge)
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const data = await getNotifications({ page: 1, limit: 1 });
        setUnreadCount(data.unreadCount || 0);
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };

    if (notificationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationDropdownOpen]);

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <button
        onClick={handleHouseClick}
        className="text-primary hover:opacity-80 transition-opacity"
      >
        <HouseIcon isFilled={isHouseFilled} />
      </button>

      {isAuthenticated && (
        <button
          onClick={handleHeartClick}
          className={`relative transition-colors  flex items-center gap-2 ${
            isSavedView ? "text-red-500" : "text-gray-600 hover:text-primary flex items-center gap-1"
          }`}
        >
          <HeartIcon isFilled={isSavedView || favoriteCount > 0} />
          {favoriteCount > 0 && (
            <span className=" text-[#000000] text-sm flex items-center justify-center font-semibold">
              {favoriteCount}
            </span>
          )}
        </button>
      )}

      {isAuthenticated && (
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationDropdownOpen((prev) => !prev)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors text-primary hover:opacity-80"
            aria-label="Notifications"
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
            viewAllPath={notificationsViewAllPath}
            previewLimit={3}
          />
        </div>
      )}

      {isAuthenticated && (
        <button
          onClick={handleChatClick}
          className="relative text-primary hover:opacity-80 transition-opacity"
        >
          <ChatIcon isFilled={isChatFilled} />
        </button>
      )}
    </div>
  );
}

export default HeaderIcons;