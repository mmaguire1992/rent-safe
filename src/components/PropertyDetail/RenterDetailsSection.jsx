import { useState } from "react";
import { FiEdit, FiTrash2, FiCheckCircle } from "react-icons/fi";
import FileUpload from "@/components/FileUpload";
import UserImg from "../../assests/images/userImg.png";
import LargeCheckIcon from "../../svg/largeCheckIcon";
import MediumCheckedIcon from "../../svg/mediumCheckedIcon";
import GrayPDFIcon from "../../svg/grayPDFIcon";
import BlueEditIcon from "../../svg/blueEditIcon";
import RedDeleteIcon from "../../svg/redDeleteIcon";
function RenterDetailsSection({
  documents,
  renterFeedback,
  setRenterFeedback,
  onEdit,
  onDelete,
}) {
  const [isEditingFeedback, setIsEditingFeedback] = useState(!renterFeedback);
  const [tempFeedback, setTempFeedback] = useState(renterFeedback || "");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleFeedbackChange = (e) => {
    setTempFeedback(e.target.value);
    setHasUnsavedChanges(
      e.target.value.trim() !== (renterFeedback || "").trim()
    );
  };

  const handleSaveFeedback = () => {
    setRenterFeedback(tempFeedback);
    setIsEditingFeedback(false);
    setHasUnsavedChanges(false);
  };

  const handleEditFeedback = () => {
    setTempFeedback(renterFeedback || "");
    setIsEditingFeedback(true);
    setHasUnsavedChanges(false);
  };
  return (
    <div className="space-y-6">
      {/* Renter Section */}
      <div className="bg-white rounded-[20px] border border-lightGray p-6">
        <h2 className="text-base font-semibold font-nunito text-secondary mb-1">
          Renter
        </h2>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 border rounded-[20px] border-lightGray min-w-[286px] p-4">
            <div className="relative">
              <img
                src={UserImg}
                alt="David Wanner"
                className="w-[60px] h-[60px] rounded-full object-cover"
              />
              <span className="absolute -bottom-0 -right-1  text-green-600 bg-white rounded-full text-xl">
                <MediumCheckedIcon />
              </span>
            </div>
            <div>
              <h2 className="text-base font-normal font-nunito text-[#0F172B] mb-0">
                David Wanner
              </h2>
              <span className="text-[#00893A] text-base font-semibold">
                Verified
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-5 py-1.5 border border-[#4A2FCC] text-[#6B4EFF] rounded-lg text-base font-bold font-nunito  transition-colors "
            >
              <span className="text-base font-bold font-nunito text-[#4A2FCC]">
                Edit
              </span>
              <BlueEditIcon className="text-[#6B4EFF]" />
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-5 py-1.5 border border-red-600 text-red-600 rounded-lg text-base font-bold font-nunito  transition-colors "
            >
              <span className="text-base font-bold font-nunito text-[#D24343]">
                Delete
              </span>
              <RedDeleteIcon className="text-red-600" />
            </button>
          </div>
        </div>

        {/* Documents Section */}
        <div className="block mt-6">
          <h2 className="text-base font-semibold font-nunito text-secondary mb-1">
            Documents
          </h2>
          <div className="border border-lightGray rounded-[20px] p-4">
            <h3 className="text-base font-semibold font-nunito text-secondary mb-1">
              Recommendations
            </h3>
            <div className="flex items-center gap-4">
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 border border-lightGray rounded-lg"
                  >
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-600"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-secondary">
                        {doc.name || `Document ${index + 1}.pdf`}
                      </p>
                      <p className="text-xs text-darkGray">
                        {doc.size
                          ? `${(doc.size / 1024).toFixed(0)} KB`
                          : "Unknown size"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-3 p-4 border border-lightGray rounded-lg">
                    <div className="block">
                      <GrayPDFIcon />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-darkGray">
                        Rental Agreement.pdf
                      </p>
                      <p className="text-xs  text-midGray font-medium">
                        124 KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-lightGray rounded-lg">
                    <div className="block">
                      <GrayPDFIcon />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-darkGray">
                        Tenant Application.pdf
                      </p>
                      <p className="text-xs  text-midGray font-medium">14 KB</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Renter Feedback Section */}
      <div className="bg-white rounded-[20px] border border-lightGray p-6">
        <div className="flex items-center justify-start gap-2 mb-1">
          <h2 className="text-base font-semibold font-nunito text-secondary">
            Renter Feedback
          </h2>
          {!isEditingFeedback && renterFeedback && (
            <div className="flex gap-2">
              <button
                onClick={handleEditFeedback}
                className="p-1 transition-colors"
              >
                <BlueEditIcon className="text-[#6B4EFF]" />
              </button>
              <button onClick={onDelete} className="p-1 transition-colors">
                <RedDeleteIcon className="text-red-600" />
              </button>
            </div>
          )}
        </div>
        {isEditingFeedback ? (
          <>
            <textarea
              value={tempFeedback}
              onChange={handleFeedbackChange}
              placeholder="Add your property renter feedback"
              rows="4"
              className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 resize-none"
            />
            {hasUnsavedChanges && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveFeedback}
                  className="bg-blueGradient text-white px-6 py-2 rounded-[10px] font-semibold hover:bg-opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-base font-normal font-nunito text-darkGray whitespace-pre-wrap">
            {renterFeedback || "No feedback provided"}
          </p>
        )}
      </div>
    </div>
  );
}

export default RenterDetailsSection;
