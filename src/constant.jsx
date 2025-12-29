// ============================================
// ALL IMPORTS
// ============================================

// Icons and Images
import ActivePropertiesIcon from "./svg/greenPropertyIcon";
import RentedPropertiesIcon from "./svg/blueRentedIcon";
import MonthlyLeadsIcon from "./svg/orangeUserIcon";
import RemainingListingCountIcon from "./svg/listingCounterIcon";
import Userimg from "./assests/images/userImg.png";
import HotelIcon from "./assests/images/hotelIcon.png";
import UserImg from "./assests/images/userImg.png";
import MainHotelImg from "./assests/images/mainHotelImg.png";
import HotelThumbnail1 from "./assests/websiteImg/galleryImg1.png";
import HotelThumbnail2 from "./assests/websiteImg/galleryImg2.png";
import HotelThumbnail3 from "./assests/websiteImg/galleryImg3.png";
import HotelThumbnail4 from "./assests/websiteImg/galleryImg4.png";
import {
  FiHome,
  FiWifi,
  FiThermometer,
  FiMapPin,
  FiDollarSign,
  FiUpload,
  FiUser,
  FiCheck,
  FiUserCheck,
} from "react-icons/fi";
import DashboardIcon from "./svg/dashboardIcon";
import PropertiesIcon from "./svg/propertiesIcon";
import MessagesIcon from "./svg/messageIcon";
import PaymentsIcon from "./svg/planIcon";
import VerificationIcon from "./svg/verificationIcon";
import SettingsIcon from "./svg/settingsIcon";
import SupportIcon from "./svg/supportIcon";
// Property Detail Icons
import BlueCarIcon from "./svg/blueCarIcon";
import BlueWIFIIcon from "./svg/blueWIFIIcon";
import BlueGardenIcon from "./svg/blueGardenIcon";
import BlueHeatingIcon from "./svg/blueHeatingIcon";
import OrangeElectrityIcon from "./svg/orangeElectrityIcon";
import OrangeGasIcon from "./svg/orangeGasIcon";
import RedMaleIcon from "./svg/redMaleIcon";
import SingleFemaleIcon from "./svg/singleFemaleIcon";
import CoupleIcon from "./svg/coupleIcon";
import FamilyIcon from "./svg/familyIcon";
import StudentIcon from "./svg/studentIcon";
import ProfessionalIcon from "./svg/professionalIcon";
import SelfEmployedIcon from "./svg/selfEmployedIcon";
import RetiredIcon from "./svg/retiredIcon";
import SharersIcon from "./svg/sharersIcon";
import CarporateTenantIcon from "./svg/carporateTenantIcon";
import { MdOutlineEuro } from "react-icons/md";

// ============================================
// DASHBOARD DATA
// ============================================

export const summaryCards = [
  {
    icon: ActivePropertiesIcon,
    title: "Total Active Properties",
    value: "24",
    change: "+2",
    trend: "up",
    color: "bg-[#DFFFE6]",
    iconColor: "text-blue-600",
  },
  {
    icon: RentedPropertiesIcon,
    title: "Total Rented Properties",
    value: "124",
    change: "+2",
    trend: "up",
    color: "bg-[#CFE4FF]",
    iconColor: "text-green-600",
  },
  {
    icon: MonthlyLeadsIcon,
    title: "Monthly Leads",
    value: "35",
    change: "+2",
    trend: "up",
    color: "bg-[#FFE4CC]",
    iconColor: "text-purple-600",
  },
  {
    icon: RemainingListingCountIcon,
    title: "Remaining Listing Count",
    value: "18",
    change: "7/25",
    trend: null,
    color: "bg-[#FFDDEE]",
    iconColor: "text-orange-600",
  },
];

