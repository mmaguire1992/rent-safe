'use client'

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from '@/lib/react-router-compat';
import { HiBars3 } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import HeartIcon from "@/svg/websiteSvg/heartIcon";
import ProfileMenu from "./ProfileMenu";
import MobileSidebar from "./MobileSidebar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

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
                  Free Contacts: <span className="text-red-500">0/5</span>
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition shadow-sm">
                  €6.99 per listing
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
              <Link to="/login" className={loginDesktop}>
                Login
              </Link>
              <Link to="/signup" className={signupDesktop}>
                Sign Up
              </Link>
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
