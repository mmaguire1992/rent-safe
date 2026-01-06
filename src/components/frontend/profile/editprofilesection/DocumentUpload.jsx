'use client'

import { useState, useEffect, useMemo, useRef } from "react";
import UploadIcon from "@/svg/uploadIcon";
import { uploadDocumentsToS3, storeDocuments, deleteDocument } from "@/api/verification";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { FiDownload, FiTrash2 } from "react-icons/fi";

function DocumentUpload({ label, maxFiles = 5, onFilesChange, docType = 'identity_proof', existingDocuments = [], onDocumentsUpdated, documentMetadata = null, onDocumentDeleted = null }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  
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

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
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
        const fileObj = {
          name: doc.metaData?.originalFileName || doc.fileName || doc.metaData?.fileName || 'Document',
          url: doc.fileUrl || doc.url,
          id: doc._id || doc.id,
          isExisting: true,
          docType: doc.docType,
          verificationStatus: doc.is_verified,
        };
        return fileObj;
      });
      setUploadedFiles(existingFiles);
    } else {
      // Clear files if no existing documents
      setUploadedFiles([]);
    }
  }, [existingDocumentsString, existingDocuments]);

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).slice(0, maxFiles);

    if (validFiles.length === 0) {
      toast.warning(`Please select a file to upload`);
      return;
    }

    try {
      setUploading(true);
      
      // Track if we're replacing an existing document
      const hadExistingDocument = uploadedFiles.length > 0 && maxFiles === 1;
      
      // If there's an existing document and we're uploading a new one, delete the old one first
      // This implements "replace" behavior for single-document types (like identity_proof)
      if (hadExistingDocument) {
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
          },
        };
        
        // Debug logging
        console.log(`DocumentUpload [${label}] - Storing document with:`, {
          docType: docToStore.docType,
          resultDocType: result.docType,
          fileName: docToStore.metaData.originalFileName,
          label: label,
          propDocType: docType, // The prop value
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
        };
      });

      // For single-file uploads (maxFiles === 1), replace instead of append
      const updatedFiles = maxFiles === 1 ? newFiles : [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      
      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }

      // Notify parent component that documents were updated
      if (onDocumentsUpdated) {
        onDocumentsUpdated();
      }

      // Show appropriate success message
      if (hadExistingDocument) {
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

  // Hide upload area if document already exists (for single-file uploads)
  const shouldShowUploadArea = maxFiles > 1 || uploadedFiles.length === 0;

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
            type="file"
            id={`doc-upload-${label}`}
            className="hidden"
            multiple={maxFiles > 1}
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
            {maxFiles === 1 && uploadedFiles.length === 0 && (
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
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={file.id || index}
              className="flex items-center justify-between bg-white border border-lightGray p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">
                      {file.name.split('.').pop().toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate" title={file.name}>
                    {file.name}
                  </p>
                  {file.verificationStatus !== undefined && (
                    <p className="text-xs text-darkGray mt-1">
                      Status: {
                        file.verificationStatus === true ? 'Verified' :
                        file.verificationStatus === false ? 'Rejected' :
                        'Pending Review'
                      }
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary hover:bg-purple-50 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    title="Download document"
                  >
                    <FiDownload className="w-5 h-5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteClick(index)}
                  className="p-2 text-errorColor hover:bg-red-50 rounded-lg transition-colors"
                  disabled={uploading}
                  title="Delete document"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
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
