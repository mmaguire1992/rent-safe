'use client'

import { useState, useEffect } from "react";
import CustomCalendar from "@/components/adminDashboard/common/CustomCalendar";
import { FiMessageSquare } from "react-icons/fi";
import { toast } from "react-toastify";
import { createRenterReview, getAllRenterReviews } from "@/api/renterReviews";
import { useAuth } from "@/context/AuthContext";

function FeedbackSection() {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

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
      const result = await createRenterReview({
        feedback,
        fromDate,
        toDate,
      });
      
      console.log("Feedback submitted successfully:", result);
      toast.success("Feedback submitted successfully");
      // Reset form
      setFromDate("");
      setToDate("");
      setFeedback("");
      setShowAddForm(false);
      
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
      console.error("Error submitting feedback:", error);
      // Extract error message from API response (axios error structure)
      let errorMessage = "Failed to submit feedback";
      
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

  const handleFeedbackChange = (e) => {
    const value = e.target.value;
    // Prevent leading spaces
    const processedValue = value.replace(/^\s+/, '');
    setFeedback(processedValue);
    if (errors.feedback && processedValue.trim()) {
      setErrors({ ...errors, feedback: "" });
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
          Feedback {existingFeedback.length > 0 && `(${existingFeedback.length})`}
        </h2>
      </div>

      {/* Display Existing Feedback */}
      {loadingFeedback ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6B4EFF]"></div>
          <span className="ml-3 text-darkGray text-sm">Loading feedback...</span>
        </div>
      ) : existingFeedback.length > 0 ? (
        <div className="space-y-6 mb-6">
          {existingFeedback.map((review, index) => {
            // Convert dates to YYYY-MM-DD format for CustomCalendar
            const fromDateValue = review.fromDate 
              ? new Date(review.fromDate).toISOString().split('T')[0] 
              : '';
            const toDateValue = review.toDate 
              ? new Date(review.toDate).toISOString().split('T')[0] 
              : '';

            return (
              <div key={review._id || review.id || index}>
                {index > 0 && <div className="border-t border-lightGray my-6"></div>}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* From Date */}
                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        From Date <span className="text-red-500">*</span>
                      </label>
                      <CustomCalendar
                        value={fromDateValue}
                        onChange={() => {}} // Read-only
                        placeholder="Select from date"
                        maxDate={maxDate}
                        disabled={true}
                      />
                    </div>

                    {/* To Date */}
                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        To Date <span className="text-red-500">*</span>
                      </label>
                      <CustomCalendar
                        value={toDateValue}
                        onChange={() => {}} // Read-only
                        placeholder="Select to date"
                        minDate={fromDateValue}
                        maxDate={maxDate}
                        disabled={true}
                      />
                    </div>
                  </div>

                  {/* Feedback Textbox */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={review.feedback || ''}
                      onChange={() => {}} // Read-only
                      rows={6}
                      placeholder="Enter your feedback..."
                      className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] resize-none bg-gray-50"
                      disabled={true}
                      readOnly
                    />
                  </div>
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

      {/* Add Feedback Form */}
      {showAddForm && (
        <div className="space-y-6 border-t border-lightGray pt-6">
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
            className={`w-full px-4 py-3 border rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] resize-none ${
              errors.feedback ? "border-errorColor" : "border-lightGray"
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
              onClick={() => {
                setShowAddForm(false);
                setFromDate("");
                setToDate("");
                setFeedback("");
                setErrors({});
              }}
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
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackSection;
