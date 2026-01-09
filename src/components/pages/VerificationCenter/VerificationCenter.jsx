'use client'

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Breadcrumb from "@/components/adminDashboard/common/Breadcrumb";
import VerificationProgressTracker from "@/components/adminDashboard/VerificationCenter/VerificationProgressTracker";
import DocumentRejectedSection from "@/components/adminDashboard/VerificationCenter/DocumentRejectedSection";
import RejectedDocumentsSection from "@/components/adminDashboard/VerificationCenter/RejectedDocumentsSection";
import VerifiedDocumentsSection from "@/components/adminDashboard/VerificationCenter/VerifiedDocumentsSection";
import UnderReviewDocumentsSection from "@/components/adminDashboard/VerificationCenter/UnderReviewDocumentsSection";
import UploadVerificationDocuments from "@/components/adminDashboard/VerificationCenter/UploadVerificationDocuments";
import PendingDocumentsSection from "@/components/adminDashboard/VerificationCenter/PendingDocumentsSection";
import {
  fetchMyDocuments,
  uploadDocuments,
  storeDocumentMetadata,
} from "@/redux/slices/verificationSlice";
import { documentTypeOptions } from "@/constant";
import { downloadDocument, deleteDocument } from "@/api/verification";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

// Map backend docType to frontend document type options
// Convert underscores to hyphens: "tax_document" → "tax-document"
const mapDocTypeToOption = (docType) => {
  // Convert underscores to hyphens for frontend option format
  return docType.replace(/_/g, '-');
};

// Convert frontend document type to backend docType format
// Simply convert hyphens to underscores: "passport" → "passport", "tax-document" → "tax_document"
const mapOptionToDocType = (option) => {
  // Convert hyphens to underscores for backend format
  // This ensures exact dropdown value is stored: "passport" → "passport", "tax-document" → "tax_document", etc.
  return option.replace(/-/g, '_');
};

// Format document type for display (convert snake_case to readable format)
const formatDocumentType = (docType) => {
  const typeMap = {
    // Old types
    'identity_proof': 'Identity Proof',
    'id_proof': 'ID Proof',
    'pay_slip': 'Pay Slip',
    'bank_statement': 'Bank Statement',
    'property_papers': 'Property Papers',
    'licenses': 'License',
    'utility_bill': 'Utility Bill',
    // New types (from dropdown)
    'passport': 'Passport',
    'driving_license': 'Driving License',
    'national_id': 'National ID',
    'proof_of_address': 'Proof of Address',
    'tax_document': 'Tax Document',
    'other': 'Other',
  };
  // Fallback: convert snake_case to Title Case if not in map
  return typeMap[docType] || docType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Document';
};

