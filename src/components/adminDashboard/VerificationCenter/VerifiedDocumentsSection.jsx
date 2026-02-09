import { FiCheck, FiX, FiFileText, FiDownload } from "react-icons/fi";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";

function VerifiedDocumentsSection({ documents, onDelete, onDownload }) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="bg-white rounded-[14px] border border-lightGray md:p-4 p-3">
      <h2 className="text-xl font-semibold font-nunito text-secondary mb-4">
        Verified Documents
      </h2>
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex md:flex-row md:items-start md:justify-between gap-3 md:p-4 p-3 bg-[#EDFFF4] border border-[#B6E9C9] rounded-[14px] overflow-hidden"
          >
            <div className="flex items-center md:gap-4 gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center flex-shrink-0">
                <FiFileText className="text-[#00893A] text-lg" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-normal flex items-center gap-2 font-nunito text-secondary">
                  <span className="truncate">{doc.name}</span>
                  <span className="flex-shrink-0"><GreenCheckedIcon /></span>
                </p>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mt-1 flex-wrap">
                  {doc.docTypeLabel && (
                    <span className="text-xs font-semibold font-nunito text-[#00893A] bg-white px-2 py-0.5 rounded border border-[#B6E9C9] whitespace-nowrap">
                      {doc.docTypeLabel} 
                    </span>
                  )}
                  <span className="text-xs font-normal font-nunito text-midGray whitespace-nowrap">
                    {doc.size}
                  </span>
                  <span className="text-xs font-normal relative before:content-[''] before:absolute before:left-[-8px] sm:before:left-[-11px] before:rounded-full before:w-[6px] before:bottom-1 before:h-[6px] before:bg-midGray font-nunito text-midGray whitespace-nowrap">
                    Uploaded {doc.uploadedDate}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3 md:flex-shrink-0 md:self-start md:mt-0">
              <button
                onClick={() => onDownload(doc)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title="Download document"
              >
                <FiDownload className="text-[#00893A] text-lg" />
              </button>
              <button
                onClick={() => onDelete(doc.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title="Delete document"
              >
                <FiX className="text-darkGray text-lg" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VerifiedDocumentsSection;
