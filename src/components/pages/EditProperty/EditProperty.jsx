'use client'

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from '@/lib/react-router-compat';
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Breadcrumb from "@/components/adminDashboard/common/Breadcrumb";
import ProgressIndicator from "@/components/adminDashboard/AddProperty/ProgressIndicator";
import AIModal from "@/components/adminDashboard/AddProperty/AIModal";
import SuccessModal from "@/components/adminDashboard/AddProperty/SuccessModal";
import BasicInfoStep from "@/components/adminDashboard/AddProperty/BasicInfoStep";
import LocationStep from "@/components/adminDashboard/AddProperty/LocationStep";
import RentDetailsStep from "@/components/adminDashboard/AddProperty/RentDetailsStep";
import AmenitiesUtilitiesStep from "@/components/adminDashboard/AddProperty/AmenitiesUtilitiesStep";
import UploadImagesStep from "@/components/adminDashboard/AddProperty/UploadImagesStep";
import RenterDescriptionStep from "@/components/adminDashboard/AddProperty/RenterDescriptionStep";
import ReviewStep from "@/components/adminDashboard/AddProperty/ReviewStep";
import { addPropertySteps, amenitiesList } from "@/constant";
import { getPropertyById, updateProperty, uploadMultiplePropertyMedia, deletePropertyMedia } from '@/api/properties';
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { toast } from "react-toastify";

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [isDescriptionAIGenerated, setIsDescriptionAIGenerated] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasFetchedRef = useRef(false);
  const [originalImages, setOriginalImages] = useState([]); // Track original images for deletion
  const [formData, setFormData] = useState({
    propertyTitle: "",
    propertyType: "",
    propertyDescription: "",
    bedrooms: "",
    bathrooms: "",
    address: "",
    city: "",
    county: "",
    state: "",
    postcode: "",
    country: "",
    monthlyRent: "",
    availableFrom: "",
    additionalCharges: [{ type: "", amount: "" }],
    furnishedStatus: "",
    amenities: [],
    otherAmenities: [],
    utilities: [""],
    images: [],
    renterProfileDescription: "",
    preferredRenterTypes: [],
    additionalRequirements: "",
    coordinates: [],
  });

  // Fetch property data on mount
  useEffect(() => {
    // Prevent multiple calls
    if (hasFetchedRef.current) return;
    
    const fetchProperty = async () => {
      if (!id) {
        toast.error('Property ID is required');
        navigate('/dashboard/properties');
        return;
      }

      hasFetchedRef.current = true;

      try {
        setLoading(true);
        console.log('Fetching property for edit:', id);
        
        // Use exact same approach as PropertyDetail - it works there
        const propertyData = await getPropertyById(id);
        
        console.log('Property data received:', propertyData);
        
        if (!propertyData) {
          throw new Error('Property not found');
        }
        
        // Check if property status is pending_approval
        const status = propertyData.status?.toLowerCase();
        console.log('Property status:', status);
        
        if (status !== 'pending_approval') {
          toast.error('Only properties with pending approval status can be edited');
          setTimeout(() => {
            navigate(`/dashboard/properties/${id}`);
          }, 1500);
          return;
        }

        // Transform property data to formData format
        console.log('Transforming property data...');
        const transformedData = transformPropertyToFormData(propertyData);
        console.log('Transformed data:', transformedData);
        setFormData(transformedData);
        console.log('Form data set successfully');
      } catch (error) {
        console.error('Error fetching property:', error);
        hasFetchedRef.current = false; // Reset on error so user can retry
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to load property';
        toast.error(errorMessage);
        setTimeout(() => {
          navigate('/dashboard/properties');
        }, 2000);
      } finally {
        setLoading(false);
        console.log('Loading set to false');
      }
    };

    fetchProperty();
  }, [id, navigate]);

  // Helper function to map backend amenity format to frontend display name
  const mapBackendAmenityToFrontend = (backendAmenity) => {
    if (!backendAmenity) return null;
    
    const amenityMap = {
      "wardrobes": "Wardrobes",
      "beds": "Bed(s)",
      "wooden_flooring": "Wooden flooring",
      "carpet_flooring": "Carpet flooring",
      "fireplace": "Fireplace",
      "underfloor_heating": "Underfloor heating",
      "heating_controls": "Heating controls",
      "dishwasher": "Dishwasher",
      "washing_machine": "Washing machine",
      "dryer": "Dryer / Washer-dryer",
      "microwave": "Microwave",
      "hob_oven": "Hob & oven",
      "fridge_freezer": "Fridge-freezer",
      "pantry_storage": "Pantry / separate storage",
      "parking": "Parking",
      "residents_parking": "Residents' parking",
      "sprinkler_system": "Sprinkler system",
      "bicycle_storage": "Bicycle storage",
      "smoke_alarms": "Smoke alarms",
      "cctv": "CCTV in communal areas",
      "recycling": "Recycling bins area",
      "lift": "Lift",
      "gas_safety_certificate": "Gas Safety Certificate",
      "electrical_safety_certificate": "Electrical Safety Certificate",
      "ev_charging": "EV charging point",
      "tv_point": "TV point",
      "garden": "Garden",
      "wifi": "WiFi Included",
      "central_heating": "Central Heating",
      "garage": "Garage",
    };
    
    // Try exact match first
    const normalized = backendAmenity.toLowerCase().trim();
    if (amenityMap[normalized]) {
      return amenityMap[normalized];
    }
    
    // Try to find in amenitiesList
    const found = amenitiesList.find(amenity => 
      amenity.toLowerCase().replace(/\s+/g, '_') === normalized ||
      amenity.toLowerCase() === normalized
    );
    
    return found || backendAmenity; // Return original if not found
  };

  // Transform API property data to formData format
  const transformPropertyToFormData = (property) => {
    if (!property) {
      console.error('transformPropertyToFormData: property is null or undefined');
      throw new Error('Property data is required');
    }
    
    try {
      // Extract preferred renter types from idealRenterProfile
      let preferredRenterTypes = [];
      let renterProfileDescription = property.idealRenterProfile || "";
      let additionalRequirements = property.additionalRequirements || "";

      if (renterProfileDescription) {
        // Extract preferred renter types
        const preferredTypeMatch = renterProfileDescription.match(/Preferred renter type:\s*([^.]+)/i);
        if (preferredTypeMatch) {
          const typesString = preferredTypeMatch[1].trim();
          preferredRenterTypes = typesString.split(',').map(t => t.trim()).filter(t => t);
          // Remove from description
          renterProfileDescription = renterProfileDescription.replace(/Preferred renter type:\s*[^.]+\.?/i, '').trim();
        }

        // Extract additional requirements
        const additionalReqMatch = renterProfileDescription.match(/Additional requirements:\s*(.+)/i);
        if (additionalReqMatch) {
          additionalRequirements = additionalReqMatch[1].trim();
          renterProfileDescription = renterProfileDescription.replace(/Additional requirements:\s*.+/i, '').trim();
        }
      }

      // Transform utilities
      const utilities = [];
      if (property.utilitiesIncluded) {
        if (property.utilitiesIncluded.electricity) utilities.push("electricity");
        if (property.utilitiesIncluded.water) utilities.push("water");
        if (property.utilitiesIncluded.gas) utilities.push("gas");
        if (property.utilitiesIncluded.internet) utilities.push("internet");
        if (property.utilitiesIncluded.councilTax) utilities.push("council tax");
      }
      if (utilities.length === 0) utilities.push("");

      // Transform additional charges
      const additionalCharges = property.additionalCharges && property.additionalCharges.length > 0
        ? property.additionalCharges.map(charge => ({
            type: charge.type || "",
            amount: charge.amount?.toString() || ""
          }))
        : [{ type: "", amount: "" }];

      // Get coordinates from address
      const coordinates = property.address?.coordinates?.coordinates || property.address?.coordinates || [];

      // Get existing images from media - store as objects with url property for better compatibility
      // UploadImagesStep can handle both strings and objects with url property
      const images = property.media && property.media.length > 0
        ? property.media
            .filter(m => m && (m.mediaType === 'image' || !m.mediaType))
            .map(m => {
              // Return as object with url property for consistent handling
              if (typeof m === 'string') {
                return { url: m };
              }
              const imageUrl = m.url || m;
              if (imageUrl) {
                return { url: imageUrl };
              }
              return null;
            })
            .filter(Boolean)
        : [];
      
      // Store original images with their media IDs for tracking deletions
      const originalImagesWithIds = property.media && property.media.length > 0
        ? property.media
            .filter(m => m && (m.mediaType === 'image' || !m.mediaType))
            .map(m => ({
              url: typeof m === 'string' ? m : (m.url || m),
              mediaId: m._id || m.id,
            }))
            .filter(img => img.url && img.mediaId)
        : [];
      setOriginalImages(originalImagesWithIds);

      // Transform amenities from backend format to frontend display names
      const transformedAmenities = (property.amenities || []).map(amenity => {
        return mapBackendAmenityToFrontend(amenity);
      }).filter(amenity => amenity !== null && amenity !== undefined);

      // Format availableFrom date
      let availableFromFormatted = "";
      if (property.availableFrom) {
        try {
          const date = new Date(property.availableFrom);
          if (!isNaN(date.getTime())) {
            availableFromFormatted = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Error formatting availableFrom date:', e);
        }
      }

      return {
        propertyTitle: property.title || "",
        propertyType: property.propertyType || "",
        propertyDescription: property.description || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        address: property.address?.address || "",
        city: property.address?.city || "",
        county: property.address?.county || "",
        state: property.address?.state || "",
        postcode: property.address?.postcode || "",
        country: property.address?.country || "United Kingdom",
        monthlyRent: property.rent?.toString() || "",
        availableFrom: availableFromFormatted,
        additionalCharges: additionalCharges,
        furnishedStatus: property.furnished || "",
        amenities: transformedAmenities,
        otherAmenities: property.otherAmenities || [],
        utilities: utilities,
        images: images,
        renterProfileDescription: renterProfileDescription,
        preferredRenterTypes: preferredRenterTypes,
        additionalRequirements: additionalRequirements,
        coordinates: coordinates,
      };
    } catch (error) {
      console.error('Error in transformPropertyToFormData:', error);
      throw error;
    }
  };

  // Helper function to map frontend amenities to backend format
  const mapAmenityToBackend = (amenity) => {
    const amenityMap = {
      "Wardrobes": "wardrobes",
      "Bed(s)": "beds",
      "Wooden flooring": "wooden_flooring",
      "Carpet flooring": "carpet_flooring",
      "Fireplace": "fireplace",
      "Underfloor heating": "underfloor_heating",
      "Heating controls": "heating_controls",
      "Dishwasher": "dishwasher",
      "Washing machine": "washing_machine",
      "Dryer / Washer-dryer": "dryer",
      "Microwave": "microwave",
      "Hob & oven": "hob_oven",
      "Fridge-freezer": "fridge_freezer",
      "Pantry / separate storage": "pantry_storage",
      "Parking": "parking",
      "Residents' parking": "residents_parking",
      "Sprinkler system": "sprinkler_system",
      "Bicycle storage": "bicycle_storage",
      "Smoke alarms": "smoke_alarms",
      "CCTV in communal areas": "cctv",
      "Recycling bins area": "recycling",
      "Lift": "lift",
      "Gas Safety Certificate": "gas_safety_certificate",
      "Electrical Safety Certificate": "electrical_safety_certificate",
      "EV charging point": "ev_charging",
      "TV point": "tv_point",
      "Garden": "garden",
      "WiFi Included": "wifi",
      "Central Heating": "central_heating",
      "Garage": "garage",
    };
    return amenityMap[amenity] || amenity.toLowerCase().replace(/\s+/g, '_');
  };

  // Validation functions (same as AddProperty)
  const validateStep1 = () => {
    const errors = {};
    if (!formData.propertyTitle?.trim()) errors.propertyTitle = "Property Title is required";
    if (!formData.propertyType?.trim()) errors.propertyType = "Property Type is required";
    if (!formData.propertyDescription?.trim()) errors.propertyDescription = "Property Description is required";
    if (!formData.bedrooms || formData.bedrooms === "") errors.bedrooms = "Bedrooms is required";
    if (!formData.bathrooms || formData.bathrooms === "") errors.bathrooms = "Bathrooms is required";
    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.address?.trim()) errors.address = "Address is required";
    if (!formData.city?.trim()) errors.city = "City is required";
    if (!formData.postcode?.trim()) errors.postcode = "Postcode is required";
    if (!formData.country?.trim()) errors.country = "Country is required";
    return errors;
  };

  const validateStep3 = () => {
    const errors = {};
    if (!formData.monthlyRent || parseFloat(formData.monthlyRent) <= 0) {
      errors.monthlyRent = "Monthly Rent is required and must be greater than 0";
    }
    if (!formData.availableFrom?.trim()) errors.availableFrom = "Available From date is required";
    if (!formData.furnishedStatus?.trim()) errors.furnishedStatus = "Furnished Status is required";
    return errors;
  };

  const validateStep4 = () => {
    const errors = {};
    if (!formData.utilities || formData.utilities.length === 0 || (formData.utilities.length === 1 && !formData.utilities[0])) {
      errors.utilities = "At least one utility must be selected";
    }
    return errors;
  };

  const validateStep5 = () => {
    const errors = {};
    // For edit, images are optional (can keep existing)
    return errors;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const errors = validateStep1();
      setStepErrors(errors);
      if (Object.values(errors).some(error => error && error.trim() !== "")) return;
    } else if (currentStep === 2) {
      const errors = validateStep2();
      setStepErrors(errors);
      if (Object.values(errors).some(error => error && error.trim() !== "")) return;
    } else if (currentStep === 3) {
      const errors = validateStep3();
      setStepErrors(errors);
      if (Object.values(errors).some(error => error && error.trim() !== "")) return;
    } else if (currentStep === 4) {
      const errors = validateStep4();
      setStepErrors(errors);
      if (Object.values(errors).some(error => error && error.trim() !== "")) return;
    } else if (currentStep === 5) {
      const errors = validateStep5();
      setStepErrors(errors);
      if (Object.values(errors).some(error => error && error.trim() !== "")) return;
    }

    if (currentStep < addPropertySteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate(`/dashboard/properties/${id}`);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Build property data (same format as AddProperty)
      const data = {
        title: formData.propertyTitle.trim(),
        propertyType: formData.propertyType,
        description: formData.propertyDescription.trim(),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        rent: parseFloat(formData.monthlyRent),
        currency: "GBP",
        deposit: 0,
        availableFrom: new Date(formData.availableFrom).toISOString(),
        additionalCharges: formData.additionalCharges
          .filter(charge => charge.type && charge.amount)
          .map(charge => ({
            type: charge.type,
            amount: parseFloat(charge.amount),
          })),
        furnished: formData.furnishedStatus,
        amenities: formData.amenities.map(mapAmenityToBackend),
        otherAmenities: formData.otherAmenities.filter(amenity => amenity.trim()),
        utilitiesIncluded: {
          electricity: formData.utilities.includes("electricity"),
          water: formData.utilities.includes("water"),
          gas: formData.utilities.includes("gas"),
          internet: formData.utilities.includes("internet"),
          councilTax: formData.utilities.includes("council tax"),
        },
        idealRenterProfile: buildIdealRenterProfile(),
        descriptionSource: isDescriptionAIGenerated ? "ai" : "manual",
        // Don't include status - backend will keep existing status (pending_approval)
        address: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          county: formData.county?.trim() || "",
          state: formData.state?.trim() || "",
          postcode: formData.postcode.trim(),
          country: formData.country?.trim() || "United Kingdom",
          coordinates: formData.coordinates,
        },
      };

      // Update property
      await updateProperty(id, data);

      // Handle media updates: delete removed images and upload new ones
      
      // Get current image URLs (existing images that are still present)
      // Handle both string URLs and objects with url property
      const currentImageUrls = formData.images
        .map(img => {
          // Extract URL from different formats
          if (typeof img === 'string') {
            return img; // Direct string URL
          }
          if (img && typeof img === 'object') {
            // Existing image with URL (no file property means it's an existing image)
            if (img.url && !img.file) {
              return img.url;
            }
            // New file being uploaded, skip for deletion check
            if (img.file instanceof File) {
              return null;
            }
            // Fallback: if it's an object but no url or file, try to use it as URL
            if (!img.url && !img.file && typeof img === 'object') {
              return null;
            }
          }
          return null;
        })
        .filter(Boolean);
      
      // Find images that were removed (in original but not in current)
      const removedImages = originalImages.filter(originalImg => {
        return !currentImageUrls.includes(originalImg.url);
      });
      
      // Delete removed images
      if (removedImages.length > 0) {
        console.log('Deleting removed images:', removedImages.length);
        const deletePromises = removedImages.map(async (img) => {
          try {
            await deletePropertyMedia(id, img.mediaId);
            console.log('Deleted image:', img.mediaId);
          } catch (error) {
            console.error('Error deleting image:', img.mediaId, error);
            // Continue even if one deletion fails
          }
        });
        await Promise.all(deletePromises);
        if (removedImages.length > 0) {
          toast.success(`${removedImages.length} image(s) removed successfully`);
        }
      }
      
      // Extract new File objects to upload
      const newImageFiles = [];
      formData.images.forEach(img => {
        // Check if it's a File object directly
        if (img instanceof File) {
          newImageFiles.push(img);
        }
        // Check if it's an object with a file property (File object)
        else if (img && typeof img === 'object' && img.file instanceof File) {
          newImageFiles.push(img.file);
        }
        // Skip existing images (strings or objects with url but no file)
      });

      console.log('Total images in formData:', formData.images.length);
      console.log('Removed images:', removedImages.length);
      console.log('New files to upload:', newImageFiles.length);

      // Upload new images if any
      if (newImageFiles.length > 0) {
        try {
          console.log('Uploading new images:', newImageFiles.length);
          // Create FormData for file upload
          const mediaFormData = new FormData();
          newImageFiles.forEach((file) => {
            mediaFormData.append('files', file);
          });
          mediaFormData.append('mediaType', 'image');
          // Don't set as primary automatically when editing
          mediaFormData.append('isPrimary', 'false');
          
          await uploadMultiplePropertyMedia(id, mediaFormData);
          toast.success(`${newImageFiles.length} new image(s) uploaded successfully`);
        } catch (mediaError) {
          console.error('Error uploading media:', mediaError);
          const errorMessage = mediaError?.response?.data?.error || mediaError?.message || 'Failed to upload media';
          toast.warning(`Property updated, but media upload failed: ${errorMessage}`);
        }
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating property:", error);
      setSubmitError(
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update property. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildIdealRenterProfile = () => {
    let profile = formData.renterProfileDescription || "";
    if (formData.preferredRenterTypes && formData.preferredRenterTypes.length > 0) {
      const typesString = formData.preferredRenterTypes.join(", ");
      profile += ` Preferred renter type: ${typesString}.`;
    }
    if (formData.additionalRequirements) {
      profile += ` Additional requirements: ${formData.additionalRequirements}`;
    }
    return profile || undefined;
  };

  const handleAddCharge = () => {
    setFormData({
      ...formData,
      additionalCharges: [...formData.additionalCharges, { type: "", amount: "" }],
    });
  };

  const handleRemoveCharge = (index) => {
    setFormData({
      ...formData,
      additionalCharges: formData.additionalCharges.filter((_, i) => i !== index),
    });
  };

  const handleAddOtherAmenity = (amenity) => {
    if (amenity && amenity.trim()) {
      setFormData({
        ...formData,
        otherAmenities: [...formData.otherAmenities, amenity.trim()],
      });
    }
  };

  const handleRemoveOtherAmenity = (index) => {
    setFormData({
      ...formData,
      otherAmenities: formData.otherAmenities.filter((_, i) => i !== index),
    });
  };

  const handleToggleAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter((a) => a !== amenity)
        : [...formData.amenities, amenity],
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#6B4EFF] border-t-transparent"></div>
          <p className="ml-4 text-text-secondary text-lg">Loading property...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb customLabels={{ propertyTitle: "Edit Property" }} />
        <ProgressIndicator currentStep={currentStep} steps={addPropertySteps} />

        {/* Step Content */}
        <div className="bg-white rounded-[20px] border border-lightGray p-4 md:p-6">
          {currentStep === 1 && (
            <BasicInfoStep
              formData={formData}
              setFormData={setFormData}
              setShowAIModal={setShowAIModal}
              errors={stepErrors}
              setErrors={setStepErrors}
            />
          )}
          {currentStep === 2 && (
            <LocationStep
              formData={formData}
              setFormData={setFormData}
              errors={stepErrors}
              setErrors={setStepErrors}
            />
          )}
          {currentStep === 3 && (
            <RentDetailsStep
              formData={formData}
              setFormData={setFormData}
              handleAddCharge={handleAddCharge}
              handleRemoveCharge={handleRemoveCharge}
              errors={stepErrors}
              setErrors={setStepErrors}
            />
          )}
          {currentStep === 4 && (
            <AmenitiesUtilitiesStep
              formData={formData}
              setFormData={setFormData}
              handleToggleAmenity={handleToggleAmenity}
              handleAddOtherAmenity={handleAddOtherAmenity}
              handleRemoveOtherAmenity={handleRemoveOtherAmenity}
              errors={stepErrors}
              setErrors={setStepErrors}
            />
          )}
          {currentStep === 5 && (
            <UploadImagesStep
              formData={formData}
              setFormData={setFormData}
              errors={stepErrors}
              setErrors={setStepErrors}
            />
          )}
          {currentStep === 6 && (
            <RenterDescriptionStep
              formData={formData}
              setFormData={setFormData}
              errors={stepErrors}
              setErrors={setStepErrors}
            />
          )}
          {currentStep === 7 && (
            <ReviewStep
              formData={formData}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-lightGray rounded-lg font-semibold font-nunito text-secondary hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-3 border border-lightGray rounded-lg font-semibold font-nunito text-secondary hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < addPropertySteps.length ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-[#6B4EFF] text-white rounded-lg font-semibold font-nunito hover:bg-opacity-90 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#6B4EFF] text-white rounded-lg font-semibold font-nunito hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating Property..." : "Update Property"}
              </button>
            )}
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {submitError}
          </div>
        )}
      </div>

      {/* Modals */}
      <AIModal
        showAIModal={showAIModal}
        setShowAIModal={setShowAIModal}
        aiDescription={aiDescription}
        setAiDescription={setAiDescription}
        setIsDescriptionAIGenerated={setIsDescriptionAIGenerated}
        setFormData={setFormData}
        formData={formData}
      />

      <SuccessModal
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        formData={formData}
        propertyId={id}
        isEdit={true}
      />

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Editing"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
      />
    </DashboardLayout>
  );
}

export default EditProperty;
