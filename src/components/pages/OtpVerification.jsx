'use client'

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from '@/lib/react-router-compat';
import { toast } from 'react-toastify';
import AuthLayout from "@/components/AuthLayout";
import { maskEmail } from "@/utils/emailUtils";
import { verifyOTP, resendOTP } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { storeAuthData } from "@/utils/auth";

function OtpVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30); // 30 seconds timer
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get email from location state or localStorage
  const originalEmail = location.state?.email || localStorage.getItem('signup_email') || "";
  const maskedEmail = maskEmail(originalEmail);
  const userType = location.state?.userType || null; // Get userType from navigation state

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;

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
    pastedData.split("").forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);
    setError("");

    // Focus last filled input or next empty one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("This field is required.");
      return;
    }

    if (!/^\d{6}$/.test(otpString)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    if (!originalEmail) {
      setError("Email not found. Please start the signup process again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify OTP
      await verifyOTP(originalEmail, otpString);

      toast.success("Email verified successfully!");

      // Get the stored user data and token from signup
      const signupUserData = localStorage.getItem('signup_user_data');
      const signupToken = localStorage.getItem('signup_token');
      
      if (signupUserData && signupToken) {
        try {
          // Parse user data
          const userData = JSON.parse(signupUserData);
          
          // Store auth data properly using the utility function
          storeAuthData(userData, signupToken);
          
          // Update AuthContext state by triggering a page reload or using the login function
          // Since we can't directly update AuthContext state, we'll reload the page
          // which will cause AuthContext to read from localStorage
          
          // Clear signup temporary data
          localStorage.removeItem('signup_user_data');
          localStorage.removeItem('signup_token');
          localStorage.removeItem('signup_email');

          // Redirect based on user type
          if (userType === 'owner' || userData.userType === 'owner') {
            // Reload to ensure AuthContext picks up the new auth data
            window.location.href = "/signup/owner/success";
          } else if (userType === 'renter' || userData.userType === 'renter') {
            window.location.href = "/signup/renter/success";
          } else {
            // Default redirect to dashboard
            window.location.href = "/dashboard";
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          toast.error("Error completing signup. Please login.");
          navigate("/login");
        }
      } else {
        // If no token, just redirect to login
        toast.info("Please login with your verified email.");
        navigate("/login");
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.message || 'OTP verification failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!originalEmail) {
      toast.error("Email not found. Please start the signup process again.");
      return;
    }

    setResending(true);
    setError("");

    try {
      await resendOTP(originalEmail);
      toast.success("OTP has been resent to your email");
      
      // Reset timer and OTP fields
      setTimer(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  placeholder="-"
                  className={`w-[50px] sm:w-[62px] h-[48px] sm:h-[52px] text-center text-lg sm:text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 placeholder:text-gray-400 ${
                    error
                      ? "border-errorColor"
                      : "border-lightGray focus:ring-primary"
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-errorColor text-left mt-1">{error}</p>
            )}
          </div>
          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
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
      </div>
    </AuthLayout>
  );
}

export default OtpVerification;
