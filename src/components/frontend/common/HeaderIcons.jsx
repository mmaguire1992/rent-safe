import { useNavigate, useLocation } from "react-router-dom";
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import HeartIcon from "@/svg/websiteSvg/heartIcon";

function HeaderIcons({
  favoriteCount = 0,
  onHeartClick,
  isSavedView = false,
  onHomeClick,
}) {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <button
        onClick={handleHouseClick}
        className="text-primary hover:opacity-80 transition-opacity"
      >
        <HouseIcon />
      </button>

      <button
        onClick={onHeartClick}
        className={`relative transition-colors ${
          isSavedView ? "text-red-500" : "text-gray-600 hover:text-primary"
        }`}
      >
        <HeartIcon isFilled={isSavedView} />
        {favoriteCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {favoriteCount}
          </span>
        )}
      </button>

      <button
        onClick={handleChatClick}
        className="relative text-primary hover:opacity-80 transition-opacity"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2C5.58 2 2 5.13 2 9c0 1.66.7 3.18 1.85 4.3L2 18l4.7-1.7C7.82 17.3 9.34 18 11 18c4.42 0 8-3.13 8-7s-3.58-7-8-7z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="15" cy="5" r="3" fill="#EF4444" />
          <path d="M15 3v4M15 5h4" stroke="white" strokeWidth="1" />
        </svg>
      </button>
    </div>
  );
}

export default HeaderIcons;
