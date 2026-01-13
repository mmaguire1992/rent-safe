'use client'

import { useState } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { toast } from 'react-toastify';

import AuthLayout from "@/components/AuthLayout";
import ProgressIndicator from "@/components/adminDashboard/common/ProgressIndicator";
import { signupUser } from "@/api/auth";
import { storeAuthData } from "@/utils/auth";

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For fullName field, prevent leading spaces
    let processedValue = value;
    if (name === 'fullName') {
      // Remove leading spaces
      processedValue = value.replace(/^\s+/, '');
    }
    
    // For phoneNumber field, only allow numbers and common phone formatting characters
    if (name === 'phoneNumber') {
      // Allow only numbers, +, -, spaces, parentheses, and dots
      processedValue = value.replace(/[^0-9+\-().\s]/g, '');
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate fullName - allow single name or two names, but not empty
    const trimmedName = formData.fullName.trim();
    if (!trimmedName || trimmedName.length === 0) {
      newErrors.fullName = "Name is required";
    } else if (trimmedName.length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    } else if (formData.fullName.startsWith(' ')) {
      newErrors.fullName = "Name cannot start with a space";
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Split fullName into firstName and lastName
      // If single name (no space): use as full name for both firstName and lastName
      // If two or more words: first word is firstName, rest is lastName
      const trimmedName = formData.fullName.trim();
      const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);
      
      let firstName, lastName;
      if (nameParts.length === 1) {
        // Single name: use as full name
        firstName = nameParts[0];
        lastName = nameParts[0];
      } else {
        // Two or more words: first is firstName, rest is lastName
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }

      // Call signup API with all form data
      const result = await signupUser({
        firstName,
        lastName,
        email: formData.email.trim(),
        password: formData.password,
        userType: 'renter',
        phone: formData.phoneNumber || undefined,
        // Additional fields for UserInfo
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        postalCode: formData.postalCode || undefined,
        occupation: formData.occupation || undefined,
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined,
        description: formData.description || undefined,
      });

      // Store user data and token (will be activated after OTP verification)
      // We store it in a temporary location first, then move it after OTP verification
      localStorage.setItem('signup_user_data', JSON.stringify(result.user));
      localStorage.setItem('signup_token', result.token);
      localStorage.setItem('signup_email', result.user.email);

      toast.success(result.message || 'Account created! Please verify your email with the OTP sent.');

      // Navigate to OTP verification page
      navigate("/signup/renter/verify-account", {
        state: { 
          email: result.user.email,
          userType: 'renter',
          formData: {
            ...formData,
            firstName,
            lastName,
          }
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      
      // Check for validation errors array
      const validationErrors = error.validationErrors || error.response?.data?.errors;
      
      if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
        // Get the first validation error message
        const firstError = validationErrors[0];
        let errorMessage = firstError.message || 'Validation failed';
        
        // Replace "phone" with "phone number" in error messages if it's a phone-related error
        if (firstError.field === 'phone' || firstError.field === 'phoneNumber') {
          errorMessage = errorMessage.replace(/\bphone\b/gi, 'phone number');
        }
        
        // Display only the first specific error message
        toast.error(errorMessage);
        
        // Map backend field names to form field names and set errors
        const fieldErrors = {};
        validationErrors.forEach((err) => {
          if (err.field === 'email') fieldErrors.email = err.message;
          if (err.field === 'password') fieldErrors.password = err.message;
          if (err.field === 'firstName' || err.field === 'fullName') fieldErrors.fullName = err.message;
          if (err.field === 'lastName') fieldErrors.fullName = err.message;
          if (err.field === 'phone' || err.field === 'phoneNumber') {
            // Replace "phone" with "phone number" in error messages
            const message = err.message ? err.message.replace(/\bphone\b/gi, 'phone number') : err.message;
            fieldErrors.phoneNumber = message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Display generic error message
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           'Failed to create account. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="block max-w-[420px] mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <img src="/images/dashboard/mainLogo.png" alt="Logo" className="justify-center" />
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
              Monthly Income (£)
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
            disabled={loading}
            className="w-full bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Next'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default RenterBasicInformation;
