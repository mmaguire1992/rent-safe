import { FiFileText, FiLoader } from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import WhiteUploadIcon from "@/svg/whiteUploadIcon";
import WhiteUnderProcessIcon from "@/svg/whiteUnderProcessIcon";
import VerifiedIcon from "@/svg/verifiedIcon";

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
      <div className="flex items-start justify-between gap-0 overflow-x-auto">
        <div className="flex items-start justify-between gap-0 w-full">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const stepStatus = getStepStatus(step.id);
            const isCompleted = stepStatus === "completed";
            const isActive =
              stepStatus === "active" || stepStatus === "completed";
            const isLineActive = isCompleted; // match Add Property behavior

            return (
              <div
                key={step.id}
                className="flex items-center flex-1 last-of-type:flex-[0]"
              >
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center w-full">
                    <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                      <div
                        className={`w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-full flex border-[6px] sm:border-[8px] border-[#E8E2FF] items-center justify-center font-semibold text-sm sm:text-base ${
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
                      <p
                        className={`text-sm md:text-base hidden md:block mt-2 font-semibold font-nunito text-center whitespace-nowrap ${
                          isActive ? "text-secondary" : "text-darkGray"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 border-t-[3px] -ml-[47px] -mr-[45px] sm:-mr-[40px] mt-[0px] md:mt-[-22px] z-0 ${
                          isLineActive
                            ? "border-purple-600 border-dashed"
                            : "border-gray-300 border-dashed"
                        }`}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VerificationProgressTracker;
