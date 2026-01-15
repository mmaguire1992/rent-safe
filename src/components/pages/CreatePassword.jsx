'use client'

import { useState } from "react";
import { useNavigate, useLocation, Link } from '@/lib/react-router-compat';
import { toast } from 'react-toastify';
import AuthLayout from "@/components/AuthLayout";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { resetPassword } from "@/api/auth";

function CreatePassword() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email and OTP from location state if coming from forgot password
  // Also check sessionStorage as fallback (in case state is lost during navigation)
  const stateData = location.state || {};
  const sessionEmail = typeof window !== 'undefined' ? sessionStorage.getItem('resetPasswordEmail') : null;
  const sessionOtp = typeof window !== 'undefined' ? sessionStorage.getItem('resetPasswordOtp') : null;
  
  const email = stateData.email || sessionEmail;
  const otp = stateData.otp || sessionOtp;
  const fromForgotPassword = stateData.fromForgotPassword || (!!email && !!otp);
  
  // Debug log to check state
  console.log('CreatePassword component state:', { 
    email, 
    otp: otp ? '***' : undefined, 
    fromForgotPassword,
    hasStateData: !!location.state,
    hasSessionData: !!(sessionEmail && sessionOtp)
  });

  const validatePassword = (password) => {
    const errors = [];

    if (!/[A-Z]/.test(password)) {
      errors.push("Must Include 1 Uppercase letter");
    }

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[@$!%*?&#]/.test(password)) {
      errors.push("Use special character (eg. @,!,etc)");
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate new password
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Please enter your new password";
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors;
      }
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords must match";
    }

    setErrors(newErrors);

    // If no errors, proceed with password creation/reset
    if (Object.keys(newErrors).length === 0) {
      // Always call reset password API if we have email and OTP (from forgot password flow)
      if (email && otp) {
        setLoading(true);
        try {
          console.log('Calling resetPassword API with:', { email, otp: '***', passwordLength: formData.newPassword.length });
          await resetPassword(email, otp, formData.newPassword);
          
          // Clear sessionStorage after successful reset
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('resetPasswordEmail');
            sessionStorage.removeItem('resetPasswordOtp');
          }
          
          toast.success("Password reset successfully!");
          navigate("/password-success");
        } catch (error) {
          console.error('Reset password error:', error);
          const errorMessage = error.message || error.data?.message || 'Failed to reset password. Please try again.';
          
          // Check if it's an OTP-related error
          const isOtpError = errorMessage.toLowerCase().includes('otp') || 
                           errorMessage.toLowerCase().includes('invalid') ||
                           errorMessage.toLowerCase().includes('expired');
          
          if (isOtpError) {
            // Clear sessionStorage on OTP error
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('resetPasswordEmail');
              sessionStorage.removeItem('resetPasswordOtp');
            }
            
            // OTP error - redirect back to forgot password with error
            toast.error(errorMessage);
            navigate("/forgot-password", {
              state: { 
                email,
                error: errorMessage 
              }
            });
          } else {
            // Password or other error - show in form
          toast.error(errorMessage);
          setErrors({ confirmPassword: errorMessage });
          }
        } finally {
          setLoading(false);
        }
      } else {
        // No email/otp - regular password creation flow (should not happen for forgot password)
        console.warn('CreatePassword: Missing email or OTP for password reset', { 
          email: !!email, 
          otp: !!otp 
        });
        navigate("/password-success");
      }
    }
  };

  return (
    <AuthLayout>
      <div className="block">
        {/* Logo */}
        <div className="mb-6">
          <img src="/images/dashboard/mainLogo.png" alt="Logo" className="justify-center" />
        </div>

        {/* Title */}
        <div className="text-left mb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] lg:leading-[45px] font-bold text-secondary mb-2">
            Create New Password
          </h1>
          <p className="text-darkGray text-base md:text-lg font-normal">
            Enter your email below to receive an OTP
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password Field */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-base font-semibold text-secondary mb-1"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 pr-12 ${
                  errors.newPassword ? "border-errorColor" : "border-lightGray"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary"
              >
                {showNewPassword ? (
                  <BsEye className="text-xl" />
                ) : (
                  <BsEyeSlash className="text-xl" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-errorColor">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-base font-semibold text-secondary mb-1"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Enter your confirm password"
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

          {/* Create Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Create'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default CreatePassword;
