import { FiCheck, FiX, FiFileText } from "react-icons/fi";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";

function VerifiedDocumentsSection({ documents, onDelete }) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="bg-white rounded-[14px] border border-lightGray p-3 md:p-4">
      <h2 className="text-lg md:text-xl font-semibold font-nunito text-secondary mb-4">
        Verified Documents
      </h2>
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 md:p-4 bg-[#EDFFF4] border border-[#B6E9C9] rounded-[14px]"
          >
            <div className="flex items-center md:gap-4 gap-3 flex-1">
              <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center flex-shrink-0">
                <FiFileText className="text-[#00893A] text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-normal flex items-center gap-2 font-nunito text-secondary truncate">
                  {doc.name} <GreenCheckedIcon />
                </p>
                <div className="flex items-center md:gap-4 gap-3 mt-1">
                  <span className="text-xs font-normal font-nunito text-midGray">
                    {doc.size}
                  </span>
                  <span className="text-xs font-normal relative before:content-[''] before:absolute before:left-[-11px] before:rounded-full before:w-[6px] before:bottom-1 before:h-[6px] before:bg-midGray font-nunito text-midGray">
                    Uploaded {doc.uploadedDate}
                  </span>
                </div>
              </div>
              <div className="flex items-center md:gap-3 gap-1">
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-0 rounded-lg transition-colors flex-shrink-0"
                >
                  <FiX className="text-darkGray text-xl" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VerifiedDocumentsSection;
