import { useNavigate } from "react-router-dom";
import { FiX, FiCheckCircle } from "react-icons/fi";

function SuccessModal({ showSuccessModal, setShowSuccessModal, formData }) {
  const navigate = useNavigate();

  if (!showSuccessModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative">
        <button
          onClick={() => {
            setShowSuccessModal(false);
            navigate("/dashboard/properties");
          }}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX className="text-secondary text-xl" />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-[#6B4EFF] rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-secondary mb-2">
            Your Property Is Now Live!
          </h2>
          <p className="text-darkGray mb-6">
            Your listing is successfully published and renters can now view and
            contact you. You can manage this property anytime from your
            dashboard.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate(
                  `/dashboard/properties/${formData.propertyTitle
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`
                );
              }}
              className="px-6 py-3 border-2 border-[#6B4EFF] text-[#6B4EFF] rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              View Property
            </button>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/dashboard/properties");
              }}
              className="px-6 py-3 bg-[#6B4EFF] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
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

