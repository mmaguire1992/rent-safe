import { FiCheck } from "react-icons/fi";

function PlansSection({ plans, currentPlan, onSwitchPlan }) {
  return (
    <div className="block">
      <div className="mb-6">
        <h2 className="lg:text-2xl text-xl font-bold font-nunito text-secondary mb-0">
          Plans & Billing
        </h2>
        <p className="text-base font-normal font-nunito text-darkGray">
          Choose the perfect plan for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`rounded-[20px] border-2 p-4 flex flex-col ${
                isCurrentPlan
                  ? "border-[#6B4EFF] bg-[#6B4EFF] text-white"
                  : "border-lightGray bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xl font-bold font-nunito mb-0 ${
                    isCurrentPlan ? "text-white" : "text-secondary"
                  }`}
                >
                  {plan.name}
                </h3>
                {plan.badge && (
                  <div className="mb-0">
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                        isCurrentPlan
                          ? "bg-white text-[#6B4EFF]"
                          : plan.badge === "NEW"
                          ? "bg-[#009966] text-white"
                          : "bg-purple-100 text-[#6B4EFF]"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}
              </div>
              <p
                className={`text-sm font-normal font-nunito mb-4 ${
                  isCurrentPlan ? "text-white opacity-90" : "text-darkGray"
                }`}
              >
                {plan.description}
              </p>

              <div
                className={`mb-4 border-b  pb-1 ${
                  isCurrentPlan ? "border-b-white" : "border-b-lightGray"
                }`}
              >
                <span
                  className={`text-3xl font-bold font-nunito ${
                    isCurrentPlan ? "text-white" : "text-[#4A2FCC]"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-base font-normal font-nunito ml-2 ${
                    isCurrentPlan ? "text-white opacity-90" : "text-midGray"
                  }`}
                >
                  {plan.period}
                </span>
              </div>

              <div className="flex-1 space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <FiCheck
                      className={`mt-0.5 text-xl flex-shrink-0 ${
                        isCurrentPlan ? "text-white" : "text-[#009966]"
                      }`}
                    />
                    <span
                      className={`text-base font-normal font-nunito ${
                        isCurrentPlan ? "text-white" : "text-darkGray"
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSwitchPlan(plan.id)}
                className={`w-full py-3 rounded-[10px] font-bold text-base font-nunito transition-colors ${
                  isCurrentPlan
                    ? "bg-white text-[#6B4EFF] hover:bg-gray-100"
                    : "bg-blueGradient text-white hover:bg-opacity-90"
                }`}
              >
                {isCurrentPlan ? "Current Plan" : "Switch Plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlansSection;
