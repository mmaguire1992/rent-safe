import { FiLoader, FiX, FiFileText, FiDownload } from "react-icons/fi";

function UnderReviewDocumentsSection({ documents, onDelete, onDownload }) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="bg-white rounded-[14px] border border-lightGray md:p-6 p-3">
      <h2 className="text-xl font-bold font-nunito text-secondary mb-4">
        Under Review Documents
      </h2>
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex items-center justify-between md:p-4 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px]"
          >
            <div className="flex items-center md:gap-4 gap-3 flex-1">
              <div className="w-10 h-10 bg-[#EEEAFF] rounded-[10px]  flex items-center justify-center flex-shrink-0">
                <FiFileText className="text-[#4A2FCC] text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-normal font-nunito text-secondary truncate flex items-center gap-2">
                  {doc.name}
                  <FiLoader className="text-[#6B4EFF] text-xl animate-spin flex-shrink-0" />
                </p>
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                  {doc.docTypeLabel && (
                    <span className="text-xs font-semibold font-nunito text-[#6B4EFF] bg-[#EEEAFF] px-2 py-0.5 rounded">
                      {doc.docTypeLabel}
                    </span>
                  )}
                  <span className="text-xs font-normal font-nunito text-midGray">
                    {doc.size}
                  </span>
                  <span className="text-xs relative before:content-[''] before:absolute before:left-[-11px] before:rounded-full before:w-[6px] before:bottom-1 before:h-[6px] before:bg-midGray font-normal font-nunito text-midGray">
                    Uploaded {doc.uploadedDate}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onDownload(doc)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  title="Download document"
                >
                  <FiDownload className="text-[#6B4EFF] text-lg" />
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default UnderReviewDocumentsSection;
