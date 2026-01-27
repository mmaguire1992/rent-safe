import { FiSearch } from "react-icons/fi";
import FileUpload from "@/components/FileUpload";
import BlueSearchIcon from "@/svg/blueSearchIcon";

function RentOutDetailsForm({
  renterEmail,
  setRenterEmail,
  documents,
  setDocuments,
  onSave,
}) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4">
      <div className="mb-6">
        <h2 className="md:text-xl text-base font-bold font-nunito text-secondary mb-1">
          Rent Out Details
        </h2>
        <p className="text-base font-normal font-nunito text-darkGray">
          Add your renter details whom you rented this property.
        </p>
      </div>

      <div className="space-y-6">
        {/* Renter's Email Address */}
        <div>
          <label className="block text-base font-semibold text-secondary mb-1">
            Renter's Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={renterEmail}
              onChange={(e) => setRenterEmail(e.target.value.replace(/^\s+/, ''))}
              placeholder="Search renter's email address"
              className="w-full px-4 py-3 pr-12 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-opacity-90 transition-colors">
              <BlueSearchIcon className="text-white" />
            </button>
          </div>
        </div>

        {/* Documents Section */}
        <div>
          <label className="block text-base font-semibold text-secondary mb-2">
            Documents
          </label>
          <FileUpload
            onFilesChange={setDocuments}
            acceptedTypes=".pdf,.doc,.docx,.png"
            maxFiles={3}
            uploadedFiles={documents}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onSave}
          className="bg-blueGradient text-white px-6 py-2 rounded-[10px] font-bold hover:bg-opacity-90 transition-opacity"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default RentOutDetailsForm;
