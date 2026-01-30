'use client'

import { useState, useEffect } from "react";
import { useParams, useNavigate } from '@/lib/react-router-compat';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Breadcrumb from "@/components/adminDashboard/common/Breadcrumb";
import RentOutDetailsForm from "@/components/adminDashboard/PropertyDetail/RentOutDetailsForm";
import RenterDetailsSection from "@/components/adminDashboard/PropertyDetail/RenterDetailsSection";
import PropertyStatusCard from "@/components/adminDashboard/PropertyDetail/PropertyStatusCard";
import ReferencesSection from "@/components/adminDashboard/PropertyDetail/ReferencesSection";
import PropertyGallery from "@/components/adminDashboard/PropertyDetail/PropertyGallery";
import PropertyDescription from "@/components/adminDashboard/PropertyDetail/PropertyDescription";
import PropertyDetailsGrid from "@/components/adminDashboard/PropertyDetail/PropertyDetailsGrid";
import LocationSection from "@/components/adminDashboard/PropertyDetail/LocationSection";
import RenterProfileDescription from "@/components/adminDashboard/PropertyDetail/RenterProfileDescription";
import { getPropertyById, deleteProperty, updateProperty, approveProperty, rejectProperty } from "@/api/properties";
import { getAllRentalHistory } from "@/api/rentalHistory";
import { PROPERTY_PLACEHOLDER_IMAGE } from "@/constant";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import RentOutModal from "@/components/adminDashboard/PropertyDetail/RentOutModal";

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showRentOutForm, setShowRentOutForm] = useState(false);
  const [showRenterDetails, setShowRenterDetails] = useState(false);
  const [renterEmail, setRenterEmail] = useState("");
  const [documents, setDocuments] = useState([]);
  const [renterFeedback, setRenterFeedback] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateAdded, setDateAdded] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [area, setArea] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showRentOutModal, setShowRentOutModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

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
        
        // Set initial selected image
        if (propertyData) {
          const firstImage = getFirstImage(propertyData);
          setSelectedImage(firstImage);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err.message || 'Failed to load property');
        toast.error(err.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Helper function to get first image from property
  const getFirstImage = (apiProperty) => {
    if (!apiProperty) return PROPERTY_PLACEHOLDER_IMAGE;
    
    // Check primaryImageId
    if (apiProperty.primaryImageId) {
      if (typeof apiProperty.primaryImageId === 'string') {
        return apiProperty.primaryImageId;
      } else if (apiProperty.primaryImageId.url) {
        return apiProperty.primaryImageId.url;
      }
    }
    
    // Check media array
    if (apiProperty.media && apiProperty.media.length > 0) {
      const firstImage = apiProperty.media.find(m => m.mediaType === 'image');
      if (firstImage) {
        return typeof firstImage === 'string' ? firstImage : firstImage.url;
      }
    }
    
    return PROPERTY_PLACEHOLDER_IMAGE;
  };

  // Transform API property data to component format
  const transformPropertyData = (apiProperty) => {
    if (!apiProperty) return null;

    // Extract main image from primaryImageId
    let mainImage = PROPERTY_PLACEHOLDER_IMAGE;
    if (apiProperty.primaryImageId) {
      if (typeof apiProperty.primaryImageId === 'string') {
        mainImage = apiProperty.primaryImageId;
      } else if (apiProperty.primaryImageId.url) {
        mainImage = apiProperty.primaryImageId.url;
      }
    }

    // Build thumbnails array (all images except the main/primary one)
    const thumbnails = [];
    const primaryImageUrl = mainImage !== PROPERTY_PLACEHOLDER_IMAGE ? mainImage : null;
    
    if (apiProperty.media && Array.isArray(apiProperty.media)) {
      apiProperty.media
        .filter(m => m.mediaType === 'image' && m.url)
        .forEach(m => {
          const imageUrl = typeof m === 'string' ? m : m.url;
          // Only add if it's not the primary image
          if (imageUrl && imageUrl !== primaryImageUrl && !thumbnails.includes(imageUrl)) {
            thumbnails.push(imageUrl);
          }
        });
    }
    
    // If no main image found, try to get from media array
    if (mainImage === PROPERTY_PLACEHOLDER_IMAGE && apiProperty.media && apiProperty.media.length > 0) {
      const firstImage = apiProperty.media.find(m => m.mediaType === 'image');
      if (firstImage) {
        mainImage = typeof firstImage === 'string' ? firstImage : firstImage.url;
      }
    }

    // Build gallery images array (mainImage + thumbnails for other components)
    const galleryImages = [mainImage, ...thumbnails].filter(Boolean);

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
    const monthlyRent = apiProperty.rent || 0;

    // Format property type
    const propertyType = apiProperty.propertyType 
      ? apiProperty.propertyType.charAt(0).toUpperCase() + apiProperty.propertyType.slice(1)
      : 'N/A';

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

    // Format availableFrom date with ordinal suffix (e.g., "15th Nov 2025")
    let availableFromFormatted = 'N/A';
    if (apiProperty.availableFrom) {
      try {
        const date = new Date(apiProperty.availableFrom);
        if (!isNaN(date.getTime())) {
          const day = date.getDate();
          const month = date.toLocaleDateString('en-GB', { month: 'short' });
          const year = date.getFullYear();
          const ordinalSuffix = getOrdinalSuffix(day);
          availableFromFormatted = `${day}${ordinalSuffix} ${month} ${year}`;
        }
      } catch (e) {
        console.error('Error formatting date:', e);
      }
    }

    // Format date added (createdAt)
    let dateAddedFormatted = 'N/A';
    if (apiProperty.createdAt) {
      try {
        const date = new Date(apiProperty.createdAt);
        if (!isNaN(date.getTime())) {
          dateAddedFormatted = date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        }
      } catch (e) {
        console.error('Error formatting date:', e);
      }
    }

    // Format approved date (approvedAt)
    let approvedOnFormatted = 'N/A';
    if (apiProperty.approvedAt) {
      try {
        const date = new Date(apiProperty.approvedAt);
        if (!isNaN(date.getTime())) {
          approvedOnFormatted = date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        }
      } catch (e) {
        console.error('Error formatting approved date:', e);
      }
    }

    return {
      id: apiProperty._id || apiProperty.id,
      title: apiProperty.title || 'Untitled Property',
      mainImage: mainImage,
      thumbnails: thumbnails,
      images: galleryImages,
      monthlyRent: monthlyRent,
      currency: currency,
      currencySymbol: currencySymbol,
      address: address,
      addressData: apiProperty.address,
      bedrooms: apiProperty.bedrooms || 0,
      bathrooms: apiProperty.bathrooms || 0,
      propertyType: propertyType,
      description: apiProperty.description || '',
      furnished: apiProperty.furnished || 'unfurnished',
      furnishedStatus: apiProperty.furnished || 'unfurnished',
      status: apiProperty.status || 'pending',
      amenities: apiProperty.amenities || [],
      utilitiesIncluded: apiProperty.utilitiesIncluded || {},
      utilities: apiProperty.utilitiesIncluded ? Object.keys(apiProperty.utilitiesIncluded).filter(key => apiProperty.utilitiesIncluded[key]) : [],
      squareFeet: apiProperty.squareFeet || 0,
      deposit: apiProperty.deposit || 0,
      minimumTenancy: apiProperty.minimumTenancy || 0,
      maximumTenancy: apiProperty.maximumTenancy || 0,
      availableFrom: availableFromFormatted,
      idealRenterProfile: apiProperty.idealRenterProfile || '',
      preferredRenterTypes: apiProperty.preferredRenterType || [],
      additionalRequirements: apiProperty.additionalRequirements || '',
      renterProfileDescription: apiProperty.idealRenterProfile || '',
      // Dashboard specific fields
      leads: apiProperty.leadsCount || 0,
      views: apiProperty.viewsCount || apiProperty.views || 0,
      dateAdded: dateAddedFormatted,
      approvedOn: approvedOnFormatted,
      // Full API data for components that need it
      apiData: apiProperty,
    };
  };

  const propertyData = transformPropertyData(property);

  const handleSaveRentOutDetails = () => {
    console.log("Saving rent out details:", { renterEmail, documents });
    setShowRentOutForm(false);
    setShowRenterDetails(true);
  };

  const handleEditRenter = () => {
    setShowRenterDetails(false);
    setShowRentOutForm(true);
  };

  const handleDeleteRenter = () => {
    // Handle delete logic
    console.log("Delete renter");
  };

  // Handle delete button click - show confirmation modal
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!id) {
      toast.error('Property ID not available');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteProperty(id);
      toast.success('Property deleted successfully');
      
      // Navigate back to properties list after successful deletion
      navigate('/dashboard/properties');
    } catch (error) {
      console.error('Error deleting property:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete property';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle delete cancellation
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    if (!id) {
      toast.error('Property ID not available');
      return;
    }

    // If changing to "rented", open the Rent Out modal instead of directly updating
    if (newStatus === 'rented') {
      setPendingStatus(newStatus);
      setShowRentOutModal(true);
      return;
    }

    // For other status changes, update directly
    try {
      // Guard: prevent setting Active if that would auto-set a move-out date before the tenancy start date.
      // This happens when a property is "rented" with a future rentedFrom, and the owner tries to end tenancy early.
      const currentStatus = String(property?.status || '').toLowerCase();
      if (String(newStatus).toLowerCase() === 'active' && currentStatus === 'rented') {
        try {
          const rentalHistoryData = await getAllRentalHistory({ page: 1, limit: 500 });
          const allRentals = rentalHistoryData?.data || [];

          const openRental = allRentals
            .filter((r) => {
              const pid = String(r?.propertyId?._id || r?.propertyId || '');
              return pid === String(id) && !r?.cancelledAt;
            })
            .sort((a, b) => new Date(b?.createdAt || b?.rentedFrom || 0) - new Date(a?.createdAt || a?.rentedFrom || 0))[0];

          if (openRental?.rentedFrom) {
            const rentedFrom = new Date(openRental.rentedFrom);
            const today = new Date();
            const rentedFromDay = new Date(rentedFrom);
            rentedFromDay.setHours(0, 0, 0, 0);
            const todayDay = new Date(today);
            todayDay.setHours(0, 0, 0, 0);

            if (todayDay < rentedFromDay) {
              const rentedFromLabel = rentedFrom.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              toast.error(
                `This tenancy starts on ${rentedFromLabel}, so you can’t mark the property Active before that date.`
              );
              return;
            }
          }
        } catch (e) {
          // If rental history fetch fails, don't block the status change here;
          // backend will still enforce the rule.
          console.error('Unable to validate tenancy start date before status change:', e);
        }
      }

      setIsUpdatingStatus(true);
      await updateProperty(id, { status: newStatus });
      toast.success(`Property status updated to ${newStatus === 'rented' ? 'Rent Out' : 'Active'}`);
      
      // Refresh property data to get updated status
      const updatedProperty = await getPropertyById(id);
      setProperty(updatedProperty);
    } catch (error) {
      console.error('Error updating property status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update property status';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle successful rental history creation
  const handleRentalHistorySuccess = async () => {
    try {
      // Update property status to "rented"
      setIsUpdatingStatus(true);
      await updateProperty(id, { status: 'rented' });
      toast.success('Property status updated to Rent Out');
      
      // Refresh property data to get updated status
      const updatedProperty = await getPropertyById(id);
      setProperty(updatedProperty);
    } catch (error) {
      console.error('Error updating property status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update property status';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
      setPendingStatus(null);
    }
  };

  // Handle modal close
  const handleCloseRentOutModal = () => {
    setShowRentOutModal(false);
    setPendingStatus(null);
  };

  // Handle property approval (Admin only)
  const handleApproveProperty = async () => {
    if (!user || user.userType !== 'admin') {
      toast.error('Only admins can approve properties');
      return;
    }

    try {
      setIsProcessingApproval(true);
      await approveProperty(id);

      // Refresh property data
      const updatedProperty = await getPropertyById(id);
      setProperty(updatedProperty);

      toast.success('Property approved successfully');
      setShowApproveModal(false);
    } catch (error) {
      console.error('Error approving property:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to approve property';
      toast.error(errorMessage);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Handle property rejection (Admin only)
  const handleRejectProperty = async () => {
    if (!user || user.userType !== 'admin') {
      toast.error('Only admins can reject properties');
      return;
    }

    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setIsProcessingApproval(true);
      await rejectProperty(id, rejectReason.trim());

      // Refresh property data
      const updatedProperty = await getPropertyById(id);
      setProperty(updatedProperty);

      toast.success('Property rejected successfully');
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting property:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reject property';
      toast.error(errorMessage);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Handle share button click - copy property link to clipboard
  const handleShare = async () => {
    try {
      if (!id) {
        toast.error('Property ID not available');
        return;
      }

      // Construct property detail URL (public route for renters to view)
      const propertyUrl = `${window.location.origin}/properties/${id}`;
      
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(propertyUrl);
        toast.success('Link copied to clipboard!');
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = propertyUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            toast.success('Link copied to clipboard!');
          } else {
            throw new Error('execCommand failed');
          }
        } catch (err) {
          document.body.removeChild(textArea);
          throw err;
        }
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link. Please copy manually.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#6B4EFF] border-t-transparent"></div>
            <p className="ml-4 text-text-secondary text-lg">Loading property...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !property || !propertyData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">{error || 'Property not found'}</p>
            <button
              onClick={() => navigate("/dashboard/properties")}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb customLabels={{ propertyTitle: propertyData.title }} />

        <PropertyStatusCard
          propertyData={propertyData}
          onStatusChange={handleStatusChange}
          onApprove={() => setShowApproveModal(true)}
          onReject={() => setShowRejectModal(true)}
          userRole={user?.userType}
        />

        <ReferencesSection 
          propertyId={id} 
          propertyStatus={propertyData.status}
        />
        
        {/* Edit Button - Only show for pending_approval status */}
        {propertyData.status?.toLowerCase() === 'pending_approval' && (
          <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4">
            <button
              onClick={() => navigate(`/dashboard/properties/edit/${id}`)}
              className="w-full md:w-auto px-6 py-3 bg-[#6B4EFF] text-white rounded-lg font-semibold font-nunito hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Property
            </button>
          </div>
        )}
        
        {/* Rent Out Modal */}
        {showRentOutModal && (
          <RentOutModal
            isOpen={showRentOutModal}
            onClose={handleCloseRentOutModal}
            propertyId={id}
            onSuccess={handleRentalHistorySuccess}
          />
        )}

        {showRentOutForm && (
          <RentOutDetailsForm
            renterEmail={renterEmail}
            setRenterEmail={setRenterEmail}
            documents={documents}
            setDocuments={setDocuments}
            onSave={handleSaveRentOutDetails}
          />
        )}

        {showRenterDetails && (
          <RenterDetailsSection
            documents={documents}
            renterFeedback={renterFeedback}
            setRenterFeedback={setRenterFeedback}
            onEdit={handleEditRenter}
            onDelete={handleDeleteRenter}
          />
        )}
        <PropertyGallery
          propertyData={propertyData}
          onEdit={() => setShowRentOutForm(true)}
          onShare={handleShare}
          onDelete={handleDelete}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          showRenterDetails={showRenterDetails}
        />

        <PropertyDescription description={propertyData.description} />

        <PropertyDetailsGrid propertyData={propertyData} />

        <LocationSection 
          address={propertyData.addressData || propertyData.address} 
          coordinates={property?.address?.coordinates?.coordinates || property?.address?.coordinates}
        />

        <RenterProfileDescription
          description={propertyData.idealRenterProfile || propertyData.renterProfileDescription}
          preferredRenterTypes={propertyData.preferredRenterTypes}
          requirements={propertyData.additionalRequirements}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${propertyData.title}"? This action cannot be undone. The property will be marked as deleted and all associated media files will be removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        isProcessing={isDeleting}
      />

      {/* Approve Property Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApproveProperty}
        title="Approve Property"
        message={`Are you sure you want to approve "${propertyData.title}"? This will make the property live and visible to renters.`}
        confirmText="Yes, Approve"
        cancelText="Cancel"
        confirmVariant="primary"
        isProcessing={isProcessingApproval}
      />

      {/* Reject Property Modal */}
      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        onConfirm={handleRejectProperty}
        title="Reject Property"
        message={`Are you sure you want to reject "${propertyData.title}"? Please provide a reason for rejection.`}
        confirmText="Yes, Reject"
        cancelText="Cancel"
        confirmVariant="danger"
        showReasonInput={true}
        reasonValue={rejectReason}
        onReasonChange={setRejectReason}
        reasonPlaceholder="Enter rejection reason..."
        reasonRequired={true}
        isProcessing={isProcessingApproval}
      />
    </DashboardLayout>
  );
}

export default PropertyDetail;