function VerificationCenter() {
  const dispatch = useDispatch();
  const {
    documents,
    documentsByType,
    verificationStatus,
    loading,
    uploading,
    storing,
    error,
  } = useSelector((state) => state.verification || {
    documents: null,
    documentsByType: {
      identity_proof: [],
      id_proof: [],
      pay_slip: [],
      bank_statement: [],
      property_papers: [],
      licenses: [],
    },
    verificationStatus: 'not_started',
    loading: false,
    uploading: false,
    storing: false,
    error: null,
  });

  // Fetch documents on mount
  useEffect(() => {
    dispatch(fetchMyDocuments());
  }, [dispatch]);

  // Transform API documents to component format
  const transformedDocuments = useMemo(() => {
    const rejected = [];
    const verified = [];
    const underReview = [];

    // Process all document types
    Object.keys(documentsByType || {}).forEach((docType) => {
      const docs = documentsByType[docType] || [];
      docs.forEach((doc) => {
        const transformedDoc = {
          id: doc.id || doc._id,
          name: doc.metaData?.originalFileName || doc.fileUrl?.split('/').pop() || 'document',
          size: doc.metaData?.fileSize 
            ? `${(doc.metaData.fileSize / (1024 * 1024)).toFixed(2)} MB`
            : 'Unknown size',
          uploadedDate: doc.createdAt 
            ? new Date(doc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Unknown date',
          fileUrl: doc.fileUrl,
          docType: doc.docType,
          docTypeLabel: formatDocumentType(doc.docType),
          reason: doc.reason_for_rejection,
          fileType: doc.fileType,
          metaData: doc.metaData,
        };

        // Categorize by status
        // null/undefined = pending (under review)
        // true = verified
        // false = rejected
        if (doc.is_verified === false) {
          rejected.push(transformedDoc);
        } else if (doc.is_verified === true) {
          verified.push(transformedDoc);
        } else {
          // null or undefined = pending
          underReview.push(transformedDoc);
        }
      });
    });

    return { rejected, verified, underReview };
  }, [documentsByType]);

  // Calculate verification progress step
  const verificationProgressStep = useMemo(() => {
    const { rejected, verified, underReview } = transformedDocuments;
    const hasDocuments = rejected.length > 0 || verified.length > 0 || underReview.length > 0;
    
    if (!hasDocuments) {
      return 1; // No documents uploaded
    }
    
    if (rejected.length > 0) {
      return 1; // Has rejected documents, needs re-upload
    }
    
    if (underReview.length > 0) {
      return 2; // Under review
    }
    
    if (verified.length > 0 && underReview.length === 0 && rejected.length === 0) {
      return 3; // All verified
    }
    
    return 2; // Default to under review
  }, [transformedDocuments]);

  // State for reupload tracking
  const [reuploadingDocumentId, setReuploadingDocumentId] = useState(null);
  const [reuploadingDocType, setReuploadingDocType] = useState(null);
  
  // State for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  // Lock body scroll when modal is open
  useBodyScrollLock(deleteModalOpen);

  const handleReupload = (doc) => {
    // Store the rejected document's ID and docType for reupload
    if (doc) {
      setReuploadingDocumentId(doc.id);
      setReuploadingDocType(doc.docType);
    }
    // Scroll to upload section
    const uploadSection = document.querySelector('[data-upload-section]');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteDocument = (id, type) => {
    // Open confirmation modal
    setDocumentToDelete({ id, type });
    setDeleteModalOpen(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocument(documentToDelete.id);
      toast.success('Document deleted successfully');
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
      // Refresh documents list
      await dispatch(fetchMyDocuments());
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete document';
      toast.error(errorMessage);
    }
  };

  const cancelDeleteDocument = () => {
    setDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  const handleDownloadDocument = async (doc) => {
    try {
      if (!doc.id) {
        toast.error('Document ID is missing');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('Downloading document...');

      // Download the document
      const blob = await downloadDocument(doc.id);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from document metadata or use a default
      const fileName = doc.name || doc.metaData?.originalFileName || `document_${doc.id}.${doc.fileType || 'pdf'}`;
      link.setAttribute('download', fileName);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success message
      toast.dismiss(loadingToast);
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to download document';
      toast.error(errorMessage);
    }
  };

  const handleSubmitDocuments = async (data) => {
    try {
      const { documentType, files } = data;
      
      if (!documentType || !files || files.length === 0) {
        toast.error('Please select a document type and upload at least one file');
        return;
      }

      // Map frontend document type to backend docType
      // If reuploading, use the rejected document's docType, otherwise use selected
      const docType = reuploadingDocType || mapOptionToDocType(documentType);
      
      // Check if this document type is already uploaded (skip check if reuploading rejected document)
      if (!reuploadingDocumentId) {
        const existingDocs = documentsByType[docType] || [];
        if (existingDocs.length > 0) {
          const docTypeLabel = formatDocumentType(docType);
          toast.error(`${docTypeLabel} is already uploaded. Please delete the existing document first or select a different document type.`);
          return;
        }
      }
      
      // Ensure we have valid File objects
      // FileUpload adds properties (uploading, progress) directly to File objects
      // We need to ensure we're using actual File instances for FormData
      console.log('Raw files received:', files);
      console.log('Files types:', files.map(f => ({
        isFile: f instanceof File,
        isBlob: f instanceof Blob,
        constructor: f?.constructor?.name,
        hasName: !!f?.name,
        hasSize: !!f?.size,
        keys: f ? Object.keys(f).slice(0, 10) : [],
      })));
      
      const fileObjects = files
        .filter(file => {
          // Only accept File or Blob instances
          // Even if properties were added, instanceof should still work
          const isValid = file instanceof File || file instanceof Blob;
          if (!isValid) {
            console.error('Invalid file object:', {
              type: typeof file,
              constructor: file?.constructor?.name,
              isFile: file instanceof File,
              isBlob: file instanceof Blob,
              hasName: !!file?.name,
              hasSize: !!file?.size,
            });
          }
          return isValid;
        });
      
      if (fileObjects.length === 0) {
        toast.error('No valid files found. Please select files to upload.');
        console.error('Files received:', files);
        console.error('File types:', files.map(f => ({
          isFile: f instanceof File,
          isBlob: f instanceof Blob,
          hasName: !!f?.name,
          hasSize: !!f?.size,
          type: typeof f,
          constructor: f?.constructor?.name,
          keys: f ? Object.keys(f) : [],
        })));
        return;
      }
      
      // Create FormData for S3 upload
      const formData = new FormData();
      
      // Backend expects specific field names based on docType
      // Note: Backend currently only accepts identityProof, paySlips, bankStatements
      // For other types, we'll use identityProof and set correct docType when storing
      let filesAppended = 0;
      
      if (docType === 'identity_proof' || docType === 'id_proof' || docType === 'property_papers' || docType === 'licenses' || docType === 'utility_bill' || docType === 'other') {
        // Single file uploads use identityProof field
        const file = fileObjects[0];
        if (file instanceof File || file instanceof Blob) {
          formData.append('identityProof', file, file.name || 'document');
          filesAppended++;
          console.log('Appended identityProof file:', file.name, file instanceof File ? 'File' : 'Blob');
        } else {
          console.error('File is not a File/Blob instance:', file);
        }
      } else if (docType === 'pay_slip') {
        fileObjects.forEach((file) => {
          if (file instanceof File || file instanceof Blob) {
            formData.append('paySlips', file, file.name || 'document');
            filesAppended++;
            console.log('Appended paySlips file:', file.name, file instanceof File ? 'File' : 'Blob');
          } else {
            console.error('File is not a File/Blob instance:', file);
          }
        });
      } else if (docType === 'bank_statement') {
        fileObjects.forEach((file) => {
          if (file instanceof File || file instanceof Blob) {
            formData.append('bankStatements', file, file.name || 'document');
            filesAppended++;
            console.log('Appended bankStatements file:', file.name, file instanceof File ? 'File' : 'Blob');
          } else {
            console.error('File is not a File/Blob instance:', file);
          }
        });
      } else {
        // Fallback: use identityProof for unknown types
        const file = fileObjects[0];
        if (file instanceof File || file instanceof Blob) {
          formData.append('identityProof', file, file.name || 'document');
          filesAppended++;
          console.log('Appended identityProof file (fallback):', file.name, file instanceof File ? 'File' : 'Blob');
        } else {
          console.error('File is not a File/Blob instance:', file);
        }
      }
      
      // Verify FormData has files
      if (filesAppended === 0) {
        toast.error('Failed to prepare files for upload. Files are not valid File objects.');
        console.error('No files were appended to FormData');
        console.error('fileObjects:', fileObjects);
        return;
      }
      
      // Debug: Log FormData contents
      console.log('FormData entries (total:', filesAppended, '):');
      for (let pair of formData.entries()) {
        const value = pair[1];
        if (value instanceof File) {
          console.log(pair[0], `File: ${value.name} (${value.size} bytes, ${value.type})`);
        } else if (value instanceof Blob) {
          console.log(pair[0], `Blob: ${value.size} bytes, ${value.type}`);
        } else {
          console.error(pair[0], 'ERROR: Not a File/Blob:', typeof value, value);
        }
      }

      // Step 1: Upload to S3
      toast.info('Uploading documents...');
      const uploadResult = await dispatch(uploadDocuments(formData)).unwrap();
      
      if (!uploadResult?.uploadResults || uploadResult.uploadResults.length === 0) {
        toast.error('Failed to upload documents');
        return;
      }

      // Step 2: Store document metadata in database
      const documentsToStore = uploadResult.uploadResults.map((result) => ({
        fileUrl: result.url,
        docType: docType, // Always use the user-selected docType (exact dropdown value)
        fileType: result.fileType,
        mime: result.mimeType,
        metaData: {
          s3Key: result.key,
          s3Bucket: result.bucket,
          originalFileName: result.fileName,
          fileSize: result.fileSize,
        },
      }));

      toast.info('Storing document information...');
      await dispatch(storeDocumentMetadata(documentsToStore)).unwrap();

      // Step 3: Refresh documents list
      await dispatch(fetchMyDocuments());

      // Reset reupload state after successful upload
      if (reuploadingDocumentId) {
        setReuploadingDocumentId(null);
        setReuploadingDocType(null);
      }

      toast.success('Documents uploaded successfully and submitted for review!');
    } catch (error) {
      console.error('Error submitting documents:', error);
      let errorMessage = "Failed to upload documents. Please try again.";
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  // Determine pending document requirements based on user type and uploaded documents
  const pendingDocumentRequirements = useMemo(() => {
    const requirements = [];
    const uploadedTypes = new Set(
      Object.values(documentsByType || {})
        .flat()
        .map(doc => doc.docType)
    );

    // Check what's missing (this would depend on user type - renter vs owner)
    // For now, show generic requirements
    if (!uploadedTypes.has('identity_proof') && !uploadedTypes.has('id_proof')) {
      requirements.push('Identity proof document (Passport, Driving License, or National ID)');
    }
    if (!uploadedTypes.has('bank_statement')) {
      requirements.push('Bank statement issued within last 3 months');
    }
    if (!uploadedTypes.has('pay_slip')) {
      requirements.push('Pay slip or income proof document');
    }

    return requirements;
  }, [documentsByType]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb />
        <div className="mb-3">
          <h1 className="text-xl md:text-2xl font-bold text-secondary mb-0">
            Verification Center
          </h1>
        </div>

        {/* Loading State */}
        {loading && !documents && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4EFF]"></div>
            <p className="ml-4 text-darkGray">Loading documents...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => dispatch(fetchMyDocuments())}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && (
          <>
            <VerificationProgressTracker currentStep={verificationProgressStep} />

            {transformedDocuments.rejected.length > 0 && (
              <RejectedDocumentsSection
                documents={transformedDocuments.rejected}
                onDelete={(id) => handleDeleteDocument(id, "rejected")}
                onDownload={handleDownloadDocument}
                onReupload={handleReupload}
              />
            )}

            {transformedDocuments.verified.length > 0 && (
              <VerifiedDocumentsSection
                documents={transformedDocuments.verified}
                onDelete={(id) => handleDeleteDocument(id, "verified")}
                onDownload={handleDownloadDocument}
              />
            )}

            {transformedDocuments.underReview.length > 0 && (
              <UnderReviewDocumentsSection
                documents={transformedDocuments.underReview}
                onDelete={(id) => handleDeleteDocument(id, "underReview")}
                onDownload={handleDownloadDocument}
              />
            )}

            <div data-upload-section>
              <UploadVerificationDocuments
                onSubmit={handleSubmitDocuments}
                documentTypes={documentTypeOptions}
                loading={uploading || storing}
                reuploadMode={!!reuploadingDocumentId}
                preSelectedDocumentType={reuploadingDocType ? mapDocTypeToOption(reuploadingDocType) : null}
              />
            </div>

            {pendingDocumentRequirements.length > 0 && (
              <PendingDocumentsSection requirements={pendingDocumentRequirements} />
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-6 max-w-[480px] w-full mx-4 relative">
            {/* Close Button */}
            <button
              onClick={cancelDeleteDocument}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Warning Icon */}
            <div className="flex justify-start mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold font-nunito text-secondary text-left mb-2">
              Delete Document
            </h2>

            {/* Description */}
            <p className="text-base font-normal font-nunito text-darkGray text-left mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteDocument}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-[10px] font-bold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDocument}
                className="flex-1 px-6 py-3 bg-blueGradient text-white rounded-[10px] font-bold shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default VerificationCenter;
