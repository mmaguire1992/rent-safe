import { FiCheckCircle } from "react-icons/fi";

function ProgressIndicator({ steps, currentStep }) {
  const progressPercentage = Math.round((currentStep / steps.length) * 100);

  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-6 overflow-hidden mb-3">
      {/* Desktop & Tablet Progress Indicator */}
      <div className="hidden md:flex items-start justify-between gap-0 mb-4 overflow-y-hidden overflow-x-auto">
        <div className="flex items-start justify-between gap-0 w-full min-w-[1040px]">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div
                key={step.number}
                className="flex items-center flex-1 last-of-type:flex-[0]"
              >
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center w-full">
                    <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                      <div
                        className={`w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-full flex border-[6px] sm:border-[8px] border-[#E8E2FF] items-center justify-center font-semibold text-sm sm:text-base ${
                          isCompleted || isCurrent
                            ? "bg-[#4A2FCC] text-white"
                            : "bg-[#F9F9FC] text-gray-400"
                        }`}
                      >
                        <Icon className="text-xl" />
                      </div>
                      <span
                        className={`text-base mt-2 font-semibold text-secondary font-nunito whitespace-nowrap`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 border-t-[3px] -ml-[47px] -mr-[45px] sm:-mr-[40px] mt-[-22px] z-0 ${
                          isCompleted
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

      {/* Mobile Progress Indicator */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-1">
            {steps.slice(0, 2).map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;

              return (
                <div key={step.number} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-[40px] h-[40px] rounded-full flex border-[6px] border-[#E8E2FF] items-center justify-center ${
                        isCompleted || isCurrent
                          ? "bg-[#4A2FCC] text-white"
                          : "bg-[#F9F9FC] text-gray-400"
                      }`}
                    >
                      <Icon className="text-lg" />
                    </div>
                    <span className="text-xs mt-1 font-semibold text-secondary font-nunito">
                      {step.label}
                    </span>
                  </div>
                  {index === 0 && (
                    <div
                      className={`flex-1 h-0.5 border-t-[2px] -ml-[20px] -mr-[20px] mt-[-20px] z-0 ${
                        isCompleted
                          ? "border-purple-600 border-dashed"
                          : "border-gray-300 border-dashed"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-right">
            <p className="text-xs text-darkGray font-nunito">
              Step {currentStep}/{steps.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#E6E8EC] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#6B4EFF] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-sm font-bold text-[#6B4EFF] font-nunito min-w-[40px]">
            {progressPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProgressIndicator;
