'use client'

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { getMyDocuments, downloadDocument, deleteDocument } from "@/api/verification";
import { getRenterPlan, getUserVerificationPayment } from "@/api/subscriptions";
import { useAuth } from "@/context/AuthContext";
import PaymentSection from "./PaymentSection";
import GreenRoundCheckIcon from "../../../svg/websiteSvg/greenRoundCheckIcon";
import WhiteCardIcon from "../../../svg/websiteSvg/whiteCardIcon";
import SuccessfullyCheck from "@/svg/successfullyCheck";
import VerifiedDocumentsSection from "@/components/adminDashboard/VerificationCenter/VerifiedDocumentsSection";
import UnderReviewDocumentsSection from "@/components/adminDashboard/VerificationCenter/UnderReviewDocumentsSection";
import RejectedDocumentsSection from "@/components/adminDashboard/VerificationCenter/RejectedDocumentsSection";

// Format document type for display
const formatDocumentType = (docType) => {
  const typeMap = {
    'identity_proof': 'Identity Proof',
    'id_proof': 'ID Proof',
    'pay_slip': 'Pay Slip',
    'bank_statement': 'Bank Statement',
    'property_papers': 'Property Papers',
    'licenses': 'License',
    'utility_bill': 'Utility Bill',
    'passport': 'Passport',
    'driving_license': 'Driving License',
    'national_id': 'National ID',
    'proof_of_address': 'Proof of Address',
    'tax_document': 'Tax Document',
    'other': 'Other',
  };
  return typeMap[docType] || docType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Document';
};

