import MultiSelectDropdown from "@/components/adminDashboard/common/MultiSelectDropdown";
import { preferredRenterTypeOptions } from "@/constant";
import BlueAIIcon from "@/svg/blueAIIcon";

function RenterDescriptionStep({ formData, setFormData, setShowAIModal }) {
  const handlePreferredRenterTypeChange = (selectedValues) => {
    setFormData({
      ...formData,
      preferredRenterTypes: selectedValues,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base md:text-xl font-bold font-nunito text-secondary mb-0">
          Renter Description
        </h2>
        <p className="text-darkGray text-base font-nunito font-normal">
          Describe what type of renter you are looking for your property
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-end justify-between mb-2">
            <label className="block text-sm md:text-base font-nunito font-semibold text-secondary mb-1 ">
              Renter Profile Description
            </label>
          </div>
          <div className="relative">
            <textarea
              value={formData.renterProfileDescription}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  renterProfileDescription: e.target.value,
                })
              }
              placeholder="Enter your property description"
              rows="6"
              className="w-full px-4 py-3 border  border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 resize-none"
            />
            <button
              onClick={() => setShowAIModal(true)}
              className="lg:absolute bottom-3 right-2 flex items-center gap-2 px-4 py-2 bg-[#E8E2FF] text-[#6B4EFF] rounded-[10px] font-bold hover:bg-opacity-90 transition-colors text-sm md:text-base"
            >
              <BlueAIIcon />
              AI Content Generator
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm md:text-base font-nunito font-semibold text-secondary mb-1">
            Preferred Renter Type
          </label>
          <MultiSelectDropdown
            options={preferredRenterTypeOptions}
            value={formData.preferredRenterTypes || []}
            onChange={handlePreferredRenterTypeChange}
            placeholder="Select preferred renter types"
          />
        </div>

        <div>
          <label className="block text-sm md:text-base font-nunito font-semibold text-secondary mb-1">
            Additional Requirements
          </label>
          <textarea
            value={formData.additionalRequirements}
            onChange={(e) =>
              setFormData({
                ...formData,
                additionalRequirements: e.target.value,
              })
            }
            placeholder="Enter Additional Requirements"
            rows="6"
            className="w-full px-4 py-3 border  border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

export default RenterDescriptionStep;
