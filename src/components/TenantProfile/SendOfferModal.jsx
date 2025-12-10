import { FiX } from "react-icons/fi";
import CustomDropdown from "@/components/common/CustomDropdown";
import { propertyDropdownOptions } from "@/constant";

function SendOfferModal({ isOpen, onClose, formData, setFormData, onSend }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative">
        <div className="p-6 border-b border-lightGray">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-secondary">Send Offer</h2>
              <p className="text-sm text-darkGray mt-1">
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

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-base font-semibold text-secondary mb-1">
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
            <label className="block text-base font-semibold text-secondary mb-1">
              Monthly Rent (€)
            </label>
            <input
              type="number"
              value={formData.monthlyRent}
              onChange={(e) =>
                setFormData({ ...formData, monthlyRent: e.target.value })
              }
              placeholder="Enter your monthly rent"
              className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent h-[52px]"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-secondary mb-1">
              Requirements
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip."
              rows="6"
              className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-lightGray flex justify-end">
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

