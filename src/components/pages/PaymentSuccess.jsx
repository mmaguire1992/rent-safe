'use client'

import { useState, useEffect } from "react";
import { useNavigate } from '@/lib/react-router-compat';
import AuthLayout from "@/components/AuthLayout";
import SuccessfullyCheck from "@/svg/successfullyCheck";

function PaymentSuccess() {
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
          Payment Successful!
        </h1>

        <p className="text-darkGray text-base md:text-lg font-normal">
          Your payment has been processed successfully. Your verification is now active and you can start using all the features. Thank you for choosing RentSafe!
        </p>

        {/* Back to Home Button */}
        <button
          onClick={handleGoToHome}
          className="w-full text-center mt-4 bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl flex items-center justify-center transition-all shadow-[0px_2px_10px_0px_#00000033]"
        >
          Go to Home
        </button>

        {/* Countdown */}
        <p className="text-base text-darkGray mt-4 text-center">
          Redirecting to home in{" "}
          <span className="font-bold text-yellow">{countdown}s</span>
        </p>
      </div>
    </AuthLayout>
  );
}

export default PaymentSuccess;
