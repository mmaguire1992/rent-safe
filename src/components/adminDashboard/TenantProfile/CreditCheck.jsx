import BlueCreditIcon from "@/svg/blueCreditIcon";

function CreditCheck({ tenantData }) {
  const creditScore = tenantData.creditScore || 0;
  const creditMax = tenantData.creditMax || 850;
  const creditPercentage = creditMax > 0 ? (creditScore / creditMax) * 100 : 0;

  // Calculate rating based on score (assuming max is 850, but adaptable)
  const getCreditRating = (score, max) => {
    // Normalize to 850 scale if max is different
    const normalizedScore = max === 850 ? score : (score / max) * 850;
    
    if (normalizedScore < 500) {
      return {
        rating: 'Bad',
        description: 'This tenant has a low credit score and may pose a higher risk.',
        gaugeColor: '#DC2626', // Red
        textColor: '#DC2626', // Red
        bgColor: '#FEE2E2', // Light pink/red
        cardBg: 'bg-gradient-to-br from-red-50 to-pink-50', // Light pink gradient
      };
    } else if (normalizedScore >= 500 && normalizedScore < 600) {
      return {
        rating: 'Fair',
        description: 'This tenant has a fair credit score with moderate payment reliability.',
        gaugeColor: '#D97706', // Orange-yellow
        textColor: '#D97706', // Orange-yellow
        bgColor: '#FEF3C7', // Light yellow
        cardBg: 'bg-gradient-to-br from-yellow-50 to-amber-50', // Light yellow gradient
      };
    } else if (normalizedScore >= 600 && normalizedScore < 700) {
      return {
        rating: 'Good',
        description: 'This tenant demonstrates good creditworthiness and payment reliability.',
        gaugeColor: '#EA580C', // Brownish-orange
        textColor: '#EA580C', // Brownish-orange
        bgColor: '#FED7AA', // Light orange/peach
        cardBg: 'bg-gradient-to-br from-orange-50 to-amber-50', // Light orange gradient
      };
    } else {
      return {
        rating: 'Excellent',
        description: 'This tenant demonstrates excellent creditworthiness and payment reliability.',
        gaugeColor: '#19AC57', // Green
        textColor: '#00893A', // Dark green
        bgColor: '#DFFFE6', // Light green
        cardBg: 'bg-lightGreenGradient', // Light green gradient
      };
    }
  };

  const creditInfo = getCreditRating(creditScore, creditMax);

  return (
    <div className={`${creditInfo.cardBg} rounded-lg border border-lightGray p-4 md:p-6`}>
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
              stroke={creditInfo.gaugeColor}
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
            <span className={`text-2xl font-bold font-nunito`} style={{ color: creditInfo.textColor }}>
              {creditScore}
            </span>
            <span className="text-sm text-darkGray font-normal font-nunito">
              out of {creditMax}
            </span>
          </div>
        </div>
        <div className="p-4 rounded-[10px]" style={{ backgroundColor: creditInfo.bgColor }}>
          <h3 className={`text-base font-bold mb-2 font-nunito`} style={{ color: creditInfo.textColor }}>
            {creditInfo.rating}
          </h3>
          <p className={`text-base font-normal font-nunito`} style={{ color: creditInfo.textColor }}>
            {creditInfo.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreditCheck;
