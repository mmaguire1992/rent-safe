import React from "react";

function ProgressIndicator({ currentStep, totalSteps = 3 }) {
  return (
    <div className="flex items-center justify-between gap-0 mb-4 overflow-x-auto">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isLineActive = stepNumber < currentStep; // Line is active if the step it connects FROM is completed

        return (
          <React.Fragment key={stepNumber}>
            {/* Step Circle */}
            <div
              className={`relative z-10 w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-full flex border-[6px] sm:border-[8px] border-[#E8E2FF] items-center justify-center font-semibold text-sm sm:text-base flex-shrink-0 ${
                isActive
                  ? "bg-[#4A2FCC] text-white"
                  : "bg-[#F9F9FC] text-gray-400"
              }`}
            >
              {stepNumber}
            </div>

            {/* Connecting Line - extends from one circle to the next */}
            {stepNumber < totalSteps && (
              <div
                className={`w-[120px] h-0.5 border-t-2 -ml-[25px] -mr-[25px] sm:-ml-[30px] sm:-mr-[30px] z-0 ${
                  isLineActive
                    ? "border-purple-600 border-dashed"
                    : "border-gray-300 border-dashed"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ProgressIndicator;
