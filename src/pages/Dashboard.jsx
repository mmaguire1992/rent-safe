import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiClock,
  FiArrowUpRight,
  FiMoreVertical,
  FiChevronRight,
  FiFilter,
  FiDownload,
  FiChevronLeft,
  FiChevronRight as FiChevronRightIcon,
} from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";

function Dashboard() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const summaryCards = [
    {
      icon: FiHome,
      title: "Total Active Properties",
      value: "24",
      change: "+2 this month",
      trend: "up",
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: FiUsers,
      title: "Total Rented Properties",
      value: "124",
      change: "+2 this month",
      trend: "up",
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: FiDollarSign,
      title: "Monthly Leads",
      value: "35",
      change: "+2 this month",
      trend: "up",
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: FiClock,
      title: "Remaining Listing Count",
      value: "18",
      change: "7/25 Used",
      trend: null,
      color: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  const recentRequests = [
    {
      id: 1,
      name: "David Wanner",
      time: "Just Now",
      property: "2-Bed Modern Apartment",
      address: "45 Oxford Street, London, W1D 2DZ",
      price: "€800",
      verified: true,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      time: "5 mins ago",
      property: "3-Bed Luxury Villa",
      address: "12 Park Avenue, London, SW1A 1AA",
      price: "€1,200",
      verified: true,
    },
    {
      id: 3,
      name: "Michael Brown",
      time: "10 mins ago",
      property: "1-Bed Studio Apartment",
      address: "78 High Street, London, EC1A 1BB",
      price: "€600",
      verified: false,
    },
    {
      id: 4,
      name: "Emma Wilson",
      time: "15 mins ago",
      property: "4-Bed Family House",
      address: "23 Baker Street, London, NW1 6XE",
      price: "€1,500",
      verified: true,
    },
    {
      id: 5,
      name: "James Taylor",
      time: "20 mins ago",
      property: "2-Bed Penthouse",
      address: "56 King's Road, London, SW3 4RD",
      price: "€2,000",
      verified: true,
    },
  ];

  // Slick Slider Settings - Must be after recentRequests declaration
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 3000, // Slow transition speed (3 seconds)
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 100, // Very fast autoplay for continuous motion
    pauseOnHover: false, // Don't pause on hover for continuous motion
    arrows: true,
    cssEase: "linear", // Linear easing for smooth continuous motion
    adaptiveHeight: false,
    swipe: true,
    touchMove: true,
    draggable: true,
    fade: false,
    useTransform: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          speed: 3000,
          autoplaySpeed: 100,
          cssEase: "linear",
          pauseOnHover: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          infinite: true,
          speed: 3000,
          autoplaySpeed: 100,
          cssEase: "linear",
          pauseOnHover: false,
        },
      },
    ],
  };

  const activeProperties = [
    {
      id: 1,
      image: "https://via.placeholder.com/60x60",
      title: "2-Bed Apartment in Cit...",
      propertyId: "ID:0033",
      location: "4517 Washington Ave.....",
      type: "Apartment",
      rent: "€800",
      leads: "22",
      status: "Pending",
      views: "67",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/60x60",
      title: "2-Bed Apartment in Cit...",
      propertyId: "ID:0033",
      location: "4517 Washington Ave.....",
      type: "House",
      rent: "€800",
      leads: "22",
      status: "Active",
      views: "55",
    },
    {
      id: 3,
      image: "https://via.placeholder.com/60x60",
      title: "2-Bed Apartment in Cit...",
      propertyId: "ID:0033",
      location: "4517 Washington Ave.....",
      type: "Apartment",
      rent: "€800",
      leads: "22",
      status: "Pending",
      views: "53",
    },
    {
      id: 4,
      image: "https://via.placeholder.com/60x60",
      title: "2-Bed Apartment in Cit...",
      propertyId: "ID:0033",
      location: "4517 Washington Ave.....",
      type: "Apartment",
      rent: "€800",
      leads: "22",
      status: "Pending",
      views: "52",
    },
    {
      id: 5,
      image: "https://via.placeholder.com/60x60",
      title: "2-Bed Apartment in Cit...",
      propertyId: "ID:0033",
      location: "4517 Washington Ave.....",
      type: "Apartment",
      rent: "€800",
      leads: "22",
      status: "Pending",
      views: "48",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Dashboard Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-darkGray">
            Manage and track your rental listings
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-4 md:p-6 border border-lightGray"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div
                    className={`${card.color} p-2 md:p-3 rounded-lg ${card.iconColor}`}
                  >
                    <Icon className="text-xl md:text-2xl" />
                  </div>
                </div>
                <h3 className="text-darkGray text-xs md:text-sm mb-1">
                  {card.title}
                </h3>
                <p className="text-2xl md:text-3xl font-bold text-secondary mb-2">
                  {card.value}
                </p>
                <div className="flex items-center gap-1">
                  {card.trend === "up" && (
                    <FiArrowUpRight className="text-green-600 text-sm md:text-base" />
                  )}
                  <span
                    className={`text-xs md:text-sm ${
                      card.trend === "up" ? "text-green-600" : "text-darkGray"
                    }`}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg border border-lightGray p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-secondary">
                Recent Requests
              </h2>
              <span className="bg-[#6B4EFF] text-white text-xs font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                4
              </span>
            </div>
            <button className="text-[#6B4EFF] font-semibold text-xs md:text-sm hover:underline">
              View All
            </button>
          </div>

          <div className="recent-requests-slider relative">
            {recentRequests.length > 0 ? (
              <Slider {...sliderSettings}>
                {recentRequests.map((request) => (
                  <div key={request.id}>
                    <div
                      onClick={() =>
                        navigate(`/dashboard/tenant/${request.id}`)
                      }
                      className="flex items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 border border-lightGray rounded-lg hover:bg-gray-50 transition-colors h-full bg-white mx-2 cursor-pointer"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-secondary font-bold text-sm md:text-base">
                            {request.name.charAt(0)}
                          </span>
                        </div>
                        {request.verified && (
                          <FiCheckCircle className="absolute -bottom-1 -right-1 text-green-600 bg-white rounded-full text-sm md:text-base" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-secondary text-sm md:text-base">
                              {request.name}
                            </span>
                            <span className="text-darkGray text-xs md:text-sm">
                              {request.time}
                            </span>
                          </div>
                          <div className="w-7 h-7 md:w-8 md:h-8 bg-[#6B4EFF] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              className="md:w-4 md:h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#6B4EFF"
                              strokeWidth="2"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>
                        </div>
                        <p className="font-medium text-secondary mb-1 text-sm md:text-base truncate">
                          {request.property}
                        </p>
                        <p className="text-darkGray text-xs md:text-sm mb-1 line-clamp-1">
                          {request.address}
                        </p>
                        <p className="text-[#6B4EFF] font-bold text-sm md:text-base">
                          {request.price}
                        </p>
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

        {/* Active Properties */}
        <div className="bg-white rounded-lg border border-lightGray p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-secondary">
              Active Properties
            </h2>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <div className="flex items-center gap-2 border border-lightGray rounded-lg px-2 md:px-3 py-1.5 md:py-2">
                <FiFilter className="text-secondary text-sm md:text-base" />
                <span className="text-secondary text-xs md:text-sm">
                  Sort by
                </span>
              </div>
              <button className="bg-[#6B4EFF] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <span>Add Property</span>
                <span>+</span>
              </button>
              <button className="bg-[#6B4EFF] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <FiDownload className="text-sm md:text-base" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lightGray">
                  <th className="text-left py-3 px-4 text-darkGray font-semibold text-sm">
                    Property
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-semibold text-sm">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-semibold text-sm">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-semibold text-sm">
                    Rent
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-semibold text-sm">
                    Leads
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-semibold text-sm">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-semibold text-sm">
                    Views
                  </th>
                  <th className="text-left py-3 px-4 text-darkGray font-semibold text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeProperties.map((property, index) => (
                  <tr
                    key={property.id}
                    className="border-b border-lightGray hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-darkGray text-sm">
                          {index + 1}
                        </span>
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-secondary text-sm">
                            {property.title}
                          </p>
                          <p className="text-darkGray text-xs">
                            {property.propertyId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-secondary text-sm">
                        {property.location}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-secondary text-sm">{property.type}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-secondary text-sm">
                        {property.rent}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-secondary text-sm">{property.leads}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          property.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-[#D19600]"
                        }`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-secondary text-sm">{property.views}</p>
                    </td>
                    <td className="py-4 px-4">
                      {property.status === "Active" ? (
                        <FiChevronRight className="text-[#6B4EFF] cursor-pointer" />
                      ) : (
                        <FiMoreVertical className="text-secondary cursor-pointer" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden space-y-4">
            {activeProperties.map((property, index) => (
              <div
                key={property.id}
                className="border border-lightGray rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-darkGray text-sm pt-1">
                    {index + 1}
                  </span>
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary text-sm mb-1">
                      {property.title}
                    </p>
                    <p className="text-darkGray text-xs mb-2">
                      {property.propertyId}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        property.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-[#D19600]"
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                  <div>
                    {property.status === "Active" ? (
                      <FiChevronRight className="text-[#6B4EFF] cursor-pointer" />
                    ) : (
                      <FiMoreVertical className="text-secondary cursor-pointer" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-lightGray">
                  <div>
                    <p className="text-xs text-darkGray mb-1">Location</p>
                    <p className="text-sm text-secondary">
                      {property.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Type</p>
                    <p className="text-sm text-secondary">{property.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Rent</p>
                    <p className="text-sm font-semibold text-secondary">
                      {property.rent}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Leads</p>
                    <p className="text-sm text-secondary">{property.leads}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-darkGray mb-1">Views</p>
                    <p className="text-sm text-secondary">{property.views}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 md:mt-6">
            <p className="text-darkGray text-xs md:text-sm text-center sm:text-left">
              Showing 1-5 of 12 properties
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                className="p-2 border border-lightGray rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <FiChevronLeft className="text-sm" />
              </button>
              <button className="bg-[#6B4EFF] text-white w-8 h-8 rounded-lg font-semibold text-sm">
                1
              </button>
              <button className="w-8 h-8 rounded-lg font-semibold text-secondary hover:bg-gray-100 text-sm">
                2
              </button>
              <button className="w-8 h-8 rounded-lg font-semibold text-secondary hover:bg-gray-100 text-sm">
                3
              </button>
              <button className="p-2 border border-lightGray rounded-lg hover:bg-gray-50">
                <FiChevronRightIcon className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
