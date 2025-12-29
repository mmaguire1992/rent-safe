'use client'

import { useParams, useNavigate } from '@/lib/react-router-compat';
import { useState, useEffect } from "react";
import PropertiesHeader from "@/components/frontend/common/PropertiesHeader";
import Footer from "@/components/frontend/common/footer";
import HeartIcon from "@/svg/websiteSvg/heartIcon";
import ShareIcon from "@/svg/websiteSvg/shareIcon";
import PropertyGallery from "@/components/frontend/PropertyListDetail/PropertyGallery";
import OwnerProfile from "@/components/frontend/PropertyListDetail/OwnerProfile";
import PropertyDescription from "@/components/frontend/PropertyListDetail/PropertyDescription";
import PropertyDetailsGrid from "@/components/frontend/PropertyListDetail/PropertyDetailsGrid";
import LocationSection from "@/components/frontend/PropertyListDetail/LocationSection";
import RenterProfileDescription from "@/components/frontend/PropertyListDetail/RenterProfileDescription";
import ContactOwnerModal from "@/components/frontend/PropertyListDetail/ContactOwnerModal";
import { getPropertyById } from "@/api/properties";
import { MdArrowBackIosNew } from "react-icons/md";
import { toast } from "react-toastify";

function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch property data from API
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('Property ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const propertyData = await getPropertyById(id);
        setProperty(propertyData);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Calculate favorite count
  const favoriteCount = favoritedIds.size;

  // Toggle favorite for current property
  const toggleFavorite = () => {
    const propertyId = property?._id || property?.id;
    if (propertyId) {
      setFavoritedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(propertyId)) {
          newSet.delete(propertyId);
          setIsFavorited(false);
        } else {
          newSet.add(propertyId);
          setIsFavorited(true);
        }
        return newSet;
      });
    }
  };

  // Check if current property is favorited on mount
  useEffect(() => {
    const propertyId = property?._id || property?.id;
    if (propertyId && favoritedIds.has(propertyId)) {
      setIsFavorited(true);
    } else {
      setIsFavorited(false);
    }
  }, [property?._id, property?.id, favoritedIds]);

  // Handle share button click - copy link to clipboard
  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Link copied to clipboard!');
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        toast.error('Failed to copy link. Please copy manually.');
      }
    }
  };

  // Transform API property data to component format
  const transformPropertyData = (apiProperty) => {
    if (!apiProperty) return null;

    // Extract image URL from primaryImageId
    let imageUrl = null;
    if (apiProperty.primaryImageId) {
      if (typeof apiProperty.primaryImageId === 'string') {
        imageUrl = apiProperty.primaryImageId;
      } else if (apiProperty.primaryImageId.url) {
        imageUrl = apiProperty.primaryImageId.url;
      }
    }
    // Fallback to media array
    if (!imageUrl && apiProperty.media && apiProperty.media.length > 0) {
      const firstImage = apiProperty.media.find(m => m.mediaType === 'image');
      if (firstImage) {
        imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url;
      }
    }
    // Fallback placeholder
    if (!imageUrl) {
      imageUrl = 'https://via.placeholder.com/800x600?text=No+Image';
    }

    // Build gallery images array
    const galleryImages = [];
    if (apiProperty.primaryImageId?.url) {
      galleryImages.push(apiProperty.primaryImageId.url);
    }
    if (apiProperty.media && Array.isArray(apiProperty.media)) {
      apiProperty.media
        .filter(m => m.mediaType === 'image' && m.url)
        .forEach(m => {
          if (!galleryImages.includes(m.url)) {
            galleryImages.push(m.url);
          }
        });
    }
    // If no images, use placeholder
    if (galleryImages.length === 0) {
      galleryImages.push(imageUrl);
    }

    // Build address string
    const addressParts = [];
    if (apiProperty.address) {
      if (apiProperty.address.address) addressParts.push(apiProperty.address.address);
      if (apiProperty.address.city) addressParts.push(apiProperty.address.city);
      if (apiProperty.address.county) addressParts.push(apiProperty.address.county);
      if (apiProperty.address.postcode) addressParts.push(apiProperty.address.postcode);
    }
    const address = addressParts.length > 0 ? addressParts.join(', ') : 'Address not available';

    // Format price with currency
    const currency = apiProperty.currency || 'GBP';
    const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '';
    const price = apiProperty.rent ? `${currencySymbol}${apiProperty.rent.toLocaleString()}` : 'N/A';

    // Format property type
    const type = apiProperty.propertyType 
      ? apiProperty.propertyType.charAt(0).toUpperCase() + apiProperty.propertyType.slice(1)
      : 'N/A';

    return {
      id: apiProperty._id || apiProperty.id,
      title: apiProperty.title || 'Untitled Property',
      image: imageUrl,
      price: price,
      address: address,
      beds: apiProperty.bedrooms || 0,
      baths: apiProperty.bathrooms || 0,
      type: type,
      description: apiProperty.description || '',
      galleryImages: galleryImages,
      isRecent: true, // All properties from API are recent
      // Full API data for components that need it
      apiData: apiProperty,
    };
  };

  const transformedProperty = transformPropertyData(property);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <PropertiesHeader favoriteCount={0} />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#6B4EFF] border-t-transparent"></div>
          <p className="mt-4 text-text-secondary text-lg">Loading property...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !property || !transformedProperty) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <PropertiesHeader favoriteCount={0} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-text-secondary text-lg">{error || 'Property not found'}</p>
          <button
            onClick={() => navigate("/properties")}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Back to Properties
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <PropertiesHeader
        favoriteCount={favoriteCount}
        onHeartClick={() => setShowSavedOnly(!showSavedOnly)}
        isSavedView={showSavedOnly}
      />

      {/* Navigation Bar */}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-0 sm:py-6 lg:py-8">
        <div className="px-0 py-4 flex flex-row items-start sm:items-center justify-between gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer max-w-full"
            onClick={() => navigate(-1)}
          >
            <button className="transition-colors flex items-center gap-2 md:block">
              <MdArrowBackIosNew className="text-[#2B2F38] text-base font-normal font-nunito" />
              <span className="block md:hidden text-darkGray text-base font-normal">
                Back
              </span>
            </button>
            <h1 className="hidden md:block text-sm sm:text-base font-normal font-nunito text-[#2B2F38] truncate">
              {transformedProperty.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <button
              onClick={toggleFavorite}
              className="flex items-center gap-2 text-[#2B2F38] text-sm sm:text-base font-normal font-nunito transition-colors"
            >
              <HeartIcon isFilled={isFavorited} />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-[#2B2F38] text-sm sm:text-base font-normal font-nunito transition-colors hover:text-[#6B4EFF]"
            >
              <ShareIcon />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
        <div className="block">
          {/* Main Content */}
          <div className="w-full space-y-6">
            {/* Image Gallery */}
            <PropertyGallery
              images={transformedProperty.galleryImages}
              isRecent={transformedProperty.isRecent}
              property={transformedProperty}
            />
            {/* Owner Profile */}
            <OwnerProfile 
              onContactClick={() => setIsContactModalOpen(true)}
              owner={property.owner}
              ownerName={property.owner ? `${property.owner.firstName || ''} ${property.owner.lastName || ''}`.trim() : undefined}
              propertiesCount={property.owner?.propertiesCount}
            />

            {/* Description */}
            <PropertyDescription description={transformedProperty.description || property.description} />

            <PropertyDetailsGrid propertyData={{
              ...property,
              monthlyRent: property.rent,
              furnishedStatus: property.furnished,
              amenities: property.amenities || [],
              utilities: property.utilitiesIncluded ? Object.keys(property.utilitiesIncluded).filter(key => property.utilitiesIncluded[key]) : [],
            }} />

            <LocationSection 
              address={property.address} 
              coordinates={property.address?.coordinates?.coordinates || property.address?.coordinates}
            />

            <RenterProfileDescription
              description={property.idealRenterProfile}
              preferredRenterTypes={property.preferredRenterType}
              requirements={property.additionalRequirements}
            />
          </div>
        </div>
      </div>

      <Footer />

      {/* Contact Owner Modal */}
      <ContactOwnerModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onVerify={() => {
          console.log("Verify clicked");
          // Navigate to verification page or handle verification
          setIsContactModalOpen(false);
        }}
        onCancel={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}

export default PropertyDetailPage;
