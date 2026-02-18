import BlueOccupationIcon from "@/svg/blueOccupationIcon";
import SectionHeader from "./SectionHeader";
import CustomCalendar from "@/components/adminDashboard/common/CustomCalendar";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";

function EmploymentDetailsSection({
  formData,
  handleChange,
  handleDateChange,
  handleDropdownChange,
  employmentTypeOptions,
  errors = {},
}) {
  return (
    <div className="bg-white pb-4">
      <SectionHeader icon={BlueOccupationIcon} title="Employment Details" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm md:text-base font-semibold text-secondary mb-1">
            Job Title
          </label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="Enter your job title"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-semibold text-secondary mb-1">
            Company
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Enter your company"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-semibold text-secondary mb-1">
            Start Date
          </label>
          <CustomCalendar
            value={formData.startDate}
            onChange={(value) => handleDateChange("startDate", value)}
            placeholder="DD/MM/YYYY"
            error={errors.startDate}
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-semibold text-secondary mb-1">
            Employment Type
          </label>
          <CustomDropdown
            options={employmentTypeOptions}
            value={formData.employmentType}
            onChange={(value) => handleDropdownChange("employmentType", value)}
            placeholder="Select an option"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-semibold text-secondary mb-1">
            Annual Salary
          </label>
          <input
            type="text"
            name="annualSalary"
            value={formData.annualSalary}
            onChange={handleChange}
            placeholder="Enter your annual salary"
            inputMode="numeric"
            pattern="[0-9.]*"
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${errors.annualSalary ? 'border-errorColor' : 'border-lightGray'
              }`}
          />
          {errors.annualSalary && (
            <p className="mt-1 text-sm text-errorColor">{errors.annualSalary}</p>
          )}
        </div>

        <div>
          <label className="block text-sm md:text-base font-semibold text-secondary mb-1">
            Work Location
          </label>
          <input
            type="text"
            name="workLocation"
            value={formData.workLocation}
            onChange={handleChange}
            placeholder="Enter your work location"
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
          />
        </div>
      </div>
    </div>
  );
}

export default EmploymentDetailsSection;
