'use client'

import { useState } from "react";
import UploadIcon from "@/svg/uploadIcon";

function DocumentUpload({ label, maxFiles = 5, onFilesChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).slice(
      0,
      maxFiles - uploadedFiles.length
    );
    const newFiles = [...uploadedFiles, ...validFiles];
    setUploadedFiles(newFiles);
    if (onFilesChange) onFilesChange(newFiles);
  };

  const removeFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    if (onFilesChange) onFilesChange(newFiles);
  };

  return (
    <div className="mt-4">
      <label className="block text-base font-medium text-secondary mb-2">
        {label}
      </label>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 md:p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-purple-50"
            : "border-lightGray bg-[#F9F9FC]"
        }`}
      >
        <input
          type="file"
          id={`doc-upload-${label}`}
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          disabled={uploadedFiles.length >= maxFiles}
        />
        <label
          htmlFor={`doc-upload-${label}`}
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="mb-3 flex items-center bg-white rounded-lg p-2 w-[36px] h-[36px] justify-center">
            <UploadIcon />
          </div>
          <p className="text-base text-darkGray font-medium mb-1">
            Drop your files here or browse
          </p>
          <p className="text-sm text-midGray font-medium">
            pdf, doc, and png. Max {maxFiles} docs.
          </p>
        </label>
      </div>
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
            >
              <span className="text-sm text-secondary">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-errorColor hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
