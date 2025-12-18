import WhiteGuarantorIcon from "@/svg/whiteGuarantorIcon";
import DocumentUpload from "./DocumentUpload";
import BlueGrantorIcon from "../../../../svg/websiteSvg/blueGrantorIcon";

function GuarantorInformationSection({ formData, handleChange }) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-3 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#E8E2FF] w-[36px] h-[36px] flex items-center justify-center rounded-[10px] p-2">
          <BlueGrantorIcon />
        </div>
        <h2 className="text-xl font-bold font-nunito text-secondary mb-0">
          Guarantor Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="guarantorName"
            value={formData.guarantorName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Relationship
          </label>
          <input
            type="text"
            name="guarantorRelationship"
            value={formData.guarantorRelationship}
            onChange={handleChange}
            placeholder="Enter your relationship"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Occupation
          </label>
          <input
            type="text"
            name="guarantorOccupation"
            value={formData.guarantorOccupation}
            onChange={handleChange}
            placeholder="Enter your occupation"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Annual Income
          </label>
          <input
            type="text"
            name="guarantorAnnualIncome"
            value={formData.guarantorAnnualIncome}
            onChange={handleChange}
            placeholder="Enter your annual income"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="guarantorEmail"
            value={formData.guarantorEmail}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="guarantorPhone"
            value={formData.guarantorPhone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Address
          </label>
          <input
            type="text"
            name="guarantorAddress"
            value={formData.guarantorAddress}
            onChange={handleChange}
            placeholder="Enter your address"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            City
          </label>
          <input
            type="text"
            name="guarantorCity"
            value={formData.guarantorCity}
            onChange={handleChange}
            placeholder="Enter your city"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Country
          </label>
          <input
            type="text"
            name="guarantorCountry"
            value={formData.guarantorCountry}
            onChange={handleChange}
            placeholder="Enter your country"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Postcode
          </label>
          <input
            type="text"
            name="guarantorPostcode"
            value={formData.guarantorPostcode}
            onChange={handleChange}
            placeholder="Enter your postcode"
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

export default GuarantorInformationSection;
