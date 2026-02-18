'use client'

import { useState, useEffect } from "react";
import { FiX, FiPlus, FiCircle } from "react-icons/fi";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import CustomCheckbox from "@/components/adminDashboard/common/CustomCheckbox";
import { amenitiesList, utilitiesList } from "@/constant";

// Amenity Icons
import BlueCarIcon from "@/svg/blueCarIcon";
import BlueWIFIIcon from "@/svg/blueWIFIIcon";
import BlueGardenIcon from "@/svg/blueGardenIcon";
import BlueHeatingIcon from "@/svg/blueHeatingIcon";
import GrayBedIcon from "@/svg/grayBedIcon";
import BlueHouseIcon from "@/svg/blueHouseIcon";
import ApartmentIcon from "@/svg/apartmentIcon";
import GrayBuildingIcon from "@/svg/grayBuildingIcon";
import BlueWardrobeIcon from "@/svg/blueWardrobeIcon";
import BlueFireplaceIcon from "@/svg/blueFireplaceIcon";
import BlueWashingMachineIcon from "@/svg/blueWashingMachineIcon";
import BlueDishwasherIcon from "@/svg/blueDishwasherIcon";
import BlueMicrowaveIcon from "@/svg/blueMicrowaveIcon";
import BlueOvenIcon from "@/svg/blueOvenIcon";
import BlueFridgeIcon from "@/svg/blueFridgeIcon";
import BlueFlooringIcon from "@/svg/blueFlooringIcon";
import BlueSmokeAlarmIcon from "@/svg/blueSmokeAlarmIcon";
import BlueCCTVIcon from "@/svg/blueCCTVIcon";
import BlueRecyclingIcon from "@/svg/blueRecyclingIcon";
import BlueSprinklerIcon from "@/svg/blueSprinklerIcon";
import BlueCertificateIcon from "@/svg/blueCertificateIcon";
import BlueEVChargingIcon from "@/svg/blueEVChargingIcon";
import BlueTVIcon from "@/svg/blueTVIcon";
import BlueDryerIcon from "@/svg/blueDryerIcon";

// Utility Icons
import OrangeElectrityIcon from "@/svg/orangeElectrityIcon";
import OrangeGasIcon from "@/svg/orangeGasIcon";
import OrangeWaterIcon from "@/svg/orangeWaterIcon";
import OrangeInternetIcon from "@/svg/orangeInternetIcon";

