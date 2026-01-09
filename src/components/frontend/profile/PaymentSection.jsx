'use client'

import { FiArrowLeft } from "react-icons/fi";

function PaymentSection({ onBack, onPaymentComplete }) {
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // Handle payment submission logic here
    console.log("Processing payment...");
    if (onPaymentComplete) {
      onPaymentComplete({ success: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-4"
      >
        <FiArrowLeft className="text-lg" />
        <span className="font-medium">Back to Verification</span>
      </button>

      {/* Payment Form */}
      <div className="bg-white rounded-[20px] border border-lightGray p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary mb-2">
            Complete Payment
          </h2>
          <p className="text-darkGray">
            Complete your payment to proceed with verification
          </p>
        </div>

        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          {/* Payment form fields would go here */}
          <div className="p-4 bg-gray-50 rounded-lg border border-lightGray">
            <p className="text-sm text-darkGray">
              Payment integration will be implemented here
            </p>
            <p className="text-lg font-semibold text-secondary mt-2">
              Amount: £6.99
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-[10px] font-bold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blueGradient text-white rounded-[10px] font-bold shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors"
            >
              Pay Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentSection;
