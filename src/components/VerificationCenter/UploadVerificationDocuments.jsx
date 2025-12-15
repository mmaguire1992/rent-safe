import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import CustomDropdown from "@/components/common/CustomDropdown";
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
    <div className="bg-white rounded-lg border border-lightGray p-6">
      <h2 className="text-xl font-bold font-nunito text-secondary mb-6">
        Upload Verification Documents
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-base font-medium text-secondary mb-2">
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
            className="px-6 py-2 bg-[#6B4EFF] text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold font-nunito"
          >
            Submit for Review
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadVerificationDocuments;





