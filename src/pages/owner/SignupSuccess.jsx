import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import mainLogo from "@/assests/images/mainLogo.png";
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
      // Redirect to dashboard after countdown
      navigate("/dashboard");
    }
  }, [countdown, navigate]);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <div className="block max-w-[420px] mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <img src={mainLogo} alt="Logo" className="justify-center" />
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
