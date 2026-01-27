import { FiAlertCircle } from "react-icons/fi";

function RejectedDocumentsSection({ documents, onReupload }) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="bg-white rounded-[14px] border border-lightGray md:p-4 p-3">
      <h2 className="text-xl font-semibold font-nunito text-secondary mb-4">
        Rejected Documents
      </h2>
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="bg-[#FEF2F2] border border-[#FFC9C9] rounded-[14px] pt-4 overflow-hidden"
          >
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4 mb-3 px-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Red Icon with Exclamation */}
                <div className="w-10 h-10 bg-[#D24343] rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center">
                    <FiAlertCircle className="text-white text-lg" />
                  </div>
                </div>
                
                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold font-nunito text-[#D24343]">
                    Document Rejected
                  </h3>
                  <p className="text-sm font-normal font-nunito text-[#D24343]">
                    {doc.docTypeLabel && `${doc.docTypeLabel} - `}
                    {doc.name}
                  </p>
                </div>
              </div>
              
              {/* Re-upload Button */}
              {onReupload && (
                <button
                  onClick={() => onReupload(doc)}
                  className="px-4 py-2 bg-blueGradient text-white rounded-[10px] text-sm font-bold font-nunito hover:bg-opacity-90 transition-colors whitespace-nowrap flex-shrink-0"
                  title="Re-upload document"
                >
                  Re-upload Document
                </button>
              )}
            </div>

            {/* Separator Line */}
            <div className="border-b border-[#FFC9C9] mb-3"></div>

            {/* Reason Section */}
            {doc.reason && (
              <div className="py-4 px-4 bg-white overflow-hidden">
                <p className="text-sm font-semibold font-nunito text-darkGray mb-2">
                  Reason for Rejection:
                </p>
                <div className="bg-[#FEF2F2] border border-[#FFC9C9] rounded-[8px] p-3">
                  <p className="text-sm font-normal font-nunito text-[#D24343]">
                    {doc.reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RejectedDocumentsSection;