export const recentRequests = [
  {
    id: 1,
    icon: Userimg,
    name: "David Wanner",
    time: "Just Now",
    property: "2-Bed Modern Apartment",
    address: "45 Oxford Street, London, W1D 2DZ",
    price: "€800",
    verified: true,
  },
  {
    id: 2,
    icon: Userimg,
    name: "Sarah Johnson",
    time: "5 mins ago",
    property: "3-Bed Luxury Villa",
    address: "12 Park Avenue, London, SW1A 1AA",
    price: "€1,200",
    verified: true,
  },
  {
    id: 3,
    icon: Userimg,
    name: "Michael Brown",
    time: "10 mins ago",
    property: "1-Bed Studio Apartment",
    address: "78 High Street, London, EC1A 1BB",
    price: "€600",
    verified: false,
  },
  {
    id: 4,
    icon: Userimg,
    name: "Emma Wilson",
    time: "15 mins ago",
    property: "4-Bed Family House",
    address: "23 Baker Street, London, NW1 6XE",
    price: "€1,500",
    verified: true,
  },
  {
    id: 5,
    icon: Userimg,
    name: "James Taylor",
    time: "20 mins ago",
    property: "2-Bed Penthouse",
    address: "56 King's Road, London, SW3 4RD",
    price: "€2,000",
    verified: true,
  },
];

