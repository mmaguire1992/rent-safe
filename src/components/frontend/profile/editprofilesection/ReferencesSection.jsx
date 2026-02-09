import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import BlueRefrenceIcon from "../../../../svg/websiteSvg/blueRefrenceIcon";

function ReferencesSection({
  references,
  handleReferenceChange,
  addReference,
  referenceTypeOptions,
}) {
  return (
    <div className="bg-white border-b border-lightGray pb-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#E8E2FF] w-[36px] h-[36px] flex items-center justify-center rounded-[10px] p-2">
          <BlueRefrenceIcon />
        </div>
        <h2 className="text-xl font-bold font-nunito text-secondary mb-0">
          References
        </h2>
      </div>

      {references.map((ref, index) => (
        <div key={index} className="mb-6">
          {index > 0 && <div className="border-t border-lightGray my-6"></div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={ref.fullName}
                onChange={(e) =>
                  handleReferenceChange(index, "fullName", e.target.value)
                }
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                Type
              </label>
              <CustomDropdown
                options={referenceTypeOptions}
                value={ref.type}
                onChange={(value) =>
                  handleReferenceChange(index, "type", value)
                }
                placeholder="Select an option"
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                Designation
              </label>
              <input
                type="text"
                value={ref.designation}
                onChange={(e) =>
                  handleReferenceChange(index, "designation", e.target.value)
                }
                placeholder="Enter your designation"
                className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={ref.email}
                onChange={(e) =>
                  handleReferenceChange(index, "email", e.target.value)
                }
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
                value={ref.phone}
                onChange={(e) =>
                  handleReferenceChange(index, "phone", e.target.value)
                }
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={ref.relationship}
                onChange={(e) =>
                  handleReferenceChange(index, "relationship", e.target.value)
                }
                placeholder="Enter your relationship"
                className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addReference}
        className="px-6 py-2 shadow-[inset_0px_2px_4px_0px_rgba(107,78,255,0.2)] bg-white border border-[#4A2FCC] text-[#4A2FCC] rounded-[10px] text-base font-semibold hover:bg-opacity-90 transition-colors"
      >
        Add more +
      </button>
    </div>
  );
}

export default ReferencesSection;
