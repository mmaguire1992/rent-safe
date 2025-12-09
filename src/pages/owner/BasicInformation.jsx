import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import mainLogo from "@/assests/images/mainLogo.png";
import AuthLayout from "@/components/AuthLayout";
import ProgressIndicator from "@/components/common/ProgressIndicator";
import { BsEyeSlash } from "react-icons/bs";

function BasicInformation() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear any errors - all fields are optional, no validation required
    setErrors({});

    // Navigate to next step with form data - no required fields
    navigate("/signup/owner/verify-account", {
      state: { formData },
    });
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
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] lg:leading-[45px] font-bold text-secondary mb-2">
            Basic Information
          </h1>
          <p className="text-darkGray text-base md:text-lg font-normal">
            Give your profile a proper name and contact info. Contact info will
            be verified.
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={2} totalSteps={3} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-base font-medium text-secondary mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                errors.fullName ? "border-errorColor" : "border-lightGray"
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-errorColor">{errors.fullName}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-base font-medium text-secondary mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                errors.email ? "border-errorColor" : "border-lightGray"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-errorColor">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-base font-medium text-secondary mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                errors.phoneNumber ? "border-errorColor" : "border-lightGray"
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-errorColor">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Company Name (Optional) */}
          <div>
            <label
              htmlFor="companyName"
              className="block text-base font-medium text-secondary mb-1"
            >
              Company Name (if applicable)
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter your company name"
              className="w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0"
            />
          </div>

          {/* Create Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-base font-medium text-secondary mb-1"
            >
              Create Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 pr-12 ${
                  errors.password ? "border-errorColor" : "border-lightGray"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary"
              >
                {showPassword ? (
                  <BsEye className="text-xl" />
                ) : (
                  <BsEyeSlash className="text-xl" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-errorColor">{errors.password}</p>
            )}
          </div>

          {/* Re-enter Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-base font-medium text-secondary mb-1"
            >
              Re-enter Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 pr-12 ${
                  errors.confirmPassword
                    ? "border-errorColor"
                    : "border-lightGray"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <BsEye className="text-xl" />
                ) : (
                  <BsEyeSlash className="text-xl" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-errorColor">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Next Button */}
          <button
            type="submit"
            className="w-full bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033]"
          >
            Next
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default BasicInformation;
