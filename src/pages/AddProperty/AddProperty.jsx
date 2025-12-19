import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { addPropertySteps } from "@/constant";

function AddProperty() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [formData, setFormData] = useState({
    propertyTitle: "",
    propertyType: "",
    propertyDescription: "",
    bedrooms: "",
    bathrooms: "",
    address: "",
    city: "",
    county: "",
    postcode: "",
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
  });

  const steps = addPropertySteps;
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
  const handleSaveAIContent = () => {
    // This is now handled in AIModal based on currentStep
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            setFormData={setFormData}
            setShowAIModal={setShowAIModal}
          />
        );
      case 2:
        return <LocationStep formData={formData} setFormData={setFormData} />;
      case 3:
        return (
          <RentDetailsStep
            formData={formData}
            setFormData={setFormData}
            handleAddCharge={handleAddCharge}
            handleRemoveCharge={handleRemoveCharge}
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
          />
        );
      case 5:
        return (
          <UploadImagesStep formData={formData} setFormData={setFormData} />
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
                  className="px-4 md:px-6 md:py-3 py-2 bg-[#6B4EFF] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Submit
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
      />

      <SuccessModal
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        formData={formData}
      />
    </DashboardLayout>
  );
}

export default AddProperty;
