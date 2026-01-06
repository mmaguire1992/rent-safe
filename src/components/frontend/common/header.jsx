'use client'

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from '@/lib/react-router-compat';
import { HiBars3 } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import { FiChevronDown } from "react-icons/fi";
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import HeartIcon from "@/svg/websiteSvg/heartIcon";
import LogoutIcon from "@/svg/websiteSvg/logoutIcon";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";
import ProfileMenu from "./ProfileMenu";
import MobileSidebar from "./MobileSidebar";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser } from "@/api/users";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [renterMenuOpen, setRenterMenuOpen] = useState(false);
  const renterMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userName, userType, user, logout } = useAuth();
  const [remainingContacts, setRemainingContacts] = useState(null);
  const [contactLimit, setContactLimit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

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

  const handleChatClick = () => {
    navigate("/chat");
    setIsOpen(false);
  };

  const handleHouseClick = () => {
    navigate("/properties");
    setIsOpen(false);
  };

  // Fetch user contacts and profile image
  useEffect(() => {
    const fetchUserData = async () => {
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
        console.error('Error fetching user data:', err);
        // Set defaults on error
        if (userType === 'renter') {
          setRemainingContacts(null);
          setContactLimit(5);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, userType]);

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
              {/* Pricing Buttons */}
              <div className="flex items-center gap-2">
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
              </div>

              {/* Icons */}
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                <button
                  onClick={handleHouseClick}
                  className="text-primary hover:opacity-80 transition-opacity"
                >
                  <HouseIcon />
                </button>

                <button className="relative text-primary hover:opacity-80 transition-opacity">
                  <HeartIcon />
                  <span className="absolute -top-1 -right-1 text-xs text-text-secondary font-medium">
                    6
                  </span>
                </button>

                <button
                  onClick={handleChatClick}
                  className="relative text-gray-600 hover:text-primary transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 2C5.58 2 2 5.13 2 9c0 1.66.7 3.18 1.85 4.3L2 18l4.7-1.7C7.82 17.3 9.34 18 11 18c4.42 0 8-3.13 8-7s-3.58-7-8-7z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <circle cx="15" cy="5" r="3" fill="#EF4444" />
                  </svg>
                </button>

                {/* User Profile */}
                <ProfileMenu />
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
                        <GreenCheckedIcon />
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
                              <GreenCheckedIcon />
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
