import SectionHeader from "./SectionHeader";
import DocumentUpload from "./DocumentUpload";
import CustomCalendar from "@/components/adminDashboard/common/CustomCalendar";
import BlueCardIcon from "../../../../svg/blueCardIcon";

function IdentityInformationSection({
  formData,
  handleChange,
  handleDateChange,
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
      <SectionHeader icon={BlueCardIcon} title="Identity Information" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Full name
          </label>
          <input
            type="text"
            name="identityFullName"
            value={formData.identityFullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              errors.identityFullName ? 'border-errorColor' : 'border-lightGray'
            }`}
          />
          {errors.identityFullName && (
            <p className="mt-1 text-sm text-errorColor">{errors.identityFullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Date of Birth
          </label>
          <CustomCalendar
            value={formData.dateOfBirth}
            onChange={(value) => handleDateChange("dateOfBirth", value)}
            placeholder="DD/MM/YYYY"
            // Allow selecting up to today (no future dates). Age 18+ is validated separately.
            maxDate={new Date().toISOString().split('T')[0]}
            error={errors.dateOfBirth}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-errorColor">{errors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            National Insurance
          </label>
          <input
            type="text"
            name="nationalInsurance"
            value={formData.nationalInsurance}
            onChange={handleChange}
            placeholder="Enter your national insurance"
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              errors.nationalInsurance ? 'border-errorColor' : 'border-lightGray'
            }`}
          />
          {errors.nationalInsurance && (
            <p className="mt-1 text-sm text-errorColor">{errors.nationalInsurance}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="identityEmail"
            value={formData.identityEmail}
            onChange={handleChange}
            disabled
            readOnly
            placeholder="Email cannot be changed"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary bg-gray-100 cursor-not-allowed opacity-70"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="identityPhone"
            value={formData.identityPhone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              errors.identityPhone ? 'border-errorColor' : 'border-lightGray'
            }`}
          />
          {errors.identityPhone && (
            <p className="mt-1 text-sm text-errorColor">{errors.identityPhone}</p>
          )}
        </div>
      </div>

      <DocumentUpload
        label="Upload document to verify the above information"
        maxFiles={1}
        docType="identity_proof"
        existingDocuments={existingDocuments}
        onFilesChange={(files) => {
          // Handle files change if needed
          console.log('Documents updated:', files);
        }}
        onDocumentsUpdated={onDocumentsUpdated}
        deferDbSave={deferDbSave}
        pendingKey={pendingKey}
        onPendingDocumentsChange={onPendingDocumentsChange}
        pendingResetToken={pendingResetToken}
      />
    </div>
  );
}

export default IdentityInformationSection;
