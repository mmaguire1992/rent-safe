'use client'

import { useNavigate } from '@/lib/react-router-compat';
import BedIcon from "@/svg/websiteSvg/bedIcon";
import BathIcon from "@/svg/websiteSvg/bathIcon";
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import LocationTwo from "@/svg/websiteSvg/locationTwo";

function PropertyHistoryCard({ property }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (property?.id) {
      navigate(`/properties/${property.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-[20px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] border border-lightGray relative cursor-pointer overflow-hidden p-4"
    >
      {/* Image Container */}
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-[200px] sm:h-[240px] rounded-[12px] object-cover"
        />
        {/* Date Range Tag */}
        {property.dateRange && (
          <div className="absolute top-[-16px] right-[-16px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1)] bg-[#4A2FCC] text-white px-4 py-2  text-xs sm:text-sm font-semibold font-nunito rounded-bl-[20px] rounded-tr-[20px]">
            {property.dateRange}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="py-3 px-0 ">
        {/* Price */}
        <div className="mb-1">
          <span className="text-xl sm:text-2xl font-bold text-[#4A2FCC] font-nunito">
            {property.price}
            <span className="text-[#5A5E67] font-normal text-base font-nunito">
              /month
            </span>
          </span>
        </div>

        {/* Property Title */}
        <h3 className="text-lg sm:text-xl font-bold text-[#2B2F38] mb-1 font-nunito">
          {property.title}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-2 mb-2 text-[#5A5E67] text-sm md:text-base font-nunito">
          <span className="mt-0.5 shrink-0">
            <LocationTwo />
          </span>
          <span className="line-clamp-2">{property.address}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 sm:gap-6 text-[#5A5E67] text-sm md:text-base font-nunito">
          <div className="flex items-center gap-1.5">
            <BedIcon />
            <span className="font-nunito">{property.beds}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BathIcon />
            <span className="font-nunito">{property.baths}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HouseIcon />
            <span className="font-nunito">{property.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyHistoryCard;
