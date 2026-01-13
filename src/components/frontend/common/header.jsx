'use client'

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from '@/lib/react-router-compat';
import { HiBars3 } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import { FiChevronDown } from "react-icons/fi";
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import HeartIcon from "@/svg/websiteSvg/heartIcon";
import ChatIcon from "@/svg/websiteSvg/chatIcon";
import LogoutIcon from "@/svg/websiteSvg/logoutIcon";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";
import RedCrossIcon from "@/svg/redCrossIcon";
import ProfileMenu from "./ProfileMenu";
import MobileSidebar from "./MobileSidebar";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser } from "@/api/users";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { getChatrooms } from "@/api/chat";
import { getWishlistPropertyIds } from "@/api/wishlists";
import { toast } from "react-toastify";
import { isUserVerified, getVerificationMessage } from '@/utils/verificationUtils';
import { isAuthenticated as checkAuth } from "@/utils/auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [renterMenuOpen, setRenterMenuOpen] = useState(false);
  const renterMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userName, userType, user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [freshUserData, setFreshUserData] = useState(null);
  
  // Use shared payment status hook
  const { 
    hasPaidVerification, 
    loading: paymentCheckLoading, 
    remainingContacts, 
    contactLimit 
  } = usePaymentStatus();

  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 88; // Header height in pixels
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerHeight;

      // Set active section immediately
      setActiveSection(sectionId);

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsOpen(false);
  };

  const handlePropertiesClick = (e) => {
    if (location.pathname === "/" || location.pathname === "/landing") {
      e.preventDefault();
      handleScrollToSection(e, "properties");
    }
  };

  const handleChatClick = async () => {
    // Only check verification for renters
    if (isAuthenticated && userType === 'renter' && user) {
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
              setIsOpen(false);
              return;
            }
            // Has chat history but not verified - allow navigation (sending is blocked in chat component)
          } catch (chatError) {
            console.error('Error checking chat history:', chatError);
            // If error checking chat history, show error and don't navigate
            toast.error(getVerificationMessage('chat with other users'));
            setIsOpen(false);
            return;
          }
        }
        // If verified, proceed normally
      } catch (error) {
        console.error('Error checking user verification:', error);
        // If error, use context user as fallback
        if (user && !isUserVerified(user)) {
          toast.error(getVerificationMessage('chat with other users'));
          setIsOpen(false);
          return;
        }
      }
    }
    
    // Navigate to chat (either verified user or has chat history)
    navigate("/chat");
    setIsOpen(false);
  };

  const handleHouseClick = () => {
    navigate("/properties");
    setIsOpen(false);
  };

  // Fetch profile image and wishlist count
  // Payment status is now handled by usePaymentStatus hook
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        // Try to get profile image from context user as fallback
        if (user?.userInfo?.profileImage) {
          setProfileImage(user.userInfo.profileImage);
        }
        return;
      }

      try {
        const userData = await getCurrentUser();
        if (userData) {
          // Store fresh user data for verification check
          setFreshUserData(userData);
          // Set profile image from userInfo
          if (userData.userInfo?.profileImage) {
            setProfileImage(userData.userInfo.profileImage);
          } else {
            // Fallback to context user
            if (user?.userInfo?.profileImage) {
              setProfileImage(user.userInfo.profileImage);
            } else {
              setProfileImage(null);
            }
          }
        } else {
          // Fallback to context user
          if (user?.userInfo?.profileImage) {
            setProfileImage(user.userInfo.profileImage);
          }
        }

        // Fetch wishlist count
        if (checkAuth()) {
          try {
            const wishlistIds = await getWishlistPropertyIds();
            setFavoriteCount(wishlistIds?.length || 0);
          } catch (wishlistErr) {
            setFavoriteCount(0);
          }
        }

      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Listen for profile image updates
    const handleProfileImageUpdate = async () => {
      // Re-fetch user data to get the latest profile image
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
  }, [isAuthenticated, userType, user?.id]);

  // Close renter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (renterMenuRef.current && !renterMenuRef.current.contains(event.target)) {
        setRenterMenuOpen(false);
      }
    };

    if (renterMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [renterMenuOpen]);

  // Detect active section on scroll
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "/landing") return;

    const sections = [
      "properties",
      "locations",
      "why-us",
      "features",
      "owners-agents",
    ];
    const headerHeight = 88;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + headerHeight + 100; // Add some offset

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;

          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            setActiveSection(sections[i]);
            return;
          }
        }
      }
      setActiveSection("");
    };

    // Check on mount and scroll
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userName) return 'U';
    const names = userName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return userName[0].toUpperCase();
  };

  const navLinks = [
    { label: "Properties", path: "/", scrollTo: "properties" },
    { label: "Locations", path: "/", scrollTo: "locations" },
    { label: "Why Us", path: "/", scrollTo: "why-us" },
    { label: "Features", path: "/", scrollTo: "features" },
    { label: "Owner/Agent", path: "/", scrollTo: "owners-agents" },
  ];

  // Check if user is on profile page
  const isProfilePage =
    location.pathname === "/profile" ||
    location.pathname.startsWith("/profile");
  
  // Check if we're in saved view
  const searchParams = new URLSearchParams(location.search);
  const isSavedView = searchParams.get("saved") === "true";

  // Common button classes
  const baseBtn =
    "px-10 py-2 rounded-xl font-bold cursor-pointer text-base transition shadow-sm border";

  const loginDesktop =
    baseBtn +
    " text-[#4A2FCC] border-[#4A2FCC] bg-white " +
    "hover:text-white hover:bg-gradient-to-l hover:from-[#4A2FCC] hover:to-[#6B4EFF] hover:border-[#6B4EFF]";

  const signupDesktop =
    baseBtn +
    " text-white border-transparent bg-gradient-to-l from-[#4A2FCC] to-[#6B4EFF] " +
    "hover:border-[#6B4EFF] hover:from-[#3B21C0] hover:to-[#5C3BFF]";

  const loginMobile =
    baseBtn +
    " w-full text-[#4A2FCC] border-[#4A2FCC] bg-white " +
    "hover:text-white hover:bg-gradient-to-l hover:from-[#4A2FCC] hover:to-[#6B4EFF] hover:border-[#6B4EFF]";

  const signupMobile =
    baseBtn +
    " w-full text-white border-transparent bg-gradient-to-l from-[#4A2FCC] to-[#6B4EFF] " +
    "hover:border-[#6B4EFF] hover:from-[#3B21C0] hover:to-[#5C3BFF]";

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex items-center justify-between  h-[60px] sm:h-[70px] px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/">
              <img
                src="/images/website/mainLogo.png"
                alt="Rent Safe logo"
                className="h-auto w-[180px] object-contain cursor-pointer"
              />
            </Link>
          </div>

          {/* Desktop Links - Hide on profile page */}
          {!isProfilePage && (
            <nav className="hidden lg:flex items-center font-normal leading-6 xl:gap-8 gap-4 text-base text-[#2B2F38]">
              {navLinks.map((item) => {
                const isActive =
                  item.scrollTo && activeSection === item.scrollTo;
                const baseClasses = `relative pb-1 transition-colors cursor-pointer
                  after:content-[''] after:absolute after:left-0 after:bottom-0
                  after:h-0.5 after:bg-gradient-to-r
                  after:from-[#4A2FCC] after:to-[#6B4EFF]
                  after:rounded-full after:transition-all after:duration-300`;

                const activeClasses = isActive
                  ? "text-[#4A2FCC] after:w-full"
                  : "text-[#2B2F38] hover:text-[#111827] after:w-0 hover:after:w-full";

                if (item.label === "Properties" && item.scrollTo) {
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={handlePropertiesClick}
                      className={`${baseClasses} ${activeClasses}`}
                    >
                      {item.label}
                    </Link>
                  );
                } else if (item.scrollTo) {
                  return (
                    <a
                      key={item.label}
                      href={`#${item.scrollTo}`}
                      onClick={(e) => handleScrollToSection(e, item.scrollTo)}
                      className={`${baseClasses} ${activeClasses}`}
                    >
                      {item.label}
                    </a>
                  );
                } else {
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`${baseClasses} ${activeClasses}`}
                    >
                      {item.label}
                    </Link>
                  );
                }
              })}
            </nav>
          )}

          {/* Desktop Right Side - Conditional based on profile page */}
          {isProfilePage ? (
            <div className="hidden lg:flex items-center gap-4">
              {/* Pricing Buttons - Show Premium User if paid, otherwise show Free Contacts */}
              {userType === 'renter' && (
                <div className="flex items-center gap-2">
                  {paymentCheckLoading ? (
                    <>
                      {/* Loading State - Show nothing or minimal loading indicator */}
                      <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-text-primary">
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
                      <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-text-primary hover:bg-gray-200 transition">
                        Free Contacts: {!loading && remainingContacts !== null ? (
                          <span className="text-red-500">{remainingContacts}/{contactLimit}</span>
                        ) : (
                          <span className="text-gray-400">-/{contactLimit}</span>
                        )}
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
                        use one connect per listing
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Icons */}
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                <button
                  onClick={handleHouseClick}
                  className="text-primary hover:opacity-80 transition-opacity"
                >
                  <HouseIcon />
                </button>

                <button 
                  onClick={() => navigate('/properties?saved=true')}
                  className={`relative transition-opacity ${
                    isSavedView || favoriteCount > 0 
                      ? "text-red-500 hover:opacity-80" 
                      : "text-primary hover:opacity-80"
                  }`}
                >
                  <HeartIcon isFilled={isSavedView || favoriteCount > 0} />
                  {favoriteCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs text-text-secondary font-medium">
                      {favoriteCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleChatClick}
                  className="relative text-primary hover:opacity-80 transition-opacity"
                >
                  <ChatIcon isFilled={location.pathname === "/chat"} />
                </button>

                {/* User Profile */}
                <ProfileMenu profileImage={profileImage} />
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated && userType === 'renter' ? (
                <div className="relative" ref={renterMenuRef}>
                  <button
                    onClick={() => setRenterMenuOpen(!renterMenuOpen)}
                    className="flex items-center gap-2 cursor-pointer border border-lightGray rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={userName || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-[#E8E2FF] rounded-full flex items-center justify-center text-primary font-bold text-sm">
                          {getUserInitials()}
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1">
                        {isUserVerified(freshUserData || user) ? (
                          <GreenCheckedIcon />
                        ) : (
                          <RedCrossIcon />
                        )}
                      </span>
                    </div>
                    <span className="text-secondary font-semibold text-base">
                      {userName || 'User'}
                    </span>
                    <FiChevronDown
                      className={`text-darkGray transition-transform ${
                        renterMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Renter Dropdown Menu */}
                  {renterMenuOpen && (
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
                              <div className="w-12 h-12 bg-[#6B4EFF] rounded-full flex items-center justify-center text-white font-bold">
                                {getUserInitials()}
                              </div>
                            )}
                            <span className="absolute -top-1 -right-1">
                              {isUserVerified(freshUserData || user) ? (
                                <GreenCheckedIcon />
                              ) : (
                                <RedCrossIcon />
                              )}
                            </span>
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
                          onClick={() => {
                            setRenterMenuOpen(false);
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
              ) : (
                <>
                  <Link to="/login" className={loginDesktop}>
                    Login
                  </Link>
                  <Link to="/signup" className={signupDesktop}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full 
                       border border-[#E5E7EB] bg-white"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <IoClose size={22} /> : <HiBars3 size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Navbar;
