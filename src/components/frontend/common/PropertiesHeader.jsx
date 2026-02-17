'use client'

import { useState, useEffect, useRef } from "react";
import { Link } from '@/lib/react-router-compat';
import { HiBars3 } from "react-icons/hi2";
import HeaderIcons from "./HeaderIcons";
import ProfileMenu from "./ProfileMenu";
import MobileSidebar from "./MobileSidebar";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { usePaymentStatus } from "@/context/PaymentStatusContext";
import { getCurrentUser } from "@/api/users";

// Module-level cache to persist profile image across component remounts
let cachedProfileImage = null;
let profileImageFetched = false;
let cachedUserId = null;

function PropertiesHeader({
  favoriteCount: propFavoriteCount,
  onHeartClick,
  isSavedView = false,
  onHomeClick,
}) {
  const { favoriteCount: contextFavoriteCount } = useWishlist();
  // Use context favoriteCount if available, otherwise fall back to prop
  const favoriteCount = contextFavoriteCount ?? propFavoriteCount ?? 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, userType, user } = useAuth();
  
  // Initialize from cache or user context (persists across remounts)
  const [profileImage, setProfileImage] = useState(() => {
    // Check if user changed (new login)
    if (user?.id !== cachedUserId) {
      cachedProfileImage = null;
      profileImageFetched = false;
      cachedUserId = user?.id || null;
    }
    // Priority: cached > user context > null
    return cachedProfileImage || user?.userInfo?.profileImage || null;
  });
  
  // Use shared payment status hook
  const { 
    hasPaidVerification, 
    loading: paymentCheckLoading, 
    remainingContacts, 
    contactLimit 
  } = usePaymentStatus();
  
  const loading = paymentCheckLoading;
  
  // Initialize profile image from user context first, then fetch if needed (only once per user)
  useEffect(() => {
    if (!isAuthenticated) {
      setProfileImage(null);
      cachedProfileImage = null;
      profileImageFetched = false;
      cachedUserId = null;
      return;
    }

    // Reset cache if user changed
    if (user?.id !== cachedUserId) {
      cachedProfileImage = null;
      profileImageFetched = false;
      cachedUserId = user?.id || null;
    }

    // Use profile image from context if available (immediate render, update cache)
    if (user?.userInfo?.profileImage) {
      const contextImage = user.userInfo.profileImage;
      setProfileImage(contextImage);
      cachedProfileImage = contextImage; // Update cache
    }

    // Only fetch once per user session if we don't have it from context or cache
    if (!profileImageFetched && !user?.userInfo?.profileImage && !cachedProfileImage) {
      profileImageFetched = true;
      
      // Fetch profile image in background (non-blocking)
      const fetchProfileImage = async () => {
        try {
          const userData = await getCurrentUser();
          if (userData?.userInfo?.profileImage) {
            const fetchedImage = userData.userInfo.profileImage;
            setProfileImage(fetchedImage);
            cachedProfileImage = fetchedImage; // Update cache
          } else {
            setProfileImage(null);
            cachedProfileImage = null;
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
          cachedProfileImage = imageUrl; // Update cache
        } else {
          setProfileImage(null);
          cachedProfileImage = null;
        }
      } catch (err) {
        console.error('Error refreshing profile image:', err);
      }
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);

    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, [isAuthenticated, user?.id]); // Depend on user ID to reset cache on user change

  return (
    <>
      <header className="bg-white border-b border-lightGray sticky top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-[60px] sm:h-[70px] px-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2">
            {/* Mobile & Tablet Logo */}
            <img
              src="/images/moblogo.svg"
              alt="Rent Safe logo"
              className="lg:hidden h-10 w-auto object-contain"
            />
            {/* Desktop Logo */}
            <img
              src="/images/website/mainLogo.png"
              alt="Rent Safe logo"
              className="hidden lg:block h-6 sm:h-8 w-auto object-contain"
            />
          </Link>

          {isAuthenticated && userType === 'renter' && (
            <div className="hidden lg:flex items-center gap-2 rounded-xl px-1 py-1 h-[48px] border border-lightGray">
              {paymentCheckLoading ? (
                <>
                  {/* Loading State - Show minimal loading indicator */}
                  <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-midGray">
                    <span className="text-gray-400">Loading...</span>
                  </div>
                </>
              ) : hasPaidVerification ? (
                <>
                  {/* Premium User Badge */}
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
                    Premium User
                  </button>
                </>
              ) : (
                <>
                  {/* Free User - Show Free Contacts */}
                  <span className="text-sm pl-4  whitespace-nowrap sm:text-base font-bold text-midGray">
                    Free Contacts:
                  </span>
                  {!loading && remainingContacts !== null ? (
                    <span className="text-sm sm:text-base pr-2 font-bold text-errorColor">
                      {remainingContacts}<span className="text-midGray">/{contactLimit}</span>
                    </span>
                  ) : (
                    <span className="text-sm sm:text-base pr-2 font-bold text-midGray">
                      <span className="text-midGray">-/{contactLimit}</span>
                    </span>
                  )}
                  <button className="w-full shadow-[0px_2px_10px_0px_rgba(0,0,0,0.2),inset_0px_2px_4px_0px_rgba(255,255,255,0.2)] px-4 py-2 bg-orangeGradient rounded-lg text-base font-bold text-white">
                    Use one connect per listing
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden lg:flex items-center gap-2 sm:gap-4">
              <HeaderIcons
                favoriteCount={favoriteCount}
                onHeartClick={onHeartClick}
                isSavedView={isSavedView}
                onHomeClick={onHomeClick}
              />
              {isAuthenticated && <ProfileMenu profileImage={profileImage} />}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden inline-flex items-center justify-center w-10 h-10"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <HiBars3 size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

export default PropertiesHeader;
