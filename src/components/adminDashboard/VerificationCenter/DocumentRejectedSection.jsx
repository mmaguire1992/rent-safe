import { FiAlertTriangle, FiFileText, FiDownload } from "react-icons/fi";
import RejectedWhiteIcon from "@/svg/rejectedWhiteIcon";

function DocumentRejectedSection({ rejectedDocument, onReupload, onDownload }) {
  if (!rejectedDocument) return null;

  return (
    <div className=" border border-[#FFC9C9] rounded-[10px]">
      <div className="flex items-start flex-wrap md:flex-nowrap justify-between w-full gap-4 rounded-tl-[10px] rounded-tr-[10px] bg-[#FEF2F2]  p-4">
        <div className="flex items-start md:items-center gap-3">
          <span className="flex justify-center items-center p-1 mt-1 w-10 h-10 rounded-[10px] bg-[#D24343]">
            <RejectedWhiteIcon />
          </span>
          <div className="flex-1">
            <h3 className="text-base font-bold font-nunito text-[#D24343] mb-0">
              Document Rejected
            </h3>
            <div className="flex items-center gap-2 mb-0 flex-wrap">
              <span className="text-sm font-normal font-nunito text-[#D24343] truncate w-[300px] lg:w-auto ">
                {rejectedDocument.name}
              </span>
              {rejectedDocument.docTypeLabel && (
                <span className="text-xs font-semibold font-nunito text-[#D24343] bg-white px-2 py-0.5 rounded border border-[#FFC9C9]">
                  {rejectedDocument.docTypeLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-[45px] md:ml-0">
          <button
            onClick={onDownload}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            title="Download document"
          >
            <FiDownload className="text-white text-lg" />
          </button>
          <button
            onClick={onReupload}
            className="px-6 py-2 bg-blueGradient text-white rounded-[10px] text-base shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors font-bold font-nunito"
          >
            Re-upload Document
          </button>
        </div>
      </div>
      <div className="block bg-white p-4 rounded-bl-[10px] rounded-br-[10px]">
        <h3 className="text-sm font-normal font-nunito text-[#0F172B] mb-2">
          Reason for Rejection
        </h3>
        <div className="bg-[#FFEFEF] border border-[#FFC9C9] rounded-[10px] p-4">
          <p className="text-sm font-normal font-nunito text-red-600 mb-0">
            {rejectedDocument.reason}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DocumentRejectedSection;
