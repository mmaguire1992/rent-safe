import { FiX, FiCheckCircle } from "react-icons/fi";

function SupportSuccessModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[20px] p-6 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX className="text-secondary text-xl" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#6B4EFF] rounded-full flex items-center justify-center">
            <FiCheckCircle className="text-white text-3xl" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold font-nunito text-secondary text-center mb-4">
          Your Support Request Has Been Submitted
        </h2>

        {/* Description */}
        <p className="text-base font-normal font-nunito text-darkGray text-center mb-6">
          Thanks for reaching out! Our team has received your query and will get
          back to you. You'll be notified via email.
        </p>

        {/* Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-200 text-secondary rounded-lg hover:bg-gray-300 transition-colors font-semibold font-nunito"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SupportSuccessModal;





