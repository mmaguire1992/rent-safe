'use client'

import { useParams, useNavigate } from '@/lib/react-router-compat';
import { useState, useEffect, useRef } from "react";
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
import { getCurrentUser } from "@/api/users";
import { createOrGetChatroom } from "@/api/chat";
import { addToWishlist, removeFromWishlist, checkWishlist, getWishlistPropertyIds } from "@/api/wishlists";
import { useAuth } from "@/context/AuthContext";
import { getUserVerificationPayment } from "@/api/subscriptions";
import { isAuthenticated } from "@/utils/auth";
import { MdArrowBackIosNew } from "react-icons/md";
import { toast } from "react-toastify";
import { PROPERTY_PLACEHOLDER_IMAGE } from "@/constant";

function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  const [isWishlistSyncing, setIsWishlistSyncing] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remainingContacts, setRemainingContacts] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [isContacting, setIsContacting] = useState(false);
  const [hasPaidVerification, setHasPaidVerification] = useState(false);
  const [freshUserData, setFreshUserData] = useState(null);

  // Wishlist concurrency control (fix rapid-click race conditions)
  const mountedRef = useRef(true);
  const isFavoritedRef = useRef(false);
  const wishlistMutationRef = useRef({
    inFlight: false,
    desired: null, // boolean | null
    propertyId: null,
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const normalizeId = (value) => {
    if (value === undefined || value === null) return null;
    const str = String(value);
    if (!str || str === 'undefined' || str === 'null' || str === '[object Object]') return null;
    return str;
  };

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

  // Fetch current user's remaining contacts and payment status
  useEffect(() => {
    const fetchUserContacts = async () => {
      // Only fetch if user is authenticated (has token)
      if (!isAuthenticated()) {
        setLoadingUserData(false);
        return;
      }

      try {
        setLoadingUserData(true);
        const userData = await getCurrentUser();
        setFreshUserData(userData); // Store fresh user data for verification check
        if (userData && userData.remainingContacts !== undefined) {
          setRemainingContacts(userData.remainingContacts);
        }
        
        // Check if user has paid verification fee (for renters)
        if (user?.userType === 'renter') {
          try {
            const payment = await getUserVerificationPayment();
            if (payment && payment.status === 'succeeded') {
              setHasPaidVerification(true);
            } else {
              // Fallback: Check userInfo.verificationStatus
              const isVerified = userData.userInfo?.verificationStatus === 'verified';
              setHasPaidVerification(isVerified);
            }
          } catch (error) {
            // If 404, user hasn't paid - check verification status
            if (error.response?.status === 404) {
              const isVerified = userData.userInfo?.verificationStatus === 'verified';
              setHasPaidVerification(isVerified);
            } else {
              console.error('Error checking verification payment:', error);
              setHasPaidVerification(false);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user contacts:', err);
        // Don't show error to user, just use default
        setRemainingContacts(5);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserContacts();
  }, [user?.userType]);
  // Handle contact owner click
  const handleContactOwner = async () => {
    // Check if user is authenticated first - prevent API call if not logged in
    if (!isAuthenticated()) {
      toast.info('Please login to contact the owner');
      navigate('/login');
      return;
    }

    // Removed verification check for renters - renters can contact owners regardless of verification status

    if (!property?.owner?._id && !property?.ownerId) {
      toast.error('Owner information not available');
      return;
    }

    const ownerId = property.owner?._id || property.ownerId;

    // Check if user has remaining contacts
    if (remainingContacts !== null && remainingContacts <= 0) {
      setIsContactModalOpen(true);
      return;
    }

    try {
      setIsContacting(true);
      
      // Get property ID from property object or URL params
      const propertyId = property?._id || property?.id || id;
      
      // Create or get chatroom with owner and propertyId
      const chatroom = await createOrGetChatroom(ownerId, propertyId);
      
      if (chatroom && (chatroom._id || chatroom.id)) {
        // Ensure chatroomId is a string
        const chatroomId = String(chatroom._id || chatroom.id || '');
        
        if (!chatroomId || chatroomId === 'undefined' || chatroomId === 'null' || chatroomId === '[object Object]') {
          toast.error('Invalid chatroom ID. Please try again.');
          return;
        }
        
        // Refresh user data to get updated remaining contacts
        if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          if (userData && userData.remainingContacts !== undefined) {
            setRemainingContacts(userData.remainingContacts);
          }
        } catch (err) {
          console.error('Error refreshing user contacts:', err);
          }
        }
        
        // Redirect to chat page with chatroom ID
        navigate(`/chat?chatroomId=${chatroomId}`);
        toast.success('Chat initiated successfully!');
      } else {
        toast.error('Failed to create chatroom. Please try again.');
      }
    } catch (err) {
      console.error('Error contacting owner:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to contact owner';
      const statusCode = err.response?.status;
      
      // If unauthorized or not authenticated, redirect to login
      if (statusCode === 401 || statusCode === 403 || errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('not authenticated')) {
        toast.info('Please login to contact the owner');
        navigate('/login');
        return;
      }
      
      // If limit reached, show modal
      if (errorMessage.includes('limit') || errorMessage.includes('Contact limit')) {
        setIsContactModalOpen(true);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsContacting(false);
    }
  };

  // Load wishlist on mount + when user logs in/out
  useEffect(() => {
    const loadWishlist = async () => {
      setWishlistLoaded(false);

      if (!isAuthenticated()) {
        // Logged out: clear local wishlist state
        setFavoritedIds(new Set());
        setIsFavorited(false);
        isFavoritedRef.current = false;
        setWishlistLoaded(true);
        return;
      }

      try {
        const propertyIds = await getWishlistPropertyIds();
        const normalized = Array.isArray(propertyIds)
          ? propertyIds.map((pid) => normalizeId(pid)).filter(Boolean)
          : [];
        setFavoritedIds(new Set(normalized));
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setWishlistLoaded(true);
      }
    };

    loadWishlist();
  }, [userId]);

  // Keep `isFavorited` in sync with `favoritedIds` (single source of truth)
  useEffect(() => {
    const propertyId = normalizeId(property?._id || property?.id || id);
    if (!propertyId) return;
    const next = favoritedIds.has(propertyId);
    setIsFavorited(next);
    isFavoritedRef.current = next;
  }, [property?._id, property?.id, id, favoritedIds]);

  // Calculate favorite count
  const favoriteCount = favoritedIds.size;

  const applyOptimisticWishlist = (propertyId, desired) => {
    isFavoritedRef.current = desired;
    setIsFavorited(desired);
    setFavoritedIds((prev) => {
      const newSet = new Set(prev);
      if (desired) newSet.add(propertyId);
      else newSet.delete(propertyId);
      return newSet;
    });
  };

  const isIdempotentWishlistError = (err, desired) => {
    const status = err?.response?.status;
    const msg = String(err?.response?.data?.message || err?.message || '').toLowerCase();
    if (desired) {
      // "already in wishlist" style errors
      return status === 409 || msg.includes('already') || msg.includes('exists') || msg.includes('duplicate');
    }
    // "not in wishlist / not found" style errors
    return status === 404 || msg.includes('not found') || msg.includes('does not exist') || msg.includes('not in wishlist');
  };

  const flushWishlistMutationQueue = async (propertyId) => {
    if (wishlistMutationRef.current.inFlight) return;
    wishlistMutationRef.current.inFlight = true;
    setIsWishlistSyncing(true);

    let lastSuccessToast = null;
    try {
      // Process "latest desired" repeatedly; rapid clicks just update desired, we only execute sequentially.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const desired = wishlistMutationRef.current.desired;
        const queuedFor = wishlistMutationRef.current.propertyId;

        // Nothing queued
        if (desired === null || !queuedFor) break;

        // Clear queue slot before executing
        wishlistMutationRef.current.desired = null;
        wishlistMutationRef.current.propertyId = null;

        try {
          if (desired) {
            await addToWishlist(queuedFor);
            lastSuccessToast = 'Property added to favorites';
          } else {
            await removeFromWishlist(queuedFor);
            lastSuccessToast = 'Property removed from favorites';
          }
        } catch (err) {
          if (isIdempotentWishlistError(err, desired)) {
            lastSuccessToast = desired ? 'Property added to favorites' : 'Property removed from favorites';
            continue;
          }

          console.error('Error toggling favorite:', err);
          const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update favorites';

          // Best-effort resync for this property (avoid leaving UI in a wrong optimistic state)
          try {
            const serverIsInWishlist = await checkWishlist(queuedFor);
            if (mountedRef.current) {
              applyOptimisticWishlist(queuedFor, !!serverIsInWishlist);
            }
          } catch (_) {
            // ignore resync errors
          }

          toast.error(errorMessage);
          break;
        }
      }
    } finally {
      wishlistMutationRef.current.inFlight = false;
      if (mountedRef.current) setIsWishlistSyncing(false);
      if (lastSuccessToast) toast.success(lastSuccessToast);

      // If a click landed right as we were finishing (after the loop decided it was empty),
      // ensure we don't drop the final desired state.
      const hasMoreQueued =
        wishlistMutationRef.current.desired !== null && !!wishlistMutationRef.current.propertyId;
      if (hasMoreQueued) {
        flushWishlistMutationQueue(wishlistMutationRef.current.propertyId);
      }
    }
  };

  // Toggle favorite for current property
  const toggleFavorite = async () => {
    const propertyId = normalizeId(property?._id || property?.id || id);
    if (!propertyId) {
      return;
    }

    if (!isAuthenticated()) {
      // If not authenticated, just update local state
      const desired = !isFavoritedRef.current;
      applyOptimisticWishlist(propertyId, desired);
      return;
    }

    // Optimistic update (instant UI feedback) + queue latest desired state for network mutation
    const desired = !isFavoritedRef.current;
    applyOptimisticWishlist(propertyId, desired);

    wishlistMutationRef.current.desired = desired;
    wishlistMutationRef.current.propertyId = propertyId;
    flushWishlistMutationQueue(propertyId);
  };

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

  // Helper function to get ordinal suffix (st, nd, rd, th)
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Format date with ordinal suffix (e.g., "15th Nov 2025")
  const formatDateWithOrdinal = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const day = date.getDate();
      const month = date.toLocaleDateString('en-GB', { month: 'short' });
      const year = date.getFullYear();
      const ordinalSuffix = getOrdinalSuffix(day);
      return `${day}${ordinalSuffix} ${month} ${year}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'N/A';
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
      imageUrl = PROPERTY_PLACEHOLDER_IMAGE;
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
        onHeartClick={() => navigate('/properties?saved=true')}
        isSavedView={false}
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
            {isAuthenticated() && (
            <button
              onClick={toggleFavorite}
              aria-busy={isWishlistSyncing}
              title={wishlistLoaded ? (isWishlistSyncing ? 'Updating...' : 'Save') : 'Loading...'}
              className="flex items-center gap-2 text-[#2B2F38] text-sm sm:text-base font-normal font-nunito transition-colors"
            >
              <HeartIcon isFilled={isFavorited} />
              <span className="hidden sm:inline">Save</span>
            </button>
            )}
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
              onContactClick={handleContactOwner}
              owner={property.owner}
              ownerName={property.owner ? `${property.owner.firstName || ''} ${property.owner.lastName || ''}`.trim() : undefined}
              propertiesCount={property.owner?.propertiesCount}
              remainingContacts={hasPaidVerification || loading ? null : remainingContacts}
              loadingUserData={loadingUserData}
              isContacting={isContacting}
            />

            {/* Description */}
            <PropertyDescription description={transformedProperty.description || property.description} />

            <PropertyDetailsGrid propertyData={{
              ...property,
              monthlyRent: property.rent,
              furnishedStatus: property.furnished,
              availableFrom: formatDateWithOrdinal(property.availableFrom),
              amenities: property.amenities || [],
              utilities: property.utilitiesIncluded ? Object.keys(property.utilitiesIncluded).filter(key => property.utilitiesIncluded[key]) : [],
            }} />

            <LocationSection 
              address={property.address} 
              coordinates={property.address?.coordinates?.coordinates || property.address?.coordinates}
            />

            <RenterProfileDescription
              description={property.idealRenterProfile}
              preferredRenterTypes={property.preferredRenterType || property.preferredRenterTypes || []}
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
          setIsContactModalOpen(false);
          // Navigate to verification tab in profile page
          navigate('/profile?tab=verification');
        }}
        onCancel={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}

export default PropertyDetailPage;
