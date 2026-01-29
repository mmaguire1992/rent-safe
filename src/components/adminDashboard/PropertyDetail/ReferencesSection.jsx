'use client'

import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiMessageSquare, FiUser, FiX } from "react-icons/fi";
import { getPropertyReferences, createOwnerReference } from "@/api/references";
import { getAllRentalHistory } from "@/api/rentalHistory";
import Pagination from "@/components/adminDashboard/common/Pagination";
import { toast } from "react-toastify";

function ReferencesSection({ propertyId, propertyStatus }) {
  const [references, setReferences] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [activeRentalForFeedback, setActiveRentalForFeedback] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const countNonSpace = (text) => String(text || "").replace(/\s/g, "").length;

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

  const getStatusBadge = (reference) => {
    // Use is_verified field to determine status
    if (reference?.is_verified === true) return "bg-[#DFFFE6] text-[#00893A]";
    if (reference?.is_verified === false && reference?.status === "rejected") return "bg-red-100 text-red-600";
    return "bg-[#FFF5CC] text-[#D19600]";
  };

  const getStatusText = (reference) => {
    // Use is_verified field to determine status text
    if (reference?.is_verified === true) return "verified";
    if (reference?.is_verified === false && reference?.status === "rejected") return "rejected";
    return "pending";
  };

  const isPropertyActive = String(propertyStatus || "").toLowerCase() === "active";

  const referenceByRentalHistoryId = useMemo(() => {
    const map = new Map();
    (references || []).forEach((ref) => {
      const key = String(ref?.rentalHistoryId?._id || ref?.rentalHistoryId || "");
      if (key) map.set(key, ref);
    });
    return map;
  }, [references]);

  // Latest "moved out" rental for this property (used to highlight the last renter who left)
  const latestMovedOutRentalId = useMemo(() => {
    const pid = String(propertyId || "");
    let latest = null;
    let latestTime = -Infinity;

    (rentals || []).forEach((rental) => {
      const rentalPropertyId = String(rental?.propertyId?._id || rental?.propertyId || "");
      const hasMovedOut = !!rental?.cancelledAt;
      if (!pid || rentalPropertyId !== pid || !hasMovedOut) return;

      const t = new Date(rental?.cancelledAt || rental?.rentedFrom || rental?.createdAt || 0).getTime();
      if (t > latestTime) {
        latestTime = t;
        latest = rental;
      }
    });

    return latest?._id ? String(latest._id) : "";
  }, [rentals, propertyId]);

  const propertyRentals = useMemo(() => {
    const pid = String(propertyId || "");
    // Only show completed rentals (move-out date exists). Do not show "From - Now" entries.
    const list = (rentals || []).filter((rental) => {
      const rentalPropertyId = String(rental?.propertyId?._id || rental?.propertyId || "");
      const hasMovedOut = !!rental?.cancelledAt;
      return pid && rentalPropertyId && rentalPropertyId === pid && hasMovedOut;
    });

    const getCreatedTime = (r) =>
      new Date(r?.createdAt || r?.rentedFrom || r?.cancelledAt || 0).getTime();

    // Deterministic sorting: latest entries first (by createdAt), stable tie-breaker by _id.
    // This prevents the list from shuffling on refresh.
    return list.sort((a, b) => {
      const ta = getCreatedTime(a);
      const tb = getCreatedTime(b);
      if (tb !== ta) return tb - ta;
      return String(b?._id || "").localeCompare(String(a?._id || ""));
    });
  }, [rentals, propertyId]);

  const totalItems = propertyRentals.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRentals = propertyRentals.slice(startIndex, startIndex + itemsPerPage);

  const openFeedbackModal = (rental) => {
    setActiveRentalForFeedback(rental);
    setFeedbackText("");
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setActiveRentalForFeedback(null);
    setFeedbackText("");
    setSubmitting(false);
  };

  const handleFeedbackChange = (e) => {
    let text = e.target.value || "";

    // Do not allow spaces at the beginning
    if (/^\s/.test(text)) {
      text = text.replace(/^\s+/, "");
    }

    // Max 200 characters (spaces not counted)
    if (countNonSpace(text) > 200) return;

    setFeedbackText(text);
  };

  const handleSubmitFeedback = async () => {
    if (!activeRentalForFeedback?._id) {
      toast.error("Rental history not found");
      return;
    }

    // Extra guard: feedback is only for completed rentals
    if (!activeRentalForFeedback?.cancelledAt) {
      toast.error("Feedback is available only after move-out date is set");
      return;
    }

    const text = String(feedbackText || "").trim();
    const nonSpaceCount = countNonSpace(text);

    if (!text) {
      toast.error("Please enter feedback");
      return;
    }

    if (nonSpaceCount < 10) {
      toast.error("Feedback must be at least 10 characters (spaces not counted)");
      return;
    }

    if (nonSpaceCount > 200) {
      toast.error("Feedback must be 200 characters or less (spaces not counted)");
      return;
    }

    try {
      setSubmitting(true);
      const newReference = await createOwnerReference({
        rentalHistoryId: activeRentalForFeedback._id,
        referenceText: text,
      });

      setReferences((prev) => [newReference, ...(prev || [])]);
      toast.success("Feedback submitted. Admin has been notified for verification.");
      closeFeedbackModal();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to submit feedback"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch references and rental history
  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) return;

      try {
        setLoading(true);

        const [refs, rentalHistoryData] = await Promise.all([
          getPropertyReferences(propertyId),
          getAllRentalHistory({ page: 1, limit: 500 }),
        ]);

        setReferences(refs || []);
        setRentals(rentalHistoryData?.data || []);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error loading references/rental history:", error);
        toast.error("Failed to load references");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, propertyStatus]);

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

  return (
    <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="md:text-xl text-base font-bold font-nunito text-secondary">
          References
        </h2>
      </div>

      {/* Rental history list (per property) with feedback status */}
      {totalItems === 0 ? (
        <div className="text-center py-8 text-darkGray">
          <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p>No completed rental history found for this property yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-lightGray rounded-[16px]">
            <table className="min-w-full bg-white">
              <thead className="bg-[#F9F9FC]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-secondary">Renter</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-secondary">Period</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-secondary">Feedback</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-secondary">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRentals.map((rental) => {
                  const renter = rental?.renterId || {};
                  const reference = referenceByRentalHistoryId.get(String(rental?._id));
                  const isLatestMovedOut = String(rental?._id || "") === latestMovedOutRentalId;
                  // Allow feedback submission for any completed rental without a reference,
                  // even if the property is currently rented again.
                  const canSubmit = !!rental?.cancelledAt && !reference && !submitting;

                  return (
                    <tr key={String(rental?._id)} className="border-t border-lightGray">
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-2">
                          <FiUser className="text-[#6B4EFF] mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-secondary truncate">
                              {`${renter?.firstName || ""} ${renter?.lastName || ""}`.trim() || "N/A"}
                            </p>
                            <p className="text-xs text-darkGray truncate">{renter?.email || ""}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <p className="text-sm text-secondary flex items-center gap-2">
                          <FiCalendar className="text-[#6B4EFF]" />
                          <span>
                            {formatDate(rental?.rentedFrom)} -{" "}
                            {formatDate(rental?.cancelledAt)}
                          </span>
                        </p>
                      </td>

                      <td className="px-4 py-4 align-top">
                        {reference ? (
                          <div className="space-y-2">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(reference)}`}
                            >
                              {getStatusText(reference)}
                            </span>
                            <p className="text-sm text-darkGray break-words max-w-[360px]">
                              {reference?.referenceText || ""}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-secondary">
                            Pending feedback
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 align-top text-right">
                        {reference ? (
                          <button
                            type="button"
                            className="px-4 py-2 border border-lightGray text-secondary rounded-lg text-sm font-semibold opacity-60 cursor-not-allowed"
                            disabled
                          >
                            Submitted
                          </button>
                        ) : canSubmit ? (
                          <button
                            type="button"
                            onClick={() => openFeedbackModal(rental)}
                            className="px-4 py-2 bg-[#6B4EFF] text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors"
                          >
                            {isLatestMovedOut && (
                              <FiMessageSquare className="inline-block mr-2 -mt-0.5" />
                            )}
                            Submit Feedback
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="px-4 py-2 border border-lightGray text-secondary rounded-lg text-sm font-semibold opacity-60 cursor-not-allowed"
                            disabled
                            title="Feedback not available yet"
                          >
                            Submit Feedback
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage) || 1}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="rentals"
            />
          </div>
        </div>
      )}

      {/* Feedback modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 !mt-0">
          <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="md:text-xl text-base font-bold font-nunito text-secondary">
                Submit Feedback
              </h3>
              <button
                type="button"
                onClick={closeFeedbackModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={submitting}
              >
                <FiX className="w-5 h-5 text-darkGray" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F9F9FC] border border-lightGray rounded-xl p-4">
                <p className="text-sm text-secondary font-semibold mb-1">Renter</p>
                <p className="text-sm text-darkGray">
                  {`${activeRentalForFeedback?.renterId?.firstName || ""} ${activeRentalForFeedback?.renterId?.lastName || ""}`.trim() ||
                    "N/A"}
                  {activeRentalForFeedback?.renterId?.email
                    ? ` (${activeRentalForFeedback.renterId.email})`
                    : ""}
                </p>
                <p className="text-sm text-secondary font-semibold mt-3 mb-1">Tenancy Dates</p>
                <p className="text-sm text-darkGray">
                  {formatDate(activeRentalForFeedback?.rentedFrom)} -{" "}
                  {formatDate(activeRentalForFeedback?.cancelledAt)}
                </p>
                <p className="text-xs text-darkGray mt-3">
                  This will be sent to Admin for verification (email notification included).
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-secondary">
                    Feedback <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-darkGray">
                    {countNonSpace(feedbackText)}/200 (spaces not counted)
                  </span>
                </div>
                <textarea
                  value={feedbackText}
                  onChange={handleFeedbackChange}
                  rows={4}
                  placeholder="Write feedback about the renter..."
                  className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] resize-none"
                  disabled={submitting}
                />
                <p className="text-xs text-darkGray mt-2">
                  Max 200 characters (spaces not counted). No leading spaces.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeFeedbackModal}
                  className="px-6 py-2 bg-gray-100 text-darkGray rounded-[10px] font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitFeedback}
                  disabled={submitting || !String(feedbackText || "").trim()}
                  className="px-6 py-2 bg-[#6B4EFF] text-white rounded-[10px] font-bold hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReferencesSection;
