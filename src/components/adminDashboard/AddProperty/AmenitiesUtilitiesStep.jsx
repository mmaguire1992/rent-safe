import { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import CustomCheckbox from "@/components/adminDashboard/common/CustomCheckbox";
import { amenitiesList, utilitiesList } from "@/constant";

function AmenitiesUtilitiesStep({
  formData,
  setFormData,
  handleToggleAmenity,
  handleAddOtherAmenity,
  handleRemoveOtherAmenity,
}) {
  const [otherAmenityInput, setOtherAmenityInput] = useState("");

  const handleAddOtherAmenityClick = () => {
    if (otherAmenityInput.trim()) {
      handleAddOtherAmenity(otherAmenityInput.trim());
      setOtherAmenityInput("");
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-secondary mb-0">
          Amenities & Utilities
        </h2>
        <p className="text-darkGray text-base font-normal">
          Set your pricing details
        </p>
      </div>

      <div className="border border-lightGray md:border-none rounded-xl p-4 bg-white">
        <h3 className="text-base font-semibold text-secondary mb-1">
          Amenities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 md:mt-0">
          {amenitiesList.map((amenity) => (
            <div
              key={amenity}
              className="py-2 md:p-3 hover:bg-gray-50 rounded-xl md:border md:border-lightGray bg-white"
            >
              <CustomCheckbox
                id={`amenity-${amenity}`}
                checked={formData.amenities.includes(amenity)}
                onChange={() => handleToggleAmenity(amenity)}
                label={amenity}
                className="w-full"
                labelClassName="text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-secondary mb-1">
          Other Amenities
        </h3>

        <div className="flex gap-3 relative">
          <input
            type="text"
            value={otherAmenityInput}
            onChange={(e) => setOtherAmenityInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddOtherAmenityClick();
              }
            }}
            placeholder="Enter amenity name"
            className="flex-1 px-4 py-3 border h-[52px] border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0"
          />
          <button
            onClick={handleAddOtherAmenityClick}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#2177CE] text-sm font-bold hover:bg-opacity-90 transition-colors absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <span>Add</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-3 mt-4">
          {formData.otherAmenities.map((amenity, index) => (
            <span
              key={index}
              className="flex items-center gap-6 px-3 py-2 text-secondary rounded-xl text-base font-medium border border-lightGray"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#6B4EFF] rounded flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                {amenity}
              </div>
              <button
                onClick={() => handleRemoveOtherAmenity(index)}
                className="text-darkGray hover:text-red-600 transition-colors"
              >
                <FiX className="text-md" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="border border-lightGray rounded-xl p-4 bg-white">
        <div className="flex items-center justify-between mb-1 ">
          <h3 className="text-base font-semibold text-secondary">Utilities</h3>
          <button
            onClick={() => {
              setFormData({
                ...formData,
                utilities: [...formData.utilities, ""],
              });
            }}
            className="flex items-center gap-1 text-[#6B4EFF] hover:text-opacity-80 transition-colors"
          >
            <FiPlus className="text-xl" />
          </button>
        </div>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
          {formData.utilities.map((utility, index) => (
            <div key={index} className="block">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <CustomDropdown
                    options={utilitiesList}
                    value={utility}
                    onChange={(value) => {
                      const newUtilities = [...formData.utilities];
                      newUtilities[index] = value;
                      setFormData({ ...formData, utilities: newUtilities });
                    }}
                    placeholder="Select an option"
                  />
                </div>
                {index > 0 && (
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        utilities: formData.utilities.filter(
                          (_, i) => i !== index
                        ),
                      });
                    }}
                    className="p-1 text-red-600  rounded-lg transition-colors"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AmenitiesUtilitiesStep;
