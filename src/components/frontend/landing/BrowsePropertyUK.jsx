'use client'

import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Badge from "./Badge";
import Button from "./Button";
import CityCard from "./CityCard";
// import ShielIcon from "@/svg/websiteSvg/shielIcon";
import BlueTrustedIcon from "../../../svg/websiteSvg/blueTrustedIcon";
import { getCityPropertyCounts } from "@/api/properties";
// Import all city images
import birmingham from '@/assests/websiteImg/birmingham.png';
import london from '@/assests/websiteImg/london.png';
import leicester from '@/assests/websiteImg/leicester.png';
import bristol from '@/assests/websiteImg/bristol.png';
import manchester from '@/assests/websiteImg/manchester.png';
import liverpool from '@/assests/websiteImg/liverpool.png';
import galleryImg1 from '@/assests/websiteImg/galleryImg1.png';
import galleryImg2 from '@/assests/websiteImg/galleryImg2.png';
import galleryImg3 from '@/assests/websiteImg/galleryImg3.png';
import galleryImg4 from '@/assests/websiteImg/galleryImg4.png';
import galleryImg5 from '@/assests/websiteImg/galleryImg5.png';
import homelistOne from '@/assests/websiteImg/homelistOne.png';
import homelistTwo from '@/assests/websiteImg/homelistTwo.png';
import homelistThree from '@/assests/websiteImg/homelistThree.png';
import homelistFour from '@/assests/websiteImg/homelistFour.png';
import homelistFive from '@/assests/websiteImg/homelistFive.png';
import homelistSix from '@/assests/websiteImg/homelistSix.png';
import streetwithhouse from '@/assests/websiteImg/streetwithhouse.png';

function BrowsePropertyUK() {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [cityCounts, setCityCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available city images array - all images we have
  const cityImages = [
    birmingham,
    london,
    leicester,
    bristol,
    manchester,
    liverpool,
    galleryImg1,
    galleryImg2,
    galleryImg3,
    galleryImg4,
    galleryImg5,
    homelistOne,
    homelistTwo,
    homelistThree,
    homelistFour,
    homelistFive,
    homelistSix,
    streetwithhouse,
  ];

  // Use ref to store image assignments so they remain consistent
  const imageAssignmentRef = useRef(new Map());

  // Fisher-Yates shuffle algorithm to randomly shuffle array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Process cities from backend only, assign images cycling through all before repeating
  // Note: Backend only returns cities with active properties (status: 'active')
  const citiesWithCounts = useMemo(() => {
    if (!cityCounts || cityCounts.length === 0) {
      return []; // Return empty array if no API data
    }

    // Filter cities that have active properties (count > 0)
    // Backend already filters by status: 'active', so all counts are for active properties only
    const citiesWithProperties = cityCounts.filter(city => city.count > 0);

    // Get or create shuffled images for this set of cities
    const cityNamesKey = citiesWithProperties.map(c => c.name).sort().join(',');
    
    if (!imageAssignmentRef.current.has(cityNamesKey)) {
      // Shuffle images to ensure random distribution
      const shuffledImages = shuffleArray(cityImages);
      const assignment = new Map();
      
      // Assign images to cities, cycling through all images before repeating
      // Example: if we have 5 images and 12 cities, use all 5 images, then repeat from first
      citiesWithProperties.forEach((city, index) => {
        // Cycle through all images: use all images once, then repeat from the beginning
        assignment.set(city.name, shuffledImages[index % shuffledImages.length]);
      });
      
      imageAssignmentRef.current.set(cityNamesKey, assignment);
    }

    const imageAssignment = imageAssignmentRef.current.get(cityNamesKey);

    // Assign images to cities - fetch name and count from backend
    const cities = citiesWithProperties.map((city, index) => ({
      id: index + 1, // Generate ID based on index
      name: city.name, // City name from backend
      propertiesCount: city.count, // Property count from backend
      image: imageAssignment.get(city.name),
    }));

    return cities;
  }, [cityCounts]);

  const displayedCities = showAll ? citiesWithCounts : citiesWithCounts.slice(0, 6);

  // Fetch city property counts (backend only returns properties with status: 'active')
  useEffect(() => {
    const fetchCityCounts = async () => {
      try {
        setLoading(true);
        setError(null);
        // API returns only cities with active properties (status: 'active')
        const counts = await getCityPropertyCounts();
        setCityCounts(counts);
      } catch (err) {
        console.error('Error fetching city counts:', err);
        setError(err.message || 'Failed to load city data');
        // Don't set error state, just use static data
      } finally {
        setLoading(false);
      }
    };

    fetchCityCounts();
  }, []);

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

  const handleCityClick = (cityName) => {
    // Navigate to properties page with city filter
    navigate(`/properties?city=${encodeURIComponent(cityName)}`);
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
    arrows: false, // No arrow buttons
    swipe: true, // Enable swipe on touch devices
    touchMove: true, // Enable touch move
    draggable: true, // Enable dragging with mouse
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 3000,
          arrows: false,
          swipe: true,
          touchMove: true,
          draggable: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 3000,
          arrows: false,
          swipe: true,
          touchMove: true,
          draggable: true,
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
          {loading ? (
            <div className="grid grid-cols-2 lg:hidden gap-4 sm:gap-6">
              <div className="text-center text-gray-500 py-8">Loading cities...</div>
            </div>
          ) : displayedCities.length > 0 ? (
            <div className="grid grid-cols-2 lg:hidden gap-4 sm:gap-6">
              {displayedCities.map((city) => (
                <div key={city.id} onClick={() => handleCityClick(city.name)}>
                  <CityCard city={city} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:hidden gap-4 sm:gap-6">
              <div className="text-center text-gray-500 py-8 col-span-2">No cities with properties found</div>
            </div>
          )}

          {/* Desktop View - Slick Slider (Container aligned left, full width right) */}
          {isDesktop && (
            <div className="hidden lg:block relative -mx-4 sm:-mx-6 lg:-mx-8 browserSlider">
              <div className="city-slider-container-full pl-4 sm:pl-6 lg:pl-8">
                {loading ? (
                  <div className="text-center text-gray-500 py-8">Loading cities...</div>
                ) : citiesWithCounts.length > 0 ? (
                  <Slider {...browserSliderSettings}>
                    {citiesWithCounts.map((city) => (
                      <div key={city.id} className="px-3" onClick={() => handleCityClick(city.name)}>
                        <CityCard city={city} />
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <div className="text-center text-gray-500 py-8">No cities with properties found</div>
                )}
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
