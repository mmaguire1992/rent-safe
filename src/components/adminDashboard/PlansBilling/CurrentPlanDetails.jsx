'use client'

import { FiClock, FiHome, FiX } from "react-icons/fi";
import GreenClockIcon from "@/svg/greenClockIcon";
import PropertyGreenIcon from "@/svg/propertyGreenIcon";

function CurrentPlanDetails({ currentPlan, onUpgrade }) {
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'No expiration';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // If no plan, show message
  if (!currentPlan || !currentPlan.plan) {
    return (
      <div className="bg-[#DFFFE6] rounded-[20px] p-5 overflow-hidden">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-sm bg-[#009966] py-1 px-2 rounded font-medium font-nunito text-white">
            CURRENT PLAN
          </h3>
        </div>
        <div className="p-0 mt-4">
          <p className="text-base font-normal font-nunito text-darkGray">
            You don't have an active subscription plan. Please select a plan to get started.
          </p>
        </div>
      </div>
    );
  }

  const plan = currentPlan.plan;
  const renewalDate = currentPlan.currentPeriodEnd 
    ? formatDate(currentPlan.currentPeriodEnd)
    : 'No expiration (One-time payment)';

  // Show upgrade button only if subscription is expired or property limit is reached
  const showUpgradeButton = currentPlan.status === 'expired' || 
                            (currentPlan.remainingProperties !== undefined && currentPlan.remainingProperties === 0);

  return (
    <div className="bg-[#DFFFE6] rounded-[20px] p-5 overflow-hidden">
      <div className="flex items-center justify-between w-full">
        <h3 className="text-sm bg-[#009966] py-1 px-2 rounded font-medium font-nunito text-white">
          CURRENT PLAN
        </h3>
        {showUpgradeButton && (
        <div className="hidden md:flex gap-3">
          <button
            onClick={onUpgrade}
            className="bg-yellowGradient text-white px-6 py-2 rounded-[10px] text-base font-bold font-nunito transition-colors whitespace-nowrap"
          >
            <span>Upgrade Your Plan</span>
          </button>
        </div>
        )}
      </div>
      <div className="p-0 mt-4 md:mt-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold font-nunito text-secondary mb-1">
              {plan.name || 'Unknown Plan'}
            </h3>
            <p className="text-base font-normal font-nunito text-darkGray mb-4">
              {plan.description || 'No description available'}
            </p>
            <div className="flex flex-wrap items-center md:gap-6 gap-2">
              <div className="flex items-center gap-2">
                <GreenClockIcon />
                <span className="text-base font-normal font-nunito text-secondary">
                  {currentPlan.currentPeriodEnd ? 'Expires:' : 'Payment Type:'}
                  <span className="font-bold ml-1">{renewalDate}</span>
                </span>
              </div>
              {currentPlan.totalProperties > 0 && (
              <div className="flex items-center gap-2">
                <PropertyGreenIcon />
                <span className="text-base font-normal font-nunito text-secondary">
                  Properties Remaining:{" "}
                  <span className="font-bold">
                      {currentPlan.propertiesRemaining || 0} of{" "}
                    {currentPlan.totalProperties}
                  </span>
                </span>
              </div>
              )}
            </div>
          </div>
          {showUpgradeButton && (
          <div className="flex md:hidden gap-3">
            <button
              onClick={onUpgrade}
              className="bg-yellowGradient text-white px-4 py-2 rounded-[10px] text-sm font-bold font-nunito transition-colors whitespace-nowrap"
            >
              <span>Upgrade Your Plan</span>
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurrentPlanDetails;
