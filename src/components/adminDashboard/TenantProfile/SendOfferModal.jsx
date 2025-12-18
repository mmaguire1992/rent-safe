import { FiX } from "react-icons/fi";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import { propertyDropdownOptions } from "@/constant";

function SendOfferModal({ isOpen, onClose, formData, setFormData, onSend }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] w-full max-w-2xl relative p-5">
        <div className="p-0 ">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-lg md:text-xl font-bold font-nunito text-secondary">
                Send Offer
              </h2>
              <p className="text-base font-normal font-nunito text-darkGray mt-0">
                2-Bed Apartment Manchester
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="text-secondary text-xl" />
            </button>
          </div>
        </div>

        <div className="p-0 mt-5 space-y-4">
          <div>
            <label className="block text-sm md:text-base font-semibold text-secondary mb-1">
              Property
            </label>
            <CustomDropdown
              options={propertyDropdownOptions}
              value={formData.property}
              onChange={(value) =>
                setFormData({ ...formData, property: value })
              }
              placeholder="Select property"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-semibold text-secondary mb-1">
              Monthly Rent (€)
            </label>
            <input
              type="number"
              value={formData.monthlyRent}
              onChange={(e) =>
                setFormData({ ...formData, monthlyRent: e.target.value })
              }
              placeholder="Enter your monthly rent"
              className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0  h-[52px]  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-semibold text-secondary mb-1">
              Requirements
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip."
              rows="6"
              className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 resize-none"
            />
          </div>
        </div>

        <div className="p-1 flex justify-end">
          <button
            onClick={onSend}
            className="bg-blueGradient text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            Send Offer
          </button>
        </div>
      </div>
    </div>
  );
}

export default SendOfferModal;
