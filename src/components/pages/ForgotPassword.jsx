'use client'

import { useState } from "react";
import { Link, useNavigate } from '@/lib/react-router-compat';

import AuthLayout from "@/components/AuthLayout";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("This field is required.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Navigate to OTP page with email - any email will work for now
    navigate("/otp-verification", { state: { email } });
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
            Reset Your Password
          </h1>
          <p className="text-darkGray text-base md:text-lg font-normal">
            Enter your email below to receive an OTP
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
              onChange={handleChange}
              placeholder="Enter your registered email address"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0  ${
                error ? "border-errorColor" : "border-lightGray"
              }`}
            />
            {error && <p className="mt-1 text-sm text-errorColor">{error}</p>}
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033]"
          >
            Continue
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary text-base font-bold">
            Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
