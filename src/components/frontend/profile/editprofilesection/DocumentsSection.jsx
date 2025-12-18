import BlueDocumentIcon from "@/svg/blueDocumentIcon";
import SectionHeader from "./SectionHeader";
import DocumentUpload from "./DocumentUpload";
import CustomCalendar from "@/components/adminDashboard/common/CustomCalendar";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";

function DocumentsSection({
  formData,
  handleChange,
  handleDateChange,
  handleDropdownChange,
  documentTypeOptions,
}) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-3 md:p-6">
      <SectionHeader icon={BlueDocumentIcon} title="Documents" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Type
          </label>
          <CustomDropdown
            options={documentTypeOptions}
            value={formData.documentType}
            onChange={(value) => handleDropdownChange("documentType", value)}
            placeholder="Select an option"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Document Number
          </label>
          <input
            type="text"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleChange}
            placeholder="Enter your document number"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Expire
          </label>
          <CustomCalendar
            value={formData.documentExpire}
            onChange={(value) => handleDateChange("documentExpire", value)}
            placeholder="DD/MM/YYYY"
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

export default DocumentsSection;
