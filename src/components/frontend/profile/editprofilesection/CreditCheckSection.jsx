import BlueCreditIcon from "@/svg/blueCreditIcon";
import SectionHeader from "./SectionHeader";
import CreditScoreDocumentUpload from "./CreditScoreDocumentUpload";

function CreditCheckSection({
  formData,
  handleChange,
  existingCreditScoreDocuments = [],
  pendingCreditScoreKey = 'credit_score',
  onPendingDocumentsChange,
  onDocumentsUpdated,
  pendingResetToken = 0,
  errors = {},
}) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-3 md:p-6">
      <SectionHeader icon={BlueCreditIcon} title="Credit Check" />

      <div className="mb-4 w-full md:max-w-[50%]">
        <label className="block text-sm md:text-base font-medium text-secondary mb-1">
          Credit Score
        </label>
        <input
          type="text"
          name="creditScore"
          value={formData.creditScore}
          onChange={handleChange}
          placeholder="Type your credit score"
          inputMode="numeric"
          pattern="[0-9]*"
          className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
            errors.creditScore ? 'border-errorColor' : 'border-lightGray'
          }`}
        />
        {errors.creditScore && (
          <p className="mt-1 text-sm text-errorColor">{errors.creditScore}</p>
        )}
      </div>

      <div className="mb-6 w-full md:max-w-[50%]">
        <CreditScoreDocumentUpload
          label="Credit Score Document"
          existingDocuments={existingCreditScoreDocuments}
          pendingKey={pendingCreditScoreKey}
          onPendingDocumentsChange={onPendingDocumentsChange}
          onDocumentsUpdated={onDocumentsUpdated}
          pendingResetToken={pendingResetToken}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#FEF2F2]  rounded-[10px] p-4">
          <p className="text-xs md:text-base font-bold text-errorColor">
            &lt;500 out of 800
          </p>
          <h2 className="text-base md:text-2xl font-bold text-errorColor">
            Bad
          </h2>
        </div>
        <div className="bg-[#FFFAE6]  rounded-[10px] p-4">
          <p className="text-xs md:text-base font-bold text-[#D19600]">
            500-600 out of 800
          </p>
          <h2 className="text-base md:text-2xl font-bold text-[#D19600]">
            Fair
          </h2>
        </div>
        <div className="bg-[#FFEFE1]  rounded-[10px] p-4">
          <p className="text-xs md:text-base font-bold text-[#A84F00]">
            600-700 out of 800
          </p>
          <h2 className="text-base md:text-2xl font-bold text-[#A84F00]">
            Good
          </h2>
        </div>
        <div className="bg-[#DFFFE6]  rounded-[10px] p-4">
          <p className="text-xs md:text-base font-bold text-[#00893A]">
            700-800 out of 800
          </p>
          <h2 className="text-base md:text-2xl font-bold text-[#00893A]">
            Excellent
          </h2>
        </div>
      </div>
    </div>
  );
}

export default CreditCheckSection;
