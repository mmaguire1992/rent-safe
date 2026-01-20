'use client'

import { useState, useEffect } from "react";
import { FiUser, FiCalendar, FiMessageSquare, FiAlertCircle } from "react-icons/fi";
import { getPropertyReferences, createOwnerReference } from "@/api/references";
import { getAllRentalHistory } from "@/api/rentalHistory";
import { toast } from "react-toastify";

function ReferencesSection({ propertyId, propertyStatus }) {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedRentalHistory, setSelectedRentalHistory] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [availableRentals, setAvailableRentals] = useState([]);

  // Fetch references and available rentals
  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) return;

      try {
        setLoading(true);
        
        // Fetch existing references
        const refs = await getPropertyReferences(propertyId);
        setReferences(refs || []);

        // If property status is active, fetch rental history to show feedback form
        if (propertyStatus?.toLowerCase() === 'active') {
          try {
            const rentalHistoryData = await getAllRentalHistory({ page: 1, limit: 100 });
            // Filter rentals for this property that have no reference yet
            const propertyRentals = (rentalHistoryData.data || []).filter(rental => 
              rental.propertyId?._id === propertyId || 
              String(rental.propertyId?._id) === String(propertyId)
            );
            
            // Filter out rentals that already have references
            const rentalsWithoutReference = propertyRentals.filter(rental => {
              const hasReference = refs.some(ref => 
                String(ref.rentalHistoryId?._id) === String(rental._id) ||
                String(ref.rentalHistoryId) === String(rental._id)
              );
              // Show any rental history that doesn't have a reference yet.
              // Submission is still restricted by backend to when property status is active.
              return !hasReference;
            });
            
            setAvailableRentals(rentalsWithoutReference);
          } catch (error) {
            console.error('Error fetching rental history:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching references:', error);
        toast.error('Failed to load references');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, propertyStatus]);

  const handleSubmitFeedback = async () => {
    if (!selectedRentalHistory) {
      toast.error('Please select a rental history');
      return;
    }

    if (!feedbackText.trim()) {
      toast.error('Please enter feedback');
      return;
    }

    if (feedbackText.trim().length > 200) {
      toast.error('Feedback must be 200 characters or less');
      return;
    }

    try {
      setSubmitting(true);
      const newReference = await createOwnerReference({
        rentalHistoryId: selectedRentalHistory._id,
        referenceText: feedbackText.trim(),
      });

      // Add the new reference to the list
      setReferences(prev => [newReference, ...prev]);
      
      // Remove from available rentals
      setAvailableRentals(prev => 
        prev.filter(r => String(r._id) !== String(selectedRentalHistory._id))
      );

      // Reset form
      setFeedbackText("");
      setSelectedRentalHistory(null);
      setShowFeedbackForm(false);
      
      toast.success('Reference submitted successfully! Admin will verify it.');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to submit reference');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.postcode) parts.push(address.postcode);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'verified') {
      return 'bg-[#DFFFE6] text-[#00893A]';
    } else if (statusLower === 'rejected') {
      return 'bg-red-100 text-red-600';
    } else {
      return 'bg-[#FFF5CC] text-[#D19600]';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4">
        <h2 className="md:text-xl text-base font-bold font-nunito text-secondary mb-4">
          References
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6B4EFF] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const showFeedbackFormButton = 
    propertyStatus?.toLowerCase() === 'active' && 
    availableRentals.length > 0 &&
    !showFeedbackForm;

  return (
    <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="md:text-xl text-base font-bold font-nunito text-secondary">
          References
        </h2>
        {showFeedbackFormButton && (
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="px-4 py-2 bg-[#6B4EFF] text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors"
          >
            Submit Feedback
          </button>
        )}
      </div>

      {/* Feedback Form */}
      {showFeedbackForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-secondary mb-3">Submit Feedback</h3>
          
          {availableRentals.length > 0 ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Select Rental History
                </label>
                <select
                  value={selectedRentalHistory?._id || ''}
                  onChange={(e) => {
                    const rental = availableRentals.find(r => String(r._id) === e.target.value);
                    setSelectedRentalHistory(rental || null);
                  }}
                  className="w-full px-4 py-2 border border-lightGray rounded-lg bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
                >
                  <option value="">Select a rental...</option>
                  {availableRentals.map((rental) => (
                    <option key={rental._id} value={rental._id}>
                      {rental.renterId?.firstName} {rental.renterId?.lastName} - 
                      From {formatDate(rental.rentedFrom)} to {formatDate(rental.cancelledAt)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRentalHistory && (
                <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-darkGray mb-2">
                    <strong>Renter:</strong> {selectedRentalHistory.renterId?.firstName} {selectedRentalHistory.renterId?.lastName}
                  </p>
                  <p className="text-sm text-darkGray mb-2">
                    <strong>Period:</strong> {formatDate(selectedRentalHistory.rentedFrom)} - {formatDate(selectedRentalHistory.cancelledAt)}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Reference Feedback <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({feedbackText.length}/200 characters)
                  </span>
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => {
                    const text = e.target.value;
                    if (text.length <= 200) {
                      setFeedbackText(text);
                    }
                  }}
                  rows={4}
                  maxLength={200}
                  placeholder="Enter your feedback about the renter (max 200 characters)..."
                  className="w-full px-4 py-2 border border-lightGray rounded-lg bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmitFeedback}
                  disabled={submitting || !selectedRentalHistory || !feedbackText.trim()}
                  className="px-6 py-2 bg-[#6B4EFF] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setFeedbackText("");
                    setSelectedRentalHistory(null);
                  }}
                  className="px-6 py-2 border border-lightGray text-secondary rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-darkGray">
              No available rentals for feedback submission.
            </p>
          )}
        </div>
      )}

      {/* References List */}
      {references.length === 0 ? (
        <div className="text-center py-8 text-darkGray">
          <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p>No references submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {references.map((reference) => {
            const renter = reference.renterId;
            const renterInfo = reference.renterInfo || {};
            const address = reference.renterAddress || {};
            const rentalHistory = reference.rentalHistoryId || {};
            const rentedFrom = reference.rentedFrom || rentalHistory.rentedFrom;
            const rentedTo = reference.rentedTo || rentalHistory.rentedTo || rentalHistory.cancelledAt;

            return (
              <div
                key={reference._id}
                className="p-4 border border-lightGray rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-[#6B4EFF]" />
                    <h3 className="font-semibold text-secondary">
                      {renter?.firstName} {renter?.lastName}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(reference.status)}`}>
                    {reference.status || 'pending'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-darkGray">
                      <strong>ID Number:</strong> {renterInfo.idNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-darkGray">
                      <strong>Renter Name:</strong> {renter?.firstName} {renter?.lastName}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-darkGray">
                      <strong>Address:</strong> {formatAddress(address)}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-darkGray flex items-center gap-2">
                      <FiCalendar className="text-[#6B4EFF]" />
                      <strong>Dates Lived:</strong> From {formatDate(rentedFrom)} - To {formatDate(rentedTo)}
                    </p>
                  </div>
                  <div className="md:col-span-2 pt-2 border-t border-lightGray">
                    <p className="text-darkGray flex items-start gap-2">
                      <FiMessageSquare className="text-[#6B4EFF] mt-1 flex-shrink-0" />
                      <span>
                        <strong>Reference:</strong> {reference.referenceText}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReferencesSection;