export const activeProperties = [
  {
    id: 1,
    image: HotelIcon,
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
    image: HotelIcon,
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
    image: HotelIcon,
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
    image: HotelIcon,
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
    image: HotelIcon,
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

// ============================================
// SLIDER SETTINGS
// ============================================

export const recentRequestsSliderSettings = {
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

// ============================================
// TENANT PROFILE DATA
// ============================================

export const getTenantData = (id) => ({
  id: id || "1",
  name: "David Wanner",
  verified: true,
  profileImage: UserImg,
  description:
    "Experienced marketing professional with excellent references from previous landlords. Looking for long-term rental with reliable payment history and strong community engagement.",
  designation: "Marketing Manager",
  location: "Manchester, UK",
  monthlyIncome: "€4,800",
  creditScore: 785,
  creditMax: 999,
  creditRating: "Excellent",
  creditDescription:
    "This Credit Score indicates excellent creditworthiness and payment reliability.",
  identity: {
    fullName: "Michael Min Chin",
    dateOfBirth: "5th July 1990",
    nationalInsurance: "CD0012E",
    phone: "+44 7445 987954",
    email: "michael.chin@email.com",
  },
  currentAddress: {
    address: "78 Canal Street",
    city: "Manchester",
    country: "United Kingdom",
    postcode: "M1 2RZ",
    livingPeriod: "3 years",
  },
  employment: {
    jobTitle: "Senior Marketing Manager",
    company: "Digital Marketing Hub Ltd",
    employmentType: "Full-time Permanent",
    annualSalary: "€57,600",
    startDate: "March 2011",
    workLocation: "Manchester Office",
  },
  proofOfIncome: {
    type: "Latest Payslip",
    date: "December 2024",
    grossMonthly: "€4,800",
    netMonthly: "€4,000",
  },
  documents: [
    {
      type: "Passport",
      documentNumber: "*****4321",
      expires: "November 2029",
      verified: true,
    },
    {
      type: "Driver's License",
      documentNumber: "*****038P",
      expires: "July 2026",
      verified: true,
    },
  ],
  rentalHistory: [
    {
      id: 1,
      address: "34 King Street, Manchester M2 8AZ",
      tenancyDates: "Sep 2020 - Dec 2021",
      location: "Manchester",
      monthlyRent: "£1,450",
      phone: "+44 7445 987954",
      reasonForLeaving: "Seeking larger space",
      landlordRecommendation: {
        name: "Jane Casper",
        verified: true,
        text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in good condition. I would gladly rent to them again. I've never had any issues with David and I hope they continue to rent from me in the future.",
      },
    },
    {
      id: 2,
      address: "34 King Street, Manchester M2 8AZ",
      tenancyDates: "Sep 2020 - Dec 2021",
      location: "Manchester",
      monthlyRent: "£1,450",
      phone: "+44 7445 987954",
      reasonForLeaving: "Seeking larger space",
      landlordRecommendation: {
        name: "Jane Casper",
        verified: true,
        text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in good condition. I would gladly rent to them again. I've never had any issues with David and I hope they continue to rent from me in the future.",
      },
    },
    {
      id: 3,
      address: "34 King Street, Manchester M2 8AZ",
      tenancyDates: "Sep 2020 - Dec 2021",
      location: "Manchester",
      monthlyRent: "£1,450",
      phone: "+44 7445 987954",
      reasonForLeaving: "Seeking larger space",
      landlordRecommendation: {
        name: "Jane Casper",
        verified: true,
        text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in good condition. I would gladly rent to them again. I've never had any issues with David and I hope they continue to rent from me in the future.",
      },
    },
    {
      id: 4,
      address: "34 King Street, Manchester M2 8AZ",
      tenancyDates: "Sep 2020 - Dec 2021",
      location: "Manchester",
      monthlyRent: "£1,450",
      phone: "+44 7445 987954",
      reasonForLeaving: "Seeking larger space",
      landlordRecommendation: {
        name: "Jane Casper",
        verified: true,
        text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in good condition. I would gladly rent to them again. I've never had any issues with David and I hope they continue to rent from me in the future.",
      },
    },
    {
      id: 5,
      address: "34 King Street, Manchester M2 8AZ",
      tenancyDates: "Sep 2020 - Dec 2021",
      location: "Manchester",
      monthlyRent: "£1,450",
      phone: "+44 7445 987954",
      reasonForLeaving: "Seeking larger space",
      landlordRecommendation: {
        name: "Jane Casper",
        verified: true,
        text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in good condition. I would gladly rent to them again. I've never had any issues with David and I hope they continue to rent from me in the future.",
      },
    },
  ],
  references: [
    {
      name: "Sarah Williams",
      designation: "Marketing Director",
      phone: "+44 7445 987954",
      email: "michael.chin@email.com",
      relationship: "Direct manager for 3 years",
      type: "Professional",
    },
    {
      name: "Sarah Williams",
      designation: "Marketing Director",
      phone: "+44 7445 987954",
      email: "michael.chin@email.com",
      relationship: "Direct manager for 3 years",
      type: "Professional",
    },
    {
      name: "Sarah Williams",
      designation: "Marketing Director",
      phone: "+44 7445 987954",
      email: "michael.chin@email.com",
      relationship: "Direct manager for 3 years",
      type: "Professional",
    },
    {
      name: "Sarah Williams",
      designation: "Marketing Director",
      phone: "+44 7445 987954",
      email: "michael.chin@email.com",
      relationship: "Direct manager for 3 years",
      type: "Professional",
    },
    {
      name: "Sarah Williams",
      designation: "Marketing Director",
      phone: "+44 7445 987954",
      email: "michael.chin@email.com",
      relationship: "Direct manager for 3 years",
      type: "Professional",
    },
  ],
  guarantor: {
    name: "Sarah Williams",
    verified: true,
    relationship: "Mother",
    occupation: "Senior Nurse",
    contactNumber: "+44 7735 609800",
    email: "sara.chin@email.com",
    annualIncome: "€44,280",
    address: "09 Willow Avenue, Liverpool L30 1DE",
  },
});

// ============================================
// MESSAGES DATA
// ============================================

export const allMessages = [
  {
    id: 1,
    name: "David Wanner",
    property: "2-Bed Apartment Manchester",
    message: "Hello, I'm interested in viewing the property this week.",
    time: "2h ago",
    unread: 1,
    hasPhoto: true,
    photoUrl: Userimg,
    initials: "DW",
  },
  {
    id: 2,
    name: "Naomi Watts",
    property: "2-Bed Apartment Anfield",
    message: "Hello, I'm interested in viewing the property this week.",
    time: "1h ago",
    unread: 1,
    hasPhoto: false,
    initials: "NW",
  },
  {
    id: 3,
    name: "Ricardo Diaz",
    property: "2-Bed Apartment Anfield",
    message: "Hello, I'm interested in viewing the property this week.",
    time: "1h ago",
    unread: 1,
    hasPhoto: false,
    initials: "RD",
  },
  {
    id: 4,
    name: "Keisha Blue",
    property: "3-Bed House Liverpool",
    message: "Hello, I'm interested in viewing the property this week.",
    time: "30m ago",
    unread: 1,
    hasPhoto: false,
    initials: "KB",
  },
];

export const messageRequests = [
  {
    id: 1,
    name: "David Wanner",
    property: "2-Bed Apartment Manchester",
    message: "Hello, I'm interested in viewing the property this week.",
    time: "2h ago",
    unread: 1,
    hasPhoto: true,
    photoUrl: Userimg,
    initials: "DW",
  },
  {
    id: 2,
    name: "Naomi Watts",
    property: "2-Bed Apartment Anfield",
    message: "Hello, I'm interested in viewing the property this week.",
    time: "1h ago",
    unread: 1,
    hasPhoto: false,
    initials: "NW",
  },
  {
    id: 3,
    name: "Ricardo Diaz",
    property: "2-Bed Apartment Anfield",
    message: "Hello, I'm interested in viewing the property this week.",
    time: "1h ago",
    unread: 1,
    hasPhoto: false,
    initials: "RD",
  },
  {
    id: 4,
    name: "Keisha Blue",
    property: "3-Bed House Liverpool",
    message: "Hello, I'm interested in viewing the property this week.",
    time: "30m ago",
    unread: 1,
    hasPhoto: false,
    initials: "KB",
  },
  {
    id: 5,
    name: "Sarah Johnson",
    property: "1-Bed Studio Birmingham",
    message: "Hello, I'm interested in viewing the property this week.",
    time: "45m ago",
    unread: 1,
    hasPhoto: false,
    initials: "SJ",
  },
  {
    id: 6,
    name: "Michael Brown",
    property: "4-Bed House Leeds",
    message: "Hello, I'm interested in viewing the property this week.",
    time: "1h ago",
    unread: 1,
    hasPhoto: false,
    initials: "MB",
  },
];

export const getChatMessages = (conversationId) => {
  if (!conversationId) return [];
  return [
    {
      id: 1,
      sender: "david",
      senderInitials: "DW",
      message:
        "Hi, I'm interested in your 2-bedroom apartment in Manchester. Is it still available?",
      time: "10:30 AM",
      type: "text",
    },
    {
      id: 2,
      sender: "you",
      message: {
        rent: "€800 / month",
        property: "2-Bed Apartment Manchester",
        requirements: "I need your ID and proof of income.",
      },
      time: "11:15 AM",
      type: "offer",
    },
  ];
};

// ============================================
// PROPERTY DATA
// ============================================

export const propertyDetailsArray = [
  {
    id: "0033",
    title: "2-Bed Apartment in City Centre",
    address: "45 Deansgate, Manchester, M3 2AY",
    bedrooms: 2,
    bathrooms: 2,
    status: "Active",
    dateAdded: "15th Nov 2025",
    approvedOn: "15th Feb 2026",
    validUntil: "15th Feb 2027",
    views: 342,
    leads: 12,
    monthlyRent: "€800",
    propertyType: "Flat/Apartment",
    furnishedStatus: "Furnished",
    availableFrom: "15th Nov 2025",
    description:
      "Beautiful modern apartment in the heart of Manchester city centre. This stunning 2-bedroom property features contemporary design, floor-to-ceiling windows with city views, and high-quality finishes throughout. Perfect for professionals or couples looking for city living at its finest.",
    renterProfileDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    additionalRequirements:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    mainImage: MainHotelImg,
    thumbnails: [
      HotelThumbnail1,
      HotelThumbnail2,
      HotelThumbnail3,
      HotelThumbnail4,
    ],
    amenities: [
      "Parking",
      "WiFi Included",
      "Garden",
      "Central Heating",
      "Gas Safety Certificate",
      "Lift",
      "TV point",
      "Bicycle storage",
      "Fridge-freezer",
      "Washing machine",
      "Fireplace",
      "Wardrobes",
      "Bed(s)",
      "Underfloor heating",
      "Dryer / Washer-dryer",
      "Pantry / separate storage",
      "Smoke alarms",
      "Garage",
      "Electrical Safety Certificate",
      "CCTV in communal areas",
      "Residents' parking",
      "Microwave",
      "Heating controls",
      "Wooden flooring",
      "Carpet flooring",
      "Dishwasher",
      "Hob & oven",
      "Sprinkler system",
      "Recycling bins area",
      "EV charging point",
    ],
    utilities: ["Gas", "Electricity", "Water", "Internet"],
    preferredRenterTypes: [
      { label: "Single Male", checked: true },
      { label: "Single Female", checked: true },
      { label: "Couple", checked: true },
      { label: "Family", checked: true },
      { label: "Students", checked: true },
      { label: "Professionals", checked: true },
      { label: "Self-Employed", checked: true },
      { label: "Retired", checked: false },
      { label: "Sharers", checked: false },
      { label: "Corporate Tenant", checked: false },
    ],
  },
  // Add more properties as needed
];

// Helper function to get property by ID
export const getPropertyData = (id) => {
  return (
    propertyDetailsArray.find((property) => property.id === id) ||
    propertyDetailsArray[0]
  );
};

// Helper function to get amenity icon (same as ReviewStep)
export const getAmenityIcon = (amenity) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes("parking")) return BlueCarIcon;
  if (amenityLower.includes("wifi") || amenityLower.includes("wi-fi"))
    return BlueWIFIIcon;
  if (amenityLower.includes("garden")) return BlueGardenIcon;
  if (amenityLower.includes("heating")) return BlueHeatingIcon;
  return null; // Will use dummy icon in component
};

// Helper function to get utility icon (same as ReviewStep)
export const getUtilityIcon = (utility) => {
  const utilityLower = utility.toLowerCase();
  if (utilityLower === "electricity") return OrangeElectrityIcon;
  if (utilityLower === "gas") return OrangeGasIcon;
  return null; // Will use dummy icon in component
};

// Helper function to get preferred renter type icon
export const getPreferredRenterIcon = (label) => {
  const labelLower = label.toLowerCase();
  if (labelLower.includes("single male")) return RedMaleIcon;
  if (labelLower.includes("single female")) return SingleFemaleIcon;
  if (labelLower.includes("couple")) return CoupleIcon;
  if (labelLower.includes("family")) return FamilyIcon;
  if (labelLower.includes("student")) return StudentIcon;
  if (labelLower.includes("professional")) return ProfessionalIcon;
  if (labelLower.includes("self-employed")) return SelfEmployedIcon;
  if (labelLower.includes("retired")) return RetiredIcon;
  if (labelLower.includes("sharer")) return SharersIcon;
  if (labelLower.includes("corporate")) return CarporateTenantIcon;
  return null;
};

export const listingStatusTabs = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export const dateOptions = [
  { value: "Date", label: "Date" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

export const propertyTypeOptions = [
  { value: "", label: "All Types" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
];

export const bedroomOptions = [
  { value: "", label: "All" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4+", label: "4+" },
];

export const bathroomOptions = [
  { value: "", label: "All" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4+", label: "4+" },
];

export const priceRangeOptions = [
  { value: "", label: "All" },
  { value: "0-500", label: "€0 - €500" },
  { value: "500-1000", label: "€500 - €1000" },
  { value: "1000-1500", label: "€1000 - €1500" },
  { value: "1500+", label: "€1500+" },
];

export const areaOptions = [
  { value: "", label: "All" },
  { value: "manchester", label: "Manchester" },
  { value: "london", label: "London" },
  { value: "birmingham", label: "Birmingham" },
];

export const statusFilterOptions = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "draft", label: "Draft" },
];

// ============================================
// RENTAL HISTORY DATA
// ============================================

export const reviewsData = [
  {
    id: 1,
    address: "34 King Street, Manchester M2 8AZ",
    tenancyDates: "Sep 2020 - Dec 2021",
    location: "Manchester",
    monthlyRent: "£1,450",
    phone: "+44 7445 987954",
    reasonForLeaving: "Seeking larger space",
    landlordRecommendation: {
      name: "Jane Casper",
      verified: true,
      text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in good condition. I would gladly rent to them again. I've never had any issues with David and I hope they continue to rent from me in the future.",
    },
  },
  {
    id: 2,
    address: "34 King Street, Manchester M2 8AZ",
    tenancyDates: "Sep 2020 - Dec 2021",
    location: "Manchester",
    monthlyRent: "£1,450",
    phone: "+44 7445 987954",
    reasonForLeaving: "Seeking larger space",
    landlordRecommendation: {
      name: "Jane Casper",
      verified: true,
      text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in good condition. I would gladly rent to them again. I've never had any issues with David and I hope they continue to rent from me in the future.",
    },
  },
  {
    id: 3,
    address: "34 King Street, Manchester M2 8AZ",
    tenancyDates: "Sep 2020 - Dec 2021",
    location: "Manchester",
    monthlyRent: "£1,450",
    phone: "+44 7445 987954",
    reasonForLeaving: "Seeking larger space",
    landlordRecommendation: {
      name: "Jane Casper",
      verified: true,
      text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in good condition. I would gladly rent to them again. I've never had any issues with David and I hope they continue to rent from me in the future.",
    },
  },
  {
    id: 4,
    address: "34 King Street, Manchester M2 8AZ",
    tenancyDates: "Sep 2020 - Dec 2021",
    location: "Manchester",
    monthlyRent: "£1,450",
    phone: "+44 7445 987954",
    reasonForLeaving: "Seeking larger space",
    landlordRecommendation: {
      name: "Jane Casper",
      verified: true,
      text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in good condition. I would gladly rent to them again. I've never had any issues with David and I hope they continue to rent from me in the future.",
    },
  },
  {
    id: 5,
    address: "34 King Street, Manchester M2 8AZ",
    tenancyDates: "Sep 2020 - Dec 2021",
    location: "Manchester",
    monthlyRent: "£1,450",
    phone: "+44 7445 987954",
    reasonForLeaving: "Seeking larger space",
    landlordRecommendation: {
      name: "Jane Casper",
      verified: true,
      text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in good condition. I would gladly rent to them again. I've never had any issues with David and I hope they continue to rent from me in the future.",
    },
  },
];

// ============================================
// MY PROPERTIES DATA
// ============================================

export const properties = [
  {
    id: "0033",
    image: HotelIcon,
    description: "2-Bed Apartment in Cit...",
    location: "4517 Washington Ave...",
    type: "Apartment",
    rent: "€800",
    leads: 22,
    status: "Pending",
    views: 67,
  },
  {
    id: "0034",
    image: HotelIcon,
    description: "3-Bed House in Liverp...",
    location: "123 Main Street, Man...",
    type: "House",
    rent: "€1,200",
    leads: 15,
    status: "Active",
    views: 55,
  },
  {
    id: "0035",
    image: HotelIcon,
    description: "1-Bed Studio in Birm...",
    location: "789 Park Lane, Birm...",
    type: "Studio",
    rent: "€600",
    leads: 8,
    status: "Active",
    views: 53,
  },
  {
    id: "0036",
    image: HotelIcon,
    description: "4-Bed House in Leed...",
    location: "456 Oak Avenue, Lee...",
    type: "House",
    rent: "€1,500",
    leads: 30,
    status: "Pending",
    views: 89,
  },
  {
    id: "0037",
    image: HotelIcon,
    description: "2-Bed Apartment in Man...",
    location: "321 Elm Street, Man...",
    type: "Apartment",
    rent: "€950",
    leads: 18,
    status: "Active",
    views: 72,
  },
  {
    id: "0038",
    image: HotelIcon,
    description: "3-Bed House in Anfield...",
    location: "654 King Street, An...",
    type: "House",
    rent: "€1,100",
    leads: 12,
    status: "Active",
    views: 48,
  },
  {
    id: "0039",
    image: HotelIcon,
    description: "2-Bed Apartment in Man...",
    location: "987 Canal Street, M...",
    type: "Apartment",
    rent: "€850",
    leads: 25,
    status: "Pending",
    views: 91,
  },
  {
    id: "0040",
    image: HotelIcon,
    description: "1-Bed Studio in Birm...",
    location: "147 New Street, Bir...",
    type: "Studio",
    rent: "€550",
    leads: 5,
    status: "Active",
    views: 35,
  },
  {
    id: "0041",
    image: HotelIcon,
    description: "4-Bed House in Leed...",
    location: "258 Victoria Road...",
    type: "House",
    rent: "€1,600",
    leads: 35,
    status: "Active",
    views: 105,
  },
  {
    id: "0042",
    image: HotelIcon,
    description: "3-Bed House in Man...",
    location: "369 Deansgate, Man...",
    type: "House",
    rent: "€1,300",
    leads: 20,
    status: "Pending",
    views: 78,
  },
  {
    id: "0043",
    image: HotelIcon,
    description: "2-Bed Apartment in Liv...",
    location: "741 Bold Street, Li...",
    type: "Apartment",
    rent: "€900",
    leads: 14,
    status: "Active",
    views: 62,
  },
  {
    id: "0044",
    image: HotelIcon,
    description: "1-Bed Studio in Man...",
    location: "852 Piccadilly, Man...",
    type: "Studio",
    rent: "€650",
    leads: 9,
    status: "Active",
    views: 41,
  },
];

export const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
];

export const typeOptions = [
  { value: "all", label: "All" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
];

export const sortOptions = [
  { value: "recent", label: "Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "rent-high", label: "Rent: High to Low" },
  { value: "rent-low", label: "Rent: Low to High" },
  { value: "leads-high", label: "Leads: High to Low" },
  { value: "views-high", label: "Views: High to Low" },
];

// ============================================
// SEND OFFER MODAL DATA
// ============================================

export const propertyDropdownOptions = [
  { value: "property1", label: "2-Bed Apartment Manchester" },
  { value: "property2", label: "3-Bed House London" },
  { value: "property3", label: "1-Bed Studio Birmingham" },
];

// ============================================
// ADD PROPERTY DATA
// ============================================

export const addPropertySteps = [
  { number: 1, label: "Basic Details", icon: FiHome },
  { number: 2, label: "Location", icon: FiMapPin },
  { number: 3, label: "Rent Details", icon: MdOutlineEuro },
  { number: 4, label: "Amenities & Utilities", icon: FiWifi },
  { number: 5, label: "Upload Images", icon: FiUpload },
  { number: 6, label: "Renter Description", icon: FiUserCheck },
  { number: 7, label: "Review", icon: FiCheck },
];

export const addPropertyTypeOptions = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
  { value: "flat", label: "Flat" },
  { value: "bungalow", label: "Bungalow" },
  { value: "other", label: "Other" },
];

export const addPropertyCityOptions = [
  { value: "manchester", label: "Manchester" },
  { value: "london", label: "London" },
  { value: "birmingham", label: "Birmingham" },
  { value: "liverpool", label: "Liverpool" },
];

export const countyOptions = [
  { value: "greater-manchester", label: "Greater Manchester" },
  { value: "london", label: "London" },
  { value: "west-midlands", label: "West Midlands" },
  { value: "merseyside", label: "Merseyside" },
];

export const chargeTypeOptions = [
  { value: "deposit", label: "Deposit" },
  { value: "service-charge", label: "Service Charge" },
  { value: "council-tax", label: "Council Tax" },
  { value: "utilities", label: "Utilities" },
];

export const preferredRenterTypeOptions = [
  { value: "single-male", label: "Single Male" },
  { value: "single-female", label: "Single Female" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "students", label: "Students" },
  { value: "professionals", label: "Professionals" },
  { value: "self-employed", label: "Self-Employed" },
  { value: "sharers", label: "Sharers" },
  { value: "corporate", label: "Corporate Tenant" },
];

export const amenitiesList = [
  "Wardrobes",
  "Bed(s)",
  "Wooden flooring",
  "Carpet flooring",
  "Fireplace",
  "Underfloor heating",
  "Heating controls",
  "Dishwasher",
  "Washing machine",
  "Dryer / Washer-dryer",
  "Microwave",
  "Hob & oven",
  "Fridge-freezer",
  "Pantry / separate storage",
  "Residents' parking",
  "Sprinkler system",
  "Bicycle storage",
  "Smoke alarms",
  "CCTV in communal areas",
  "Recycling bins area",
  "Lift",
  "Gas Safety Certificate",
  "Electrical Safety Certificate",
  "EV charging point",
  "TV point",
  "Garage",
];

export const utilitiesList = [
  { value: "electricity", label: "Electricity" },
  { value: "gas", label: "Gas" },
  { value: "water", label: "Water" },
  { value: "internet", label: "Internet" },
];

// ============================================
// SIDEBAR DATA
// ============================================

export const sidebarMenuItems = [
  {
    icon: DashboardIcon,
    label: "Dashboard",
    path: "/dashboard",
    badge: null,
  },
  {
    icon: PropertiesIcon,
    label: "My Properties",
    path: "/dashboard/properties",
    badge: null,
  },
  {
    icon: MessagesIcon,
    label: "Messages",
    path: "/dashboard/messages",
    badge: 3,
  },
  {
    icon: PaymentsIcon,
    label: "Payments & Plans",
    path: "/dashboard/payments",
    badge: null,
  },
  {
    icon: VerificationIcon,
    label: "Verification Center",
    path: "/dashboard/verification",
    badge: null,
  },
  {
    icon: SettingsIcon,
    label: "Profile Settings",
    path: "/dashboard/profile",
    badge: null,
  },
  {
    icon: SupportIcon,
    label: "Support",
    path: "/dashboard/support",
    badge: null,
  },
];

// ============================================
// PLANS & BILLING DATA
// ============================================

export const plansData = [
  {
    id: "basic",
    name: "Basic Plan",
    badge: "NEW",
    description: "Perfect for occasional listings.",
    price: "€15",
    period: "/ per month",
    features: [
      "1 active listing",
      "30-day visibility",
      "Verified renter messages",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id: "standard",
    name: "Standard Plan",
    description: "Great for individual landlords.",
    price: "€49",
    period: "/ per month",
    features: [
      "10 active listings",
      "Featured listing (1)",
      "Verified renter messages",
      "Advanced analytics",
      "Priority email support",
      "No per-listing fees",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    badge: "POPULAR",
    description: "Best for active landlords.",
    price: "€99",
    period: "/ per month",
    features: [
      "25 active listings",
      "Featured listings (5)",
      "Verified renter messages",
      "Advanced analytics",
      "Priority phone support",
      "Promoted in search",
      "No per-listing fees",
    ],
  },
  {
    id: "agency",
    name: "Agency Plan",
    description: "Great for individual landlords.",
    price: "€249",
    period: "/ per month",
    features: [
      "Unlimited active listings",
      "Unlimited featured listings",
      "Verified renter messages",
      "White-label analytics",
      "Dedicated account manager",
      "API access",
      "Custom branding",
      "No per-listing fees",
    ],
  },
];

export const currentPlanData = {
  id: "premium",
  name: "Premium Plan",
  description: "25 active listings with advanced features.",
  renewalDate: "15th December 2025",
  propertiesRemaining: 18,
  totalProperties: 25,
};

export const billingHistoryData = [
  {
    date: "15 Dec 2025",
    description: "Premium Plan - Monthly",
    amount: "€99",
    status: "Success",
  },
  {
    date: "15 Jan 2026",
    description: "Premium Plan - Monthly",
    amount: "€99",
    status: "Failed",
  },
  {
    date: "15 Feb 2026",
    description: "Premium Plan - Monthly",
    amount: "€99",
    status: "Success",
  },
  {
    date: "15 Mar 2026",
    description: "Premium Plan - Monthly",
    amount: "€99",
    status: "Failed",
  },
  {
    date: "15 Apr 2026",
    description: "Premium Plan - Monthly",
    amount: "€99",
    status: "Success",
  },
  {
    date: "15 May 2026",
    description: "Premium Plan - Monthly",
    amount: "€99",
    status: "Success",
  },
  {
    date: "15 Jun 2026",
    description: "Premium Plan - Monthly",
    amount: "€99",
    status: "Success",
  },
];

export const paymentMethodData = {
  cardNumber: "**** **** **** 4242",
  expiryDate: "12/2026",
};

// ============================================
// VERIFICATION CENTER DATA
// ============================================

export const verificationProgressStep = 2; // 1: Documents Uploaded, 2: Under Review, 3: Verified

export const rejectedDocumentData = {
  id: 1,
  name: "Bank Account Verification - bank-statement.pdf",
  reason:
    "Your bank statement was not clear enough. Please upload a recent bank statement (within the last 3 months) showing your full name and account details clearly visible. Ensure the document is not blurred or cropped.",
};

export const verifiedDocumentsData = [
  {
    id: 1,
    name: "passport-scan.pdf",
    size: "2.4 MB",
    uploadedDate: "15 Nov 2025",
  },
  {
    id: 2,
    name: "proof-of-address.pdf",
    size: "1.8 MB",
    uploadedDate: "15 Nov 2025",
  },
];

export const underReviewDocumentsData = [
  {
    id: 1,
    name: "passport-scan.pdf",
    size: "2.4 MB",
    uploadedDate: "15 Nov 2025",
  },
  {
    id: 2,
    name: "proof-of-address.pdf",
    size: "1.8 MB",
    uploadedDate: "15 Nov 2025",
  },
];

export const documentTypeOptions = [
  { value: "passport", label: "Passport" },
  { value: "driving-license", label: "Driving License" },
  { value: "national-id", label: "National ID" },
  { value: "bank-statement", label: "Bank Statement" },
  { value: "proof-of-address", label: "Proof of Address" },
  { value: "utility-bill", label: "Utility Bill" },
  { value: "tax-document", label: "Tax Document" },
  { value: "other", label: "Other" },
];

export const pendingDocumentRequirements = [
  "Bank statement issued within last 3 months",
  "Full name clearly visible",
  "Account number and sort code visible",
  "Clear, unblurred image or PDF",
];

// ============================================
// PROFILE SETTINGS DATA
// ============================================

export const profileSettingsData = {
  fullName: "John Smith",
  email: "john.smith@example.com",
  isEmailVerified: true,
  phoneNumber: "+44 7700 900000",
  isPhoneVerified: false,
  businessName: "Smith Property Management",
  address: "",
  city: "",
  country: "",
  postcode: "",
  profileImage: null,
};
