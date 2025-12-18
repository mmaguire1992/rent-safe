import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PropertiesHeader from "@/components/frontend/common/PropertiesHeader";
import Footer from "@/components/frontend/common/footer";
import { propertyListings } from "@/websitedata/propertyListings";
import HeartIcon from "@/svg/websiteSvg/heartIcon";
import ShareIcon from "@/svg/websiteSvg/shareIcon";
import PropertyGallery from "@/components/frontend/PropertyListDetail/PropertyGallery";
import OwnerProfile from "@/components/frontend/PropertyListDetail/OwnerProfile";
import PropertyDescription from "@/components/frontend/PropertyListDetail/PropertyDescription";
import PropertyDetailsGrid from "@/components/frontend/PropertyListDetail/PropertyDetailsGrid";
import LocationSection from "@/components/frontend/PropertyListDetail/LocationSection";
import RenterProfileDescription from "@/components/frontend/PropertyListDetail/RenterProfileDescription";
import ContactOwnerModal from "@/components/frontend/PropertyListDetail/ContactOwnerModal";
import { getPropertyData } from "@/constant";
import { MdArrowBackIosNew } from "react-icons/md";
function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Find property by ID
  const property = propertyListings.find((p) => p.id === parseInt(id));

  // Calculate favorite count
  const favoriteCount = favoritedIds.size;

  // Toggle favorite for current property
  const toggleFavorite = () => {
    const propertyId = property?.id;
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
    if (property?.id && favoritedIds.has(property.id)) {
      setIsFavorited(true);
    } else {
      setIsFavorited(false);
    }
  }, [property?.id, favoritedIds]);

  if (!property) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <PropertiesHeader favoriteCount={0} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-text-secondary text-lg">Property not found</p>
          <button
            onClick={() => navigate("/properties")}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
          >
            Back to Properties
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Get full property data from constant
  const propertyData = getPropertyData(id);

  // Create gallery images array from propertyData (mainImage + thumbnails)
  const galleryImages =
    propertyData?.mainImage && propertyData?.thumbnails
      ? [propertyData.mainImage, ...propertyData.thumbnails]
      : property?.galleryImages || [
          property.image,
          property.image,
          property.image,
          property.image,
          property.image,
        ];

  // Fallback if propertyData doesn't exist
  if (!propertyData) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <PropertiesHeader favoriteCount={0} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-text-secondary text-lg">Property not found</p>
          <button
            onClick={() => navigate("/properties")}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
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
              {propertyData.title || property.title}
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
            <button className="flex items-center gap-2 text-[#2B2F38] text-sm sm:text-base font-normal font-nunito transition-colors">
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
              images={galleryImages}
              isRecent={property.isRecent}
              property={{
                ...property,
                title: propertyData.title || property.title,
                address: propertyData.address || property.address,
                beds: propertyData.bedrooms || property.beds,
                baths: propertyData.bathrooms || property.baths,
                type: propertyData.propertyType || property.type,
                price: propertyData.monthlyRent || property.price,
              }}
            />
            {/* Owner Profile */}
            <OwnerProfile onContactClick={() => setIsContactModalOpen(true)} />

            {/* Description */}
            <PropertyDescription description={propertyData.description} />

            <PropertyDetailsGrid propertyData={propertyData} />

            <LocationSection address={propertyData.address} />

            <RenterProfileDescription
              description={propertyData.renterProfileDescription}
              preferredRenterTypes={propertyData.preferredRenterTypes}
              requirements={propertyData.additionalRequirements}
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
