'use client'

import { useEffect } from 'react';
import { useNavigate, useLocation } from '@/lib/react-router-compat';
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import HeartIcon from "@/svg/websiteSvg/heartIcon";
import ChatIcon from "@/svg/websiteSvg/chatIcon";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser } from "@/api/users";
import { getChatrooms } from "@/api/chat";
import { toast } from "react-toastify";
import { isUserVerified, getVerificationMessage } from '@/utils/verificationUtils';

function HeaderIcons({
  favoriteCount = 0,
  onHeartClick,
  isSavedView = false,
  onHomeClick,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType, isAuthenticated } = useAuth();
  
  // Determine fill state based on current route
  const isHouseFilled = location.pathname === "/properties";
  const isChatFilled = location.pathname === "/chat";

  const handleHouseClick = () => {
    // Navigate to landing page
    navigate("/landing");
  };

  const handleChatClick = async () => {
    // Only check verification for renters
    if (userType === 'renter' && user) {
      try {
        // Fetch fresh user data to get latest verification status
        const freshUserData = await getCurrentUser();
        const userForVerification = freshUserData || user;
        
        // Check if user is verified
        if (userForVerification && !isUserVerified(userForVerification)) {
          // If not verified, check if user has chat history
          try {
            const chatrooms = await getChatrooms();
            const hasChatHistory = chatrooms && chatrooms.length > 0;
            
            if (!hasChatHistory) {
              // No chat history and not verified - show error and don't navigate
              toast.error(getVerificationMessage('chat with other users'));
              return;
            }
            // Has chat history but not verified - allow navigation (sending is blocked in chat component)
          } catch (chatError) {
            console.error('Error checking chat history:', chatError);
            // If error checking chat history, show error and don't navigate
            toast.error(getVerificationMessage('chat with other users'));
            return;
          }
        }
        // If verified, proceed normally
      } catch (error) {
        console.error('Error checking user verification:', error);
        // If error, use context user as fallback
        if (user && !isUserVerified(user)) {
          toast.error(getVerificationMessage('chat with other users'));
          return;
        }
      }
    }
    
    // Navigate to chat (either verified user or has chat history)
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

      {isAuthenticated && (
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