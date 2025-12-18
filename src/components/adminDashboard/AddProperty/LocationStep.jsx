import { FiMapPin } from "react-icons/fi";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import { addPropertyCityOptions, countyOptions } from "@/constant";

function LocationStep({ formData, setFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base md:text-xl font-bold font-nunito text-secondary mb-0">
          Location Details
        </h2>
        <p className="text-darkGray text-sm md:text-base font-normal font-nunito">
          Where is your property located?
        </p>
      </div>
      <div className="w-full">
        <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
          Address
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          placeholder="Enter your address"
          className="w-full px-4 py-3 border h-[52px] border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              City
            </label>
            <CustomDropdown
              options={addPropertyCityOptions}
              value={formData.city}
              onChange={(value) => setFormData({ ...formData, city: value })}
              placeholder="Enter your city"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              County
            </label>
            <CustomDropdown
              options={countyOptions}
              value={formData.county}
              onChange={(value) => setFormData({ ...formData, county: value })}
              placeholder="Enter your country"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Postcode
            </label>
            <input
              type="text"
              value={formData.postcode}
              onChange={(e) =>
                setFormData({ ...formData, postcode: e.target.value })
              }
              placeholder="Enter your postcode"
              className="w-full px-4 py-3 border h-[52px] border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-2">
            Map preview
          </label>
          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-lightGray">
            <div className="text-center">
              <FiMapPin className="text-[#6B4EFF] text-4xl mx-auto mb-2" />
              <p className="text-darkGray">
                Location will be shown based on postcode
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationStep;
