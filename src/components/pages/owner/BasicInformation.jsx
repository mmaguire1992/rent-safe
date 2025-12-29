'use client'

import { useState } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify';

import AuthLayout from "@/components/AuthLayout";
import ProgressIndicator from "@/components/adminDashboard/common/ProgressIndicator";
import { BsEyeSlash } from "react-icons/bs";
import { signupUser } from "@/api/auth";
import { storeAuthData } from "@/utils/auth";

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
  const [loading, setLoading] = useState(false);
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

  const validateForm = () => {
    const newErrors = {};

    // Split fullName into firstName and lastName
    const nameParts = formData.fullName.trim().split(/\s+/);
    if (nameParts.length < 2) {
      newErrors.fullName = "Please enter your first and last name";
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
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0]; // If only one name, use it for both

      // Call signup API
      const result = await signupUser({
        firstName,
        lastName,
        email: formData.email.trim(),
        password: formData.password,
        userType: 'owner',
        phone: formData.phoneNumber || undefined,
      });

      // Store user data and token (will be activated after OTP verification)
      // We store it in a temporary location first, then move it after OTP verification
      localStorage.setItem('signup_user_data', JSON.stringify(result.user));
      localStorage.setItem('signup_token', result.token);
      localStorage.setItem('signup_email', result.user.email);

      toast.success(result.message || 'Account created! Please verify your email with the OTP sent.');

      // Navigate to OTP verification page
      navigate("/signup/owner/verify-account", {
        state: { 
          email: result.user.email,
          userType: 'owner',
          formData: {
            ...formData,
            firstName,
            lastName,
          }
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      toast.error(errorMessage);
      
      // Set specific field errors if available
      if (error.data && error.data.errors) {
        const fieldErrors = {};
        error.data.errors.forEach(err => {
          if (err.field === 'email') fieldErrors.email = err.message;
          if (err.field === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
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

export default BasicInformation;
