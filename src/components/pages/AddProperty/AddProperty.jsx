'use client'

import { useState } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import { useDispatch, useSelector } from 'react-redux';
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
import { createNewProperty } from '@/redux/slices/propertySlice';
import { uploadMultiplePropertyMedia } from '@/api/properties';

function AddProperty() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { creating, error: propertyError } = useSelector((state) => state.property);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [createdPropertyId, setCreatedPropertyId] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isDescriptionAIGenerated, setIsDescriptionAIGenerated] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
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
    preferredRenterType: "",
    additionalRequirements: "",
    coordinates: [], // [longitude, latitude]
  });

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
      "Pantry / separate storage": "pantry",
      "Residents' parking": "residents_parking",
      "Sprinkler system": "sprinkler_system",
      "Bicycle storage": "bicycle_storage",
      "Smoke alarms": "smoke_alarms",
      "CCTV in communal areas": "cctv",
      "Recycling bins area": "recycling_bins",
      "Lift": "lift",
      "Gas Safety Certificate": "gas_safety_certificate",
      "Electrical Safety Certificate": "electrical_safety_certificate",
      "EV charging point": "ev_charging_point",
      "TV point": "tv_point",
      "Garage": "garage",
    };
    return amenityMap[amenity] || amenity.toLowerCase().replace(/\s+/g, "_");
  };

  // Transform form data to backend API format
  const transformFormDataToAPI = (data) => {
    // Map property type (condo -> apartment)
    let propertyType = data.propertyType;
    if (propertyType === "condo") {
      propertyType = "apartment";
    }

    // Map furnished status
    let furnished = "";
    if (data.furnishedStatus === "furnished") {
      furnished = "furnished";
    } else if (data.furnishedStatus === "unfurnished") {
      furnished = "unfurnished";
    } else if (data.furnishedStatus === "semi-furnished") {
      furnished = "partially_furnished";
    }

    // Map amenities from frontend format to backend format
    const mappedAmenities = data.amenities.map(mapAmenityToBackend);

    // Build utilities object
    const utilitiesIncluded = {
      electricity: false,
      water: false,
      gas: false,
      internet: false,
      councilTax: false,
    };
    
    data.utilities.forEach((utility) => {
      if (utility && utility.trim()) {
        const utilityKey = utility.toLowerCase();
        if (utilityKey === "electricity") utilitiesIncluded.electricity = true;
        if (utilityKey === "water") utilitiesIncluded.water = true;
        if (utilityKey === "gas") utilitiesIncluded.gas = true;
        if (utilityKey === "internet") utilitiesIncluded.internet = true;
        if (utilityKey === "council tax") utilitiesIncluded.councilTax = true;
      }
    });

    // Use coordinates from formData if available, otherwise default (London, UK)
    // Format: [longitude, latitude]
    const defaultCoordinates = [-0.1278, 51.5074];
    const coordinates = data.coordinates && data.coordinates.length === 2 
      ? data.coordinates 
      : defaultCoordinates;

    // Build ideal renter profile
    let idealRenterProfile = "";
    if (data.renterProfileDescription) {
      idealRenterProfile = data.renterProfileDescription;
      if (data.preferredRenterType) {
        idealRenterProfile += ` Preferred renter type: ${data.preferredRenterType}.`;
      }
      if (data.additionalRequirements) {
        idealRenterProfile += ` Additional requirements: ${data.additionalRequirements}`;
      }
    }

    // Calculate deposit from additional charges if available
    let deposit = 0;
    if (data.additionalCharges && data.additionalCharges.length > 0) {
      const depositCharge = data.additionalCharges.find(
        (charge) => charge.type && charge.type.toLowerCase().includes("deposit")
      );
      if (depositCharge && depositCharge.amount) {
        deposit = parseFloat(depositCharge.amount) || 0;
      }
    }

    // Process additional charges - filter out empty ones and convert amounts to numbers
    const processedAdditionalCharges = data.additionalCharges && data.additionalCharges.length > 0
      ? data.additionalCharges
          .filter((charge) => charge.type && charge.type.trim() && charge.amount)
          .map((charge) => ({
            type: charge.type.trim(),
            amount: parseFloat(charge.amount) || 0,
          }))
      : undefined;

    // Process availableFrom date
    let availableFromDate = undefined;
    if (data.availableFrom) {
      // Convert date string to ISO format if it's not already
      const date = new Date(data.availableFrom);
      if (!isNaN(date.getTime())) {
        availableFromDate = date.toISOString();
      }
    }

    return {
      title: data.propertyTitle.trim(),
      description: data.propertyDescription.trim(),
      propertyType: propertyType,
      bedrooms: parseInt(data.bedrooms) || 0,
      bathrooms: parseInt(data.bathrooms) || 0,
      rent: parseFloat(data.monthlyRent) || 0,
      currency: "GBP", // Default to GBP
      deposit: deposit,
      availableFrom: availableFromDate,
      additionalCharges: processedAdditionalCharges,
      furnished: furnished || undefined,
      amenities: mappedAmenities,
      otherAmenities: data.otherAmenities && data.otherAmenities.length > 0 
        ? data.otherAmenities.map(amenity => amenity.trim()).filter(amenity => amenity.length > 0)
        : undefined,
      utilitiesIncluded: utilitiesIncluded,
      idealRenterProfile: idealRenterProfile || undefined,
      descriptionSource: isDescriptionAIGenerated ? "ai" : "manual",
      status: "draft", // Default to draft
      address: {
        address: data.address.trim(),
        city: data.city.trim(),
        county: data.county?.trim() || "",
        state: data.state?.trim() || "",
        postcode: data.postcode.trim(),
        country: data.country?.trim() || "United Kingdom",
        coordinates: coordinates, // [longitude, latitude] - saved in DB
      },
    };
  };

  const steps = addPropertySteps;
  
  // Validate step 1 (Basic Information)
  const validateStep1 = () => {
    const errors = {};
    if (!formData.propertyTitle || !formData.propertyTitle.trim()) {
      errors.propertyTitle = "Property Title is required";
    }
    if (!formData.propertyType || !formData.propertyType.trim()) {
      errors.propertyType = "Property Type is required";
    }
    if (!formData.propertyDescription || !formData.propertyDescription.trim()) {
      errors.propertyDescription = "Property Description is required";
    }
    if (!formData.bedrooms || formData.bedrooms === "" || parseInt(formData.bedrooms) < 0) {
      errors.bedrooms = "Bedrooms is required";
    }
    if (!formData.bathrooms || formData.bathrooms === "" || parseInt(formData.bathrooms) < 0) {
      errors.bathrooms = "Bathrooms is required";
    }
    return errors;
  };

  // Validate step 2 (Location)
  const validateStep2 = () => {
    const errors = {};
    if (!formData.address || !formData.address.trim()) {
      errors.address = "Address is required";
    }
    if (!formData.city || !formData.city.trim()) {
      errors.city = "City is required";
    }
    if (!formData.postcode || !formData.postcode.trim()) {
      errors.postcode = "Postcode is required";
    }
    if (!formData.country || !formData.country.trim()) {
      errors.country = "Country is required";
    }
    return errors;
  };

  // Validate step 3 (Rent Details)
  const validateStep3 = () => {
    const errors = {};
    if (!formData.monthlyRent || formData.monthlyRent === "" || parseFloat(formData.monthlyRent) <= 0) {
      errors.monthlyRent = "Monthly Rent is required";
    }
    if (!formData.availableFrom || !formData.availableFrom.trim()) {
      errors.availableFrom = "Available From date is required";
    }
    if (!formData.furnishedStatus || !formData.furnishedStatus.trim()) {
      errors.furnishedStatus = "Furnished Status is required";
    }
    // Additional charges are optional, so no validation needed
    return errors;
  };

  // Validate step 4 (Amenities & Utilities)
  const validateStep4 = () => {
    const errors = {};
    if (!formData.amenities || !Array.isArray(formData.amenities) || formData.amenities.length === 0) {
      errors.amenities = "At least one amenity is required";
    }
    if (!formData.utilities || !Array.isArray(formData.utilities) || formData.utilities.length === 0) {
      errors.utilities = "At least one utility is required";
    } else {
      // Check if all utilities have values
      const emptyUtilities = formData.utilities.filter(util => !util || !util.trim());
      if (emptyUtilities.length > 0) {
        errors.utilities = "All utilities must be selected";
      }
    }
    // Other amenities are optional, so no validation needed
    return errors;
  };

  // Validate step 5 (Media Upload)
  const validateStep5 = () => {
    const errors = {};
    if (!formData.images || !Array.isArray(formData.images) || formData.images.length === 0) {
      errors.media = "At least one image or video is required";
    }
    return errors;
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      const errors = validateStep1();
      setStepErrors(errors);
      
      // Check if there are any errors
      const hasErrors = Object.values(errors).some(error => error && error.trim() !== "");
      if (hasErrors) {
        return; // Don't proceed if there are errors
      }
    } else if (currentStep === 2) {
      const errors = validateStep2();
      setStepErrors(errors);
      
      // Check if there are any errors
      const hasErrors = Object.values(errors).some(error => error && error.trim() !== "");
      if (hasErrors) {
        return; // Don't proceed if there are errors
      }
    } else if (currentStep === 3) {
      const errors = validateStep3();
      setStepErrors(errors);
      
      // Check if there are any errors
      const hasErrors = Object.values(errors).some(error => error && error.trim() !== "");
      if (hasErrors) {
        return; // Don't proceed if there are errors
      }
    } else if (currentStep === 4) {
      const errors = validateStep4();
      setStepErrors(errors);
      
      // Check if there are any errors
      const hasErrors = Object.values(errors).some(error => error && error.trim() !== "");
      if (hasErrors) {
        return; // Don't proceed if there are errors
      }
    } else if (currentStep === 5) {
      const errors = validateStep5();
      setStepErrors(errors);
      
      // Check if there are any errors
      const hasErrors = Object.values(errors).some(error => error && error.trim() !== "");
      if (hasErrors) {
        return; // Don't proceed if there are errors
      }
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setSubmitError(null); // Clear errors when moving to next step
      setStepErrors({}); // Clear step errors
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSubmitError(null); // Clear errors when going back
    }
  };
  
  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      
      // Validate required fields
      if (!formData.propertyTitle || !formData.propertyType || !formData.propertyDescription) {
        setSubmitError("Please fill in all required fields in Basic Information step.");
        setCurrentStep(1);
        return;
      }
      
      if (!formData.address || !formData.city || !formData.postcode) {
        setSubmitError("Please fill in all required fields in Location step.");
        setCurrentStep(2);
        return;
      }
      
      if (!formData.monthlyRent) {
        setSubmitError("Please fill in monthly rent in Rent Details step.");
        setCurrentStep(3);
        return;
      }

      // Transform form data to API format
      const apiData = transformFormDataToAPI(formData);
      
      // Dispatch Redux action to create property
      const result = await dispatch(createNewProperty(apiData)).unwrap();
      
      // Get property ID from response
      const propertyId = result?.data?._id || result?.data?.id || result?._id || result?.id;
      
      if (!propertyId) {
        setSubmitError("Property created but could not retrieve property ID.");
        return;
      }

      setCreatedPropertyId(propertyId);

      // Upload media files if any images/videos are selected
      if (formData.images && formData.images.length > 0) {
        try {
          // Filter only image and video files
          const mediaFiles = formData.images
            .map((img) => img.file)
            .filter((file) => {
              if (!file || !(file instanceof File)) return false;
              const fileType = file.type.toLowerCase();
              return fileType.startsWith("image/") || fileType.startsWith("video/");
            });

          if (mediaFiles.length > 0) {
            // Separate images and videos
            const imageFiles = mediaFiles.filter((file) =>
              file.type.toLowerCase().startsWith("image/")
            );
            const videoFiles = mediaFiles.filter((file) =>
              file.type.toLowerCase().startsWith("video/")
            );

            // Upload images first (if any)
            if (imageFiles.length > 0) {
              const imageFormData = new FormData();
              imageFiles.forEach((file) => {
                imageFormData.append("files", file);
              });
              imageFormData.append("mediaType", "image");
              // Set first image as primary
              imageFormData.append("isPrimary", "true");
              await uploadMultiplePropertyMedia(propertyId, imageFormData);
            }

            // Upload videos (if any)
            if (videoFiles.length > 0) {
              const videoFormData = new FormData();
              videoFiles.forEach((file) => {
                videoFormData.append("files", file);
              });
              videoFormData.append("mediaType", "video");
              // Don't set primary for videos if images exist
              if (imageFiles.length === 0) {
                videoFormData.append("isPrimary", "true");
              }
              await uploadMultiplePropertyMedia(propertyId, videoFormData);
            }
          }
        } catch (mediaError) {
          console.error("Error uploading media:", mediaError);
          // Don't fail the entire submission if media upload fails
          // Property is already created, just show a warning
          setSubmitError(
            "Property created successfully, but some media files failed to upload. You can upload them later."
          );
        }
      }

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating property:", error);
      setSubmitError(
        error?.message || 
        error?.error?.message || 
        "Failed to create property. Please try again."
      );
    }
  };
  const handleAddCharge = () => {
    setFormData({
      ...formData,
      additionalCharges: [
        ...formData.additionalCharges,
        { type: "", amount: "" },
      ],
    });
  };
  const handleRemoveCharge = (index) => {
    setFormData({
      ...formData,
      additionalCharges: formData.additionalCharges.filter(
        (_, i) => i !== index
      ),
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
  const handleGenerateAI = () => {
    let generatedContent = "";
    if (currentStep === 1) {
      generatedContent =
        "Beautiful, modern apartment in the heart of Manchester city centre. This stunning 2-bedroom property features contemporary design, floor-to-ceiling windows with city views, and high-quality finishes throughout. Perfect for professionals or couples looking for city living at its finest.";
    } else if (currentStep === 6) {
      generatedContent =
        "We are looking for responsible, professional tenants who will treat this property as their own. Ideal candidates are working professionals or couples with stable income, good references, and a commitment to maintaining the property in excellent condition.";
    } else {
      generatedContent =
        "Beautiful, modern property with excellent features and amenities.";
    }
    setAiDescription(generatedContent);
  };
  const handleSaveAIContent = (field) => {
    // Mark description as AI-generated if it's the property description field
    if (field === "propertyDescription") {
      setIsDescriptionAIGenerated(true);
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            setFormData={setFormData}
            setShowAIModal={setShowAIModal}
            errors={stepErrors}
            setErrors={setStepErrors}
          />
        );
      case 2:
        return (
          <LocationStep
            formData={formData}
            setFormData={setFormData}
            errors={stepErrors}
            setErrors={setStepErrors}
          />
        );
      case 3:
        return (
          <RentDetailsStep
            formData={formData}
            setFormData={setFormData}
            handleAddCharge={handleAddCharge}
            handleRemoveCharge={handleRemoveCharge}
            errors={stepErrors}
            setErrors={setStepErrors}
          />
        );
      case 4:
        return (
          <AmenitiesUtilitiesStep
            formData={formData}
            setFormData={setFormData}
            handleToggleAmenity={handleToggleAmenity}
            handleAddOtherAmenity={handleAddOtherAmenity}
            handleRemoveOtherAmenity={handleRemoveOtherAmenity}
            errors={stepErrors}
            setErrors={setStepErrors}
          />
        );
      case 5:
        return (
          <UploadImagesStep 
            formData={formData} 
            setFormData={setFormData}
            errors={stepErrors}
            setErrors={setStepErrors}
          />
        );
      case 6:
        return (
          <RenterDescriptionStep
            formData={formData}
            setFormData={setFormData}
            setShowAIModal={setShowAIModal}
          />
        );
      case 7:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="block">
        {/* Page Header */}
        <div className="mb-3">
          <h1 className="text-xl md:text-2xl font-bold text-secondary mb-0">
            Add New Property
          </h1>
          <p className="text-sm md:text-base text-darkGray">
            Complete all steps to list your property
          </p>
        </div>
        <Breadcrumb />
        <ProgressIndicator steps={steps} currentStep={currentStep} />

        <div className="bg-white rounded-[20px] border border-lightGray p-4">
          {renderStepContent()}

          {/* Error Display */}
          {(submitError || propertyError) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                {submitError || propertyError?.message || "An error occurred. Please try again."}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-6   ">
            <button
              onClick={() => navigate("/dashboard/properties")}
              className="px-4 md:px-6 py-1.5 font-nunito border border-[#F1F1F1] rounded-[10px] text-base text-secondary font-bold bg-[#F1F1F1] transition-colors"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 md:px-6  py-1.5 font-nunito border-2 border-[#6B4EFF] text-[#6B4EFF] rounded-[10px] font-semibold  transition-colors"
                >
                  Back
                </button>
              )}
              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  className="px-4 md:px-6  py-1.5 font-nunito bg-blueGradient text-base font-bold text-white rounded-[10px] hover:bg-opacity-90 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={creating}
                  className="px-4 md:px-6 md:py-3 py-2 bg-[#6B4EFF] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AIModal
        showAIModal={showAIModal}
        setShowAIModal={setShowAIModal}
        formData={formData}
        setFormData={setFormData}
        aiDescription={aiDescription}
        setAiDescription={setAiDescription}
        handleGenerateAI={handleGenerateAI}
        handleSaveAIContent={handleSaveAIContent}
        currentStep={currentStep}
        setIsDescriptionAIGenerated={setIsDescriptionAIGenerated}
      />

      <SuccessModal
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        formData={formData}
        propertyId={createdPropertyId}
      />
    </DashboardLayout>
  );
}

export default AddProperty;
