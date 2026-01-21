'use client'

import { useEffect, useState } from "react";
import { FiMessageSquare, FiCalendar, FiUser, FiStar } from "react-icons/fi";
import { getRenterReferences } from "@/api/references";

function RenterFeedbackSection({ renterId }) {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchReferences = async () => {
      if (!renterId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getRenterReferences(renterId);
        // Filter to only show verified references
        const verifiedReferences = data.filter(ref => ref.is_verified === true);
        setReferences(verifiedReferences);
      } catch (err) {
        console.error('Error fetching renter references:', err);
        setError('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchReferences();
    }
  }, [renterId, mounted]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold font-nunito text-secondary mb-4 flex items-center gap-2">
          <FiMessageSquare className="text-[#6B4EFF]" />
          Renter Feedback
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6B4EFF] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold font-nunito text-secondary mb-4 flex items-center gap-2">
          <FiMessageSquare className="text-[#6B4EFF]" />
          Renter Feedback
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6B4EFF] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold font-nunito text-secondary mb-4 flex items-center gap-2">
          <FiMessageSquare className="text-[#6B4EFF]" />
          Renter Feedback
        </h2>
        <div className="text-center py-8 text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <h2 className="text-lg font-bold font-nunito text-secondary mb-4 flex items-center gap-2">
        <FiMessageSquare className="text-[#6B4EFF]" />
        Renter Feedback ({references.length})
      </h2>

      {references.length === 0 ? (
        <div className="text-center py-8 text-darkGray">
          <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p>No verified feedback available for this renter yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {references.map((reference, index) => (
            <div
              key={reference._id || index}
              className="border border-lightGray rounded-xl p-4 bg-gray-50"
            >
              {/* Property and Owner Info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[#6B4EFF] flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-white text-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-secondary text-sm">
                      {reference.propertyId?.title || 'Property'}
                    </h3>
                    <p className="text-xs text-darkGray">
                      Feedback by: {reference.ownerId?.firstName} {reference.ownerId?.lastName}
                    </p>
                    <p className="text-xs text-darkGray flex items-center gap-1 mt-1">
                      <FiCalendar className="text-[#6B4EFF] text-xs" />
                      {formatDate(reference.rentalHistoryId?.rentedFrom)} - {formatDate(reference.rentalHistoryId?.cancelledAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                  <FiStar className="text-green-600 text-xs" />
                  <span className="text-xs font-semibold text-green-600">Verified</span>
                </div>
              </div>

              {/* Feedback Text */}
              <div className="bg-white border border-lightGray rounded-lg p-3">
                <p className="text-sm text-secondary leading-relaxed">
                  "{reference.referenceText}"
                </p>
              </div>

              {/* Feedback Date */}
              <div className="mt-3 text-xs text-darkGray">
                Submitted on {formatDate(reference.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RenterFeedbackSection;