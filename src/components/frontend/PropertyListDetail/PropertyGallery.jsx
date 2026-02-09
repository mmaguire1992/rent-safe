'use client'

import { useState } from "react";
import BedIcon from "@/svg/websiteSvg/bedIcon";
import BathIcon from "@/svg/websiteSvg/bathIcon";
import HouseIcon from "@/svg/websiteSvg/houseIcon";
import BlueLocationIcon from "../../../svg/blueLocationIcon";
function PropertyGallery({ images, isRecent = false, property }) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-[20px] p-3 sm:p-4 border border-lightGray overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Main Image */}
          <div className="relative">
            <img
              src={images[selectedImage]}
              alt="Property"
              className="w-full h-[240px] sm:h-[300px] md:h-[460px] object-unset rounded-xl md:rounded-tl-xl md:rounded-bl-xl"
            />
          </div>

          {/* Thumbnail Grid - Show 4 thumbnails vertically, scroll for 5th and more */}
          {images.length > 1 && (
            <div className="p-[2px] overflow-x-auto md:overflow-y-auto  sm:h-[300px] md:h-[360px]">
              <div className="flex items-center flex-nowrap md:grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                {images.map((img, index) => {
                  const isSelected = selectedImage === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 overflow-hidden w-full h-[270px] rounded-lg transition-all ${
                        isSelected
                          ? "ring-2 ring-primary opacity-100"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="block mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl md:text-2xl font-bold font-nunito text-[#2B2F38] mb-3 sm:mb-2">
                {property.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 mb-0">
                <div className="flex items-start gap-2 text-sm sm:text-base font-normal font-nunito text-secondary">
                  <BlueLocationIcon />
                  <span className="break-words">{property.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base font-normal font-nunito text-secondary">
                  <BedIcon />
                  <span>{property.beds}</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base font-normal font-nunito text-secondary">
                  <BathIcon />
                  <span>{property.baths}</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base font-normal font-nunito text-secondary">
                  <HouseIcon />
                  <span>{property.type}</span>
                </div>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#4A2FCC] mb-0 flex-shrink-0">
              {property.price}
              <span className="text-midGray font-normal text-sm sm:text-base">
                /month
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PropertyGallery;
