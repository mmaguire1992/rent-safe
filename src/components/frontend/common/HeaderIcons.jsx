'use client'

import { useEffect } from 'react';
import { useNavigate, useLocation } from '@/lib/react-router-compat';
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import HeartIcon from "@/svg/websiteSvg/heartIcon";
import ChatIcon from "@/svg/websiteSvg/chatIcon";

function HeaderIcons({
  favoriteCount = 0,
  onHeartClick,
  isSavedView = false,
  onHomeClick,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine fill state based on current route
  const isHouseFilled = location.pathname === "/properties";
  const isChatFilled = location.pathname === "/chat";

  const handleHouseClick = () => {
    // If already on properties page, use callback to reset saved view
    if (location.pathname === "/properties" && onHomeClick) {
      onHomeClick();
    } else {
      navigate("/properties");
    }
  };

  const handleChatClick = () => {
    navigate("/chat");
  };

  const handleHeartClick = () => {
    if (onHeartClick) {
      onHeartClick();
    }
  };

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <button
        onClick={handleHouseClick}
        className="text-primary hover:opacity-80 transition-opacity"
      >
        <HouseIcon isFilled={isHouseFilled} />
      </button>

      <button
        onClick={handleHeartClick}
        className={`relative transition-colors ${
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

      <button
        onClick={handleChatClick}
        className="relative text-primary hover:opacity-80 transition-opacity"
      >
        <ChatIcon isFilled={isChatFilled} />
      </button>
    </div>
  );
}

export default HeaderIcons;
