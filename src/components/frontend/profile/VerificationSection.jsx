import { useState } from "react";
import PaymentSection from "./PaymentSection";
import GreenRoundCheckIcon from "../../../svg/websiteSvg/greenRoundCheckIcon";
import WhiteCardIcon from "../../../svg/websiteSvg/whiteCardIcon";

function VerificationSection() {
  const [showPayment, setShowPayment] = useState(false);

  const handlePaymentComplete = (paymentData) => {
    console.log("Payment completed:", paymentData);
    // Handle payment success - could redirect or show success message
    setShowPayment(false);
  };

  if (showPayment) {
    return (
      <PaymentSection
        onBack={() => setShowPayment(false)}
        onPaymentComplete={handlePaymentComplete}
      />
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-border p-4">
      <div className="block">
        <div>
          <p className="text-base font-normal font-nunito text-midGray mb-1">
            <span className="text-xl font-bold text-mainBlue">£6.99</span> /
            listing
          </p>
          <p className="text-base font-nunito font-normal text-[#45556C] mb-3">
            One-time payment{" "}
            <span className="relative ml-3 before:content-[''] before:absolute before:left-[-11px] before:rounded-full before:w-[6px] before:bottom-2 before:h-[6px] before:bg-midGray  text-base font-nunito font-normal text-[#45556C]">
              Lifetime verification
            </span>
          </p>
          <ul className="space-y-1 text-sm text-text-secondary">
            <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
              <GreenRoundCheckIcon />
              Unlimited owner contacts
            </li>
            <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
              <GreenRoundCheckIcon />
              Verified badge on profile
            </li>
            <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
              <GreenRoundCheckIcon />
              3x more responses from owners
            </li>
            <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
              <GreenRoundCheckIcon />
              Priority support
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setShowPayment(true)}
          className="self-start mt-6 sm:self-auto px-6 py-2 rounded-[10px] bg-blueGradient text-white text-base font-bold shadow-[0px_2px_10px_0px_#00000033]  transition-opacity font-nunito flex items-center gap-2"
        >
          <WhiteCardIcon />
          Continue to Payment
        </button>
      </div>
    </section>
  );
}

export default VerificationSection;
