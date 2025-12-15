import { FiFileText, FiLoader } from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import WhiteUploadIcon from "../../svg/whiteUploadIcon";
import WhiteUnderProcessIcon from "../../svg/whiteUnderProcessIcon";
import VerifiedIcon from "../../svg/verifiedIcon";

function VerificationProgressTracker({ currentStep }) {
  const steps = [
    {
      id: 1,
      label: "Documents Uploaded",
      icon: WhiteUploadIcon,
    },
    {
      id: 2,
      label: "Under Review",
      icon: WhiteUnderProcessIcon,
    },
    {
      id: 3,
      label: "Verified",
      icon: VerifiedIcon,
    },
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="bg-white rounded-lg border border-lightGray p-6">
      <div className="flex justify-between gap-0 overflow-x-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const stepStatus = getStepStatus(step.id);
          const isCompleted = stepStatus === "completed";
          const isActive =
            stepStatus === "active" || stepStatus === "completed";
          const isPending = stepStatus === "pending";
          const stepNumber = step.id;
          // Line should be active if the step it connects FROM is active
          const isLineActive = isActive;

          return (
            <div key={step.id} className="flex items-start flex-shrink-0">
              {/* Step Circle with Label */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-full flex border-[6px] sm:border-[8px] border-[#E8E2FF] items-center justify-center font-semibold text-sm sm:text-base relative z-10 ${
                    isActive
                      ? "bg-[#4A2FCC] text-white"
                      : "bg-[#F9F9FC] text-gray-400"
                  }`}
                >
                  {isActive && step.id === 2 ? (
                    <FiLoader className="animate-spin text-white text-lg" />
                  ) : (
                    <Icon
                      className={`text-lg ${
                        isActive ? "text-white" : "text-gray-400"
                      }`}
                    />
                  )}
                </div>

                {/* Label */}
                <p
                  className={`mt-3 text-sm font-normal font-nunito text-center whitespace-nowrap ${
                    isActive ? "text-secondary font-semibold" : "text-darkGray"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Connecting Line - positioned at circle center */}
              {index < steps.length - 1 && (
                <div
                  className={`w-[60px] sm:w-[100px] md:w-[120px] h-0.5 border-t-2 mt-[25px] sm:mt-[30px] ${
                    isLineActive
                      ? "border-purple-600 border-dashed"
                      : "border-gray-300 border-dashed"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VerificationProgressTracker;
