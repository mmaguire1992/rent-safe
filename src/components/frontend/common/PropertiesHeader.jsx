'use client'

import { useState, useEffect } from "react";
import { Link } from '@/lib/react-router-compat';
import { HiBars3 } from "react-icons/hi2";
import HeaderIcons from "./HeaderIcons";
import ProfileMenu from "./ProfileMenu";
import MobileSidebar from "./MobileSidebar";
import { getCurrentUser } from "@/api/users";
import { useAuth } from "@/context/AuthContext";


function PropertiesHeader({
  favoriteCount = 0,
  onHeartClick,
  isSavedView = false,
  onHomeClick,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [remainingContacts, setRemainingContacts] = useState(null);
  const [contactLimit, setContactLimit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    const fetchUserContacts = async () => {
      // Only fetch for authenticated users
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        if (userData) {
          // Set contacts for renters
          if (userType === 'renter') {
            setRemainingContacts(userData.remainingContacts ?? null);
            setContactLimit(userData.chatContactLimit ?? 5);
          }
          // Set profile image from userInfo
          if (userData.userInfo?.profileImage) {
            setProfileImage(userData.userInfo.profileImage);
          }
        }
      } catch (err) {
        console.error('Error fetching user contacts:', err);
        // Set defaults on error
        if (userType === 'renter') {
          setRemainingContacts(null);
          setContactLimit(5);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserContacts();

    // Listen for profile image updates
    const handleProfileImageUpdate = async () => {
      if (!isAuthenticated) return;
      try {
        const userData = await getCurrentUser();
        if (userData?.userInfo?.profileImage) {
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
  }, [isAuthenticated, userType]);

  return (
    <>
      <header className="bg-white border-b border-lightGray sticky top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-[60px] sm:h-[70px] px-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/website/logo.svg"
              alt="Rent Safe logo"
              className="h-6 sm:h-8 w-auto object-contain"
            />
          </Link>

          {isAuthenticated && userType === 'renter' && (
            <div className="hidden lg:flex items-center gap-2 rounded-xl px-1 py-1 h-[48px] border border-lightGray">
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
                use one connect per listing
              </button>
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
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#E5E7EB] bg-white"
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
