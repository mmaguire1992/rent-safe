import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import ProgressIndicator from "@/components/adminDashboard/common/ProgressIndicator";
import FileUpload from "@/components/FileUpload";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import mainLogo from "@/assests/images/mainLogo.png";

function VerifyAccount() {
  const [idProofFiles, setIdProofFiles] = useState([]);
  const [propertyDocFiles, setPropertyDocFiles] = useState([]);
  const [licenseFiles, setLicenseFiles] = useState([]);
  const [documentType, setDocumentType] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.formData || {};

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate account creation
    // In real app, this would upload files and create account via API
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  const handleSkip = () => {
    // Navigate to dashboard even if documents are skipped
    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <div className="block max-w-[420px] mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <img src={mainLogo} alt="Logo" className="justify-center" />
        </div>

        {/* Title */}
        <div className="text-left mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] lg:leading-[45px] font-bold text-secondary mb-2">
            Verify Your Account
          </h1>
          <p className="text-darkGray text-base md:text-lg font-normal">
            Upload your documents to ensure a safe and secure Rent Safe
            experience.
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={3} totalSteps={3} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ID Proof */}
          <div>
            <label className="block text-base font-medium text-secondary mb-1">
              ID Proof
            </label>
            <div className="mb-3">
              <CustomDropdown
                options={[
                  { value: "passport", label: "Passport" },
                  { value: "driving-license", label: "Driving License" },
                  { value: "national-id", label: "National ID" },
                  { value: "other", label: "Other" },
                ]}
                value={documentType}
                onChange={setDocumentType}
                placeholder="Select your document type"
              />
            </div>
            <FileUpload
              label=""
              acceptedTypes=".pdf,.docx,.png"
              maxFiles={3}
              onFilesChange={setIdProofFiles}
              uploadedFiles={idProofFiles}
            />
          </div>

          {/* Property Documents */}
          <div>
            <FileUpload
              label="Property Documents"
              acceptedTypes=".pdf,.docx,.png"
              maxFiles={3}
              onFilesChange={setPropertyDocFiles}
              uploadedFiles={propertyDocFiles}
            />
          </div>

          {/* Estate Agent License (Optional) */}
          <div>
            <FileUpload
              label="Estate Agent License (if applicable)"
              acceptedTypes=".pdf,.docx,.png"
              maxFiles={3}
              onFilesChange={setLicenseFiles}
              uploadedFiles={licenseFiles}
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full bg-blueGradient text-white font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033]"
          >
            Sign Up
          </button>
        </form>

        {/* Skip Link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="text-gray-600 hover:text-darkGray text-base font-bold"
          >
            Skip
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

export default VerifyAccount;
