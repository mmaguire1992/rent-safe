'use client'

import { useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FiPhone, FiMail } from "react-icons/fi";
import BlueUserIcon from "@/svg/blueUserIcon";
import GrayBuildingIcon from "@/svg/grayBuildingIcon";
import DesignationIcon from "@/svg/designationIcon";
import GrayDesignationIcon from "@/svg/grayDesignationIcon";
import GrayCallIcon from "@/svg/grayCallIcon";
import GrayEmailIcon from "@/svg/grayEmailIcon";
import GrayRelationIcon from "@/svg/grayRelationIcon";

function References({ references }) {
  const sliderRef = useRef(null);

  // useEffect(() => {

  //   if (sliderRef.current) {
  //     setTimeout(() => {
  //       sliderRef.current.slickGoTo(0);
  //     }, 100);
  //   }
  // }, [references]);

  const referencesSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    pauseOnHover: true,
    arrows: false,
    cssEase: "ease",
    adaptiveHeight: false,
    swipe: true,
    touchMove: true,
    draggable: true,
    fade: false,
    initialSlide: 0,
    rtl: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          swipe: true,
          touchMove: true,
          draggable: true,
          autoplay: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          infinite: true,
          swipe: true,
          touchMove: true,
          draggable: true,
          autoplay: false,
        },
      },
    ],
  };

  return (
    <div className="bg-lightGrayGradient rounded-[10px]  border border-lightGray p-4 md:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
        <div className="flex items-center justify-start gap-2 sm:gap-4 mb-0">
          <span className="bg-[#E8E2FF] rounded-[10px] p-2 flex-shrink-0">
            <BlueUserIcon />
          </span>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-secondary font-nunito mb-0">
            References
          </h2>
        </div>
        <span className="text-midGray text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 whitespace-nowrap">
          {references.length} References
        </span>
      </div>
      <div className="references-slider overflow-hidden">
        {references.length > 0 ? (
          <Slider ref={sliderRef} {...referencesSliderSettings}>
            {references.map((ref, index) => (
              <div
                key={index}
                className="outline-none focus:outline-none px-1 sm:px-2 rfntBox"
              >
                <div className="border border-lightGray rounded-[20px] p-3 sm:p-4 bg-white h-full w-full">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 bg-[#6B4EFF] rounded-[10px] w-9 h-9 flex items-center justify-center text-white text-sm font-bold mt-1">
                      SW
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-secondary font-nunito font-bold mb-0">
                        {ref.name}
                      </p>
                      <p className="font-normal text-darkGray text-sm font-nunito">
                        {ref.type}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                        <GrayDesignationIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                          Designation
                        </p>
                        <p className="font-normal text-secondary text-base font-nunito">
                          {ref.designation}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                        <GrayCallIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                          Phone
                        </p>
                        <p className="font-normal text-secondary text-base font-nunito">
                          {ref.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                        <GrayEmailIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                          Email Address
                        </p>
                        <p className="font-normal text-secondary text-base font-nunito">
                          {ref.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                        <GrayRelationIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                          Relationship
                        </p>
                        <p className="font-normal text-secondary text-base font-nunito">
                          {ref.relationship}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <div className="text-center py-4 text-darkGray">
            No references available
          </div>
        )}
      </div>
    </div>
  );
}

export default References;
