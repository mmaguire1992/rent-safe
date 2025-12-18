import { FiCheck } from "react-icons/fi";
import GrayCheckedIcon from "@/svg/grayCheckedIcon";

function PendingDocumentsSection({ requirements }) {
  if (!requirements || requirements.length === 0) return null;

  return (
    <div className="bg-white rounded-[14px] border border-lightGray p-3 md:p-4">
      <h2 className="text-lg md:text-xl font-semibold font-nunito text-secondary mb-2">
        Pending Documents
      </h2>
      <div>
        <h4 className="text-sm md:text-base font-normal font-nunito text-secondary mb-2">
          Required Information:
        </h4>
        <div className="space-y-1">
          {requirements.map((requirement, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <GrayCheckedIcon className="text-[#6B4EFF] text-lg" />
              </div>
              <p className="text-base font-normal font-nunito text-darkGray">
                {requirement}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PendingDocumentsSection;
