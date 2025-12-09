function ProgressIndicator({ currentStep, totalSteps = 3 }) {
  return (
    <div className="flex items-center justify-between gap-0 mb-4 overflow-x-auto">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={stepNumber} className="flex items-center flex-shrink-0">
            {/* Step Circle */}
            <div
              className={`w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-full flex border-[6px] sm:border-[8px] border-[#E8E2FF] items-center justify-center font-semibold text-sm sm:text-base ${
                isActive
                  ? "bg-[#4A2FCC] text-white"
                  : "bg-[#F9F9FC] text-gray-400"
              }`}
            >
              {isCompleted ? stepNumber : stepNumber}
            </div>

            {/* Connecting Line */}
            {stepNumber < totalSteps && (
              <div
                className={`w-[60px] sm:w-[100px] md:w-[120px] h-0.5 mx-0 border-t-2 ${
                  isActive
                    ? "border-purple-600 border-dashed"
                    : "border-gray-300 border-dashed"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProgressIndicator;
