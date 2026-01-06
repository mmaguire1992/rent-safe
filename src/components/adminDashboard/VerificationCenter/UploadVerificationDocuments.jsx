'use client'

import { useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import FileUpload from "@/components/FileUpload";
import { documentTypeOptions } from "@/constant";

function UploadVerificationDocuments({ 
  onSubmit, 
  documentTypes, 
  loading = false,
  reuploadMode = false,
  preSelectedDocumentType = null
}) {
  const [selectedDocumentType, setSelectedDocumentType] = useState(preSelectedDocumentType || "");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});

  // Update selected document type when preSelectedDocumentType changes (reupload mode)
  useEffect(() => {
    if (preSelectedDocumentType) {
      setSelectedDocumentType(preSelectedDocumentType);
    } else if (!reuploadMode && !preSelectedDocumentType) {
      // Clear selection when reupload mode is turned off
      setSelectedDocumentType("");
    }
  }, [preSelectedDocumentType, reuploadMode]);

  const validateForm = () => {
    const newErrors = {};
    
    // In reupload mode, document type is pre-selected, so skip validation
    if (!reuploadMode && !selectedDocumentType) {
      newErrors.documentType = 'Please select a document type';
    }
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
      newErrors.files = 'Please upload at least one file';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      // Show a single combined error message
      const errorMessages = [];
      if (!reuploadMode && !selectedDocumentType) {
        errorMessages.push('select a document type');
      }
      if (!uploadedFiles || uploadedFiles.length === 0) {
        errorMessages.push('upload at least one file');
      }
      
      if (errorMessages.length > 0) {
        toast.error(`Please ${errorMessages.join(' and ')}`);
      }
      return;
    }
    
    onSubmit({
      documentType: selectedDocumentType,
      files: uploadedFiles,
    });
    
    // Reset form (preserve document type in reupload mode)
    if (!reuploadMode) {
      setSelectedDocumentType("");
    }
    setUploadedFiles([]);
    setErrors({});
  };

  const handleDocumentTypeChange = (value) => {
    // Don't allow changes in reupload mode
    if (reuploadMode) return;
    setSelectedDocumentType(value);
    // Clear error when user selects a type
    if (errors.documentType) {
      setErrors(prev => ({ ...prev, documentType: '' }));
    }
  };

  const handleFilesChange = (files) => {
    setUploadedFiles(files);
    // Clear error when user uploads files
    if (errors.files) {
      setErrors(prev => ({ ...prev, files: '' }));
    }
  };

  return (
    <div className="bg-white rounded-[14px] border border-lightGray md:p-4 p-3">
      <h2 className="text-xl font-semibold font-nunito text-secondary md:mb-6 mb-4">
        {reuploadMode ? 'Re-upload Document' : 'Upload Verification Documents'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-base font-medium text-secondary mb-2">
            Document Type <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            options={documentTypes || documentTypeOptions}
            value={selectedDocumentType}
            onChange={handleDocumentTypeChange}
            placeholder="Select your document type"
            error={!!errors.documentType}
            disabled={reuploadMode}
          />
          {reuploadMode && (
            <p className="mt-1 text-sm text-gray-500">
              Document type is fixed for re-upload. Please upload the corrected file.
            </p>
          )}
          {errors.documentType && (
            <p className="mt-1 text-sm text-red-600">{errors.documentType}</p>
          )}
        </div>

        <div>
          <FileUpload
            label=""
            acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
            maxFiles={3}
            maxSize={10 * 1024 * 1024}
            onFilesChange={handleFilesChange}
            uploadedFiles={uploadedFiles}
          />
          {errors.files && (
            <p className="mt-1 text-sm text-red-600">{errors.files}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blueGradient text-white rounded-[10px] hover:bg-opacity-90 transition-colors font-bold font-nunito shadow-[0px_2px_10px_0px_#00000033] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadVerificationDocuments;
