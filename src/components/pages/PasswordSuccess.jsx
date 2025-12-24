'use client'

import { Link } from '@/lib/react-router-compat';

import AuthLayout from "@/components/AuthLayout";
import SuccessfullyCheck from "@/svg/successfullyCheck";

function PasswordSuccess() {
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
        <Link
          to="/login"
          className="w-full  text-center mt-4 bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl flex items-center justify-center transition-all shadow-[0px_2px_10px_0px_#00000033]"
        >
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}

export default PasswordSuccess;
