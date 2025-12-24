'use client'

import { useNavigate, useParams } from '@/lib/react-router-compat';
import { useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SmallCheckIcon from "@/svg/smallCheckIcon";
import WhiteLocationIcon from "@/svg/whiteLocationIcon";
import GrayBuildingIcon from "@/svg/grayBuildingIcon";
import BlueHouseIcon from "@/svg/blueHouseIcon";

function RentalHistory({ rentalHistory }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const sliderRef = useRef(null);

  useEffect(() => {
    // Force slider to start from slide 0 when component mounts
    if (sliderRef.current) {
      setTimeout(() => {
        sliderRef.current.slickGoTo(0);
      }, 100);
    }
  }, [rentalHistory]);

  const RentalsliderSettings = {
    dots: false,
    infinite: true,
    speed: 7000,
    slidesToShow: 1.5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10,
    pauseOnHover: false,
    arrows: false,
    cssEase: "linear",
    adaptiveHeight: false,
    swipe: false,
    touchMove: false,
    draggable: false,
    fade: false,
    initialSlide: 0,
    rtl: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          speed: 500,
          autoplay: false,
          cssEase: "ease",
          pauseOnHover: false,
          initialSlide: 0,
          rtl: false,
          swipe: true,
          touchMove: true,
          draggable: true,
        },
      },
    ],
  };

  return (
    <div className="bg-lightGrayGradient rounded-[10px]  border border-lightGray p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-start gap-4 mb-0">
          <span className="bg-[#E8E2FF] rounded-[10px] p-2">
            <BlueHouseIcon />
          </span>
          <h2 className="text-base md:text-xl font-bold text-secondary font-nunito mb-0">
            Previous Rental History & Landlord Recommendations
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/dashboard/tenant/${id}/rental-history`)}
            className="text-[#2177CE] font-bold text-sm whitespace-nowrap"
          >
            View All
          </button>
        </div>
      </div>
      <div className="rental-history-slider overflow-hidden">
        {rentalHistory.length > 0 ? (
          <Slider ref={sliderRef} {...RentalsliderSettings}>
            {rentalHistory.map((history, index) => (
              <div
                key={history.id || index}
                className="outline-none focus:outline-none px-1 sm:px-2 rntBox"
              >
                <div className="border border-lightGray rounded-[20px] p-4 bg-white w-full">
                  <div className="flex md:flex-row flex-col items-start gap-4">
                    {/* Rental History Details - 60% (Left Side) */}
                    <div className="flex-[0_0_50%] min-w-0 md:border-r border-lightGray space-y-3">
                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 bg-[#6B4EFF] rounded-[10px] w-9 h-9 flex items-center justify-center mt-1">
                          <WhiteLocationIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base text-secondary font-nunito font-bold mb-1">
                            Address
                          </p>
                          <p className="font-normal text-darkGray text-sm font-nunito">
                            {history.address}
                          </p>
                        </div>
                      </div>

                      {/* Tenancy Dates */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                          <GrayBuildingIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                            Tenancy Dates
                          </p>
                          <p className="font-normal text-secondary text-base font-nunito">
                            {history.tenancyDates}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                          <GrayBuildingIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                            Location
                          </p>
                          <p className="font-normal text-secondary text-base font-nunito">
                            {history.location}
                          </p>
                        </div>
                      </div>

                      {/* Monthly Rent */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                          <GrayBuildingIcon className="text-[#6B4EFF] text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                            Monthly Rent
                          </p>
                          <p className="font-normal text-secondary text-base font-nunito">
                            {history.monthlyRent}
                          </p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                          <GrayBuildingIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                            Phone
                          </p>
                          <p className="font-normal text-secondary text-base font-nunito">
                            {history.phone}
                          </p>
                        </div>
                      </div>

                      {/* Reason for Leaving */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                          <GrayBuildingIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                            Reason for Leaving
                          </p>
                          <p className="font-normal text-secondary text-base font-nunito">
                            {history.reasonForLeaving}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Landlord Recommendation - 50% (Right Side) */}
                    {history.landlordRecommendation ? (
                      <div className="flex-[0_0_50%] min-w-0 md:pl-0 pr-3 pt-4 md:pt-0 border-t md:border-t-0 border-lightGray md:border-0">
                        <p className="font-normal text-darkGray text-base font-nunito mb-4 leading-relaxed">
                          {history.landlordRecommendation.text}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-4 pr-3">
                          <div className="block min-w-0">
                            <span className="block font-bold text-secondary text-base font-nunito">
                              {history.landlordRecommendation.name}
                            </span>
                            <span className="text-darkGray text-sm font-nunito font-normal">
                              Owner
                            </span>
                          </div>
                          {history.landlordRecommendation.verified && (
                            <span className="bg-[#DFFFE6] text-[#00893A] px-2 py-1 rounded-full text-xs font-normal font-nunito flex items-center gap-1 flex-shrink-0">
                              Verified <SmallCheckIcon />
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-[0_0_50%] min-w-0 pl-4">
                        <p className="text-darkGray text-sm font-nunito font-normal">
                          No recommendation available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <div className="text-center py-4 text-darkGray">
            No rental history available
          </div>
        )}
      </div>
    </div>
  );
}

export default RentalHistory;
