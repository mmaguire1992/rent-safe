import { useState } from "react";
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Breadcrumb from "@/components/adminDashboard/common/Breadcrumb";
import VerificationProgressTracker from "@/components/adminDashboard/VerificationCenter/VerificationProgressTracker";
import DocumentRejectedSection from "@/components/adminDashboard/VerificationCenter/DocumentRejectedSection";
import VerifiedDocumentsSection from "@/components/adminDashboard/VerificationCenter/VerifiedDocumentsSection";
import UnderReviewDocumentsSection from "@/components/adminDashboard/VerificationCenter/UnderReviewDocumentsSection";
import UploadVerificationDocuments from "@/components/adminDashboard/VerificationCenter/UploadVerificationDocuments";
import PendingDocumentsSection from "@/components/adminDashboard/VerificationCenter/PendingDocumentsSection";
import {
  verificationProgressStep,
  rejectedDocumentData,
  verifiedDocumentsData,
  underReviewDocumentsData,
  documentTypeOptions,
  pendingDocumentRequirements,
} from "@/constant";

function VerificationCenter() {
  const [rejectedDocument, setRejectedDocument] =
    useState(rejectedDocumentData);
  const [verifiedDocuments, setVerifiedDocuments] = useState(
    verifiedDocumentsData
  );
  const [underReviewDocuments, setUnderReviewDocuments] = useState(
    underReviewDocumentsData
  );

  const handleReupload = () => {
    console.log("Re-uploading document");
    // Handle re-upload logic
  };

  const handleDeleteDocument = (id, type) => {
    if (type === "verified") {
      setVerifiedDocuments(verifiedDocuments.filter((doc) => doc.id !== id));
    } else if (type === "underReview") {
      setUnderReviewDocuments(
        underReviewDocuments.filter((doc) => doc.id !== id)
      );
    }
  };

  const handleSubmitDocuments = (data) => {
    console.log("Submitting documents:", data);
    // Handle document submission logic
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb />
        <div class="mb-3">
          <h1 class="text-xl md:text-2xl font-bold text-secondary mb-0">
            Verification Center
          </h1>
        </div>
        <VerificationProgressTracker currentStep={verificationProgressStep} />

        {rejectedDocument && (
          <DocumentRejectedSection
            rejectedDocument={rejectedDocument}
            onReupload={handleReupload}
          />
        )}

        {verifiedDocuments.length > 0 && (
          <VerifiedDocumentsSection
            documents={verifiedDocuments}
            onDelete={(id) => handleDeleteDocument(id, "verified")}
          />
        )}

        {underReviewDocuments.length > 0 && (
          <UnderReviewDocumentsSection
            documents={underReviewDocuments}
            onDelete={(id) => handleDeleteDocument(id, "underReview")}
          />
        )}

        <UploadVerificationDocuments
          onSubmit={handleSubmitDocuments}
          documentTypes={documentTypeOptions}
        />

        {pendingDocumentRequirements.length > 0 && (
          <PendingDocumentsSection requirements={pendingDocumentRequirements} />
        )}
      </div>
    </DashboardLayout>
  );
}

export default VerificationCenter;
