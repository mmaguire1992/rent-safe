import { FiX, FiAlertTriangle } from "react-icons/fi";

function DeleteAccountModal({ isOpen, onClose, onConfirm }) {
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

        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-200 rounded-full opacity-50 animate-ping"></div>
            <div className="relative bg-white rounded-full p-3">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="text-red-600 text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold font-nunito text-secondary text-center mb-4">
          Delete My Account
        </h2>

        {/* Description */}
        <p className="text-base font-normal font-nunito text-darkGray text-center mb-6">
          Removing your account is a permanent action. All your personal
          information, Profile Settings, and stored content will be erased and
          cannot be restored after deletion.
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-[#6B4EFF] text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold font-nunito"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 border-2 border-[#6B4EFF] text-[#6B4EFF] rounded-lg hover:bg-purple-50 transition-colors font-semibold font-nunito"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;