function AmenitiesUtilitiesStep({
  formData,
  setFormData,
  handleToggleAmenity,
  handleAddOtherAmenity,
  handleRemoveOtherAmenity,
  errors,
  setErrors,
}) {
  const [otherAmenityInput, setOtherAmenityInput] = useState("");
  const [touched, setTouched] = useState({});
  const [openUtilityDropdowns, setOpenUtilityDropdowns] = useState({});

  // Dummy icon component for amenities without specific icon
  const DummyAmenityIcon = () => (
    <FiCircle className="w-5 h-5 text-[#6B4EFF]" strokeWidth="2" />
  );

  // Dummy icon component for utilities without specific icon
  const DummyUtilityIcon = () => (
    <FiCircle className="w-5 h-5 text-yellow-500" strokeWidth="2" />
  );

  // Get amenity icon based on amenity name
  const getAmenityIcon = (amenity) => {
    if (!amenity) return DummyAmenityIcon;
    
    // Normalize amenity string: handle both display names and backend formats
    const amenityLower = amenity.toLowerCase().replace(/_/g, ' ').trim();
    
    // Parking variations: "parking", "residents' parking", "residents parking"
    if (amenityLower.includes("parking")) return BlueCarIcon;
    
    // WiFi variations: "wifi", "wi-fi", "wifi included"
    if (amenityLower.includes("wifi") || amenityLower.includes("wi-fi") || amenityLower.includes("wi fi")) {
      return BlueWIFIIcon;
    }
    
    // Garden variations: "garden"
    if (amenityLower.includes("garden")) return BlueGardenIcon;
    
    // Heating variations: "heating", "central heating", "underfloor heating", "heating controls"
    if (amenityLower.includes("heating")) return BlueHeatingIcon;
    
    // Bed variations: "bed", "beds"
    if (amenityLower.includes("bed")) return GrayBedIcon;
    
    // Wardrobe variations
    if (amenityLower.includes("wardrobe")) return BlueWardrobeIcon;
    
    // Fireplace variations
    if (amenityLower.includes("fireplace")) return BlueFireplaceIcon;
    
    // Washing machine variations
    if (amenityLower.includes("washing machine") || amenityLower.includes("washing")) return BlueWashingMachineIcon;
    
    // Dishwasher variations
    if (amenityLower.includes("dishwasher")) return BlueDishwasherIcon;
    
    // Microwave variations
    if (amenityLower.includes("microwave")) return BlueMicrowaveIcon;
    
    // Oven/Hob variations
    if (amenityLower.includes("oven") || amenityLower.includes("hob")) return BlueOvenIcon;
    
    // Fridge variations
    if (amenityLower.includes("fridge") || amenityLower.includes("freezer")) return BlueFridgeIcon;
    
    // Dryer variations
    if (amenityLower.includes("dryer") || amenityLower.includes("washer-dryer")) return BlueDryerIcon;
    
    // Flooring variations: "wooden flooring", "carpet flooring", "flooring"
    if (amenityLower.includes("flooring") || amenityLower.includes("floor")) return BlueFlooringIcon;
    
    // Smoke alarm variations
    if (amenityLower.includes("smoke alarm") || amenityLower.includes("smoke")) return BlueSmokeAlarmIcon;
    
    // CCTV variations
    if (amenityLower.includes("cctv") || amenityLower.includes("camera")) return BlueCCTVIcon;
    
    // Recycling variations
    if (amenityLower.includes("recycling") || amenityLower.includes("bin")) return BlueRecyclingIcon;
    
    // Sprinkler variations
    if (amenityLower.includes("sprinkler")) return BlueSprinklerIcon;
    
    // Certificate variations: "gas safety certificate", "electrical safety certificate", "certificate"
    if (amenityLower.includes("certificate") || amenityLower.includes("safety")) return BlueCertificateIcon;
    
    // EV charging variations
    if (amenityLower.includes("ev charging") || amenityLower.includes("charging point")) return BlueEVChargingIcon;
    
    // TV point variations
    if (amenityLower.includes("tv point") || amenityLower.includes("tv")) return BlueTVIcon;
    
    // House/Home/Garage variations
    if (amenityLower.includes("garage") || amenityLower.includes("house") || amenityLower.includes("home")) {
      return BlueHouseIcon;
    }
    
    // Building/Apartment/Lift variations
    if (amenityLower.includes("apartment") || amenityLower.includes("building") || amenityLower.includes("lift")) {
      return ApartmentIcon;
    }
    
    // Storage/Pantry variations
    if (amenityLower.includes("storage") || amenityLower.includes("pantry") || amenityLower.includes("bicycle storage")) {
      return GrayBuildingIcon;
    }
    
    // Return dummy icon for amenities without specific icon
    return DummyAmenityIcon;
  };

  // Get utility icon based on utility value
  const getUtilityIcon = (utility) => {
    // Handle both object format {value, label} and string format
    const utilityValue = typeof utility === 'string' 
      ? utility.toLowerCase() 
      : (utility?.value || utility?.label || '').toLowerCase();
    
    if (utilityValue === "electricity") return OrangeElectrityIcon;
    if (utilityValue === "gas") return OrangeGasIcon;
    if (utilityValue === "water") return OrangeWaterIcon;
    if (utilityValue === "internet") return OrangeInternetIcon;
    // Return dummy icon for utilities without specific icon
    return DummyUtilityIcon;
  };

  // Mark all fields as touched when errors are set from parent
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const allTouched = {
        amenities: true,
        utilities: true,
      };
      setTouched(allTouched);
    }
  }, [errors]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.utility-dropdown-container')) {
        setOpenUtilityDropdowns({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Validate utilities when they change and are touched
  useEffect(() => {
    if (touched.utilities && formData.utilities.length > 0 && setErrors) {
      const hasEmptyUtilities = formData.utilities.some(util => !util || !util.trim());
      if (hasEmptyUtilities) {
        setErrors({ ...errors, utilities: "Please select a utility for all added fields" });
      } else if (errors?.utilities) {
        setErrors({ ...errors, utilities: "" });
      }
    }
  }, [formData.utilities, touched.utilities]);

  const handleToggleAmenityWithValidation = (amenity) => {
    handleToggleAmenity(amenity);
    setTouched({ ...touched, amenities: true });
    // Clear error when user selects an amenity
    if (errors && errors.amenities && setErrors) {
      setErrors({ ...errors, amenities: "" });
    }
  };

  const handleUtilityChange = (index, value) => {
    const newUtilities = [...formData.utilities];
    newUtilities[index] = value;
    setFormData({ ...formData, utilities: newUtilities });
    setTouched({ ...touched, utilities: true });
    // Validate utilities after change
    if (setErrors) {
      const hasEmptyUtilities = newUtilities.some(util => !util || !util.trim());
      if (hasEmptyUtilities) {
        setErrors({ ...errors, utilities: "Please select a utility for all added fields" });
      } else {
        setErrors({ ...errors, utilities: "" });
      }
    }
  };

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
          {amenitiesList.map((amenity) => {
            const Icon = getAmenityIcon(amenity);
            const IconComponent = Icon || DummyAmenityIcon;
            return (
              <div
                key={amenity}
                className="py-2 md:p-3 hover:bg-gray-50 rounded-xl md:border md:border-lightGray bg-white"
              >
                <label
                  className="flex items-center cursor-pointer w-full"
                  htmlFor={`amenity-${amenity}`}
                >
                  {/* Custom Checkbox */}
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleToggleAmenityWithValidation(amenity)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${
                        formData.amenities.includes(amenity)
                          ? "bg-[#6B4EFF] border-[#6B4EFF]"
                          : "bg-white border-lightGray"
                      }`}
                    >
                      {formData.amenities.includes(amenity) && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  {/* Icon */}
                  {/* <div className="ml-2 flex items-center justify-center w-6 h-6">
                    <IconComponent />
                  </div> */}
                  {/* Label */}
                  <span className="ml-2 text-sm text-secondary font-medium select-none">
                    {amenity}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
        {touched.amenities && errors?.amenities && (
          <p className="mt-2 text-sm text-red-600">{errors.amenities}</p>
        )}
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
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="truncate break-all">{amenity}</p>
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
          <h3 className="text-base font-semibold text-secondary">Utilities <span className="text-red-600">*</span></h3>
          <button
            onClick={() => {
              const newUtilities = [...formData.utilities, ""];
              setFormData({
                ...formData,
                utilities: newUtilities,
              });
              setTouched({ ...touched, utilities: true });
              // Validate utilities after adding a new field
              if (setErrors) {
                const hasEmptyUtilities = newUtilities.some(util => !util || !util.trim());
                if (hasEmptyUtilities) {
                  setErrors({ ...errors, utilities: "Please select a utility for all added fields" });
                }
              }
            }}
            className="flex items-center gap-1 text-[#6B4EFF] hover:text-opacity-80 transition-colors"
          >
            <FiPlus className="text-xl" />
          </button>
        </div>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
          {formData.utilities.map((utility, index) => {
            const selectedUtility = utilitiesList.find(u => u.value === utility);
            const UtilityIcon = getUtilityIcon(utility);
            const UtilityIconComponent = UtilityIcon || DummyUtilityIcon;
            const isOpen = openUtilityDropdowns[index] || false;
            
            return (
              <div key={index} className="block">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative utility-dropdown-container">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenUtilityDropdowns(prev => ({
                          ...prev,
                          [index]: !prev[index]
                        }));
                      }}
                      className="w-full px-4 py-1.5 h-[52px] border rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 flex gap-2 items-center justify-between bg-white border-lightGray"
                    >
                      <div className="flex items-center gap-2">
                        {selectedUtility ? (
                          <>
                            <div className="flex items-center justify-center w-5 h-5">
                              <UtilityIconComponent />
                            </div>
                            <span className="text-darkGray text-sm md:text-base font-nunito font-medium">
                              {selectedUtility.label}
                            </span>
                          </>
                        ) : (
                          <span className="text-darkGray text-sm md:text-base font-nunito font-medium">
                            Select an option
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-4 h-4 text-[#4A2FCC] transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {/* Custom Dropdown Options */}
                    {isOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-lightGray rounded-xl shadow-lg max-h-60 overflow-auto">
                        {utilitiesList.map((option) => {
                          const OptionIcon = getUtilityIcon(option);
                          const OptionIconComponent = OptionIcon || DummyUtilityIcon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                handleUtilityChange(index, option.value);
                                setOpenUtilityDropdowns(prev => ({
                                  ...prev,
                                  [index]: false
                                }));
                              }}
                              className={`w-full px-4 py-1.5 text-left text-sm md:text-base font-nunito font-normal hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                                utility === option.value
                                  ? "bg-primary bg-opacity-10 text-primary"
                                  : "text-secondary"
                              }`}
                            >
                              <div className="flex items-center justify-center w-5 h-5">
                                <OptionIconComponent />
                              </div>
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {index > 0 && (
                    <button
                      onClick={() => {
                        const newUtilities = formData.utilities.filter(
                          (_, i) => i !== index
                        );
                        setFormData({
                          ...formData,
                          utilities: newUtilities,
                        });
                        // Close dropdown if it was open
                        setOpenUtilityDropdowns(prev => {
                          const newState = { ...prev };
                          delete newState[index];
                          return newState;
                        });
                        // Re-validate utilities after removal
                        if (setErrors) {
                          const hasEmptyUtilities = newUtilities.some(util => !util || !util.trim());
                          if (hasEmptyUtilities) {
                            setErrors({ ...errors, utilities: "Please select a utility for all added fields" });
                          } else {
                            setErrors({ ...errors, utilities: "" });
                          }
                        }
                      }}
                      className="p-1 text-red-600  rounded-lg transition-colors"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {touched.utilities && errors?.utilities && (
          <p className="mt-2 text-sm text-red-600">{errors.utilities}</p>
        )}
      </div>
    </div>
  );
}

export default AmenitiesUtilitiesStep;
