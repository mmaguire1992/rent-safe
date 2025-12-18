import { FiLoader, FiX, FiFileText } from "react-icons/fi";

function UnderReviewDocumentsSection({ documents, onDelete }) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="bg-white rounded-[14px] border border-lightGray p-3 md:p-6">
      <h2 className="text-lg md:text-xl font-bold font-nunito text-secondary mb-4">
        Under Review Documents
      </h2>
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 md:p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px]"
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
                <div className="flex items-center md:gap-4 gap-3 mt-1">
                  <span className="text-xs font-normal font-nunito text-midGray">
                    {doc.size}
                  </span>
                  <span className="text-xs relative before:content-[''] before:absolute before:left-[-11px] before:rounded-full before:w-[6px] before:bottom-1 before:h-[6px] before:bg-midGray font-normal font-nunito text-midGray">
                    Uploaded {doc.uploadedDate}
                  </span>
                </div>
              </div>
              <div className="flex items-center md:gap-3 gap-1">
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-0 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <FiX className="text-darkGray" />
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
