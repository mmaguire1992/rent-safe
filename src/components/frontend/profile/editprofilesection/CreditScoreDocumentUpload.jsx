'use client'

import { useMemo, useRef, useState } from "react";
import UploadIcon from "@/svg/uploadIcon";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { FiDownload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { uploadCreditScoreDocument, deleteCreditScoreDocument } from "@/api/users";

function CreditScoreDocumentUpload({
  label = "Credit Score Document",
  documentUrl = null,
  metaData = null,
  onUploaded,
  onDeleted,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const fileCard = useMemo(() => {
    if (!documentUrl) return null;
    const name = metaData?.originalFileName || 'Credit score document';
    const fileSize = metaData?.fileSize ? formatFileSize(metaData.fileSize) : null;
    const uploadedDate = metaData?.uploadedAt ? formatDate(metaData.uploadedAt) : null;
    return {
      name,
      url: documentUrl,
      fileSize,
      uploadedDate,
    };
  }, [documentUrl, metaData]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const result = await uploadCreditScoreDocument(file);
      toast.success('Credit score document uploaded successfully');
      if (onUploaded) onUploaded(result);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to upload credit score document';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) uploadFile(file);
  };

  const handleFileInput = (e) => {
    const file = e?.target?.files?.[0];
    if (file) uploadFile(file);
    // reset so same file can be selected again
    if (e?.target) e.target.value = '';
  };

  const confirmDelete = async () => {
    try {
      setUploading(true);
      setDeleteModalOpen(false);
      await deleteCreditScoreDocument();
      toast.success('Credit score document deleted successfully');
      if (onDeleted) onDeleted();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete credit score document';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-base font-medium text-secondary mb-2">
        {label} <span className="text-darkGray font-normal">(Optional)</span>
      </label>

      {/* Upload area (same style as DocumentUpload) */}
      {!fileCard && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 md:p-8 text-center transition-colors ${
            dragActive ? "border-primary bg-purple-50" : "border-lightGray bg-[#F9F9FC]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="credit-score-doc-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
            onChange={handleFileInput}
            disabled={uploading}
          />
          <label htmlFor="credit-score-doc-upload" className="cursor-pointer flex flex-col items-center">
            <div className="mb-3 flex items-center bg-white rounded-lg p-2 w-[36px] h-[36px] justify-center">
              <UploadIcon />
            </div>
            <p className="text-base text-darkGray font-medium mb-1">
              Drop your files here or browse
            </p>
            <p className="text-sm text-midGray font-medium">
              pdf, doc, and png. Max 1 doc.
              {uploading && <span className="text-primary ml-2">Uploading...</span>}
            </p>
          </label>
        </div>
      )}

      {/* Message when document exists (no re-upload allowed; delete first) */}
      {fileCard && (
        <div className="border border-lightGray rounded-xl p-4 bg-gray-50 text-center">
          <p className="text-sm text-darkGray">
            Document already uploaded. Delete the existing document to upload a new one.
          </p>
        </div>
      )}

      {/* Existing document card (same style as DocumentUpload) */}
      {fileCard && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:p-4 p-3 rounded-[14px] overflow-hidden bg-white border border-lightGray">
            <div className="flex items-center md:gap-4 gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 bg-purple-100">
                <span className="font-bold text-sm text-primary">
                  {fileCard.name.includes('.') ? fileCard.name.split('.').pop().toUpperCase() : 'DOC'}
                </span>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-normal font-nunito text-secondary">
                  <span className="truncate">{fileCard.name}</span>
                </p>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mt-1 flex-wrap">
                  <span className="text-xs font-semibold font-nunito px-2 py-0.5 rounded border whitespace-nowrap text-primary bg-purple-50 border-purple-200">
                    Credit Score
                  </span>
                  {fileCard.fileSize && (
                    <span className="text-xs font-normal font-nunito text-midGray whitespace-nowrap">
                      {fileCard.fileSize}
                    </span>
                  )}
                  {fileCard.uploadedDate && (
                    <span className="text-xs font-normal relative before:content-[''] before:absolute before:left-[-8px] sm:before:left-[-11px] before:rounded-full before:w-[6px] before:bottom-1 before:h-[6px] before:bg-midGray font-nunito text-midGray whitespace-nowrap">
                      Uploaded {fileCard.uploadedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:flex-shrink-0 md:self-start md:mt-0">
              {fileCard.url && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(fileCard.url, '_blank', 'noopener,noreferrer');
                  }}
                  className="p-2 rounded-lg transition-colors flex-shrink-0 hover:bg-purple-50"
                  title="Download document"
                  disabled={uploading}
                >
                  <FiDownload className="text-lg text-primary" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 rounded-lg transition-colors flex-shrink-0 hover:bg-red-50"
                disabled={uploading}
                title="Delete document"
              >
                <FiX className="text-lg text-errorColor" />
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${fileCard?.name || 'this document'}"? This action cannot be undone and you will need to upload a new document.`}
        confirmText="Delete"
        cancelText="Cancel"
        isProcessing={uploading}
      />
    </div>
  );
}

export default CreditScoreDocumentUpload;

