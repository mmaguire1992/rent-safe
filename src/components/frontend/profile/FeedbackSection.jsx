'use client'

import { useState, useEffect } from "react";
import CustomCalendar from "@/components/adminDashboard/common/CustomCalendar";
import { FiMessageSquare, FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { createRenterReview, getAllRenterReviews, updateRenterReview, deleteRenterReview } from "@/api/renterReviews";
import { useAuth } from "@/context/AuthContext";
import ConfirmationModal from "@/components/common/ConfirmationModal";

function FeedbackSection() {
  const { user } = useAuth();
  const [propertyName, setPropertyName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ 
    isOpen: false, 
    reviewId: null, 
    reviewName: null,
    reviewDates: null 
  });
  const [deleting, setDeleting] = useState(false);

  // Calculate yesterday's date in YYYY-MM-DD format for maxDate
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const maxDate = getYesterdayDate(); // Both dates cannot be after yesterday

  // Fetch existing feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!user?.id) return;

      try {
        setLoadingFeedback(true);
        const result = await getAllRenterReviews({ userId: user.id, limit: 100 });
        if (result && result.reviews) {
          setExistingFeedback(result.reviews);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoadingFeedback(false);
      }
    };

    fetchFeedback();
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to parent form

    // Validation
    const newErrors = {};
    if (!propertyName.trim()) {
      newErrors.propertyName = "Property name is required";
    }
    if (!fromDate) {
      newErrors.fromDate = "From date is required";
    }
    if (!toDate) {
      newErrors.toDate = "To date is required";
    }
    if (!feedback.trim()) {
      newErrors.feedback = "Feedback is required";
    }

    // Validate date range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (to < from) {
        newErrors.toDate = "To date must be after From date";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      let result;
      if (editingId) {
        // Update existing review
        result = await updateRenterReview(editingId, {
          propertyName,
          feedback,
          fromDate,
          toDate,
        });
        // Use backend message
        toast.success(result?.message || "Feedback updated successfully");
      } else {
        // Create new review
        result = await createRenterReview({
          propertyName,
          feedback,
          fromDate,
          toDate,
        });
        // Use backend message
        toast.success(result?.message || "Feedback submitted successfully");
      }

      console.log("Feedback saved successfully:", result);
      
      // Reset form
      setPropertyName("");
      setFromDate("");
      setToDate("");
      setFeedback("");
      setShowAddForm(false);
      setEditingId(null);

      // Refresh feedback list
      if (user?.id) {
        try {
          const result = await getAllRenterReviews({ userId: user.id, limit: 100 });
          if (result && result.reviews) {
            setExistingFeedback(result.reviews);
          }
        } catch (error) {
          console.error('Error refreshing feedback:', error);
        }
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
      // Extract error message from API response (axios error structure)
      let errorMessage = editingId ? "Failed to update feedback" : "Failed to submit feedback";

      if (error?.response?.data) {
        // Axios error response
        errorMessage = error.response.data.message ||
          error.response.data.error ||
          error.response.data.error?.message ||
          errorMessage;
      } else if (error?.message) {
        // Standard error
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    // Format dates to YYYY-MM-DD for the calendar component
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setPropertyName(review.propertyName || '');
    setFromDate(formatDateForInput(review.fromDate));
    setToDate(formatDateForInput(review.toDate));
    setFeedback(review.feedback || '');
    setEditingId(review._id || review.id);
    setShowAddForm(true);
    setErrors({});
    
    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('.feedback-form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setPropertyName("");
    setFromDate("");
    setToDate("");
    setFeedback("");
    setErrors({});
  };

  const handleDeleteClick = (review) => {
    // Format dates for display
    const formatDateForDisplay = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        return 'N/A';
      }
    };

    const fromDate = formatDateForDisplay(review.fromDate);
    const toDate = formatDateForDisplay(review.toDate);
    const dateRange = `${fromDate} - ${toDate}`;

    setDeleteConfirmModal({
      isOpen: true,
      reviewId: review._id || review.id,
      reviewName: review.propertyName || 'this rental history entry',
      reviewDates: dateRange,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmModal.reviewId) return;

    setDeleting(true);
    try {
      const result = await deleteRenterReview(deleteConfirmModal.reviewId);
      // Use backend message
      toast.success(result?.message || "Rental history entry deleted successfully");
      
      // Close modal
      setDeleteConfirmModal({ isOpen: false, reviewId: null, reviewName: null, reviewDates: null });
      
      // Refresh feedback list
      if (user?.id) {
        try {
          const result = await getAllRenterReviews({ userId: user.id, limit: 100 });
          if (result && result.reviews) {
            setExistingFeedback(result.reviews);
          }
        } catch (error) {
          console.error('Error refreshing feedback:', error);
        }
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      // Extract error message from API response
      let errorMessage = "Failed to delete rental history entry";

      if (error?.response?.data) {
        errorMessage = error.response.data.message ||
          error.response.data.error ||
          error.response.data.error?.message ||
          errorMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, reviewId: null, reviewName: null, reviewDates: null });
  };

  const handlePropertyNameChange = (e) => {
    const value = e.target.value;
    // Prevent leading spaces
    const processedValue = value.replace(/^\s+/, '');
    setPropertyName(processedValue);
    if (errors.propertyName && processedValue.trim()) {
      setErrors({ ...errors, propertyName: "" });
    }
  };

  const handleFeedbackChange = (e) => {
    const value = e.target.value;
    // Prevent leading spaces
    const processedValue = value.replace(/^\s+/, '');
    setFeedback(processedValue);
    if (errors.feedback && processedValue.trim()) {
      setErrors({ ...errors, feedback: "" });
    }
  };

  const handlePropertyNameKeyDown = (e) => {
    // Prevent space at the beginning
    if (e.key === ' ' && (!propertyName || propertyName.length === 0 || e.target.selectionStart === 0)) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    // Prevent space at the beginning
    if (e.key === ' ' && (!feedback || feedback.length === 0 || e.target.selectionStart === 0)) {
      e.preventDefault();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="bg-white border-b border-lightGray pb-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#E8E2FF] w-[36px] h-[36px] flex items-center justify-center rounded-[10px] p-2">
          <FiMessageSquare className="text-[#6B4EFF] text-xl" />
        </div>
        <h2 className="text-xl font-bold font-nunito text-secondary mb-0">
          Rental  History {existingFeedback.length > 0 && `(${existingFeedback.length})`}
        </h2>
      </div>

      {/* Display Existing Feedback */}
      {loadingFeedback ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6B4EFF]"></div>
          <span className="ml-3 text-darkGray text-sm">Loading feedback...</span>
        </div>
      ) : existingFeedback.length > 0 ? (
        <div className="space-y-4 mb-6">
          {existingFeedback.map((review, index) => {
            const fromDate = review.fromDate ? new Date(review.fromDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : 'N/A';
            const toDate = review.toDate ? new Date(review.toDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : 'N/A';
            const createdAt = review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : '';

            return (
              <div
                key={review._id || review.id || index}
                className="border border-lightGray rounded-xl p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {review.propertyName && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-semibold text-secondary">
                          {review.propertyName}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-secondary">
                        Period: {fromDate} - {toDate}
                      </span>
                    </div>
                    {createdAt && (
                      <p className="text-xs text-darkGray">
                        Submitted on {createdAt}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(review)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-200 transition-colors text-[#6B4EFF]"
                      title="Edit feedback"
                    >
                      <FiEdit className="text-lg" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(review)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 transition-colors text-red-500"
                      title="Delete feedback"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-lightGray rounded-lg p-3">
                  <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">
                    "{review.feedback}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Add More Button */}
      {!showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="px-6 py-2 shadow-[inset_0px_2px_4px_0px_rgba(107,78,255,0.2)] bg-white border border-[#4A2FCC] text-[#4A2FCC] rounded-[10px] text-base font-semibold hover:bg-opacity-90 transition-colors"
        >
          Add more +
        </button>
      )}

      {/* Add/Edit Feedback Form */}
      {showAddForm && (
        <div className="space-y-6 border-t border-lightGray pt-6 feedback-form-section">
          {/* Property Name */}
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Property Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={propertyName}
              onChange={handlePropertyNameChange}
              onKeyDown={handlePropertyNameKeyDown}
              placeholder="Enter property name..."
              className={`w-full px-4 py-3 border rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] ${errors.propertyName ? "border-errorColor" : "border-lightGray"
                }`}
              disabled={submitting}
            />
            {errors.propertyName && (
              <p className="text-xs text-red-500 mt-1">{errors.propertyName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From Date */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                From Date <span className="text-red-500">*</span>
              </label>
              <CustomCalendar
                value={fromDate}
                onChange={(date) => {
                  setFromDate(date);
                  // Clear toDate if it's before the new fromDate
                  if (toDate && date && toDate < date) {
                    setToDate("");
                  }
                  if (errors.fromDate) {
                    setErrors({ ...errors, fromDate: "" });
                  }
                }}
                placeholder="Select from date"
                maxDate={maxDate}
                error={errors.fromDate}
              />
              {errors.fromDate && (
                <p className="text-xs text-red-500 mt-1">{errors.fromDate}</p>
              )}
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                To Date <span className="text-red-500">*</span>
              </label>
              <CustomCalendar
                value={toDate}
                onChange={(date) => {
                  setToDate(date);
                  if (errors.toDate) {
                    setErrors({ ...errors, toDate: "" });
                  }
                }}
                placeholder="Select to date"
                minDate={fromDate ? (fromDate < maxDate ? fromDate : undefined) : undefined}
                maxDate={maxDate}
                error={errors.toDate}
              />
              {errors.toDate && (
                <p className="text-xs text-red-500 mt-1">{errors.toDate}</p>
              )}
            </div>
          </div>

          {/* Feedback Textbox */}
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={handleFeedbackChange}
              onKeyDown={handleKeyDown}
              rows={6}
              placeholder="Enter your feedback..."
              className={`w-full px-4 py-3 border rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] resize-none ${errors.feedback ? "border-errorColor" : "border-lightGray"
                }`}
              disabled={submitting}
            />
            {errors.feedback && (
              <p className="text-xs text-red-500 mt-1">{errors.feedback}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="px-6 py-3 border border-lightGray text-secondary rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-blueGradient text-white rounded-lg font-semibold hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting 
                ? (editingId ? "Updating..." : "Submitting...") 
                : (editingId ? "Update Feedback" : "Submit Feedback")}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Rental History Entry"
        message={
          <div className="space-y-3">
            <p className="text-gray-700 text-base">
              You are about to permanently delete this rental history entry. This action cannot be undone.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-gray-900 text-base mb-2">
                {deleteConfirmModal.reviewName}
              </p>
              {deleteConfirmModal.reviewDates && (
                <p className="text-gray-600 text-sm">
                  Rental Period: <span className="font-medium">{deleteConfirmModal.reviewDates}</span>
                </p>
              )}
            </div>
            <p className="text-red-600 font-semibold text-sm flex items-center gap-1">
              <span>All data associated with this entry will be permanently removed from your profile.</span>
            </p>
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        isProcessing={deleting}
      />
    </div>
  );
}

export default FeedbackSection;
