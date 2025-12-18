import SectionHeader from "./SectionHeader";
import DocumentUpload from "./DocumentUpload";
import CustomCalendar from "@/components/adminDashboard/common/CustomCalendar";
import BlueCardIcon from "../../../../svg/blueCardIcon";

function IdentityInformationSection({
  formData,
  handleChange,
  handleDateChange,
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
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Date of Birth
          </label>
          <CustomCalendar
            value={formData.dateOfBirth}
            onChange={(value) => handleDateChange("dateOfBirth", value)}
            placeholder="DD/MM/YYYY"
          />
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
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
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
            name="identityPhone"
            value={formData.identityPhone}
            onChange={handleChange}
            placeholder="Enter your phone number"
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

export default IdentityInformationSection;
