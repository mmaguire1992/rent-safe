import { FiLoader, FiX, FiFileText } from "react-icons/fi";

function UnderReviewDocumentsSection({ documents, onDelete }) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-lightGray p-6">
      <h2 className="text-xl font-bold font-nunito text-secondary mb-4">
        Under Review Documents
      </h2>
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-[#6B4EFF] rounded-lg flex items-center justify-center flex-shrink-0">
                <FiFileText className="text-white text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold font-nunito text-secondary truncate">
                  {doc.name}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm font-normal font-nunito text-darkGray">
                    {doc.size}
                  </span>
                  <span className="text-sm font-normal font-nunito text-darkGray">
                    Uploaded {doc.uploadedDate}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiLoader className="text-[#6B4EFF] text-xl animate-spin flex-shrink-0" />
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
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





