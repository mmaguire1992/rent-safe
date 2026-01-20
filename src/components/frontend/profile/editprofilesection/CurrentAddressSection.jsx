import BlueLocationIcon from "@/svg/blueLocationIcon";
import SectionHeader from "./SectionHeader";
import DocumentUpload from "./DocumentUpload";

function CurrentAddressSection({
  formData,
  handleChange,
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
      <SectionHeader icon={BlueLocationIcon} title="Current Address" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Address
          </label>
          <input
            type="text"
            name="currentAddress"
            value={formData.currentAddress}
            onChange={handleChange}
            placeholder="Enter your address"
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              errors.currentAddress ? 'border-errorColor' : 'border-lightGray'
            }`}
          />
          {errors.currentAddress && (
            <p className="mt-1 text-sm text-errorColor">{errors.currentAddress}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            City
          </label>
          <input
            type="text"
            name="currentCity"
            value={formData.currentCity}
            onChange={handleChange}
            placeholder="Enter your city"
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              errors.currentCity ? 'border-errorColor' : 'border-lightGray'
            }`}
          />
          {errors.currentCity && (
            <p className="mt-1 text-sm text-errorColor">{errors.currentCity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Country
          </label>
          <input
            type="text"
            name="currentCountry"
            value={formData.currentCountry}
            onChange={handleChange}
            placeholder="Enter your country"
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              errors.currentCountry ? 'border-errorColor' : 'border-lightGray'
            }`}
          />
          {errors.currentCountry && (
            <p className="mt-1 text-sm text-errorColor">{errors.currentCountry}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Postcode
          </label>
          <input
            type="text"
            name="currentPostcode"
            value={formData.currentPostcode}
            onChange={handleChange}
            placeholder="Enter your postcode"
            inputMode="text"
            autoComplete="postal-code"
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              errors.currentPostcode ? 'border-errorColor' : 'border-lightGray'
            }`}
          />
          {errors.currentPostcode && (
            <p className="mt-1 text-sm text-errorColor">{errors.currentPostcode}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Residency Length
          </label>
          <input
            type="text"
            name="residencyLength"
            value={formData.residencyLength}
            onChange={handleChange}
            placeholder="Enter your residency length"
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              errors.residencyLength ? 'border-errorColor' : 'border-lightGray'
            }`}
          />
          {errors.residencyLength && (
            <p className="mt-1 text-sm text-errorColor">{errors.residencyLength}</p>
          )}
        </div>
      </div>

      <DocumentUpload
        label="Upload document to verify the above information"
        maxFiles={1}
        docType="proof_of_address"
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

export default CurrentAddressSection;
