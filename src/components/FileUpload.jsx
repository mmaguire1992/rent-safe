'use client'

import { useState, useEffect } from "react";
import UploadIcon from "@/svg/uploadIcon";
import DeleteIcon from "@/svg/deleteIcon";
import PdfIcon from "@/svg/pdfIcon";
import CloseIcon from "@/svg/closeIcon";

function FileUpload({
  label,
  acceptedTypes = ".pdf,.docx,.png",
  maxFiles = 3,
  maxSize = 5 * 1024 * 1024, // 5MB
  onFilesChange,
  uploadedFiles = [],
}) {
  const [dragActive, setDragActive] = useState(false);

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
    const validFiles = Array.from(files)
      .filter((file) => {
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();
        return acceptedTypes.split(",").includes(fileExtension);
      })
      .filter((file) => file.size <= maxSize)
      .slice(0, maxFiles - uploadedFiles.length);

    if (validFiles.length > 0 && onFilesChange) {
      // Add files with uploading state
      const filesWithUploadState = validFiles.map((file) => ({
        ...file,
        uploading: true,
        progress: 0,
      }));
      onFilesChange([...uploadedFiles, ...filesWithUploadState]);
    }
  };

  // Simulate upload progress
  useEffect(() => {
    const uploadingFiles = uploadedFiles.filter((file) => file.uploading);

    if (uploadingFiles.length === 0) return;

    const interval = setInterval(() => {
      const updatedFiles = uploadedFiles.map((file) => {
        if (file.uploading && file.progress < 100) {
          const newProgress = Math.min(file.progress + 10, 100);
          return {
            ...file,
            progress: newProgress,
            uploading: newProgress < 100,
          };
        }
        return file;
      });

      // Only update if there are changes
      const hasChanges = updatedFiles.some((file, index) => {
        const original = uploadedFiles[index];
        return (
          file.progress !== original?.progress ||
          file.uploading !== original?.uploading
        );
      });

      if (hasChanges && onFilesChange) {
        onFilesChange(updatedFiles);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [uploadedFiles]);

  const handleRemove = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleCancel = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
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
            type="file"
            id={`file-input-${label}`}
            className="hidden"
            multiple
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
              pdf, docs, and png. Max {maxFiles} docs.
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
                      <PdfIcon />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs sm:text-sm font-medium text-darkGray truncate">
                        {file.name}
                      </p>
                      {file.uploading ? (
                        <>
                          <p className="text-xs text-[#9FA3AA] font-medium">
                            {formatFileSize((file.progress / 100) * file.size)}{" "}
                            of {formatFileSize(file.size)}
                          </p>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-[#6B4EFF] h-1.5 rounded-full transition-all"
                              style={{ width: `${file.progress || 0}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-[#9FA3AA] font-medium">
                          {formatFileSize(file.size)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      file.uploading ? handleCancel(index) : handleRemove(index)
                    }
                    className="p-1 flex-shrink-0"
                  >
                    {file.uploading ? <CloseIcon /> : <DeleteIcon />}
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
