import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import mainLogo from "@/assests/images/mainLogo.png";
import AuthLayout from "@/components/AuthLayout";
import ProgressIndicator from "@/components/common/ProgressIndicator";

function RenterBasicInformation() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    occupation: "",
    monthlyIncome: "",
    education: "",
    description: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
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
    navigate("/signup/renter/share-thoughts", {
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
            Build your verified renter profile to safely connect with genuine
            landlords and agents.
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

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-base font-medium text-secondary mb-1"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                errors.address ? "border-errorColor" : "border-lightGray"
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-errorColor">{errors.address}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-base font-medium text-secondary mb-1"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter your city"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                errors.city ? "border-errorColor" : "border-lightGray"
              }`}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-errorColor">{errors.city}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="country"
              className="block text-base font-medium text-secondary mb-1"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter your country"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                errors.country ? "border-errorColor" : "border-lightGray"
              }`}
            />
            {errors.country && (
              <p className="mt-1 text-sm text-errorColor">{errors.country}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label
              htmlFor="state"
              className="block text-base font-medium text-secondary mb-1"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter your state"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                errors.state ? "border-errorColor" : "border-lightGray"
              }`}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-errorColor">{errors.state}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label
              htmlFor="postalCode"
              className="block text-base font-medium text-secondary mb-1"
            >
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Enter your postal code"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                errors.postalCode ? "border-errorColor" : "border-lightGray"
              }`}
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-errorColor">
                {errors.postalCode}
              </p>
            )}
          </div>

          {/* Occupation */}
          <div>
            <label
              htmlFor="occupation"
              className="block text-base font-medium text-secondary mb-1"
            >
              Designation
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="Enter your designation"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                errors.occupation ? "border-errorColor" : "border-lightGray"
              }`}
            />
            {errors.occupation && (
              <p className="mt-1 text-sm text-errorColor">
                {errors.occupation}
              </p>
            )}
          </div>

          {/* Monthly Income */}
          <div>
            <label
              htmlFor="monthlyIncome"
              className="block text-base font-medium text-secondary mb-1"
            >
              Monthly Income ($)
            </label>
            <input
              type="number"
              id="monthlyIncome"
              name="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={handleChange}
              placeholder="Enter your monthly income"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                errors.monthlyIncome ? "border-errorColor" : "border-lightGray"
              }`}
            />
            {errors.monthlyIncome && (
              <p className="mt-1 text-sm text-errorColor">
                {errors.monthlyIncome}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-base font-medium text-secondary mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter your description"
              className="w-full px-4 py-3 border h-[150px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0"
            ></textarea>
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 "
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary"
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

export default RenterBasicInformation;
