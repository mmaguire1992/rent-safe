import { FiAlertTriangle, FiFileText } from "react-icons/fi";

function DocumentRejectedSection({ rejectedDocument, onReupload }) {
  if (!rejectedDocument) return null;

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <FiAlertTriangle className="text-red-600 text-2xl" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold font-nunito text-red-700 mb-2">
            Document Rejected
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <FiFileText className="text-red-600" />
            <span className="text-base font-semibold font-nunito text-red-700">
              {rejectedDocument.name}
            </span>
          </div>
          <p className="text-sm font-normal font-nunito text-red-600 mb-4">
            {rejectedDocument.reason}
          </p>
          <button
            onClick={onReupload}
            className="px-6 py-2 bg-[#6B4EFF] text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold font-nunito"
          >
            Re-upload Document
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentRejectedSection;





