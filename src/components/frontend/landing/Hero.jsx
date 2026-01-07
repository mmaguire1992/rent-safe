'use client'

import { useNavigate } from '@/lib/react-router-compat'
import { useAuth } from '@/context/AuthContext'
import BlueTrustedIcon from "../../../svg/websiteSvg/blueTrustedIcon";
import Badge from "./Badge";
import Button from "./Button";
import ImageBadge from "./ImageBadge";

import ShielIcon from "@/svg/websiteSvg/shielIcon";
import UsersIcon from "@/svg/websiteSvg/usersIcon";

function Hero() {
  const navigate = useNavigate();
  const { userType, isAuthenticated, loading } = useAuth();

  const handleRentClick = () => {
    navigate('/properties');
  };

  const handlePropertyClick = () => {
    if (userType === 'owner') {
      navigate('/dashboard/properties/add');
    } else {
      // If not owner, redirect to signup or login
      navigate('/signup');
    }
  };

  // Determine which buttons to show
  // Show both buttons if not authenticated, or show specific button based on user type
  const showRentButton = !loading && (!isAuthenticated || userType === 'renter');
  const showPropertyButton = !loading && (!isAuthenticated || userType === 'owner');

  return (
    <section
      id="properties"
      className=" py-8 md:py-12 lg:py-16 gap-8 lg:gap-12 bg-lightBlueGradient overflow-hidden"
    >
      {/* Left Content */}
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex-1 max-w-2xl w-full space-y-3 md:space-y-5">
            <span className="border-[#6B4EFF33] border bg-badgeGradient rounded-2xl px-4 py-2 text-sm text-[#4A2FCC] font-semibold uppercase inline-flex items-center gap-2">
              <BlueTrustedIcon />
              Trusted UK Renting
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-secondary leading-tight">
              Renting Made Safe and Simple
            </h1>

            <p className="text-base md:text-lg text-[#5A5E67] font-normal font-nunito max-w-xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

            <div className="flex sm:flex-row gap-3 sm:gap-4">
              {showRentButton && (
                <button
                  onClick={handleRentClick}
                  className="bg-blueGradient text-white px-4 md:px-7 py-2 md:py-3 rounded-[10px] text-base font-bold font-nunito"                >
                  I'm Looking to Rent
                </button>
              )}
              {showPropertyButton && (
                <button
                  onClick={handlePropertyClick}
                  className="bg-white text-[#4A2FCC] border border-[#4A2FCC] px-4 md:px-7 py-2 md:py-3 rounded-[10px] text-base font-bold font-nunito hover:bg-[#4A2FCC] hover:text-white transition-colors"
                >
                  I have a Property
                </button>
              )}
            </div>
          </div>
          {/* Right Image */}
          <div className="flex-1 relative w-full lg:w-auto lg:max-w-4xl mt-10 lg:mt-0">
            <div className="relative">
              <div className="rounded-tl-full rounded-tr-full">
                <img src="/images/website/hero-image.png" alt="Modern house" className="w-full" />
              </div>
              <ImageBadge
                icon={<ShielIcon />}
                text="100% Free for Renters"
                position="top-left"
              />
              <ImageBadge
                icon={<UsersIcon />}
                text="10,000+ Active Users"
                position="bottom-right"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
