import { FiX, FiFileText, FiDownload, FiAlertCircle, FiUpload } from "react-icons/fi";

function RejectedDocumentsSection({ documents, onDelete, onDownload, onReupload }) {
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
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:p-4 p-3 bg-[#FEF2F2] border border-[#FFC9C9] rounded-[14px] overflow-hidden"
          >
            <div className="flex items-center md:gap-4 gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-[#D24343] rounded-[10px] flex items-center justify-center flex-shrink-0">
                <FiFileText className="text-white text-lg" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-normal font-nunito text-secondary flex items-center gap-2">
                  <span className="truncate">{doc.name}</span>
                  <FiAlertCircle className="text-[#D24343] text-lg animate-pulse flex-shrink-0" />
                </p>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mt-1 flex-wrap">
                  {doc.docTypeLabel && (
                    <span className="text-xs font-semibold font-nunito text-[#D24343] bg-white px-2 py-0.5 rounded border border-[#FFC9C9] whitespace-nowrap">
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
                {doc.reason && (
                  <div className="mt-2 bg-white border border-[#FFC9C9] rounded-[8px] p-2">
                    <p className="text-xs font-semibold font-nunito text-[#D24343] mb-1">Rejection Reason:</p>
                    <p className="text-xs font-normal font-nunito text-red-600">{doc.reason}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:flex-shrink-0 md:self-start md:mt-0">
              {onDownload && (
                <button
                  onClick={() => onDownload(doc)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Download document"
                >
                  <FiDownload className="text-[#D24343] text-lg" />
                </button>
              )}
              {onReupload && (
                <button
                  onClick={() => onReupload(doc)}
                  className="px-4 py-2 bg-blueGradient text-white rounded-[10px] text-sm font-bold shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors whitespace-nowrap"
                  title="Re-upload document"
                >
                  Re-upload
                </button>
              )}
              <button
                onClick={() => onDelete(doc.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
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

export default RejectedDocumentsSection;

