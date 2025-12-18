import BlueCreditIcon from "@/svg/blueCreditIcon";

function CreditCheck({ tenantData }) {
  const creditPercentage =
    (tenantData.creditScore / tenantData.creditMax) * 100;

  return (
    <div className="bg-lightGreenGradient rounded-lg border border-lightGray p-4 md:p-6">
      <div className="flex items-center justify-start gap-4 mb-6">
        <span className="bg-[#E8E2FF] rounded-[10px] p-2">
          <BlueCreditIcon />
        </span>
        <h2 className="text-lg md:text-xl font-bold text-secondary font-nunito mb-0">
          Credit Check
        </h2>
      </div>
      <div className="block">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#E5E7EB"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#19AC57"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${
                2 * Math.PI * 56 * (1 - creditPercentage / 100)
              }`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#00893A] font-nunito">
              {tenantData.creditScore}
            </span>
            <span className="text-sm text-darkGray font-normal font-nunito">
              out of {tenantData.creditMax}
            </span>
          </div>
        </div>
        <div className="p-4 bg-[#DFFFE6] rounded-[10px]">
          <h3 className="text-base font-bold text-[#00893A] mb-2">
            {tenantData.creditRating}
          </h3>
          <p className="text-[#00893A] text-base font-normal font-nunito">
            {tenantData.creditDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreditCheck;
