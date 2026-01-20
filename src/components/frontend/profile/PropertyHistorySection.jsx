'use client';

import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { getMyRentalHistory } from "@/api/rentalHistory";
import PropertyHistoryCard from "./PropertyHistoryCard";
import homelistOne from '@/assests/websiteImg/homelistOne.png';
import homelistTwo from '@/assests/websiteImg/homelistTwo.png';
import homelistThree from '@/assests/websiteImg/homelistThree.png';
import homelistFour from '@/assests/websiteImg/homelistFour.png';
import homelistFive from '@/assests/websiteImg/homelistFive.png';
import homelistSix from '@/assests/websiteImg/homelistSix.png';
// Static images array to keep existing UI look
const PROPERTY_IMAGES = [
  homelistOne,
  homelistTwo,
  homelistThree,
  homelistFour,
  homelistFive,
  homelistSix,
];

// Format date to "Mon YYYY" (e.g., "Nov 2025")
const formatMonthYear = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// Map rental history entry from API to PropertyHistoryCard data shape
const mapRentalHistoryToCard = (entry, index) => {
  const property = entry?.propertyId || entry?.property || {};
  const addressObj = property.addressId || property.address || {};

  const addressParts = [
    addressObj.street || addressObj.address,
    addressObj.city,
    addressObj.county,
    addressObj.postcode,
    addressObj.country,
  ].filter(Boolean);

  const from = formatMonthYear(entry.rentedFrom);
  const to = entry.cancelledAt ? formatMonthYear(entry.cancelledAt) : "Now";
  const dateRange = from ? `${from} - ${to}` : "";

  const currencySymbol =
    property.currency === "USD"
      ? "$"
      : property.currency === "EUR"
      ? "€"
      : "£";

  // Prefer real property media if available
  let image = null;
  
  // First, try primaryImageId (populated from backend)
  if (property.primaryImageId) {
    if (typeof property.primaryImageId === "string") {
      // If it's just an ID string, we can't use it directly
      // But if backend populated it, it should be an object
      image = null;
    } else if (property.primaryImageId && property.primaryImageId.url) {
      // Backend populated it as an object with url
      image = property.primaryImageId.url;
    }
  }
  
  // If no primary image, try media array (populated from backend)
  if (!image && property.media && Array.isArray(property.media) && property.media.length > 0) {
    // Find first image in media array
    const firstImage = property.media.find(
      (m) => m && (m.mediaType === "image" || !m.mediaType) && m.url
    );
    if (firstImage && firstImage.url) {
      image = firstImage.url;
    }
  }
  
  // Fallback to static placeholder images to keep UI design
  if (!image) {
    image = PROPERTY_IMAGES[index % PROPERTY_IMAGES.length] || homelistOne;
  }

  return {
    id: String(property._id || property.id || entry.propertyId || entry._id),
    image,
    title: property.title || "Property",
    price: property.rent != null ? `${currencySymbol}${property.rent}` : "",
    address: addressParts.join(", "),
    beds: property.bedrooms ?? 0,
    baths: property.bathrooms ?? 0,
    type: property.propertyType || "Apartment",
    dateRange,
  };
};

function PropertyHistorySection() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasShownErrorRef = useRef(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!user?.id) {
          setHistory([]);
          setLoading(false);
          return;
        }

        setLoading(true);

        // Fetch rental history for logged-in renter
        const response = await getMyRentalHistory({ page: 1, limit: 50 });
        const allEntries = response?.data || response?.items || [];

        const mapped =
          allEntries.length > 0
            ? allEntries.map((entry, index) =>
                mapRentalHistoryToCard(entry, index)
              )
            : [];

        setHistory(mapped);
      } catch (error) {
        console.error("Error loading rental history:", error);
        // Avoid spamming toasts (React StrictMode double renders in dev)
        if (!hasShownErrorRef.current) {
          const status = error?.response?.status;
          const message =
            error?.response?.data?.error ||
            error?.message ||
            "Failed to load property history";

          // Only show toast for real failures (not forbidden owner-only route)
          if (status !== 403 || !String(message).includes("Owner access required")) {
            toast.error(message);
          }
          hasShownErrorRef.current = true;
        }
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[20px] md:border md:border-lightGray md:p-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-base font-nunito">
              Loading your property history...
            </p>
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {history.map((property) => (
              <PropertyHistoryCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary text-base font-nunito">
              You do not have any recent property activity yet. When you contact
              owners or save properties, they will appear here for quick access.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyHistorySection;
