import { FiX, FiCheckCircle } from "react-icons/fi";
import SuccessfullyCheck from "@/svg/successfullyCheck";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

function SupportSuccessModal({ isOpen, onClose }) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[20px] p-6 max-w-2xl w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX className="text-secondary text-xl" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-start mb-4">
          <SuccessfullyCheck />
        </div>

        {/* Heading */}
        <h2 className="text-2xl lg:text-3xl font-bold font-nunito text-secondary text-left mb-2">
          Your Support Request Has Been Submitted
        </h2>

        {/* Description */}
        <p className="text-base lg:text-lg font-normal font-nunito text-darkGray text-left mb-4">
          Thanks for reaching out! Our team has received your query and will get
          back to you. You'll be notified via email.
        </p>

        {/* Button */}
        {/* <div className="flex justify-center w-full ">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#F1F1F1] w-full text-darkGray rounded-[10px] hover:bg-gray-300 transition-colors font-semibold font-nunito"
          >
            Cancel
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default SupportSuccessModal;
