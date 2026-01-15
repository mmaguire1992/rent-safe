'use client'

import { useNavigate } from '@/lib/react-router-compat';
import { FiX, FiCheckCircle } from "react-icons/fi";
import SuccessfullyCheck from "@/svg/successfullyCheck";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

function SuccessModal({ showSuccessModal, setShowSuccessModal, formData, propertyId, isEdit = false }) {
  const navigate = useNavigate();
  useBodyScrollLock(showSuccessModal);

  if (!showSuccessModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl relative">
        <button
          onClick={() => {
            setShowSuccessModal(false);
            navigate("/dashboard/properties");
          }}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX className="text-secondary text-xl" />
        </button>

        <div className="p-8 text-left">
          <div className="mb-4 flex justify-start">
            <SuccessfullyCheck />
          </div>
          <h2 className="text-2xl font-bold text-secondary mb-2">
            {isEdit ? "Property Updated Successfully!" : "Your Property Is Now Live!"}
          </h2>
          <p className="text-darkGray text-base font-normal font-nunito mb-6">
            {isEdit 
              ? "Your property has been updated successfully. The changes are pending approval."
              : "Your listing is successfully published and renters can now view and contact you. You can manage this property anytime from your dashboard."
            }
          </p>
          <div className="flex gap-3 justify-center flex-wrap md:flex-nowrap">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                if (propertyId) {
                  navigate(`/dashboard/properties/${propertyId}`);
                } else {
                  navigate("/dashboard/properties");
                }
              }}
              className="px-6 w-full py-2 border-2 border-[#4A2FCC] text-[#4A2FCC] rounded-[10px] font-bold text-base font-nunito transition-colors"
            >
              View Property
            </button>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/dashboard/properties");
              }}
              className="px-6 w-full py-2 bg-blueGradient text-white rounded-[10px] font-bold text-base font-nunito hover:bg-opacity-90 transition-colors"
            >
              Go To My Property
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
