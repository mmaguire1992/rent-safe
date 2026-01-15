import { FiX } from "react-icons/fi";
import { FiCheck } from "react-icons/fi";
import SuccessfullyCheck from "@/svg/successfullyCheck";
import GreenCheckedIcon from "../../../svg/greenCheckedIcon";
import GreenCheckIcon from "../../../svg/greenCheckIcon";
import GreenRoundCheckIcon from "../../../svg/websiteSvg/greenRoundCheckIcon";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

function ContactOwnerModal({ isOpen, onClose, onVerify, onCancel }) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-[480px] w-full mx-4 relative shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX className="text-gray-600 text-xl" />
        </button>

        {/* Icon */}
        <div className="flex justify-start mb-4">
          <SuccessfullyCheck />
        </div>

        {/* Title */}
        <h2 className="text-2xl lg:text-3xl font-bold font-nunito text-secondary text-left mb-2">
          Free Limit Reached
        </h2>

        {/* Required Information */}
        <p className="text-[#0F172B] font-normal font-nunito text-base mb-2">
          Required Information:
        </p>

        {/* List Items */}
        <div className="space-y-2 mb-6">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <GreenRoundCheckIcon />
            </div>
            <p className="text-[#314158] font-normal font-nunito text-base">
              Next contact costs{" "}
              <span className="text-[#4A2FCC] font-semibold">€6.99</span>.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <GreenRoundCheckIcon />
            </div>
            <p className="text-[#314158] font-normal font-nunito text-base">
              Verify your account to contact more owners.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <GreenRoundCheckIcon />
            </div>
            <p className="text-[#314158] font-normal font-nunito text-base">
              Verification time: 24-48 hours.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel || onClose}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-[10px] font-bold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onVerify}
            className="flex-1 px-6 py-3 bg-blueGradient text-base shadow-[0px_2px_10px_0px_#00000033] text-white rounded-[10px] font-bold hover:bg-opacity-90 transition-colors"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactOwnerModal;
