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

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "verified") return "bg-[#DFFFE6] text-[#00893A]";
    if (statusLower === "rejected") return "bg-red-100 text-red-600";
    return "bg-[#FFF5CC] text-[#D19600]";
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

  const propertyRentals = useMemo(() => {
    const pid = String(propertyId || "");
    const list = (rentals || []).filter((rental) => {
      const rentalPropertyId = String(rental?.propertyId?._id || rental?.propertyId || "");
      return pid && rentalPropertyId && rentalPropertyId === pid;
    });

    const getTime = (r) => new Date(r?.rentedFrom || r?.createdAt || 0).getTime();

    // Priority sorting:
    // 1) Rentals that need feedback (moved out + no reference yet) come first
    // 2) Within each group: newest first
    return list.sort((a, b) => {
      const aHasMovedOut = !!a?.cancelledAt;
      const bHasMovedOut = !!b?.cancelledAt;

      const aHasReference = referenceByRentalHistoryId.has(String(a?._id));
      const bHasReference = referenceByRentalHistoryId.has(String(b?._id));

      const aNeedsFeedback = isPropertyActive && aHasMovedOut && !aHasReference;
      const bNeedsFeedback = isPropertyActive && bHasMovedOut && !bHasReference;

      const aScore = aNeedsFeedback ? 1 : 0;
      const bScore = bNeedsFeedback ? 1 : 0;

      if (aScore !== bScore) return bScore - aScore; // higher score first

      return getTime(b) - getTime(a);
    });
  }, [rentals, propertyId, referenceByRentalHistoryId, isPropertyActive]);

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
          <p>No rental history found for this property yet.</p>
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
                  const hasMovedOut = !!rental?.cancelledAt;
                  const canSubmit =
                    isPropertyActive && hasMovedOut && !reference && !submitting;

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
                            {hasMovedOut ? formatDate(rental?.cancelledAt) : "Now"}
                          </span>
                        </p>
                        {!hasMovedOut && (
                          <p className="text-xs text-darkGray mt-1">
                            Feedback will be available once the renter leaves (move-out date is set).
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 align-top">
                        {reference ? (
                          <div className="space-y-2">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(reference?.status)}`}
                            >
                              {reference?.status || "pending"}
                            </span>
                            <p className="text-sm text-darkGray break-words max-w-[360px]">
                              {reference?.referenceText || ""}
                            </p>
                          </div>
                        ) : hasMovedOut ? (
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-secondary">
                            Pending feedback
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-secondary">
                            Ongoing
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
                            Submit Feedback
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="px-4 py-2 border border-lightGray text-secondary rounded-lg text-sm font-semibold opacity-60 cursor-not-allowed"
                            disabled
                            title={!isPropertyActive ? "Property must be Active to submit feedback" : "Feedback not available yet"}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
