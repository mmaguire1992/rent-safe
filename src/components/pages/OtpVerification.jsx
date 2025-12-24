'use client'

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from '@/lib/react-router-compat';
import AuthLayout from "@/components/AuthLayout";
import { maskEmail } from "@/utils/emailUtils";

function OtpVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const originalEmail = location.state?.email || "abc123@example.com";
  const maskedEmail = maskEmail(originalEmail);

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

  const handleSubmit = (e) => {
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

    // Simulate OTP verification - in real app, this would be an API call
    // Navigate to create new password page
    navigate("/create-password", { state: { email: originalEmail } });
  };

  const handleResend = () => {
    setTimer(30);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    // In real app, this would trigger a new OTP to be sent
    console.log("Resending OTP to:", originalEmail);
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
            className="w-full bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033]"
          >
            Verify
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
              className="text-primary text-base font-bold"
            >
              Send again
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
