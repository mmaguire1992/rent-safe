'use client'

import { useState, useEffect } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import AuthLayout from "@/components/AuthLayout";

function PaymentFailure() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      // Redirect to landing page after countdown
      navigate("/");
    }
  }, [countdown, navigate]);

  const handleGoToHome = () => {
    navigate("/");
  };

  const handleTryAgain = () => {
    // Navigate back to profile management verification tab
    navigate("/profile-management?tab=verification");
  };

  return (
    <AuthLayout>
      <div className="block max-w-[420px] mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <img src="/images/dashboard/mainLogo.png" alt="Logo" className="justify-center" />
        </div>

        {/* Error Icon */}
        <div className="mb-4 flex justify-start">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl sm:text-3xl lg:text-[36px] lg:leading-[45px] font-bold text-secondary mb-2">
          Payment Failed
        </h1>

        <p className="text-darkGray text-base md:text-lg font-normal mb-6">
          Unfortunately, your payment could not be processed. This could be due to insufficient funds, card issues, or network problems. Please try again or contact support if the problem persists.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="w-full text-center bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl flex items-center justify-center transition-all shadow-[0px_2px_10px_0px_#00000033]"
          >
            Try Again
          </button>
          
          <button
            onClick={handleGoToHome}
            className="w-full text-center bg-gray-200 h-[56px] text-gray-700 text-base font-bold py-3 rounded-xl flex items-center justify-center transition-all hover:bg-gray-300"
          >
            Go to Home
          </button>
        </div>

        {/* Countdown */}
        <p className="text-base text-darkGray mt-4 text-center">
          Redirecting to home in{" "}
          <span className="font-bold text-yellow">{countdown}s</span>
        </p>
      </div>
    </AuthLayout>
  );
}

export default PaymentFailure;
