import { useState } from "react";
import { FiCreditCard, FiArrowLeft } from "react-icons/fi";
import {
  verificationProgressStep,
  rejectedDocumentData,
  verifiedDocumentsData,
  underReviewDocumentsData,
  documentTypeOptions,
  pendingDocumentRequirements,
} from "@/constant";
import VerifiedDocumentsSection from "../../frontend/profile/verification/VerifiedDocumentsSection";
import UnderReviewDocumentsSection from "../../frontend/profile/verification/UnderReviewDocumentsSection";
import UploadVerificationDocuments from "../../frontend/profile/verification/UploadVerificationDocuments";
import PendingDocumentsSection from "../../frontend/profile/verification/PendingDocumentsSection";
function PaymentSection({ onBack }) {
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
    <div className="space-y-6">
      {/* Payment Form */}
      <div className="bg-white rounded-[20px] md:border md:border-lightGray md:p-6 space-y-4">
        <VerifiedDocumentsSection
          documents={verifiedDocuments}
          onDelete={(id) => handleDeleteDocument(id, "verified")}
        />

        <UnderReviewDocumentsSection
          documents={underReviewDocuments}
          onDelete={(id) => handleDeleteDocument(id, "underReview")}
        />

        <UploadVerificationDocuments
          onSubmit={handleSubmitDocuments}
          documentTypes={documentTypeOptions}
        />

        <PendingDocumentsSection requirements={pendingDocumentRequirements} />
      </div>
    </div>
  );
}

export default PaymentSection;
