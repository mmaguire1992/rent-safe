import { FiCheckCircle } from "react-icons/fi";

function ProgressIndicator({ steps, currentStep }) {
  return (
    <div className="bg-white rounded-lg border border-lightGray p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted || isCurrent
                      ? "bg-[#6B4EFF] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <FiCheckCircle className="text-xl" />
                  ) : (
                    <Icon className="text-xl" />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-semibold ${
                    isCurrent ? "text-[#6B4EFF]" : "text-darkGray"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? "bg-[#6B4EFF]" : "bg-gray-200 border-dashed"
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

export default ProgressIndicator;

