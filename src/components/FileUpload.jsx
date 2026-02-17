'use client'

import { useState, useRef } from "react";
import { toast } from "react-toastify";
import UploadIcon from "@/svg/uploadIcon";
import DeleteIcon from "@/svg/deleteIcon";
import PdfIcon from "@/svg/pdfIcon";

function FileUpload({
  label,
  acceptedTypes = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp",
  maxFiles = 3,
  maxSize = 10 * 1024 * 1024, // 10MB (matches backend)
  onFilesChange,
  uploadedFiles = [],
  allowMultiple = true,
}) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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
      // Reset input value after processing to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset input value after processing to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleFiles = (files) => {
    const acceptedExtensions = acceptedTypes.split(",").map(ext => ext.trim().toLowerCase());
    const allFiles = Array.from(files);

    if (!allowMultiple) {
      if (uploadedFiles.length >= 1) {
        toast.warning('Only one document can be uploaded at a time.');
        return;
      }
      if (allFiles.length > 1) {
        toast.warning('Only one document can be uploaded at a time.');
      }
    }
    
    // MIME type mapping for validation
    const mimeTypeMap = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    // Track invalid files for error messages
    const invalidFiles = [];
    const oversizedFiles = [];
    
    // Filter valid files
    const validFiles = allFiles
      .filter((file) => {
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();
        const isValidExtension = acceptedExtensions.includes(fileExtension);
        
        // Also check MIME type if available
        const expectedMimeType = mimeTypeMap[fileExtension];
        const isValidMimeType = !expectedMimeType || !file.type || file.type === expectedMimeType;
        
        const isValid = isValidExtension && isValidMimeType;
        if (!isValid) {
          invalidFiles.push(file.name);
        }
        return isValid;
      })
      .filter((file) => {
        const isValidSize = file.size <= maxSize;
        if (!isValidSize) {
          oversizedFiles.push(file.name);
        }
        return isValidSize;
      })
      .slice(0, allowMultiple ? (maxFiles - uploadedFiles.length) : 1);

    // Show toast error messages for invalid files
    if (invalidFiles.length > 0) {
      const count = invalidFiles.length;
      const fileText = count === 1 ? 'file' : 'files';
      toast.error(`Invalid file format. ${count} ${fileText} rejected. Accepted formats: ${acceptedTypes}`);
    }
    
    if (oversizedFiles.length > 0) {
      const count = oversizedFiles.length;
      const fileText = count === 1 ? 'file' : 'files';
      toast.error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }
    
    // Check if max files limit reached
    const remainingSlots = allowMultiple ? (maxFiles - uploadedFiles.length) : 1;
    if (validFiles.length > remainingSlots && remainingSlots > 0) {
      toast.warning(`Only ${remainingSlots} more file(s) can be uploaded. Maximum ${maxFiles} files allowed.`);
    } else if (remainingSlots === 0) {
      toast.warning(`Maximum ${maxFiles} files allowed. Please remove some files before adding new ones.`);
    }

    if (validFiles.length > 0 && onFilesChange) {
      onFilesChange(allowMultiple ? [...uploadedFiles, ...validFiles] : validFiles);
    }
  };

  const handleRemove = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileTypeLabel = (file) => {
    const name = file?.name || "";
    const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";

    // Prefer extension from filename (most reliable for user uploads)
    const normalized = ext === "jpeg" ? "jpg" : ext;
    if (normalized) return normalized.toUpperCase();

    // Fallback to mime type if no extension
    const mime = (file?.type || "").toLowerCase();
    if (mime.startsWith("image/")) return mime.split("/")[1].toUpperCase();
    if (mime === "application/pdf") return "PDF";

    return "FILE";
  };

  const renderFileTypeBadge = (file) => {
    const label = getFileTypeLabel(file);
    if (label === "PDF") return <PdfIcon />;

    // Match PdfIcon dimensions/colors so UI stays the same
    return (
      <div className="w-[36px] h-[36px] bg-[#F9F9FC] border border-[#E6E8EC] rounded-[4px] flex items-center justify-center">
        <span className="text-[11px] font-bold text-[#5A5E67] leading-none">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div>
      {label && (
        <label className="block text-sm sm:text-base font-medium text-secondary mb-1">
          {label}
        </label>
      )}
      <div className="border-2 border-dashed rounded-lg p-2 border-lightGray">
        {/* File Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={` p-3 sm:p-4 text-center transition-colors ${
            dragActive ? "border-[#6B4EFF]" : "border-gray-300"
          } bg-[#F9F9FC]`}
        >
          <input
            ref={fileInputRef}
            type="file"
            id={`file-input-${label}`}
            className="hidden"
            multiple={allowMultiple && maxFiles > 1}
            accept={acceptedTypes}
            onChange={handleFileInput}
            disabled={uploadedFiles.length >= maxFiles}
          />
          <label
            htmlFor={`file-input-${label}`}
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="mb-3 flex items-center bg-white rounded-lg p-2 w-[36px] h-[36px] justify-center">
              <UploadIcon />
            </div>
            <p className="text-sm sm:text-base text-darkGray font-medium mb-1">
              Drop your files here or browse
            </p>
            <p className="text-sm text-midGray font-medium">
              Images (JPG, PNG, GIF, WEBP) and Documents (PDF, DOC, DOCX). Max {maxFiles} files, {maxSize / (1024 * 1024)}MB each.
            </p>
          </label>
          {uploadedFiles.length > 0 && (
            <div className="mt-3 sm:mt-4 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white border border-lightGray rounded-lg gap-2"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {renderFileTypeBadge(file)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs sm:text-sm font-medium text-darkGray truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-[#9FA3AA] font-medium">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1 flex-shrink-0"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Uploaded Files List */}
    </div>
  );
}

export default FileUpload;
