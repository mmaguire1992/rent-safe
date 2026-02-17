'use client'

import { useState, useEffect } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import AuthLayout from "@/components/AuthLayout";

import SuccessfullyCheck from "@/svg/successfullyCheck";

function OwnerSignupSuccess() {
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      // Use window.location.replace for hard redirect to prevent back navigation
      window.location.replace("/dashboard");
    }
  }, [countdown]);

  const handleGoToDashboard = () => {
    // Use window.location.replace for hard redirect
    window.location.replace("/dashboard");
  };

  return (
    <AuthLayout>
      <div className="block max-w-[420px] mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <img src="/images/dashboard/mainLogo.png" alt="Logo" className="justify-center" />
        </div>
        {/* Success Icon */}
        <div className="mb-4 flex justify-start">
          <SuccessfullyCheck />
        </div>
        {/* Success Message */}
        <h1 className="text-2xl sm:text-3xl lg:text-[36px] lg:leading-[45px] font-bold text-secondary mb-2">
          Account Created Successfully
        </h1>

        <p className="text-darkGray text-base md:text-lg font-normal">
          You can now access property listing and explore your Rent Safe
          features.
        </p>

        {/* Go To Dashboard Button */}
        <button
          onClick={handleGoToDashboard}
          className="mt-4 w-full bg-blueGradient text-white font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033]"
        >
          Go To Dashboard
        </button>

        {/* Countdown */}
        <p className="text-sm text-darkGray mt-4 text-center">
          Redirect to Dashboard in{" "}
          <span className="font-semibold">{countdown}s</span>
        </p>
      </div>
    </AuthLayout>
  );
}

export default OwnerSignupSuccess;
