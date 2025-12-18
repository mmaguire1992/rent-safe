import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { maskEmail } from "@/utils/emailUtils";

function ProfileOtpModal({
  isOpen,
  onClose,
  onVerify,
  email = "ab******@example.com",
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const maskedEmail = maskEmail(email);

  useEffect(() => {
    if (!isOpen) return;
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setTimer(30);
    setCanResend(false);
    inputRefs.current[0]?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (timer <= 0) {
      setCanResend(true);
      return undefined;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, "");
    setOtp(newOtp);
    setError("");
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
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, idx) => {
      if (/^[0-9]$/.test(char) && idx < 6) {
        newOtp[idx] = char;
      }
    });
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    onVerify?.(otpString);
    onClose?.();
  };

  const handleResend = () => {
    setTimer(30);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-[20px] p-6 md:p-7 lg:p-8 w-full max-w-[600px] relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX className="text-secondary text-xl" />
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
          OTP Verification
        </h2>
        <p className="text-darkGray text-base mb-5">
          We&apos;ve shared a 6-digit code to your registered {maskedEmail}.
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-start gap-2 sm:gap-3 mb-4">
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
              className={`w-[44px] h-[44px] sm:w-[54px] sm:h-[52px] text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 ${
                error
                  ? "border-errorColor focus:ring-errorColor"
                  : "border-lightGray focus:ring-primary"
              }`}
            />
          ))}
        </div>
        {error && <p className="text-sm text-errorColor mb-3">{error}</p>}

        <button
          onClick={handleVerify}
          className="w-full bg-blueGradient h-[48px] sm:h-[56px] text-white text-base font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033]"
        >
          Verify OTP
        </button>

        <div className="mt-3 text-left text-base font-nunito">
          {!canResend ? (
            <>
              Haven&apos;t received a code?{" "}
              <span className="text-yellow font-bold">{timer}s</span>
            </>
          ) : (
            <>
              Haven&apos;t received a code?{" "}
              <button
                onClick={handleResend}
                className="text-primary font-bold hover:underline"
              >
                Send again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileOtpModal;
