import { FiX, FiPlus } from "react-icons/fi";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import CustomCalendar from "@/components/adminDashboard/common/CustomCalendar";
import { chargeTypeOptions } from "@/constant";

function RentDetailsStep({
  formData,
  setFormData,
  handleAddCharge,
  handleRemoveCharge,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base md:text-xl font-bold font-nunito text-secondary mb-0">
          Rent Details
        </h2>
        <p className="text-darkGray text-sm md:text-base font-normal font-nunito">
          Set your pricing details
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Monthly Rent (€)
            </label>
            <input
              type="number"
              value={formData.monthlyRent}
              onChange={(e) =>
                setFormData({ ...formData, monthlyRent: e.target.value })
              }
              placeholder="Enter your monthly rent"
              className="w-full px-4 py-3 border h-[52px] border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Available From
            </label>
            <CustomCalendar
              value={formData.availableFrom}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  availableFrom: value,
                })
              }
              placeholder="dd/mm/yyyy"
            />
          </div>
        </div>
        <div className="border border-lightGray rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Additional Charges
            </label>
            <button
              onClick={handleAddCharge}
              className="flex items-center gap-2 px-4 py-1  text-[#6B4EFF] rounded-[10px] font-semibold  transition-colors"
            >
              <FiPlus className="text-xl" />
            </button>
          </div>
          {formData.additionalCharges.map((charge, index) => (
            <div key={index} className="flex lg:flex-row flex-col gap-3 mb-3">
              <div className="flex-1">
                <CustomDropdown
                  options={chargeTypeOptions}
                  value={charge.type}
                  onChange={(value) => {
                    const newCharges = [...formData.additionalCharges];
                    newCharges[index].type = value;
                    setFormData({
                      ...formData,
                      additionalCharges: newCharges,
                    });
                  }}
                  placeholder="Select an option"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={charge.amount}
                  onChange={(e) => {
                    const newCharges = [...formData.additionalCharges];
                    newCharges[index].amount = e.target.value;
                    setFormData({
                      ...formData,
                      additionalCharges: newCharges,
                    });
                  }}
                  placeholder="Charges (€)"
                  className="w-full px-4 py-3 border h-[52px] border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <button
                onClick={() => handleRemoveCharge(index)}
                className="p-3 hidden lg:block text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
            Furnished Status
          </label>
          <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
            {["Furnished", "Unfurnished", "Semi-furnished"].map((status) => (
              <label
                key={status}
                className="flex items-center gap-3 cursor-pointer border border-lightGray rounded-xl p-3 bg-white"
              >
                <input
                  type="radio"
                  name="furnishedStatus"
                  value={status.toLowerCase()}
                  checked={formData.furnishedStatus === status.toLowerCase()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      furnishedStatus: e.target.value,
                    })
                  }
                  className="w-4 h-4 text-[#6B4EFF] focus:ring-[#6B4EFF]"
                />
                <span className="text-secondary text-sm md:text-base font-medium font-nunito">
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RentDetailsStep;
