'use client'

import { useNavigate } from '@/lib/react-router-compat';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FiCheckCircle } from "react-icons/fi";
import GreenGrowthIcon from "@/svg/greenGrowthIcon";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";
import BlueChatIcon from "@/svg/blueChatIcon";
import GrayMapIcon from "@/svg/grayMapIcon";

function RecentRequests({ recentRequests }) {
  const navigate = useNavigate();
  const recentSliderSettings = {
    dots: false,
    infinite: true,
    speed: 5000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false,
    cssEase: "linear",
    adaptiveHeight: false,
    swipe: true,
    touchMove: true,
    draggable: true,
    fade: false,
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
          arrows: false,
          autoplay: true,
          autoplaySpeed: 3000,
          speed: 5000,
          cssEase: "linear",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          infinite: true,
          swipe: true,
          touchMove: true,
          draggable: true,
          autoplay: true,
          autoplaySpeed: 3000,
          speed: 5000,
          cssEase: "linear",
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
          autoplay: true,
          autoplaySpeed: 3000,
          speed: 5000,
          cssEase: "linear",
        },
      },
    ],
  };
  return (
    <div className="bg-white overflow-hidden mt-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-secondary">
            Recent Requests
          </h2>
          <span className="bg-[#E8E2FF] text-[#4A2FCC] text-xs sm:text-sm font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center flex-shrink-0">
            4
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard/messages")}
          className="text-[#2177CE] font-bold font-nunito text-xs sm:text-sm whitespace-nowrap"
        >
          View All
        </button>
      </div>

      <div className="recent-requests-slider relative">
        {recentRequests.length > 0 ? (
          <Slider {...recentSliderSettings}>
            {recentRequests.map((request) => (
              <div key={request.id}>
                <div
                  onClick={() => navigate(`/dashboard/tenant/${request.id}`)}
                  className="border min-w-[250px] border-lightGray rounded-[20px] transition-colors h-full bg-white mx-1 sm:mx-2 md:mx-0 cursor-pointer"
                >
                  <div className="flex items-start gap-3  p-3 md:p-4 ">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 md:w-[56px] md:h-[56px] bg-gray-300 rounded-[10px] flex items-center justify-center">
                        <img
                          src={request.icon}
                          alt={request.name}
                          className="w-full h-full object-cover rounded-[10px]"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-secondary font-nunito text-sm md:text-base">
                              {request.name}
                            </span>
                            {request.verified && (
                              <span className="relative">
                                <GreenCheckedIcon />
                              </span>
                            )}
                          </div>
                          <span className="text-darkGray text-xs md:text-sm font-nunito">
                            {request.time}
                          </span>
                        </div>
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-[#6B4EFF] bg-opacity-10 rounded-[10px] flex items-center justify-center p-2 flex-shrink-0">
                          <BlueChatIcon />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#F8F8F8] rounded-bl-[20px] rounded-br-[20px] flex items-end justify-between p-4 gap-5">
                    <div>
                      {" "}
                      <p className="font-bold text-secondary font-nunito mb-1 text-sm md:text-base truncate">
                        {request.property}
                      </p>
                      <div className="flex items-center gap-1">
                        <GrayMapIcon />
                        <p className="text-darkGray text-sm font-nunito md:text-base mb-1 line-clamp-1">
                          {request.address}
                        </p>
                      </div>
                    </div>
                    <div>
                      {" "}
                      <p className="text-[#6B4EFF] font-nunito font-bold text-lg md:text-xl">
                        {request.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <div className="text-center py-4 text-darkGray">
            No recent requests
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentRequests;
