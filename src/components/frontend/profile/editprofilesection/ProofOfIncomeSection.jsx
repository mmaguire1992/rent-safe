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
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
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
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>
      </div>

      <DocumentUpload
        label="Upload document to verify the above information"
        maxFiles={5}
      />
    </div>
  );
}

export default ProofOfIncomeSection;
