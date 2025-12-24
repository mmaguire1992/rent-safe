'use client'

import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Badge from "./Badge";
import Button from "./Button";
import CityCard from "./CityCard";
import ShielIcon from "@/svg/websiteSvg/shielIcon";
import { ukCities } from "@/websitedata/ukCities";
import BlueTrustedIcon from "../../../svg/websiteSvg/blueTrustedIcon";

function BrowsePropertyUK() {
  const [showAll, setShowAll] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const displayedCities = showAll ? ukCities : ukCities.slice(0, 6);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleViewMore = () => {
    setShowAll(!showAll);
  };

  // Slider settings - only used on desktop (lg and above)
  const browserSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false,
    swipe: false,
    touchMove: false,
    draggable: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 3000,
          swipe: false,
          touchMove: false,
          draggable: false,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 3000,
          swipe: false,
          touchMove: false,
          draggable: false,
        },
      },
    ],
  };

  return (
    <section
      id="locations"
      className="w-full py-6 md:pt-14 lg:pt-16 pb-0 bg-white scroll-mt-[88px]  overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4">
            <span className="border-[#6B4EFF33] border bg-badgeGradient rounded-2xl px-4 py-2 text-sm text-[#4A2FCC] font-semibold uppercase inline-flex items-center gap-2">
              <BlueTrustedIcon />
              PROPERTIES IN 51+ CITIES
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-secondary mb-4">
            Browse Property in UK
          </h2>

          <p className="text-base md:text-lg text-[#5A5E67] font-normal font-nunito">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* City Cards - Mobile: Grid, Desktop: Slider */}
        <div className="mb-8 md:mb-12">
          {/* Mobile View - Grid */}
          <div className="grid grid-cols-2 lg:hidden gap-4 sm:gap-6">
            {displayedCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>

          {/* Desktop View - Slick Slider (Container aligned left, full width right) */}
          {isDesktop && (
            <div className="hidden lg:block relative -mx-4 sm:-mx-6 lg:-mx-8 browserSlider">
              <div className="city-slider-container-full pl-4 sm:pl-6 lg:pl-8 overflow-hidden">
                <Slider {...browserSliderSettings}>
                  {ukCities.map((city) => (
                    <div key={city.id} className="px-3">
                      <CityCard city={city} />
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          )}
        </div>

        {/* View More Button - Only show on mobile */}
        <div className="flex justify-center lg:hidden">
          <Button variant="primary" onClick={handleViewMore}>
            {showAll ? "Show Less" : "View more"}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default BrowsePropertyUK;
