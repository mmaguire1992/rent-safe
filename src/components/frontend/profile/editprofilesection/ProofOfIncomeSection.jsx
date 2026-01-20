import BlueIncomeIcon from "@/svg/blueIncomeIcon";
import SectionHeader from "./SectionHeader";
import DocumentUpload from "./DocumentUpload";
import CustomCalendar from "@/components/adminDashboard/common/CustomCalendar";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";

function ProofOfIncomeSection({
  formData,
  handleChange,
  handleDateChange,
  handleDropdownChange,
  incomeTypeOptions,
  existingDocuments = [],
  onDocumentsUpdated,
  deferDbSave = false,
  pendingKey = null,
  onPendingDocumentsChange = null,
  pendingResetToken = 0,
  errors = {},
}) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-3 md:p-6">
      <SectionHeader icon={BlueIncomeIcon} title="Proof of Income" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Type
          </label>
          <CustomDropdown
            options={incomeTypeOptions}
            value={formData.incomeType}
            onChange={(value) => handleDropdownChange("incomeType", value)}
            placeholder="Select an option"
          />
          {errors.incomeType && (
            <p className="mt-1 text-sm text-errorColor">{errors.incomeType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Date
          </label>
          <CustomCalendar
            value={formData.incomeDate}
            onChange={(value) => handleDateChange("incomeDate", value)}
            placeholder="DD/MM/YYYY"
          />
          {errors.incomeDate && (
            <p className="mt-1 text-sm text-errorColor">{errors.incomeDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Gross Monthly (£)
          </label>
          <input
            type="text"
            name="grossMonthly"
            value={formData.grossMonthly}
            onChange={handleChange}
            placeholder="Enter your gross monthly"
            inputMode="numeric"
            pattern="[0-9.]*"
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              errors.grossMonthly ? 'border-errorColor' : 'border-lightGray'
            }`}
          />
          {errors.grossMonthly && (
            <p className="mt-1 text-sm text-errorColor">{errors.grossMonthly}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Net Monthly (£)
          </label>
          <input
            type="text"
            name="netMonthly"
            value={formData.netMonthly}
            onChange={handleChange}
            placeholder="Enter your net monthly"
            inputMode="numeric"
            pattern="[0-9.]*"
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              errors.netMonthly ? 'border-errorColor' : 'border-lightGray'
            }`}
          />
          {errors.netMonthly && (
            <p className="mt-1 text-sm text-errorColor">{errors.netMonthly}</p>
          )}
        </div>
      </div>

      <DocumentUpload
        label="Upload document to verify proof of income"
        maxFiles={3}
        docType="pay_slip"
        existingDocuments={existingDocuments}
        onDocumentsUpdated={onDocumentsUpdated}
        deferDbSave={deferDbSave}
        pendingKey={pendingKey}
        onPendingDocumentsChange={onPendingDocumentsChange}
        pendingResetToken={pendingResetToken}
      />
    </div>
  );
}

export default ProofOfIncomeSection;