function VerificationSection() {
  const { user, updateUser } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [renterPlan, setRenterPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [verificationPayment, setVerificationPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Store fresh user data

  // Fetch documents on mount and when payment is successful
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getMyDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Fetch fresh user data on mount to get latest verification status
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { getCurrentUser } = await import('@/api/users');
        const freshUser = await getCurrentUser();
        setCurrentUser(freshUser);
        // Update AuthContext with fresh data
        if (freshUser && updateUser) {
          updateUser(freshUser);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        // Fallback to user from context
        setCurrentUser(user);
      }
    };
    fetchCurrentUser();
  }, []);

  // Refresh user data when user object changes (e.g., after login/update)
  useEffect(() => {
    if (user && !currentUser) {
      setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Refresh user data function
  const refreshUserData = async () => {
    try {
      const { getCurrentUser } = await import('@/api/users');
      const freshUser = await getCurrentUser();
      setCurrentUser(freshUser);
      // Update AuthContext with fresh data
      if (freshUser && updateUser) {
        updateUser(freshUser);
      }
      return freshUser;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  };

  // Check for payment success in URL and refresh everything
  // Note: New payment flow redirects to dedicated payment-success page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success') {
      // Refresh user data to get updated verification status
      refreshUserData();
      // Refresh documents to show updated verification status
      fetchDocuments();
      // Also refresh the plan in case it changed
      const refreshPlan = async () => {
        try {
          const plan = await getRenterPlan();
          setRenterPlan(plan);
        } catch (error) {
          console.error('Error refreshing plan:', error);
        }
      };
      refreshPlan();
    }
  }, []);

  // Fetch renter subscription plan on mount
  useEffect(() => {
    const fetchRenterPlan = async () => {
      try {
        setPlanLoading(true);
        const plan = await getRenterPlan();
        setRenterPlan(plan);
      } catch (error) {
        console.error('Error fetching renter plan:', error);
        // Don't show error toast, just log it - plan is optional
      } finally {
        setPlanLoading(false);
      }
    };
    fetchRenterPlan();
  }, []);

  // Fetch verification payment status - always try to fetch to check if payment exists
  useEffect(() => {
    const fetchVerificationPayment = async () => {
      try {
        setPaymentLoading(true);
        // Always try to fetch payment - if it exists, user has paid
        const payment = await getUserVerificationPayment();
        if (payment && payment.status === 'succeeded') {
          setVerificationPayment(payment);
          console.log('✅ Verification payment found:', payment);
          // If payment exists but userInfo doesn't show verified, refresh user data
          const userToCheck = currentUser || user;
          if (userToCheck?.userInfo?.verificationStatus !== 'verified') {
            console.log('⚠️ Payment exists but verificationStatus not updated, refreshing user data...');
            // Refresh user data to get updated status
            await refreshUserData();
          }
        } else {
          console.log('ℹ️ No verification payment found or payment not succeeded');
          setVerificationPayment(null);
        }
      } catch (error) {
        // If 404, user hasn't paid yet - that's okay
        if (error.response?.status === 404) {
          console.log('ℹ️ No verification payment found (404) - user hasn\'t paid yet');
        } else {
          console.error('Error fetching verification payment:', error);
        }
        setVerificationPayment(null);
      } finally {
        setPaymentLoading(false);
      }
    };
    // Only fetch if we have user data
    if (currentUser || user) {
      fetchVerificationPayment();
    }
  }, [currentUser, user]);

  // Transform and categorize documents
  const transformedDocuments = useMemo(() => {
    const verified = [];
    const underReview = [];
    const rejected = [];

    if (!documents?.documents || !Array.isArray(documents.documents)) {
      return { verified, underReview, rejected };
    }

    // Process all document types
    documents.documents.forEach((docGroup) => {
      const docs = docGroup.docs || [];
      const docType = docGroup.docType;

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
          docType: doc.docType || docType,
          docTypeLabel: formatDocumentType(doc.docType || docType),
          fileType: doc.fileType,
          metaData: doc.metaData,
          reason: doc.reason_for_rejection || doc.reason || null,
        };

        // Categorize by status
        // null/undefined = pending (under review)
        // true = verified
        // false = rejected
        if (doc.is_verified === true) {
          verified.push(transformedDoc);
        } else if (doc.is_verified === false) {
          rejected.push(transformedDoc);
        } else if (doc.is_verified === null || doc.is_verified === undefined) {
          underReview.push(transformedDoc);
        }
      });
    });

    return { verified, underReview, rejected };
  }, [documents]);

  const handlePaymentComplete = async (paymentData) => {
    console.log("Payment completed:", paymentData);
    setShowPayment(false);
    
    // Refresh user data to get updated verification status
    const updatedUser = await refreshUserData();
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
    
    // Refresh documents to show updated verification status
    await fetchDocuments();
    
    // Refresh plan if needed
    try {
      const plan = await getRenterPlan();
      setRenterPlan(plan);
    } catch (error) {
      console.error('Error refreshing plan:', error);
    }
    
    // Fetch verification payment details
    try {
      const payment = await getUserVerificationPayment();
      setVerificationPayment(payment);
    } catch (error) {
      console.error('Error fetching verification payment:', error);
    }
    
    toast.success('Payment successful! Your verification status has been updated.');
  };

  const handlePaymentClick = () => {
    // Check if there are any rejected or under review documents
    const hasRejectedDocs = transformedDocuments.rejected.length > 0;
    const hasUnderReviewDocs = transformedDocuments.underReview.length > 0;

    if (hasRejectedDocs || hasUnderReviewDocs) {
      toast.warning('Please wait for verification then only proceed with payment');
      return;
    }

    // If all documents are verified (or no documents), proceed with payment
    setShowPayment(true);
  };

  const handleDeleteDocument = (id) => {
    setDocumentToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocument(documentToDelete);
      toast.success('Document deleted successfully');
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
      // Refresh documents list
      const data = await getMyDocuments();
      setDocuments(data);
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

      const loadingToast = toast.loading('Downloading document...');
      const blob = await downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = doc.name || doc.metaData?.originalFileName || `document_${doc.id}.${doc.fileType || 'pdf'}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss(loadingToast);
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to download document';
      toast.error(errorMessage);
    }
  };

  if (showPayment) {
    return (
      <PaymentSection
        onBack={() => setShowPayment(false)}
        onPaymentComplete={handlePaymentComplete}
        renterPlan={renterPlan}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Documents Section */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4EFF]"></div>
          <p className="ml-4 text-darkGray">Loading documents...</p>
        </div>
      ) : (
        <>
          {transformedDocuments.verified.length > 0 && (
            <VerifiedDocumentsSection
              documents={transformedDocuments.verified}
              onDelete={handleDeleteDocument}
              onDownload={handleDownloadDocument}
            />
          )}

          {transformedDocuments.rejected.length > 0 && (
            <RejectedDocumentsSection
              documents={transformedDocuments.rejected}
              onDelete={handleDeleteDocument}
              onDownload={handleDownloadDocument}
            />
          )}

          {transformedDocuments.underReview.length > 0 && (
            <UnderReviewDocumentsSection
              documents={transformedDocuments.underReview}
              onDelete={handleDeleteDocument}
              onDownload={handleDownloadDocument}
            />
          )}
        </>
      )}

      {/* Payment Section - Dynamic from subscription plan */}
      {planLoading ? (
        <section className="bg-white rounded-2xl border border-border p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B4EFF]"></div>
            <p className="ml-4 text-darkGray">Loading subscription plan...</p>
          </div>
        </section>
      ) : renterPlan ? (
        // Check if user has already paid (one-time payment)
        // Check: 1) userInfo.verificationStatus === 'verified' OR 2) verificationPayment exists
        // Use currentUser (fresh data) or fallback to user from context
        (() => {
          const userToCheck = currentUser || user;
          const isVerifiedByStatus = userToCheck?.userInfo?.verificationStatus === 'verified';
          const hasPayment = verificationPayment && verificationPayment.status === 'succeeded';
          const hasPaid = isVerifiedByStatus || hasPayment;
          
          // Debug log
          if (process.env.NODE_ENV === 'development') {
            console.log('Payment button visibility check:', {
              verificationStatus: userToCheck?.userInfo?.verificationStatus,
              isVerifiedByStatus,
              hasPayment,
              hasPaid,
              paymentStatus: verificationPayment?.status
            });
          }
          
          return hasPaid;
        })() ? (
          // Payment Confirmation Section (User has already paid)
          <section className="bg-white rounded-2xl border border-border p-6">
            <div className="block">
              {/* Success Icon */}
              <div className="mb-4 flex justify-start">
                <SuccessfullyCheck />
              </div>

              {/* Payment Confirmation Header */}
              <h3 className="text-xl font-bold font-nunito text-secondary mb-2">
                Payment Completed
              </h3>
              <p className="text-base font-nunito font-normal text-[#45556C] mb-4">
                You have successfully completed your verification payment. Your account is now verified and you can enjoy all the premium features.
              </p>

              {/* Payment Details */}
              {paymentLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6B4EFF]"></div>
                  <p className="ml-2 text-sm text-darkGray">Loading payment details...</p>
                </div>
              ) : verificationPayment ? (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-lightGray">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-darkGray">Plan:</p>
                    <p className="text-base font-semibold text-secondary">
                      {renterPlan.name || 'Verification Plan'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-darkGray">Amount Paid:</p>
                    <p className="text-lg font-bold text-mainBlue">
                      £{verificationPayment.amount?.toFixed(2) || renterPlan.monthlyPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-darkGray">Payment Date:</p>
                    <p className="text-sm font-normal text-darkGray">
                      {verificationPayment.paidAt 
                        ? new Date(verificationPayment.paidAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-darkGray">Status:</p>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Verified
                    </span>
                  </div>
                  {verificationPayment.paymentMethod?.card?.last4 && (
                    <div className="flex justify-between items-center pt-2 border-t border-lightGray">
                      <p className="text-sm font-medium text-darkGray">Payment Method:</p>
                      <p className="text-sm font-normal text-darkGray">
                        •••• •••• •••• {verificationPayment.paymentMethod.card.last4}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-lightGray">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-darkGray">Amount Paid:</p>
                    <p className="text-lg font-bold text-mainBlue">
                      £{renterPlan.monthlyPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-medium text-darkGray">Status:</p>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Verified
                    </span>
                  </div>
                </div>
              )}

              {/* Benefits List */}
              <div className="mt-4 pt-4 border-t border-lightGray">
                <p className="text-sm font-semibold text-secondary mb-2">Your Benefits:</p>
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
                    <GreenRoundCheckIcon />
                    Unlimited owner contacts
                  </li>
                  <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
                    <GreenRoundCheckIcon />
                    Verified badge on profile
                  </li>
                  <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
                    <GreenRoundCheckIcon />
                    3x more responses from owners
                  </li>
                  <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
                    <GreenRoundCheckIcon />
                    Priority support
                  </li>
                </ul>
              </div>
            </div>
          </section>
        ) : (
          // Payment Section (User hasn't paid yet)
          <section className="bg-white rounded-2xl border border-border p-4">
            <div className="block">
              <div>
                <p className="text-base font-normal font-nunito text-midGray mb-1">
                  <span className="text-xl font-bold text-mainBlue">
                    £{renterPlan.monthlyPrice?.toFixed(2) || '0.00'}
                  </span>
                  {renterPlan.userType === 'renter' ? ' / listing' : ' / month'}
                </p>
                <p className="text-base font-nunito font-normal text-[#45556C] mb-3">
                  {renterPlan.userType === 'renter' ? 'One-time payment' : 'Monthly subscription'}{" "}
                  <span className="relative ml-3 before:content-[''] before:absolute before:left-[-11px] before:rounded-full before:w-[6px] before:bottom-2 before:h-[6px] before:bg-midGray  text-base font-nunito font-normal text-[#45556C]">
                    {renterPlan.userType === 'renter' ? 'Lifetime verification' : 'Recurring billing'}
                  </span>
                </p>
                {renterPlan.description && (
                  <p className="text-sm font-nunito font-normal text-[#45556C] mb-3">
                    {renterPlan.description}
                  </p>
                )}
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
                    <GreenRoundCheckIcon />
                    Unlimited owner contacts
                  </li>
                  <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
                    <GreenRoundCheckIcon />
                    Verified badge on profile
                  </li>
                  <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
                    <GreenRoundCheckIcon />
                    3x more responses from owners
                  </li>
                  <li className="text-base font-normal font-nunito text-secondary flex items-center gap-2">
                    <GreenRoundCheckIcon />
                    Priority support
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handlePaymentClick}
                className="self-start mt-6 sm:self-auto px-6 py-2 rounded-[10px] bg-blueGradient text-white text-base font-bold shadow-[0px_2px_10px_0px_#00000033]  transition-opacity font-nunito flex items-center gap-2"
              >
                <WhiteCardIcon />
                Continue to Payment
              </button>
            </div>
          </section>
        )
      ) : (
        <section className="bg-white rounded-2xl border border-border p-4">
          <div className="block">
            <p className="text-base font-normal font-nunito text-darkGray">
              No subscription plan available at the moment. Please contact support.
            </p>
          </div>
        </section>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-6 max-w-[480px] w-full mx-4 relative">
            <button
              onClick={cancelDeleteDocument}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex justify-start mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold font-nunito text-secondary text-left mb-2">
              Delete Document
            </h2>
            <p className="text-base font-normal font-nunito text-darkGray text-left mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
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
    </div>
  );
}

export default VerificationSection;
