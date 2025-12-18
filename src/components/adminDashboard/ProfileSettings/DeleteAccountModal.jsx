import { FiX, FiAlertTriangle } from "react-icons/fi";
import RemoveLargeIcon from "@/svg/removeLargeIcon";

function DeleteAccountModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[20px] p-6 max-w-[650px] w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX className="text-secondary text-xl" />
        </button>

        {/* Warning Icon */}
        <div className="flex justify-start mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-200 rounded-full opacity-50 animate-ping"></div>
            <div className="relative">
              <RemoveLargeIcon />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl lg:text-4xl font-bold font-nunito text-secondary text-left mb-4">
          Delete My Account
        </h2>

        {/* Description */}
        <p className="text-base lg:text-lg font-normal font-nunito text-darkGray text-left mb-6">
          Removing your account is a permanent action. All your personal
          information, Profile Settings, and stored content will be erased and
          cannot be restored after deletion.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 flex-wrap md:flex-nowrap">
          <button
            onClick={onClose}
            className="px-4 sm:px-8 flex-1 py-3 bg-blueGradient text-white rounded-[10px] text-sm sm:text-base shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors font-bold font-nunito"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 sm:px-6 py-3 border-2 border-[#4A2FCC] text-[#4A2FCC] rounded-[10px]  transition-colors text-sm sm:text-base font-bold font-nunito"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
