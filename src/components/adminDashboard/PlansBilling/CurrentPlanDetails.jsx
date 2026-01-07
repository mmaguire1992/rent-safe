import { FiClock, FiHome, FiX } from "react-icons/fi";
import GreenClockIcon from "@/svg/greenClockIcon";
import PropertyGreenIcon from "@/svg/propertyGreenIcon";

function CurrentPlanDetails({ currentPlan, onCancel, onUpgrade }) {
  return (
    <div className="bg-[#DFFFE6] rounded-[20px] p-5  overflow-hidden">
      <div className="flex items-center justify-between w-full">
        <h3 className="text-sm bg-[#009966] py-1 px-2 rounded font-medium  font-nunito text-white">
          CURRENT PLAN
        </h3>
        <div className="hidden md:flex gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-white  text-[#4A2FCC] rounded-[10px] text-base font-nunito transition-colors font-bold"
          >
            Cancel Plan
          </button>
          <button
            onClick={onUpgrade}
            className="bg-yellowGradient text-white px-6 py-2 rounded-[10px] text-base font-bold font-nunito transition-colors whitespace-nowrap"
          >
            {/* <FiSparkles /> */}
            <span>Upgrade Your Plan</span>
          </button>
        </div>
      </div>
      <div className="p-0 mt-4 md:mt-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold font-nunito text-secondary mb-1">
              {currentPlan.name}
            </h3>
            <p className="text-base font-normal font-nunito text-darkGray mb-4">
              {currentPlan.description}
            </p>
            <div className="flex flex-wrap items-center md:gap-6 gap-2">
              <div className="flex items-center gap-2">
                <GreenClockIcon />
                <span className="text-base font-normal font-nunito text-secondary">
                  Renewal Date:
                  <span className="font-bold ml-1">{currentPlan.renewalDate}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PropertyGreenIcon />
                <span className="text-base font-normal font-nunito text-secondary">
                  Properties Remaining:{" "}
                  <span className="font-bold">
                    {currentPlan.propertiesRemaining} of{" "}
                    {currentPlan.totalProperties}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex md:hidden gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-white  text-[#4A2FCC] rounded-[10px] text-sm font-nunito transition-colors font-bold"
            >
              Cancel Plan
            </button>
            <button
              onClick={onUpgrade}
              className="bg-yellowGradient text-white px-4 py-2 rounded-[10px] text-sm font-bold font-nunito transition-colors whitespace-nowrap"
            >
              {/* <FiSparkles /> */}
              <span>Upgrade Your Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentPlanDetails;
