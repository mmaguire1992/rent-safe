import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import { addPropertyTypeOptions } from "@/constant";
import BlueAIIcon from "@/svg/blueAIIcon";

function BasicInfoStep({ formData, setFormData, setShowAIModal }) {
  const handleIncrement = (field) => {
    const currentValue = parseInt(formData[field]) || 0;
    setFormData({ ...formData, [field]: (currentValue + 1).toString() });
  };

  const handleDecrement = (field) => {
    const currentValue = parseInt(formData[field]) || 0;
    if (currentValue > 0) {
      setFormData({ ...formData, [field]: (currentValue - 1).toString() });
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base md:text-xl font-bold font-nunito text-secondary mb-0">
          Basic Information
        </h2>
        <p className="text-darkGray text-sm md:text-base font-normal font-nunito">
          Manage and track your rental listings
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Property Title
            </label>
            <input
              type="text"
              value={formData.propertyTitle}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  propertyTitle: e.target.value,
                })
              }
              placeholder="Enter your property title"
              className="w-full px-4 py-3 border h-[52px] border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-2">
              Property Type
            </label>
            <CustomDropdown
              options={addPropertyTypeOptions}
              value={formData.propertyType}
              onChange={(value) =>
                setFormData({ ...formData, propertyType: value })
              }
              placeholder="Select your property type"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary">
              Property Description
            </label>
          </div>
          <div className="relative">
            <textarea
              value={formData.propertyDescription}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  propertyDescription: e.target.value,
                })
              }
              placeholder="Enter your property description"
              rows="6"
              className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 resize-none"
            />
            <button
              onClick={() => setShowAIModal(true)}
              className="lg:absolute bottom-3 right-2 flex items-center gap-2 px-4 py-2 bg-[#E8E2FF] text-[#6B4EFF] rounded-[10px] font-bold hover:bg-opacity-90 transition-colors text-base"
            >
              <BlueAIIcon />
              AI Content Generator
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Bedrooms
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: e.target.value })
                }
                placeholder="Enter number of bedrooms"
                min="0"
                className="w-full px-4 py-3 pr-12 h-[52px] border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="absolute bg-white right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleIncrement("bedrooms")}
                  className="p-01 hover:bg-gray-100 rounded transition-colors"
                >
                  <FiChevronUp className="w-4 h-4 text-darkGray" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDecrement("bedrooms")}
                  className="p-0 hover:bg-gray-100 rounded transition-colors"
                  disabled={parseInt(formData.bedrooms) <= 0}
                >
                  <FiChevronDown className="w-4 h-4 text-darkGray" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Bathrooms
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bathrooms: e.target.value })
                }
                placeholder="Enter number of bathrooms"
                min="0"
                className="w-full px-4 py-3 pr-12 h-[52px] border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleIncrement("bathrooms")}
                  className="p-0 hover:bg-gray-100 rounded transition-colors"
                >
                  <FiChevronUp className="w-4 h-4 text-darkGray" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDecrement("bathrooms")}
                  className="p-0 hover:bg-gray-100 rounded transition-colors"
                  disabled={parseInt(formData.bathrooms) <= 0}
                >
                  <FiChevronDown className="w-4 h-4 text-darkGray" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BasicInfoStep;
