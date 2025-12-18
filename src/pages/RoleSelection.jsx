import { useState } from "react";
import { useNavigate } from "react-router-dom";
import mainLogo from "@/assests/images/mainLogo.png";
import AuthLayout from "@/components/AuthLayout";
import ProgressIndicator from "@/components/adminDashboard/common/ProgressIndicator";

function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState("renter");
  const navigate = useNavigate();

  const handleNext = () => {
    if (selectedRole === "owner") {
      navigate("/signup/owner/basic-info");
    } else if (selectedRole === "renter") {
      navigate("/signup/renter/basic-info");
    }
  };

  return (
    <AuthLayout>
      <div className="block max-w-[420px] mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <img src={mainLogo} alt="Logo" className="justify-center" />
        </div>

        {/* Title */}
        <div className="text-left mb-4">
          <h1 className="text-3xl lg:text-[36px] lg:leading-[45px] font-bold text-secondary mb-2">
            Create Your Account
          </h1>
          <p className="text-darkGray text-lg font-normal">
            Choose how you want to use Rent Safe. Your experience will be
            tailored to help you rent or list properties securely.
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={1} totalSteps={3} />

        {/* Role Selection */}
        <div className="mb-4">
          <h2 className="text-base font-semibold text-secondary mb-1">
            Select Your Role
          </h2>
          <div className=" flex items-center sm:flex-row flex-col sm:justify-between justify-center gap-4">
            {/* Renter Option */}
            <button
              onClick={() => setSelectedRole("renter")}
              className={`w-full px-4 py-2 border-2 h-[52px] rounded-xl text-left transition-all flex items-center sm:justify-between justify-center ${
                selectedRole === "renter"
                  ? "border-primary bg-white"
                  : "border-lightGray bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm sm:text-base font-medium ${
                    selectedRole === "renter"
                      ? "text-primary"
                      : "text-secondary"
                  }`}
                >
                  I am a Renter
                </span>
                {/* {selectedRole === "renter" && (
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )} */}
              </div>
            </button>

            {/* Owner/Agent Option */}
            <button
              onClick={() => setSelectedRole("owner")}
              className={`w-full px-2 sm:px-4 py-2 border-2 h-[52px] rounded-xl text-left transition-all flex items-center sm:justify-between justify-center ${
                selectedRole === "owner"
                  ? "border-primary bg-white"
                  : "border-lightGray bg-white"
              }`}
            >
              <div className="flex items-center sm:justify-between justify-center">
                <span
                  className={`text-sm sm:text-base font-medium ${
                    selectedRole === "owner" ? "text-primary" : "text-secondary"
                  }`}
                >
                  I am an Owner/Agent
                </span>
                {/* {selectedRole === "owner" && (
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )} */}
              </div>
            </button>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-full bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033]"
        >
          Next
        </button>
      </div>
    </AuthLayout>
  );
}

export default RoleSelection;
