'use client'

import { useState, useEffect, useRef, useMemo } from "react";
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
import VerificationSubscriptionModal from "@/components/common/VerificationSubscriptionModal";
import { addPropertySteps, amenitiesList } from "@/constant";
import { createNewProperty } from '@/redux/slices/propertySlice';
import { uploadMultiplePropertyMedia } from '@/api/properties';
import { saveAddWizard, clearAddWizard } from '@/redux/slices/propertyWizardSlice';
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser } from "@/api/users";
import { getCurrentSubscription } from "@/api/subscriptions";
import { toast } from "react-toastify";

function AddProperty() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { creating, error: propertyError } = useSelector((state) => state.property);
  const wizardAdd = useSelector((state) => state.propertyWizard?.add);
  const { user, userType } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [wizardFinalized, setWizardFinalized] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  // Store fetched data to pass to modal (prevents duplicate API calls)
  const [userData, setUserData] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [aiDescription, setAiDescription] = useState("");
  const [createdPropertyId, setCreatedPropertyId] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isDescriptionAIGenerated, setIsDescriptionAIGenerated] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Track entire submission process (property + media)
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
    coordinates: [], // [longitude, latitude]
  });

  const isWizardDirty = useMemo(() => {
    if (wizardFinalized) return false;
    if (isSubmitting || creating) return false;
    if (currentStep > 1) return true;
    // Check if any meaningful field has been filled
    const fd = formData || {};
    const keysToIgnore = new Set(['images']);
    for (const [key, value] of Object.entries(fd)) {
      if (keysToIgnore.has(key)) continue;
      if (Array.isArray(value)) {
        if (value.length > 0 && !(value.length === 1 && value[0] === '')) return true;
      } else if (typeof value === 'object' && value) {
        // additionalCharges etc.
        if (JSON.stringify(value) !== JSON.stringify(undefined) && Object.keys(value).length > 0) {
          // handle default additionalCharges
          if (key === 'additionalCharges') {
            const normalized = Array.isArray(value) ? value : [];
            const hasAny = normalized.some((c) => (c?.type && String(c.type).trim()) || (c?.amount && String(c.amount).trim()));
            if (hasAny) return true;
          } else {
            return true;
          }
        }
      } else if (typeof value === 'string') {
        if (value.trim() !== '') return true;
      } else if (value !== null && value !== undefined && value !== '') {
        return true;
      }
    }
    return false;
  }, [wizardFinalized, currentStep, formData, isSubmitting, creating]);

  const isWizardDirtyRef = useRef(false);
  useEffect(() => {
    isWizardDirtyRef.current = isWizardDirty;
  }, [isWizardDirty]);

  // Register a global navigation blocker so sidebar/header navigation prompts before leaving
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const owner = 'AddProperty';
    window.__rentsafe_navBlocker = {
      owner,
      shouldBlock: () => isWizardDirtyRef.current,
      request: (nav) => {
        setPendingNavigation(nav);
        setShowLeaveModal(true);
      },
    };
    return () => {
      if (window.__rentsafe_navBlocker?.owner === owner) {
        window.__rentsafe_navBlocker = null;
      }
    };
  }, []);

  // Restore wizard state on first mount (prevents refresh from resetting to step 1)
  const hasRestoredWizardRef = useRef(false);
  useEffect(() => {
    if (hasRestoredWizardRef.current) return;
    hasRestoredWizardRef.current = true;

    if (wizardAdd?.currentStep) {
      setCurrentStep(wizardAdd.currentStep);
    }
    if (wizardAdd?.formData) {
      // Deep-clone to avoid Immer-frozen objects from Redux (prevents "read only property" errors)
      const restoredFormData = JSON.parse(JSON.stringify(wizardAdd.formData));
      setFormData((prev) => ({
        ...prev,
        ...restoredFormData,
        // New uploads cannot be restored after refresh
        images: prev.images,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave wizard state (serializable only) so refresh doesn't lose progress
  const canAutosaveWizardRef = useRef(false);
  useEffect(() => {
    if (!canAutosaveWizardRef.current) {
      // enable after first render so we don't overwrite an existing saved wizard with defaults
      canAutosaveWizardRef.current = true;
      return;
    }
    dispatch(
      saveAddWizard({
        currentStep,
        // only serializable data (Files can't be stored/restored after refresh)
        formData: { ...formData, images: [] },
      })
    );
  }, [currentStep, formData, dispatch]);

  // Check verification and subscription status on mount
  useEffect(() => {
    const checkAccess = async () => {
      // Only check for owners
      if (userType !== 'owner') {
        setCheckingAccess(false);
        return;
      }

      try {
        // Fetch fresh user data (includes subscriptionId)
        const fetchedUserData = await getCurrentUser();
        setUserData(fetchedUserData);

        // Check verification status from userData
        const isVerified = fetchedUserData?.userInfo?.verificationStatus === 'verified';
        setNeedsVerification(!isVerified);

        // Check subscription status
        let subscription = null;
        let hasActiveSubscription = false;
        try {
          subscription = await getCurrentSubscription();
          setSubscriptionData(subscription);
          // Check if subscription exists and is active with remaining properties
          // Handle both 'active' and 'activate' status (backend may use 'activate')
          const isActiveStatus = subscription.status === 'active' || subscription.status === 'activate';
          if (subscription &&
            isActiveStatus &&
            subscription.remainingProperties !== undefined &&
            subscription.remainingProperties > 0) {
            hasActiveSubscription = true;
          }
        } catch (error) {
          // If 404, no subscription exists
          if (error.response?.status !== 404) {
            console.error('Error checking subscription:', error);
          }
          setSubscriptionData(null);
        }
        setNeedsSubscription(!hasActiveSubscription);

        // Show modal if user needs verification or subscription
        if (!isVerified || !hasActiveSubscription) {
          setShowVerificationModal(true);
        }
      } catch (error) {
        console.error('Error checking verification and subscription:', error);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [userType, user?.id]);

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
      if (data.preferredRenterTypes && Array.isArray(data.preferredRenterTypes) && data.preferredRenterTypes.length > 0) {
        const typesString = data.preferredRenterTypes.join(", ");
        idealRenterProfile += ` Preferred renter type: ${typesString}.`;
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
      status: "pending_approval", // Default to pending approval
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
    const errors = { ...stepErrors }; // Preserve existing errors from BasicInfoStep

    if (!formData.propertyTitle || !formData.propertyTitle.trim()) {
      errors.propertyTitle = "Property Title is required";
    }
    if (!formData.propertyType || !formData.propertyType.trim()) {
      errors.propertyType = "Property Type is required";
    }
    if (!formData.propertyDescription || !formData.propertyDescription.trim()) {
      errors.propertyDescription = "Property Description is required";
    }

    // Validate bedrooms - check original input if available, otherwise check cleaned value
    const bedroomsOriginal = formData.bedroomsOriginal || formData.bedrooms;
    if (!formData.bedrooms || formData.bedrooms === "") {
      errors.bedrooms = "Bedrooms is required";
    } else {
      // Check if original input had invalid characters (before cleaning)
      const originalValue = bedroomsOriginal.toString().trim();
      if (originalValue !== "" && !/^\d+$/.test(originalValue)) {
        errors.bedrooms = "Please enter a valid bedroom number";
      } else {
        // Check if cleaned value is valid
        const isValidNumber = /^\d+$/.test(formData.bedrooms.toString().trim());
        if (!isValidNumber || parseInt(formData.bedrooms) < 0) {
          errors.bedrooms = "Please enter a valid bedroom number";
        }
      }
    }

    // Validate bathrooms - check original input if available, otherwise check cleaned value
    const bathroomsOriginal = formData.bathroomsOriginal || formData.bathrooms;
    if (!formData.bathrooms || formData.bathrooms === "") {
      errors.bathrooms = "Bathrooms is required";
    } else {
      // Check if original input had invalid characters (before cleaning)
      const originalValue = bathroomsOriginal.toString().trim();
      if (originalValue !== "" && !/^\d+$/.test(originalValue)) {
        errors.bathrooms = "Please enter a valid bathroom number";
      } else {
        // Check if cleaned value is valid
        const isValidNumber = /^\d+$/.test(formData.bathrooms.toString().trim());
        if (!isValidNumber || parseInt(formData.bathrooms) < 0) {
          errors.bathrooms = "Please enter a valid bathroom number";
        }
      }
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
    if (!formData.state || !formData.state.trim()) {
      errors.state = "State/Province is required";
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
      errors.monthlyRent = "Monthly rent cannot be empty";
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
      setIsSubmitting(true); // Start loading state

      // Validate required fields
      if (!formData.propertyTitle || !formData.propertyType || !formData.propertyDescription) {
        setSubmitError("Please fill in all required fields in Basic Information step.");
        setCurrentStep(1);
        setIsSubmitting(false);
        return;
      }

      if (!formData.address || !formData.city || !formData.postcode) {
        setSubmitError("Please fill in all required fields in Location step.");
        setCurrentStep(2);
        setIsSubmitting(false);
        return;
      }

      if (!formData.monthlyRent) {
        setSubmitError("Please fill in monthly rent in Rent Details step.");
        setCurrentStep(3);
        setIsSubmitting(false);
        return;
      }

      // Transform form data to API format
      const apiData = transformFormDataToAPI(formData);

      // Step 1: Create property first
      const result = await dispatch(createNewProperty(apiData)).unwrap();

      // Get property ID from response
      const propertyId = result?.data?._id || result?.data?.id || result?._id || result?.id;

      if (!propertyId) {
        setSubmitError("Property created but could not retrieve property ID.");
        return;
      }

      setCreatedPropertyId(propertyId);

      // Step 2: Upload media files if any images/videos are selected
      let mediaUploadSuccess = true;
      let mediaUploadError = null;

      if (formData.images && formData.images.length > 0) {
        try {
          // Filter only valid image files (strict validation)
          const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
          const mediaFiles = formData.images
            .map((img) => img.file)
            .filter((file) => {
              if (!file || !(file instanceof File)) return false;
              const fileType = file.type.toLowerCase();
              // Only accept specific image types that API supports
              return allowedImageTypes.includes(fileType);
            });

          // Check if any files were filtered out
          const invalidFiles = formData.images
            .map((img) => img.file)
            .filter((file) => {
              if (!file || !(file instanceof File)) return true;
              const fileType = file.type.toLowerCase();
              return !allowedImageTypes.includes(fileType);
            });

          if (invalidFiles.length > 0) {
            const fileNames = invalidFiles.map(f => f.name).join(', ');
            throw new Error(`Invalid file types: ${fileNames}. Only JPG, PNG, GIF, and WEBP images are allowed.`);
          }

          if (mediaFiles.length > 0) {
            // Upload images
            const imageFormData = new FormData();
            mediaFiles.forEach((file) => {
              imageFormData.append("files", file);
            });
            imageFormData.append("mediaType", "image");
            // Set first image as primary
            imageFormData.append("isPrimary", "true");

            await uploadMultiplePropertyMedia(propertyId, imageFormData);
            mediaUploadSuccess = true;
          }
        } catch (mediaError) {
          console.error("Error uploading media:", mediaError);
          mediaUploadSuccess = false;
          mediaUploadError = mediaError?.response?.data?.error ||
            mediaError?.message ||
            "Failed to upload media files";

          // If media upload fails, show error but don't prevent success modal
          // User can upload media later
          setSubmitError(
            `Property created successfully, but media upload failed: ${mediaUploadError}. You can upload media later from the property edit page.`
          );
        }
      }

      // Step 3: Only show success modal after both property creation AND media upload complete
      // If media upload failed, still show success but with a note
      // Clear draft wizard state now that property is created
      dispatch(clearAddWizard());
      setWizardFinalized(true);
      if (mediaUploadSuccess || !formData.images || formData.images.length === 0) {
        // All good - show success modal
        setShowSuccessModal(true);
      } else {
        // Property created but media failed - still show success but with warning
        // The error message is already set above
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error(error?.response?.data?.error || error?.error || error?.error?.message || "Failed to create property. Please try again.");
      setSubmitError(
        error?.response?.data?.error ||
        error?.error ||
        error?.error?.message ||
        "Failed to create property. Please try again."
      );
    } finally {
      // Always stop loading state when done (success or error)
      setIsSubmitting(false);
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

  // Show loading state while checking access
  if (checkingAccess) {
    return (
      <DashboardLayout>
        <div className="block">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#6B4EFF] border-t-transparent mb-4"></div>
              <p className="text-darkGray">Checking access...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="block">
        <VerificationSubscriptionModal
          isOpen={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false);
            // Redirect back to dashboard if user closes modal
            navigate('/dashboard');
          }}
          needsVerification={needsVerification}
          needsSubscription={needsSubscription}
          userData={userData}
          subscriptionData={subscriptionData}
        />
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
          {(submitError || propertyError?.message) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                {submitError || propertyError?.message}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setShowCancelModal(true)}
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
                  disabled={isSubmitting || creating}
                  className="px-4 md:px-6 md:py-3 py-2 bg-[#6B4EFF] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                >
                  {isSubmitting || creating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>submitting</span>
                    </>
                  ) : (
                    "Submit"
                  )}
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

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          setShowCancelModal(false);
          dispatch(clearAddWizard());
          navigate("/dashboard/properties", { __bypassBlocker: true });
        }}
        title="Cancel Property Creation"
        message="Are you sure you want to cancel? All your progress will be lost if you continue."
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
      />

      <ConfirmationModal
        isOpen={showLeaveModal}
        onClose={() => {
          setShowLeaveModal(false);
          setPendingNavigation(null);
        }}
        onConfirm={() => {
          setShowLeaveModal(false);
          dispatch(clearAddWizard());
          setWizardFinalized(true);
          // proceed with the original navigation attempt
          if (pendingNavigation?.proceed) {
            pendingNavigation.proceed();
          } else if (pendingNavigation?.to !== undefined) {
            // Fallback if proceed not provided
            navigate(pendingNavigation.to, { ...(pendingNavigation.options || {}), __bypassBlocker: true });
          }
          setPendingNavigation(null);
        }}
        title="Discard your changes?"
        message="You have unsaved progress in this property draft. If you leave now, your draft will be discarded."
        confirmText="Discard & Leave"
        cancelText="Stay"
      />
    </DashboardLayout>
  );
}

export default AddProperty;
