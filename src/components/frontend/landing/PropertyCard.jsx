'use client'

import { useNavigate } from '@/lib/react-router-compat';
import { toast } from 'react-toastify';
import HeartIcon from "@/svg/websiteSvg/heartIcon";
import ShareIcon from "@/svg/websiteSvg/shareIcon";
import LocationIcon from "@/svg/websiteSvg/locationIcon";
import BedIcon from "@/svg/websiteSvg/bedIcon";
import BathIcon from "@/svg/websiteSvg/bathIcon";
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import LocationTwo from "@/svg/websiteSvg/locationTwo";
import ApartmentIcon from "../../../svg/apartmentIcon";
import { PROPERTY_PLACEHOLDER_IMAGE } from "@/constant";
import { useAuth } from "@/context/AuthContext";
import { recordPropertyView } from '@/api';

function PropertyCard({ property, isFavorited = false, onToggleFavorite }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

const handleCardClick = async (e) => {
    // Don't navigate if clicking on action buttons (share, heart)
    if (e.target.closest("button")) {
      return;
    }

    const propertyId = property?.id || property?._id;
    if (!propertyId) {
      navigate("/properties");
      return;
    }


    // Record view BEFORE navigation
    try {
     const userId = isAuthenticated && user?.id ? user.id : null;
      console.log("userid::",userId);
      
      
      // Fire and forget – don't await if you don't want to delay navigation
      recordPropertyView(propertyId, userId);
      
      // Optional: you could await it if you want to be sure it succeeds
      // await recordPropertyView(propertyId, userId);
    } catch (err) {
      // Silent fail is fine – view count is not critical
      console.warn('View recording failed', err);
    }

    // Now navigate
    const currentSearchParams = new URLSearchParams(window.location.search);
    const currentPage = currentSearchParams.get("page");
    const backUrl = currentPage && currentPage !== "1" 
      ? `/properties/${propertyId}?fromPage=${currentPage}` 
      : `/properties/${propertyId}`;
    
    navigate(backUrl);
  };

  // Handle share button click - copy property link to clipboard
  const handleShare = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    try {
      // Construct property detail URL
      const propertyId = property?.id || property?._id;
      if (!propertyId) {
        toast.error('Property ID not available');
        return;
      }

      const propertyUrl = `${window.location.origin}/properties/${propertyId}`;
      
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(propertyUrl);
        toast.success('Link copied to clipboard!');
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = propertyUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            toast.success('Link copied to clipboard!');
          } else {
            throw new Error('execCommand failed');
          }
        } catch (err) {
          document.body.removeChild(textArea);
          throw err;
        }
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link. Please copy manually.');
    }
  };
  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-[20px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] border border-lightGray relative cursor-pointer overflow-hidden p-4 hover:shadow-lg"
    >
      <div>
        <div className="">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-[200px] sm:h-[240px] object-cover rounded-xl"
            onError={(e) => {
              // Prevent infinite loop by checking if already set to placeholder
              if (!e.target.src.includes('data:image/svg+xml')) {
                e.target.src = PROPERTY_PLACEHOLDER_IMAGE;
              }
            }}
          />
          {property.isRecent && (
            <div className="absolute top-0 right-[0px] bg-[#FFC14D] text-text-primary px-4 py-2 rounded-bl-full text-xs sm:text-sm font-medium min-w-[85px] text-center">
              Recent
            </div>
          )}
        </div>
        <div className="py-3 px-0">
          {/* Price and Action Icons */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl sm:text-2xl font-bold text-[#4A2FCC] font-nunito">
              {property.price}
              <span className="text-[#5A5E67] font-normal text-base font-nunito">
                /month
              </span>
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="text-[#9FA3AA] hover:text-[#000000] transition-colors"
                title="Share property"
              >
                <ShareIcon />
              </button>
              {isAuthenticated && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleFavorite) {
                      onToggleFavorite();
                    }
                  }}
                  className={`transition-colors ${
                    isFavorited
                      ? "text-red-400"
                      : "text-[#9FA3AA] hover:text-[#000000]"
                  }`}
                >
                  <HeartIcon isFilled={isFavorited} />
                </button>
              )}
            </div>
          </div>

          {/* Property Title */}
          <h3 className="text-lg sm:text-xl font-bold text-[#2B2F38] mb-1 font-nunito">
            {property.title}
          </h3>

          {/* Address */}
          <div className="flex items-start gap-2 mb-2 text-[#5A5E67] text-sm sm:text-base font-nunito h-[55px]">
            <span className="mt-0.5 shrink-0">
              <LocationTwo />
            </span>
            <span className="line-clamp-2">{property.address}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-[#5A5E67] text-sm sm:text-base font-nunito">
            <div className="flex items-center gap-1.5">
              <BedIcon />
              <span className="font-nunito">{property.beds}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BathIcon />
              <span className="font-nunito">{property.baths}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ApartmentIcon />
              <span className="font-nunito">{property.type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;