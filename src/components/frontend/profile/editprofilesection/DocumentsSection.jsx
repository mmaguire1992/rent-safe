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
  onDocumentsUpdated,
  existingDocuments = [],
  deferDbSave = false,
  pendingKey = null,
  onPendingDocumentsChange = null,
  pendingResetToken = 0,
  errors = {},
}) {
  // Map dropdown values to backend docType enum values
  const docTypeMap = {
    'passport': 'passport',
    'driving-license': 'driving_license',
    'id-card': 'national_id',
  };
  
  // Get the current docType based on selected documentType
  const currentDocType = docTypeMap[formData.documentType] || null;
  
  // Filter existing documents to only show those matching the selected document type
  // If no document type is selected, show all documents from this section (passport, driving_license, national_id)
  const filteredDocuments = existingDocuments.filter(doc => {
    if (currentDocType) {
      // If a document type is selected, only show documents of that type
      return doc.docType === currentDocType;
    } else {
      // If no document type is selected, show all documents from Documents section
      return ['passport', 'driving_license', 'national_id'].includes(doc.docType);
    }
  });
  
  return (
    <div className="bg-white border-b border-lightGray pb-4">
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
          {errors.documentType && (
            <p className="mt-1 text-sm text-errorColor">{errors.documentType}</p>
          )}
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
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              errors.documentNumber ? 'border-errorColor' : 'border-lightGray'
            }`}
          />
          {errors.documentNumber && (
            <p className="mt-1 text-sm text-errorColor">{errors.documentNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Expire
          </label>
          <CustomCalendar
            value={formData.documentExpire}
            onChange={(value) => handleDateChange("documentExpire", value)}
            placeholder="DD/MM/YYYY"
            // Expiry date must never be in the past (Passport / Driving License / ID Card)
            minDate={new Date().toISOString().split('T')[0]}
            error={errors.documentExpire}
          />
          {errors.documentExpire && (
            <p className="mt-1 text-sm text-errorColor">{errors.documentExpire}</p>
          )}
        </div>
      </div>

      <DocumentUpload
        label="Upload document to verify the above information"
        maxFiles={1}
        docType={currentDocType || 'passport'} // Default to passport if not selected, but validation will prevent upload
        existingDocuments={filteredDocuments}
        documentMetadata={{
          documentType: formData.documentType || '',
          documentNumber: formData.documentNumber || '',
          documentExpire: formData.documentExpire || '',
        }}
        onDocumentsUpdated={onDocumentsUpdated}
        onDocumentDeleted={() => {
          // Clear document metadata fields when document is deleted
          if (handleDropdownChange) {
            handleDropdownChange('documentType', '');
          }
          if (handleChange) {
            handleChange({ target: { name: 'documentNumber', value: '' } });
          }
          if (handleDateChange) {
            handleDateChange('documentExpire', '');
          }
        }}
        deferDbSave={deferDbSave}
        pendingKey={pendingKey}
        onPendingDocumentsChange={onPendingDocumentsChange}
        pendingResetToken={pendingResetToken}
      />
    </div>
  );
}

export default DocumentsSection;
