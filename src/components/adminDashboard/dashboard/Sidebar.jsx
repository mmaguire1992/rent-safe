import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import MainLogo from "@/assests/images/whiteLogo.png";
import LogoIcon from "@/svg/logoIcon";
import { sidebarMenuItems } from "@/constant";

function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = sidebarMenuItems;

  // Function to check if a menu item should be active based on current pathname
  const isMenuActive = (menuPath, currentPathname) => {
    // Dashboard menu: exact match or tenant routes
    if (menuPath === "/dashboard") {
      return (
        currentPathname === "/dashboard" ||
        currentPathname.startsWith("/dashboard/tenant")
      );
    }
    // My Properties menu: properties routes (including add and detail)
    if (menuPath === "/dashboard/properties") {
      return currentPathname.startsWith("/dashboard/properties");
    }
    // Other menus: exact match or starts with menu path
    return (
      currentPathname === menuPath || currentPathname.startsWith(`${menuPath}/`)
    );
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-mainBlue min-h-screen text-white relative transition-all duration-300 flex flex-col`}
    >
      {/* Toggle Button - Top Right Corner */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute w-8 h-8 top-8 right-[-14px] lg:flex items-center justify-center hidden bg-white   rounded-full transition-colors z-10 shadow-[2px_2px_8px_0px_#0000001A]"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <MdChevronRight className="text-[#6B4EFF] text-2xl" />
        ) : (
          <MdChevronLeft className="text-[#6B4EFF] text-2xl" />
        )}
      </button>

      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white lg:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Logo */}
      <div className={` p-4 md:py-6 ${isCollapsed ? "px-2" : "px-4"}`}>
        <button
          onClick={() => {
            navigate("/dashboard");
            if (onClose) onClose();
          }}
          className={`flex items-center   transition-colors ${
            isCollapsed ? "justify-center px-2 mx-auto" : ""
          }`}
        >
          {!isCollapsed ? (
            <img src={MainLogo} alt="Logo" className="w-[150px] h-auto" />
          ) : (
            <LogoIcon />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav
        className={`px-2 md:px-4 ${
          isCollapsed ? "px-2" : ""
        } flex-1 overflow-y-auto`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isMenuActive(item.path, location.pathname);

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center" : "justify-between"
              } px-3 md:px-4 py-2.5 md:py-3 rounded-lg mb-2 transition-colors relative ${
                isActive
                  ? "bg-white text-[#6B4EFF]"
                  : "text-white hover:bg-white hover:bg-opacity-10"
              } ${isCollapsed ? "px-2" : ""}`}
              title={isCollapsed ? item.label : ""}
            >
              <div
                className={`flex items-center ${
                  isCollapsed ? "justify-center" : "gap-2 md:gap-3"
                }`}
              >
                <Icon
                  className={`text-lg md:text-xl ${
                    isActive ? "text-[#6B4EFF]" : "text-white"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-medium text-sm md:text-base">
                    {item.label}
                  </span>
                )}
              </div>
              {!isCollapsed && item.badge && (
                <span
                  className={`text-xs font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center ${
                    isActive
                      ? "bg-[#6B4EFF] text-white"
                      : "bg-white bg-opacity-20 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {isCollapsed && item.badge && (
                <span
                  className={`absolute top-1 right-1 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                    isActive
                      ? "bg-[#6B4EFF] text-white"
                      : "bg-white bg-opacity-20 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
