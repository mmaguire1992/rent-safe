'use client'

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from '@/lib/react-router-compat';
import { toast } from 'react-toastify';
import AuthLayout from "@/components/AuthLayout";
import { maskEmail } from "@/utils/emailUtils";
import { forgotPassword, verifyPasswordResetOTP } from "@/api/auth";

function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get email and error from location state if coming back from CreatePassword
  const { email: stateEmail, error: stateError } = location.state || {};

  const [email, setEmail] = useState(stateEmail || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(stateError || "");
  const [validationError, setValidationError] = useState(""); // Separate state for validation errors (for field highlighting)
  const [showOtp, setShowOtp] = useState(!!stateEmail); // Show OTP form if we have email from state (coming back from CreatePassword)
  const [timer, setTimer] = useState(30); // 30 seconds timer
  const [canResend, setCanResend] = useState(!!stateError); // Enable resend if coming back with error (OTP invalid/expired)
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef([]);

  const maskedEmail = maskEmail(email);

  // Show error toast if coming back with error from CreatePassword
  useEffect(() => {
    if (stateError) {
      toast.error(stateError);
    }
  }, [stateError]);

  useEffect(() => {
    if (showOtp && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (showOtp && timer === 0) {
      setCanResend(true);
    }
  }, [timer, showOtp]);

  const handleEmailChange = (e) => {
    let value = e.target.value;

    // Prevent leading spaces - remove all leading spaces immediately
    value = value.replace(/^\s+/, '');

    setEmail(value);
    setError("");
    setValidationError(""); // Clear validation error when user types
  };

  const handleEmailKeyDown = (e) => {
    // Prevent space from being entered if field is empty or cursor is at the start
    if (e.key === ' ' || e.key === 'Spacebar') {
      const input = e.target;
      const cursorPosition = input.selectionStart;

      // If cursor is at the start (position 0) or field is empty, prevent space
      if (cursorPosition === 0 || email.length === 0) {
        e.preventDefault();
        return false;
      }
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow single digit (0-9)
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];
    let filledCount = 0;

    pastedData.split("").forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) {
        newOtp[index] = char;
        filledCount++;
      }
    });

    setOtp(newOtp);
    setError("");

    // Focus last filled input or next empty one
    const nextIndex = Math.min(filledCount, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setValidationError("Email is required");
      setError("Email is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Invalid email format. Please enter a valid email address.");
      setError("Invalid email format. Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setValidationError(""); // Clear validation error before API call

    try {
      await forgotPassword(email);
      toast.success("OTP has been sent to your email");
      setShowOtp(true);
      setTimer(30);
      setCanResend(false);
      // Focus first OTP input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.error('Forgot password error:', error);

      // Check if it's a validation error from API (structured error response)
      // Note: fetch API stores response data in error.data, not error.response.data
      const responseData = error.data || error.response?.data;
      const validationErrors = responseData?.errors;

      if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
        // Find email field error
        const emailError = validationErrors.find(err => err.field === 'email');
        if (emailError && emailError.message) {
          // Show API error message only in toast, NOT below field
          const errorMessage = emailError.message;
          setError(errorMessage);
          toast.error(errorMessage);
        } else {
          // Use first error message if no email-specific error found
          const firstError = validationErrors[0];
          const errorMessage = firstError?.message || 'Validation failed. Please check your input.';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        // Generic API error (network, server error, etc.)
        const errorMessage = error.message || responseData?.error || responseData?.message || 'Failed to send OTP. Please try again.';
        setError(errorMessage);
        // Don't set validationError for API errors - this prevents field highlighting
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");

    // Validate OTP field
    if (otpString.length !== 6) {
      setError("OTP is required. Please enter all 6 digits.");
      return;
    }

    if (!/^\d{6}$/.test(otpString)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      // Verify OTP with backend before navigating
      await verifyPasswordResetOTP(email, otpString);

      // Store email and OTP in sessionStorage as backup (in case state is lost)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('resetPasswordEmail', email);
        sessionStorage.setItem('resetPasswordOtp', otpString);
      }

      // OTP verified successfully - navigate to create password page
      navigate("/create-password", {
        state: {
          email,
          otp: otpString,
          fromForgotPassword: true
        }
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.message || error.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("User not found. Please enter your email again.");
      return;
    }

    setResending(true);
    setError("");

    try {
      await forgotPassword(email);
      toast.success("OTP has been resent to your email");

      // Reset timer and OTP fields
      setTimer(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      // Focus first OTP input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="block max-w-[420px] mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <img src="/images/dashboard/mainLogo.png" alt="Logo" className="justify-center" />
        </div>

        {!showOtp ? (
          <>
            {/* Title */}
            <div className="text-left mb-4">
              <h1 className="text-2xl sm:text-3xl lg:text-[36px] lg:leading-[45px] font-bold text-secondary mb-2">
                Reset Your Password
              </h1>
              <p className="text-darkGray text-base md:text-lg font-normal">
                Enter your email below to receive an OTP
              </p>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-5" noValidate>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-base font-semibold text-secondary mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="Enter your registered email address"
                  title=""
                  className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${validationError ? "border-errorColor" : "border-lightGray"
                    }`}
                />
                {validationError && (
                  <p className="text-errorColor text-sm mt-1.5">
                    {validationError}
                  </p>
                )}
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Continue'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Title */}
            <div className="text-left mb-4">
              <h1 className="text-2xl sm:text-3xl lg:text-[36px] lg:leading-[45px] font-bold text-secondary mb-2">
                OTP Verification
              </h1>
              <p className="text-darkGray text-base md:text-lg font-normal">
                We've shared a 6-digit code to your registered {maskedEmail}.
              </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleOtpSubmit} className="space-y-4" noValidate>
              {/* OTP Input Fields */}
              <div>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      placeholder="-"
                      className={`w-[50px] sm:w-[62px] h-[48px] sm:h-[52px] text-center text-lg sm:text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 placeholder:text-gray-400 ${error
                        ? "border-errorColor"
                        : "border-lightGray focus:ring-primary"
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </form>

            {/* Resend Code */}
            <div className="mt-2 text-left">
              <span className="text-darkGray text-base font-normal">
                Haven't received a code?{" "}
              </span>
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-primary text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? 'Sending...' : 'Send again'}
                </button>
              ) : (
                <span className="text-yellow text-base font-bold">{timer}s</span>
              )}
            </div>
          </>
        )}

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary text-base font-bold hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
