import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import FileUpload from "@/components/FileUpload";
import { documentTypeOptions } from "@/constant";

function UploadVerificationDocuments({ onSubmit, documentTypes }) {
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDocumentType && uploadedFiles.length > 0) {
      onSubmit({
        documentType: selectedDocumentType,
        files: uploadedFiles,
      });
      // Reset form
      setSelectedDocumentType("");
      setUploadedFiles([]);
    }
  };

  return (
    <div className="bg-white rounded-[14px] border border-lightGray p-3 md:p-4">
      <h2 className="text-lg md:text-xl font-semibold font-nunito text-secondary mb-3 md:mb-6">
        Upload Verification Documents
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-2">
            Document Type
          </label>
          <CustomDropdown
            options={documentTypes || documentTypeOptions}
            value={selectedDocumentType}
            onChange={setSelectedDocumentType}
            placeholder="Select your document type"
          />
        </div>

        <div>
          <FileUpload
            label=""
            acceptedTypes=".pdf,.docx,.png"
            maxFiles={3}
            onFilesChange={setUploadedFiles}
            uploadedFiles={uploadedFiles}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 w-full sm:w-auto py-2 bg-blueGradient text-white rounded-[10px] hover:bg-opacity-90 transition-colors font-bold font-nunito shadow-[0px_2px_10px_0px_#00000033]"
          >
            Submit for Review
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadVerificationDocuments;
