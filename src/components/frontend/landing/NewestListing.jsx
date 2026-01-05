'use client'

import { useState, useEffect } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import BlueTrustedIcon from "../../../svg/websiteSvg/blueTrustedIcon";
import Badge from "./Badge";
import Button from "./Button";
import PropertyCard from "./PropertyCard";
import ShielIcon from "@/svg/websiteSvg/shielIcon";
import { getRecentActiveProperties } from "@/api/properties";
import { addToWishlist, removeFromWishlist, getWishlistPropertyIds } from "@/api/wishlists";
import { useAuth } from "@/context/AuthContext";
import { isAuthenticated } from "@/utils/auth";
import { PROPERTY_PLACEHOLDER_IMAGE } from "@/constant";

function NewestListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritedIds, setFavoritedIds] = useState(new Set());

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecentActiveProperties(6);
        setProperties(data);
      } catch (err) {
        console.error('Error fetching recent properties:', err);
        setError(err.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Load wishlist on mount
  useEffect(() => {
    const loadWishlist = async () => {
      if (!isAuthenticated()) {
        return;
      }

      try {
        const propertyIds = await getWishlistPropertyIds();
        setFavoritedIds(new Set(propertyIds));
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    };

    loadWishlist();
  }, []);

  // Toggle favorite
  const toggleFavorite = async (propertyId) => {
    if (!isAuthenticated()) {
      // If not authenticated, just update local state
      setFavoritedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(propertyId)) {
          newSet.delete(propertyId);
        } else {
          newSet.add(propertyId);
        }
        return newSet;
      });
      return;
    }

    // Update local state immediately for better UX
    const wasFavorited = favoritedIds.has(propertyId);
    setFavoritedIds((prev) => {
      const newSet = new Set(prev);
      if (wasFavorited) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });

    // Call API
    try {
      if (wasFavorited) {
        await removeFromWishlist(propertyId);
      } else {
        await addToWishlist(propertyId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setFavoritedIds((prev) => {
        const newSet = new Set(prev);
        if (wasFavorited) {
          newSet.add(propertyId);
        } else {
          newSet.delete(propertyId);
        }
        return newSet;
      });
    }
  };

  // Transform API data to match PropertyCard component structure
  const transformedProperties = properties.map((property) => {
    // Extract image URL from primaryImageId
    let imageUrl = null;
    if (property.primaryImageId) {
      if (typeof property.primaryImageId === 'string') {
        imageUrl = property.primaryImageId;
      } else if (property.primaryImageId.url) {
        imageUrl = property.primaryImageId.url;
      }
    }
    // Fallback to images array if primaryImageId is not available
    if (!imageUrl && property.media && property.media.length > 0) {
      const firstImage = property.media.find(m => m.mediaType === 'image');
      if (firstImage) {
        imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url;
      }
    }
    // Fallback placeholder
    if (!imageUrl) {
      imageUrl = PROPERTY_PLACEHOLDER_IMAGE;
    }

    // Build address string
    const addressParts = [];
    if (property.address) {
      if (property.address.address) addressParts.push(property.address.address);
      if (property.address.city) addressParts.push(property.address.city);
      if (property.address.county) addressParts.push(property.address.county);
      if (property.address.postcode) addressParts.push(property.address.postcode);
    }
    const address = addressParts.length > 0 ? addressParts.join(', ') : 'Address not available';

    // Format price with currency
    const currency = property.currency || 'GBP';
    const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '';
    const price = property.rent ? `${currencySymbol}${property.rent.toLocaleString()}` : 'N/A';

    // Format property type
    const type = property.propertyType 
      ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
      : 'N/A';

    return {
      id: property._id || property.id,
      image: imageUrl,
      title: property.title || 'Untitled Property',
      price: price,
      address: address,
      beds: property.bedrooms || 0,
      baths: property.bathrooms || 0,
      type: type,
      isRecent: true, // All properties from this endpoint are recent
    };
  });

  return (
    <section
      id="newest-listing"
      className="w-full py-10 md:py-14 lg:py-16 bg-bg-primary scroll-mt-[88px]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4">
            <span className="border-[#6B4EFF33] border bg-badgeGradient rounded-2xl px-4 py-2 text-sm text-[#4A2FCC] font-semibold uppercase inline-flex items-center gap-2">
              <BlueTrustedIcon />
              VERIFIED LISTING
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-text-primary mb-4">
            Newest Listing
          </h2>

          <p className="text-base md:text-lg text-[#5A5E67] font-normal font-nunito max-w-2xl mx-auto">
            Every property is verified. Every landlord is checked. No scams, no
            fake listings.
          </p>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-12">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-[20px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] border border-lightGray p-4 animate-pulse"
              >
                <div className="w-full h-[200px] sm:h-[240px] bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 mb-10 md:mb-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blueGradient text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : transformedProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-12">
            {transformedProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property}
                isFavorited={favoritedIds.has(property.id)}
                onToggleFavorite={() => toggleFavorite(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 mb-10 md:mb-12">
            <p className="text-[#5A5E67] text-lg">No properties available at the moment.</p>
          </div>
        )}

        {/* Browse Listings Button */}
        <div className="flex justify-center w-full md:w-auto">
          <Button 
            variant="primary" 
            onClick={() => navigate('/properties')}
          >
            Browse listings
          </Button>
        </div>
      </div>
    </section>
  );
}

export default NewestListing;
