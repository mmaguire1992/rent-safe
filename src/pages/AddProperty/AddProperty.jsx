import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CustomDropdown from "@/components/common/CustomDropdown";
import FileUpload from "@/components/FileUpload";
import ProgressIndicator from "@/components/AddProperty/ProgressIndicator";
import AIModal from "@/components/AddProperty/AIModal";
import SuccessModal from "@/components/AddProperty/SuccessModal";
import {
  FiHome,
  FiMapPin,
  FiDollarSign,
  FiWifi,
  FiUpload,
  FiUser,
  FiCheck,
  FiX,
  FiCalendar,
  FiPlus,
} from "react-icons/fi";
import {
  addPropertySteps,
  addPropertyTypeOptions,
  addPropertyCityOptions,
  countyOptions,
  chargeTypeOptions,
  preferredRenterTypeOptions,
  amenitiesList,
  utilitiesList,
} from "@/constant";

function AddProperty() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [formData, setFormData] = useState({
    // Basic Info
    propertyTitle: "",
    propertyType: "",
    propertyDescription: "",
    bedrooms: "",
    bathrooms: "",
    // Location
    address: "",
    city: "",
    county: "",
    postcode: "",
    // Rent Details
    monthlyRent: "",
    availableFrom: "",
    additionalCharges: [],
    furnishedStatus: "",
    // Amenities & Utilities
    amenities: [],
    otherAmenities: [],
    utilities: [],
    // Images
    images: [],
    // Renter Description
    renterProfileDescription: "",
    preferredRenterType: "",
    additionalRequirements: "",
  });

  const steps = addPropertySteps;
  const propertyTypeOptions = addPropertyTypeOptions;
  const cityOptions = addPropertyCityOptions;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Handle final submission
    console.log("Submitting property:", formData);
    setShowSuccessModal(true);
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
      additionalCharges: formData.additionalCharges.filter((_, i) => i !== index),
    });
  };

  const handleAddOtherAmenity = () => {
    const amenity = prompt("Enter amenity name:");
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
    // Simulate AI generation
    setAiDescription(
      "Beautiful, modern apartment in the heart of Manchester city centre. This stunning 2-bedroom property features contemporary design, floor-to-ceiling windows with city views, and high-quality finishes throughout. Perfect for professionals or couples looking for city living at its finest."
    );
  };

  const handleSaveAIContent = () => {
    if (aiDescription) {
      setFormData({
        ...formData,
        propertyDescription: aiDescription,
      });
      setShowAIModal(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-darkGray">
          <button
            onClick={() => navigate("/dashboard/properties")}
            className="hover:text-secondary"
          >
            My Properties
          </button>
          <span>/</span>
          <span className="text-secondary font-semibold">Add New Property</span>
        </div>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">
            Add New Property
          </h1>
          <p className="text-darkGray">
            Complete all steps to list your property
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-2">
                  Basic Information
                </h2>
                <p className="text-darkGray">
                  Manage and track your rental listings
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-secondary mb-2">
                    Property Title
                  </label>
                  <input
                    type="text"
                    value={formData.propertyTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, propertyTitle: e.target.value })
                    }
                    placeholder="Enter your property title"
                    className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-secondary mb-2">
                    Property Type
                  </label>
                  <CustomDropdown
                    options={propertyTypeOptions}
                    value={formData.propertyType}
                    onChange={(value) =>
                      setFormData({ ...formData, propertyType: value })
                    }
                    placeholder="Select your property type"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-base font-semibold text-secondary">
                      Property Description
                    </label>
                    <button
                      onClick={() => setShowAIModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#6B4EFF] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                      AI Content Generator
                    </button>
                  </div>
                  <textarea
                    value={formData.propertyDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        propertyDescription: e.target.value,
                      })
                    }
                    placeholder="Enter your property description"
                    rows="6"
                    className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-semibold text-secondary mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bedrooms: e.target.value })
                      }
                      placeholder="Enter number of bedrooms"
                      min="0"
                      className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-secondary mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bathrooms: e.target.value })
                      }
                      placeholder="Enter number of bathrooms"
                      min="0"
                      className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-2">
                  Location Details
                </h2>
                <p className="text-darkGray">
                  Where is your property located?
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-semibold text-secondary mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Enter your address"
                      className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-secondary mb-2">
                      City
                    </label>
                    <CustomDropdown
                      options={cityOptions}
                      value={formData.city}
                      onChange={(value) =>
                        setFormData({ ...formData, city: value })
                      }
                      placeholder="Enter your city"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-secondary mb-2">
                      County
                    </label>
                    <CustomDropdown
                      options={countyOptions}
                      value={formData.county}
                      onChange={(value) =>
                        setFormData({ ...formData, county: value })
                      }
                      placeholder="Enter your country"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-secondary mb-2">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={formData.postcode}
                      onChange={(e) =>
                        setFormData({ ...formData, postcode: e.target.value })
                      }
                      placeholder="Enter your postcode"
                      className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-secondary mb-2">
                    Map preview
                  </label>
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-lightGray">
                    <div className="text-center">
                      <FiMapPin className="text-[#6B4EFF] text-4xl mx-auto mb-2" />
                      <p className="text-darkGray">
                        Location will be shown based on postcode
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Rent Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-2">
                  Rent Details
                </h2>
                <p className="text-darkGray">Set your pricing details</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-secondary mb-2">
                    Monthly Rent (€)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyRent: e.target.value })
                    }
                    placeholder="Enter your monthly rent"
                    className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-secondary mb-2">
                    Available From
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.availableFrom}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availableFrom: e.target.value,
                        })
                      }
                      placeholder="MM/DD/YYYY"
                      className="w-full px-4 py-3 pr-12 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                    />
                    <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray" />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-secondary mb-2">
                    Additional Charges
                  </label>
                  {formData.additionalCharges.map((charge, index) => (
                    <div key={index} className="flex gap-3 mb-3">
                      <div className="flex-1">
                        <CustomDropdown
                          options={chargeTypeOptions}
                          value={charge.type}
                          onChange={(value) => {
                            const newCharges = [...formData.additionalCharges];
                            newCharges[index].type = value;
                            setFormData({ ...formData, additionalCharges: newCharges });
                          }}
                          placeholder="Select an option"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={charge.amount}
                          onChange={(e) => {
                            const newCharges = [...formData.additionalCharges];
                            newCharges[index].amount = e.target.value;
                            setFormData({
                              ...formData,
                              additionalCharges: newCharges,
                            });
                          }}
                          placeholder="Charges (€)"
                          className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveCharge(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddCharge}
                    className="flex items-center gap-2 px-4 py-2 border border-[#6B4EFF] text-[#6B4EFF] rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <FiPlus />
                    <span>Add Charge</span>
                  </button>
                </div>

                <div>
                  <label className="block text-base font-semibold text-secondary mb-2">
                    Furnished Status
                  </label>
                  <div className="flex gap-4">
                    {["Furnished", "Unfurnished", "Semi-furnished"].map(
                      (status) => (
                        <label
                          key={status}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="furnishedStatus"
                            value={status.toLowerCase()}
                            checked={formData.furnishedStatus === status.toLowerCase()}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                furnishedStatus: e.target.value,
                              })
                            }
                            className="w-4 h-4 text-[#6B4EFF] focus:ring-[#6B4EFF]"
                          />
                          <span className="text-secondary">{status}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Amenities & Utilities */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-2">
                  Amenities & Utilities
                </h2>
                <p className="text-darkGray">Set your pricing details</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {amenitiesList.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleToggleAmenity(amenity)}
                        className="w-4 h-4 text-[#6B4EFF] rounded focus:ring-[#6B4EFF]"
                      />
                      <span className="text-sm text-secondary">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  Other Amenities
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.otherAmenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-[#6B4EFF] rounded-full text-sm"
                    >
                      {amenity}
                      <button
                        onClick={() => handleRemoveOtherAmenity(index)}
                        className="text-[#6B4EFF] hover:text-red-600"
                      >
                        <FiX className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={handleAddOtherAmenity}
                  className="flex items-center gap-2 px-4 py-2 border border-[#6B4EFF] text-[#6B4EFF] rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <FiPlus />
                  <span>Add</span>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  Utilities
                </h3>
                {formData.utilities.map((utility, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <CustomDropdown
                        options={utilitiesList}
                        value={utility}
                        onChange={(value) => {
                          const newUtilities = [...formData.utilities];
                          newUtilities[index] = value;
                          setFormData({ ...formData, utilities: newUtilities });
                        }}
                        placeholder="Select an option"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          utilities: formData.utilities.filter((_, i) => i !== index),
                        });
                      }}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      utilities: [...formData.utilities, ""],
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-[#6B4EFF] text-[#6B4EFF] rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <FiPlus />
                  <span>Add Utility</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Upload Images */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-2">
                  Property Images
                </h2>
                <p className="text-darkGray">
                  Upload high-quality photos of your property
                </p>
              </div>

              <FileUpload
                onFilesChange={(files) => {
                  setFormData({ ...formData, images: files });
                }}
                acceptedTypes=".jpg,.jpeg,.png,.webp"
                maxFiles={10}
                uploadedFiles={formData.images}
              />

              {formData.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-4">
                    Image Thumbnails
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {formData.images.map((image, index) => {
                      const imageUrl =
                        image instanceof File
                          ? URL.createObjectURL(image)
                          : image.url || image;
                      return (
                        <div
                          key={index}
                          className="relative border border-lightGray rounded-lg overflow-hidden"
                        >
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-[#6B4EFF] text-white text-xs px-2 py-1 rounded z-10">
                              Main
                            </span>
                          )}
                          <img
                            src={imageUrl}
                            alt={`Property image ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          <button
                            onClick={() => {
                              setFormData({
                                ...formData,
                                images: formData.images.filter((_, i) => i !== index),
                              });
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 z-10"
                          >
                            <FiX className="text-xs" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Renter Description */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-2">
                  Renter Description
                </h2>
                <p className="text-darkGray">
                  Describe what type of renter you are looking for your property
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-base font-semibold text-secondary">
                      Renter Profile Description
                    </label>
                    <button
                      onClick={() => setShowAIModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#6B4EFF] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                      AI Content Generator
                    </button>
                  </div>
                  <textarea
                    value={formData.renterProfileDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        renterProfileDescription: e.target.value,
                      })
                    }
                    placeholder="Enter your property description"
                    rows="6"
                    className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-secondary mb-2">
                    Preferred Renter Type
                  </label>
                  <CustomDropdown
                    options={preferredRenterTypeOptions}
                    value={formData.preferredRenterType}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        preferredRenterType: value,
                      })
                    }
                    placeholder="Select an option"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-secondary mb-2">
                    Additional Requirements
                  </label>
                  <textarea
                    value={formData.additionalRequirements}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additionalRequirements: e.target.value,
                      })
                    }
                    placeholder="Enter Additional Requirements"
                    rows="6"
                    className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Review */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-2">
                  Review Your Property
                </h2>
                <p className="text-darkGray">
                  Review all details before submitting
                </p>
              </div>

              {/* Property Overview */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-secondary mb-4">
                  {formData.propertyTitle || "2-Bed Apartment in City Centre"}
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-darkGray">
                    <FiMapPin />
                    <span className="text-sm">
                      {formData.address || "45 Deansgate, Manchester, M3 2AY"}
                    </span>
                  </div>
                  <span className="text-sm text-darkGray">
                    {formData.bedrooms || "2"} beds
                  </span>
                  <span className="text-sm text-darkGray">
                    {formData.bathrooms || "2"} baths
                  </span>
                </div>
                {formData.images.length > 0 && (
                  <div className="mb-4">
                    <img
                      src={
                        formData.images[0] instanceof File
                          ? URL.createObjectURL(formData.images[0])
                          : formData.images[0].url || formData.images[0]
                      }
                      alt="Property"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                <p className="text-darkGray mb-4">
                  {formData.propertyDescription ||
                    "Beautiful, modern apartment in the heart of Manchester city centre..."}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-darkGray mb-1">Monthly Rent</p>
                    <p className="text-sm font-semibold text-secondary">
                      {formData.monthlyRent
                        ? `€${formData.monthlyRent}`
                        : "€900"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Property Type</p>
                    <p className="text-sm font-semibold text-secondary">
                      {formData.propertyType || "Flat/Apartment"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">
                      Furnished Status
                    </p>
                    <p className="text-sm font-semibold text-secondary">
                      {formData.furnishedStatus || "Furnished"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">
                      Available From
                    </p>
                    <p className="text-sm font-semibold text-secondary">
                      {formData.availableFrom || "15th Nov 2025"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amenities Summary */}
              {formData.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-4">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.slice(0, 4).map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-[#6B4EFF] rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                    {formData.amenities.length > 4 && (
                      <span className="px-3 py-1 bg-gray-100 text-darkGray rounded-full text-sm">
                        +{formData.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Utilities Summary */}
              {formData.utilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-4">
                    Utilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.utilities.map((utility, index) => {
                      const utilityLabel =
                        utilitiesList.find((u) => u.value === utility)?.label ||
                        utility;
                      return (
                        <span
                          key={index}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                        >
                          {utilityLabel}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-lightGray">
            <button
              onClick={() => navigate("/dashboard/properties")}
              className="px-6 py-3 border border-lightGray rounded-lg text-secondary font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border-2 border-[#6B4EFF] text-[#6B4EFF] rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  Back
                </button>
              )}
              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[#6B4EFF] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-[#6B4EFF] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Content Generator Modal */}
      <AIModal
        showAIModal={showAIModal}
        setShowAIModal={setShowAIModal}
        formData={formData}
        setFormData={setFormData}
        aiDescription={aiDescription}
        setAiDescription={setAiDescription}
        handleGenerateAI={handleGenerateAI}
        handleSaveAIContent={handleSaveAIContent}
      />

      {/* Success Modal */}
      <SuccessModal
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        formData={formData}
      />
    </DashboardLayout>
  );
}

export default AddProperty;

