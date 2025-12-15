import { FiCheck } from "react-icons/fi";

function PendingDocumentsSection({ requirements }) {
  if (!requirements || requirements.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-lightGray p-6">
      <h2 className="text-xl font-bold font-nunito text-secondary mb-4">
        Pending Documents
      </h2>
      <div className="space-y-3">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <FiCheck className="text-[#6B4EFF] text-lg" />
            </div>
            <p className="text-sm font-normal font-nunito text-secondary">
              {requirement}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingDocumentsSection;





