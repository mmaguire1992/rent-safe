'use client'

import { useState, useEffect } from "react";
import { Link, useNavigate } from '@/lib/react-router-compat';
import AuthLayout from "@/components/AuthLayout";
import SuccessfullyCheck from "@/svg/successfullyCheck";

function PasswordSuccess() {
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      // Redirect to login page after countdown
      navigate("/login");
    }
  }, [countdown, navigate]);

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <AuthLayout>
      <div className="block max-w-[420px] mx-auto">
        {/* Logo with lock */}
        <div className="mb-6">
          <img src="/images/dashboard/mainLogo.png" alt="Logo" className="justify-center" />
        </div>

        {/* Success Icon */}
        <div className="mb-4 flex justify-start">
          <SuccessfullyCheck />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl sm:text-3xl lg:text-[36px] lg:leading-[45px] font-bold text-secondary mb-2">
          Password Created Successfully
        </h1>

        <p className="text-darkGray text-base md:text-lg font-normal">
          You can now log in with your new password. If you experience any
          issues, feel free to contact our support team for assistance.
        </p>

        {/* Back to Login Button */}
        <button
          onClick={handleGoToLogin}
          className="w-full text-center mt-4 bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl flex items-center justify-center transition-all shadow-[0px_2px_10px_0px_#00000033]"
        >
          Back to Login
        </button>

        {/* Countdown */}
        <p className="text-base text-darkGray mt-4 text-center">
          Redirecting to login in{" "}
          <span className="font-bold text-yellow">{countdown}s</span>
        </p>
      </div>
    </AuthLayout>
  );
}

export default PasswordSuccess;
