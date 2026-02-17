'use client'

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
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
import { fetchHeaderData, refreshProfileImage, updateFavoriteCount, resetIfUserChanged } from "@/redux/slices/headerSlice";
import { getNotifications } from "@/api/notifications";
import { getCurrentUser } from "@/api/users";
import NotificationDropdown from "@/components/adminDashboard/common/NotificationDropdown";
import BellIcon from "@/svg/bellIcon";
import { toast } from "react-toastify";
import { isUserVerified, getVerificationMessage } from '@/utils/verificationUtils';
import { isAuthenticated as checkAuth } from "@/utils/auth";

const Navbar = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [renterMenuOpen, setRenterMenuOpen] = useState(false);
  const renterMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userName, userType, user, logout  } = useAuth();
  const [freshUserData, setFreshUserData] = useState(null);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  
  // Get header data from Redux (persisted)
  const headerData = useSelector((state) => state.header);
  const {
    profileImage,
    favoriteCount,
    hasPaidVerification,
    remainingContacts,
    contactLimit,
    loading: headerLoading,
    userId: headerUserId,
    lastFetched,
  } = headerData;
  
  // Only show loading if:
  // 1. Currently fetching AND
  // 2. No persisted data exists (first load)
  const currentUserId = user?.id || user?._id;
  const hasPersistedData = headerUserId === currentUserId && lastFetched;
  const paymentCheckLoading = headerLoading && !hasPersistedData;

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
    // Removed verification check for renters - renters can access chat regardless of verification status
    
    // Navigate to chat
    navigate("/chat");
    setIsOpen(false);
  };

  const handleHouseClick = () => {
    navigate("/properties");
    setIsOpen(false);
  };

  // Track initialization to prevent unnecessary fetches on route changes
  const initializedRef = useRef(false);
  const lastUserIdRef = useRef(null);
  const userDataFetchedRef = useRef(false);

  // Fetch header data from Redux (ONCE per user session, then use persisted data)
  useEffect(() => {
    const currentUserId = user?.id || user?._id;
    
    // Reset if user changed (login/logout)
    if (lastUserIdRef.current && lastUserIdRef.current !== currentUserId) {
      dispatch(resetIfUserChanged(currentUserId));
      initializedRef.current = false;
    }

    // Skip if already initialized for this user (prevents re-fetch on route changes)
    if (initializedRef.current && lastUserIdRef.current === currentUserId) {
      return;
    }

    if (!isAuthenticated || !currentUserId) {
      if (headerUserId) {
        // User logged out, clear header data
        dispatch(resetIfUserChanged(null));
      }
      initializedRef.current = true;
      lastUserIdRef.current = null;
      return;
    }

    // Check if we have valid persisted data for this user
    const hasValidPersistedData = 
      headerUserId === currentUserId && 
      lastFetched;

    // Only fetch if we don't have persisted data for this user AND not currently loading
    // This ensures we use persisted data immediately on route changes
    if (!hasValidPersistedData && !headerLoading) {
      dispatch(fetchHeaderData());
    }

    // Mark as initialized for this user (prevents future fetches on route changes)
    initializedRef.current = true;
    lastUserIdRef.current = currentUserId;
  }, [isAuthenticated, user?.id, user?._id, headerUserId, lastFetched, headerLoading, dispatch]);

  // Listen for profile image updates
  useEffect(() => {
    const handleProfileImageUpdate = () => {
      if (isAuthenticated) {
        dispatch(refreshProfileImage());
      }
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, [isAuthenticated, dispatch]);

  // Fetch fresh user data for verification status (only once per user session)
  useEffect(() => {
    if (!isAuthenticated) {
      setFreshUserData(null);
      userDataFetchedRef.current = false;
      return;
    }

    const currentUserId = user?.id || user?._id;
    
    // Reset if user changed
    if (lastUserIdRef.current !== currentUserId) {
      userDataFetchedRef.current = false;
      setFreshUserData(null);
    }

    // Only fetch once per user session
    if (!userDataFetchedRef.current && currentUserId) {
      userDataFetchedRef.current = true;
      
      const fetchUserData = async () => {
        try {
          const userData = await getCurrentUser();
          if (userData) {
            setFreshUserData(userData);
          }
        } catch (err) {
          // Silently fail, will use context user as fallback
          console.error('Error fetching user data for verification:', err);
        }
      };

      fetchUserData();
    }
  }, [isAuthenticated, user?.id]); // Fetch when user changes

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

  const notificationsViewAllPath = userType === 'owner' ? '/dashboard/notifications' : '/notifications';

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
          {/* Mobile Profile Page Header - Toggle on left, icons on right, no logo */}
          {isProfilePage ? (
            <>
              {/* Left side - Hamburger menu (mobile only) */}
              <button
                className="lg:hidden inline-flex items-center justify-center w-10 h-10"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? <IoClose size={22} /> : <HiBars3 size={24} />}
              </button>

              {/* Desktop Logo - Only show on desktop for profile pages */}
              {/* <div className="hidden lg:flex items-center gap-2"> */}
                <Link to="/">
                  <img
                    src="/images/website/mainLogo.png"
                    alt="Rent Safe logo"
                    className="h-auto w-[180px] object-contain cursor-pointer"
                  />
                </Link>
              {/* </div> */}

              {/* Right side - Notification & Profile (mobile only) */}
              <div className="lg:hidden flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setNotificationDropdownOpen((prev) => !prev)}
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
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

                {/* Profile Avatar */}
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center justify-center"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={userName || 'User'}
                      className="w-9 h-9 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-[#E8E2FF] rounded-full flex items-center justify-center text-primary font-bold text-lg border-2 border-[#E6E8EC]">
                      {userName ? userName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Regular Logo for non-profile pages */
            <div className="flex items-center gap-2">
              <Link to="/">
                {/* Mobile & Tablet Logo */}
                <img
                  src="/images/moblogo.svg"
                  alt="Rent Safe logo"
                  className="lg:hidden h-10 w-auto object-contain cursor-pointer"
                />
                {/* Desktop Logo */}
                <img
                  src="/images/website/mainLogo.png"
                  alt="Rent Safe logo"
                  className="hidden lg:block h-auto w-[180px] object-contain cursor-pointer"
                />
              </Link>
            </div>
          )}

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
                  ) : hasPaidVerification && !paymentCheckLoading ? (
                    <>
                      {/* Premium User Badge - Only show when payment check is complete and payment exists */}
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
                        Premium User
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Free User - Show Free Contacts */}
                      <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-text-primary hover:bg-gray-200 transition">
                        Free Contacts: {!paymentCheckLoading && remainingContacts !== null ? (
                          <span className="text-red-500">{remainingContacts}/{contactLimit}</span>
                        ) : (
                          <span className="text-gray-400">-/{contactLimit}</span>
                        )}
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
                        Use one connect per listing
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Icons */}
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                {/* Notifications */}
                {isAuthenticated && (
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setNotificationDropdownOpen((prev) => !prev)}
                      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                <div className="flex items-center gap-2">
                  {/* Notifications */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setNotificationDropdownOpen((prev) => !prev)}
                      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                            <p className="text-xs text-text-secondary truncate md:w-[130px]">
                              {user?.email || ''}renter12@yopmail.comrenter12@yopmail.comrenter12@yopmail.com
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50"
                          onClick={() => {
                            setRenterMenuOpen(false);
                            navigate("/profile");
                          }}
                        >
                          Profile Settings
                        </button>
                        <button
                          onClick={() => {
                            setRenterMenuOpen(false);
                            navigate("/profile?tab=property-history");
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50"
                        >
                          Property History
                        </button>
                        <button
                          onClick={() => {
                            setRenterMenuOpen(false);
                            navigate("/support");
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50"
                        >
                          Support
                        </button>
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

          {/* Mobile menu toggle - Hide on profile pages (already shown on left) */}
          {!isProfilePage && (
            <button
              className="lg:hidden inline-flex items-center justify-center w-10 h-10"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <IoClose size={22} /> : <HiBars3 size={24} />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Navbar;
