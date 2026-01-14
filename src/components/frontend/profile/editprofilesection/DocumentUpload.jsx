'use client'

import { useState, useEffect, useMemo, useRef } from "react";
import UploadIcon from "@/svg/uploadIcon";
import { uploadDocumentsToS3, storeDocuments, deleteDocument } from "@/api/verification";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { FiDownload, FiTrash2, FiUpload, FiFileText, FiAlertCircle, FiX } from "react-icons/fi";

function DocumentUpload({ label, maxFiles = 5, onFilesChange, docType = 'identity_proof', existingDocuments = [], onDocumentsUpdated, documentMetadata = null, onDocumentDeleted = null }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [reuploadingDocId, setReuploadingDocId] = useState(null);
  const fileInputRef = useRef(null);
  
  // Debug: Log component mount with docType
  useEffect(() => {
    console.log(`DocumentUpload mounted - Label: "${label}", docType: "${docType}", maxFiles: ${maxFiles}`);
  }, []);
  
  // Memoize existingDocuments to prevent infinite loops
  const existingDocumentsRef = useRef();
  const existingDocumentsString = useMemo(() => {
    if (!existingDocuments || !Array.isArray(existingDocuments)) {
      return JSON.stringify([]);
    }
    // Create a stable string representation based on document IDs
    const ids = existingDocuments.map(doc => doc._id || doc.id).sort().join(',');
    return ids;
  }, [existingDocuments]);

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


  // Load existing documents on mount and when existingDocuments changes
  // Use string comparison to prevent infinite loops from array reference changes
  useEffect(() => {
    // Only update if the actual document IDs have changed
    if (existingDocumentsRef.current === existingDocumentsString) {
      return; // No change, skip update
    }
    
    existingDocumentsRef.current = existingDocumentsString;
    
    if (existingDocuments && Array.isArray(existingDocuments) && existingDocuments.length > 0) {
      // Convert existing documents to file-like objects for display
      const existingFiles = existingDocuments.map(doc => {
        // Format document type label
        const docTypeLabels = {
          'pay_slip': 'Pay Slip',
          'bank_statement': 'Bank Statement',
          'identity_proof': 'Identity Proof',
          'passport': 'Passport',
          'driving_license': 'Driving License',
          'national_id': 'National ID',
          'proof_of_address': 'Proof of Address',
          'utility_bill': 'Utility Bill',
          'tax_document': 'Tax Document',
          'other': 'Other',
        };
        
        // Format file size
        const fileSize = doc.metaData?.fileSize || doc.fileSize || 0;
        const formatFileSize = (bytes) => {
          if (bytes === 0) return '0 B';
          const k = 1024;
          const sizes = ['B', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
        };
        
        // Format upload date
        const uploadDate = doc.metaData?.uploadedAt || doc.createdAt;
        const formatDate = (dateString) => {
          if (!dateString) return 'Unknown';
          const date = new Date(dateString);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        };
        
        const fileObj = {
          name: doc.metaData?.originalFileName || doc.fileName || doc.metaData?.fileName || 'Document',
          url: doc.fileUrl || doc.url,
          id: doc._id || doc.id,
          isExisting: true,
          docType: doc.docType,
          docTypeLabel: docTypeLabels[doc.docType] || doc.docType,
          verificationStatus: doc.is_verified,
          rejectionReason: doc.reason_for_rejection || doc.rejectionReason || null,
          fileSize: formatFileSize(fileSize),
          uploadedDate: formatDate(uploadDate),
        };
        return fileObj;
      });
      setUploadedFiles(existingFiles);
      // Reset reupload state when documents change
      setReuploadingDocId(null);
    } else {
      // Clear files if no existing documents
      setUploadedFiles([]);
    }
  }, [existingDocumentsString, existingDocuments]);

  const handleFiles = async (files, isReupload = false, docIdToUpdate = null) => {
    // Validation: Check if document type is required (when documentMetadata is provided)
    if (documentMetadata && !isReupload) {
      // For Documents section, documentType must be selected before upload
      if (!documentMetadata.documentType || documentMetadata.documentType.trim() === '') {
        toast.error('Please select a document type before uploading.');
        return;
      }
    }
    
    // Validation: Check total document count (all statuses: verified, pending, rejected)
    const totalDocs = uploadedFiles.length;
    const filesToAdd = Array.from(files).length;
    
    if (isReupload) {
      // Re-upload: replacing an existing document, so count stays the same
      // Only allow 1 file for re-upload
      if (filesToAdd > 1) {
        toast.warning('You can only re-upload one file at a time.');
        return;
      }
      if (!docIdToUpdate) {
        toast.error('Document ID is missing for re-upload.');
        return;
      }
    } else {
      // Normal upload: check if adding new files would exceed the limit
      const remainingSlots = maxFiles - totalDocs;
      if (remainingSlots <= 0) {
        toast.warning(`Maximum ${maxFiles} document(s) allowed. You currently have ${totalDocs} document(s). Please delete a document first to upload a new one.`);
        return;
      }
      if (filesToAdd > remainingSlots) {
        toast.warning(`Maximum ${maxFiles} document(s) allowed. You can upload ${remainingSlots} more document(s).`);
        // Continue with the remaining slots
      }
    }

    // Limit valid files based on available slots
    const validFiles = isReupload 
      ? Array.from(files).slice(0, 1) // Re-upload allows only 1 file
      : Array.from(files).slice(0, Math.min(filesToAdd, maxFiles - totalDocs));

    if (validFiles.length === 0) {
      toast.warning(`Please select a file to upload`);
      return;
    }

    try {
      setUploading(true);
      
      // Track if we're replacing an existing document
      const hadExistingDocument = uploadedFiles.length > 0 && maxFiles === 1;
      
      // If reuploading, we don't delete the document - backend will update it
      // If there's an existing document and we're uploading a new one (not reupload), delete the old one first
      // This implements "replace" behavior for single-document types (like identity_proof)
      if (hadExistingDocument && !isReupload) {
        const existingFile = uploadedFiles[0];
        if (existingFile.id) {
          try {
            console.log('Deleting existing document before uploading new one:', existingFile.id);
            await deleteDocument(existingFile.id);
            console.log('Existing document deleted successfully');
          } catch (deleteError) {
            console.warn('Error deleting existing document:', deleteError);
            // Continue with upload even if delete fails (might already be deleted)
            if (deleteError.response?.status !== 404) {
              // Only show error if it's not a 404 (document not found)
              const errorMessage = deleteError.response?.data?.message || deleteError.message || 'Failed to delete existing document';
              toast.warning(`Could not delete existing document: ${errorMessage}. Uploading new document anyway.`);
            }
          }
        }
        // Clear the existing file from state
        setUploadedFiles([]);
      }
      
      // Upload files to S3
      // Backend expects files with specific field names based on docType
      const formData = new FormData();
      
      // Map docType to backend field names (for S3 upload FormData)
      const fieldNameMap = {
        'identity_proof': 'identityProof',
        'pay_slip': 'paySlips',
        'bank_statement': 'bankStatements',
        'passport': 'identityProof',
        'driving_license': 'identityProof',
        'national_id': 'identityProof',
        'proof_of_address': 'proofOfAddress', // Use dedicated field for proof of address
        'utility_bill': 'bankStatements',
        'tax_document': 'paySlips',
        'other': 'otherDocuments', // Use dedicated field for other documents (guarantor, etc.)
      };
      
      const fieldName = fieldNameMap[docType] || 'identityProof';
      
      // Debug logging
      console.log(`DocumentUpload [${label}] - Uploading document:`, {
        docType: docType,
        fieldName: fieldName,
        maxFiles: maxFiles,
        fileCount: validFiles.length,
        label: label,
      });
      
      validFiles.forEach((file) => {
        formData.append(fieldName, file);
      });

      const uploadResponse = await uploadDocumentsToS3(formData);
      
      // Extract uploadResults from response
      // Response structure: { uploadResults: [...], count: number }
      const uploadResults = uploadResponse?.uploadResults || 
                           (Array.isArray(uploadResponse) ? uploadResponse : []) || [];
      
      if (!Array.isArray(uploadResults) || uploadResults.length === 0) {
        throw new Error('Invalid upload response or no files uploaded');
      }

      // Prepare documents for database storage
      // Always use the docType prop, not the one from S3 response (which is based on field name)
      const documentsToStore = uploadResults.map((result, index) => {
        const docToStore = {
          fileUrl: result.url || result.fileUrl,
          docType: docType, // Always use the docType prop passed to the component
          fileType: result.fileType || validFiles[index].name.split('.').pop().toLowerCase(),
          mime: result.mimeType || validFiles[index].type,
          metaData: {
            originalFileName: result.fileName || validFiles[index].name,
            fileSize: result.fileSize || validFiles[index].size,
            s3Key: result.key,
            s3Bucket: result.bucket,
            uploadedAt: new Date().toISOString(),
            // Store document metadata if provided (for Documents section: type, number, expiry)
            ...(documentMetadata ? {
              documentType: documentMetadata.documentType || '',
              documentNumber: documentMetadata.documentNumber || '',
              documentExpire: documentMetadata.documentExpire || '',
            } : {}),
            // If reuploading, include the document ID so backend can update it
            ...(isReupload && docIdToUpdate ? {
              documentIdToUpdate: docIdToUpdate,
            } : {}),
          },
        };
        
        // Debug logging
        console.log(`DocumentUpload [${label}] - Storing document with:`, {
          docType: docToStore.docType,
          resultDocType: result.docType,
          fileName: docToStore.metaData.originalFileName,
          label: label,
          propDocType: docType, // The prop value
          isReupload: isReupload,
          docIdToUpdate: docIdToUpdate,
        });
        
        return docToStore;
      });

      // Store documents in database
      // Final check: ensure docType is correct before storing
      console.log('DocumentUpload - Final documentsToStore before API call:', documentsToStore.map(doc => ({
        docType: doc.docType,
        fileName: doc.metaData.originalFileName
      })));
      
      const storedDocumentsResponse = await storeDocuments(documentsToStore);
      
      // Extract stored documents from response
      const storedDocuments = Array.isArray(storedDocumentsResponse) 
        ? storedDocumentsResponse 
        : (storedDocumentsResponse?.documents || []);
      
      // Add uploaded files to state
      const docTypeLabels = {
        'pay_slip': 'Pay Slip',
        'bank_statement': 'Bank Statement',
        'identity_proof': 'Identity Proof',
        'passport': 'Passport',
        'driving_license': 'Driving License',
        'national_id': 'National ID',
        'proof_of_address': 'Proof of Address',
        'utility_bill': 'Utility Bill',
        'tax_document': 'Tax Document',
        'other': 'Other',
      };
      
      const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
      };
      
      const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
      };
      
      const newFiles = validFiles.map((file, index) => {
        const storedDoc = Array.isArray(storedDocuments) 
          ? storedDocuments[index] 
          : (storedDocuments?.documents?.[index] || storedDocuments);
        
        return {
          name: file.name,
          url: uploadResults[index]?.url || uploadResults[index]?.fileUrl,
          id: storedDoc?._id || storedDoc?.id || storedDoc?._id || storedDoc?.id,
          isExisting: false,
          docType: docType,
          docTypeLabel: docTypeLabels[docType] || docType,
          verificationStatus: storedDoc?.is_verified ?? null,
          rejectionReason: storedDoc?.reason_for_rejection || storedDoc?.rejectionReason || null,
          fileSize: formatFileSize(file.size || storedDoc?.fileSize || storedDoc?.metaData?.fileSize),
          uploadedDate: formatDate(storedDoc?.createdAt || storedDoc?.metaData?.uploadedAt),
        };
      });

      // For reupload, replace the specific document; otherwise append
      let updatedFiles;
      if (isReupload && docIdToUpdate) {
        // Replace the document being reuploaded
        updatedFiles = uploadedFiles.map(file => 
          file.id === docIdToUpdate ? newFiles[0] : file
        );
        // If document wasn't found in list, just append
        if (!updatedFiles.some(f => f.id === docIdToUpdate)) {
          updatedFiles = [...uploadedFiles, ...newFiles];
        }
      } else {
        // For single-file uploads (maxFiles === 1), replace instead of append
        updatedFiles = maxFiles === 1 ? newFiles : [...uploadedFiles, ...newFiles];
      }
      setUploadedFiles(updatedFiles);
      
      // Reset reupload state
      setReuploadingDocId(null);
      
      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }

      // Notify parent component that documents were updated
      if (onDocumentsUpdated) {
        onDocumentsUpdated();
      }

      // Show appropriate success message
      if (isReupload) {
        toast.success('Document re-uploaded successfully');
      } else if (hadExistingDocument) {
        toast.success('Document replaced successfully');
      } else {
        toast.success(`${validFiles.length} document(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to upload documents';
      
      // If error is about document already existing, refresh documents to show existing one
      if (errorMessage.includes('already exists') || errorMessage.includes('already exist')) {
        toast.error(errorMessage);
        // Refresh documents to show the existing one
        if (onDocumentsUpdated) {
          setTimeout(() => {
            onDocumentsUpdated();
          }, 1000);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (index) => {
    const file = uploadedFiles[index];
    if (file) {
      setFileToDelete({ file, index });
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    
    const { file: fileToRemove, index } = fileToDelete;
    
    try {
      setUploading(true);
      setDeleteModalOpen(false);
      
      // If document has an ID (either existing or newly uploaded), delete it from backend
      if (fileToRemove.id) {
        try {
          await deleteDocument(fileToRemove.id);
          toast.success('Document deleted successfully');
          
          // Clear document metadata (type, number, expiry) if callback is provided
          if (onDocumentDeleted) {
            onDocumentDeleted();
          }
        } catch (deleteError) {
          // If delete fails (e.g., document doesn't exist), still remove from UI
          console.warn('Error deleting document from backend:', deleteError);
          // Don't show error if it's a 404 (document might already be deleted)
          if (deleteError.response?.status !== 404) {
            const errorMessage = deleteError.response?.data?.message || deleteError.message || 'Failed to delete document';
            toast.error(errorMessage);
            setUploading(false);
            setFileToDelete(null);
            return;
          }
        }
      }
      
      // Remove from local state (always remove from UI, even if backend delete failed)
      const newFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(newFiles);
      if (onFilesChange) onFilesChange(newFiles);
      
      // Notify parent component that documents were updated (so it can refresh the list)
      if (onDocumentsUpdated) {
        onDocumentsUpdated();
      }
      
      setFileToDelete(null);
    } catch (error) {
      console.error('Error removing file:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove document';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setFileToDelete(null);
  };

  const handleReuploadClick = (docId) => {
    setReuploadingDocId(docId);
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const isReupload = !!reuploadingDocId;
      handleFiles(e.target.files, isReupload, reuploadingDocId);
      // Reset file input
      e.target.value = '';
    }
  };

  // Hide upload area if max documents reached (count all statuses: verified, pending, rejected)
  // For reupload, always show upload area when a document is selected for reupload
  const totalDocs = uploadedFiles.length;
  const shouldShowUploadArea = reuploadingDocId ? true : (maxFiles > 1 ? totalDocs < maxFiles : totalDocs === 0);

  return (
    <div className="mt-4">
      <label className="block text-base font-medium text-secondary mb-2">
        {label}
      </label>
      
      {/* Only show upload area if no document exists (for single-file) or if multiple files allowed */}
      {shouldShowUploadArea && (
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
            ref={fileInputRef}
            type="file"
            id={`doc-upload-${label}`}
            className="hidden"
            multiple={maxFiles > 1 && !reuploadingDocId}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileInput}
            disabled={uploading}
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
              pdf, doc, and png. Max {maxFiles} {maxFiles === 1 ? 'doc' : 'docs'}.
              {uploading && <span className="text-primary ml-2">Uploading...</span>}
            </p>
            {reuploadingDocId && (
              <p className="text-xs text-primary mt-2 font-medium">
                Re-uploading document. Select a new file to replace the rejected document.
              </p>
            )}
            {maxFiles === 1 && uploadedFiles.length === 0 && !reuploadingDocId && (
              <p className="text-xs text-midGray mt-2">
                Uploading a new document will replace any existing document
              </p>
            )}
          </label>
        </div>
      )}
      
      {/* Show message if document exists and upload area is hidden */}
      {!shouldShowUploadArea && (
        <div className="border border-lightGray rounded-xl p-4 bg-gray-50 text-center">
          <p className="text-sm text-darkGray">
            Document already uploaded. Delete the existing document to upload a new one.
          </p>
        </div>
      )}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadedFiles.map((file, index) => {
            const isRejected = file.verificationStatus === false;
            
            return (
              <div
                key={file.id || index}
                className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:p-4 p-3 rounded-[14px] overflow-hidden ${
                  isRejected 
                    ? 'bg-[#FEF2F2] border border-[#FFC9C9]' 
                    : 'bg-white border border-lightGray'
                }`}
              >
                <div className="flex items-center md:gap-4 gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                    isRejected ? 'bg-[#D24343]' : 'bg-purple-100'
                  }`}>
                    {isRejected ? (
                      <FiFileText className="text-white text-lg" />
                    ) : (
                      <span className={`font-bold text-sm ${
                        file.verificationStatus === true ? 'text-green-600' : 'text-primary'
                      }`}>
                        {file.name.split('.').pop().toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className={`text-sm font-normal font-nunito flex items-center gap-2 ${
                      isRejected ? 'text-secondary' : 'text-secondary'
                    }`}>
                      <span className="truncate">{file.name}</span>
                      {isRejected && (
                        <FiAlertCircle className="text-[#D24343] text-lg animate-pulse flex-shrink-0" />
                      )}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mt-1 flex-wrap">
                      {file.docTypeLabel && (
                        <span className={`text-xs font-semibold font-nunito px-2 py-0.5 rounded border whitespace-nowrap ${
                          isRejected 
                            ? 'text-[#D24343] bg-white border-[#FFC9C9]' 
                            : 'text-primary bg-purple-50 border-purple-200'
                        }`}>
                          {file.docTypeLabel}
                        </span>
                      )}
                      {file.fileSize && (
                        <span className="text-xs font-normal font-nunito text-midGray whitespace-nowrap">
                          {file.fileSize}
                        </span>
                      )}
                      {file.uploadedDate && (
                        <span className="text-xs font-normal relative before:content-[''] before:absolute before:left-[-8px] sm:before:left-[-11px] before:rounded-full before:w-[6px] before:bottom-1 before:h-[6px] before:bg-midGray font-nunito text-midGray whitespace-nowrap">
                          Uploaded {file.uploadedDate}
                        </span>
                      )}
                      {!isRejected && (
                        <span className={`text-xs font-medium whitespace-nowrap ${
                          file.verificationStatus === true ? 'text-green-600' :
                          file.verificationStatus === null ? 'text-yellow-600' :
                          'text-secondary'
                        }`}>
                          {file.verificationStatus === true ? 'Verified' :
                           file.verificationStatus === null ? 'Pending Review' :
                           'Rejected'}
                        </span>
                      )}
                    </div>
                    {isRejected && file.rejectionReason && (
                      <div className="mt-2 bg-white border border-[#FFC9C9] rounded-[8px] p-2">
                        <p className="text-xs font-semibold font-nunito text-[#D24343] mb-1">Rejection Reason:</p>
                        <p className="text-xs font-normal font-nunito text-red-600">{file.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 md:flex-shrink-0 md:self-start md:mt-0">
                  {file.url && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(file.url, '_blank', 'noopener,noreferrer');
                      }}
                      className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                        isRejected 
                          ? 'hover:bg-red-50' 
                          : 'hover:bg-purple-50'
                      }`}
                      title="Download document"
                    >
                      <FiDownload className={`text-lg ${isRejected ? 'text-[#D24343]' : 'text-primary'}`} />
                    </button>
                  )}
                  {isRejected && (
                    <button
                      type="button"
                      onClick={() => handleReuploadClick(file.id)}
                      className="px-4 py-2 bg-blueGradient text-white rounded-[10px] text-sm font-bold shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors whitespace-nowrap"
                      disabled={uploading}
                      title="Re-upload document"
                    >
                      Re-upload
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(index)}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                      isRejected 
                        ? 'hover:bg-red-50' 
                        : 'hover:bg-red-50'
                    }`}
                    disabled={uploading}
                    title="Delete document"
                  >
                    <FiX className={`text-lg ${isRejected ? 'text-darkGray' : 'text-errorColor'}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${fileToDelete?.file?.name || 'this document'}"? This action cannot be undone and you will need to upload a new document.`}
        confirmText="Delete"
        cancelText="Cancel"
        isProcessing={uploading}
      />
    </div>
  );
}

export default DocumentUpload;
