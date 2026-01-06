import { useState, useEffect, useMemo } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import CustomCalendar from "@/components/adminDashboard/common/CustomCalendar";
import { chargeTypeOptions } from "@/constant";

function RentDetailsStep({
  formData,
  setFormData,
  handleAddCharge,
  handleRemoveCharge,
  errors,
  setErrors,
}) {
  const [touched, setTouched] = useState({});

  // Mark all fields as touched when errors are set from parent
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const allTouched = {
        monthlyRent: true,
        availableFrom: true,
        furnishedStatus: true,
      };
      setTouched(allTouched);
    }
  }, [errors]);

  // Validate fields
  const validateField = (fieldName, value) => {
    let error = "";
    
    switch (fieldName) {
      case "monthlyRent":
        if (!value || value === "" || parseFloat(value) <= 0) {
          error = "Monthly Rent is required";
        }
        break;
      case "availableFrom":
        if (!value || !value.trim()) {
          error = "Available From date is required";
        }
        break;
      case "furnishedStatus":
        if (!value || !value.trim()) {
          error = "Furnished Status is required";
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
    const error = validateField(fieldName, formData[fieldName]);
    if (setErrors) {
      setErrors({ ...errors, [fieldName]: error });
    }
  };

  const handleChange = (field, value) => {
    // For monthly rent, only allow digits and decimal point
    if (field === "monthlyRent") {
      // Remove all non-numeric characters except decimal point
      value = value.replace(/[^0-9.]/g, "");
      // Ensure only one decimal point
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
      }
      // Prevent negative values
      if (value !== "" && parseFloat(value) < 0) {
        value = "0";
      }
    }
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors && errors[field] && setErrors) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Calculate minimum date (today - past dates should be disabled)
  // Use local date to avoid timezone issues
  const minDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);
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
              onChange={(e) => handleChange("monthlyRent", e.target.value)}
              onBlur={() => handleBlur("monthlyRent")}
              placeholder="Enter your monthly rent"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                touched.monthlyRent && errors?.monthlyRent
                  ? "border-red-500"
                  : "border-lightGray"
              }`}
            />
            {touched.monthlyRent && errors?.monthlyRent && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlyRent}</p>
            )}
          </div>

          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Available From
            </label>
            <CustomCalendar
              value={formData.availableFrom}
              onChange={(value) => {
                handleChange("availableFrom", value);
                setTouched({ ...touched, availableFrom: true });
              }}
              minDate={minDate}
              placeholder="dd/mm/yyyy"
            />
            {touched.availableFrom && errors?.availableFrom && (
              <p className="mt-1 text-sm text-red-600">{errors.availableFrom}</p>
            )}
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
                    let value = e.target.value;
                    // Remove all non-numeric characters except decimal point
                    value = value.replace(/[^0-9.]/g, "");
                    // Ensure only one decimal point
                    const parts = value.split(".");
                    if (parts.length > 2) {
                      value = parts[0] + "." + parts.slice(1).join("");
                    }
                    // Prevent negative values
                    if (value !== "" && parseFloat(value) < 0) {
                      value = "0";
                    }
                    const newCharges = [...formData.additionalCharges];
                    newCharges[index].amount = value;
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
            {["Furnished", "Unfurnished", "Semi-furnished"].map((status) => {
              const isSelected =
                formData.furnishedStatus === status.toLowerCase();
              return (
                <label
                  key={status}
                  className={`flex items-center gap-3 cursor-pointer border rounded-xl p-3 bg-white transition-all ${
                    isSelected ? "" : "border-lightGray "
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="furnishedStatus"
                      value={status.toLowerCase()}
                      checked={isSelected}
                      onChange={(e) => {
                        handleChange("furnishedStatus", e.target.value);
                        setTouched({ ...touched, furnishedStatus: true });
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-[#4A2FCC] "
                          : "border-lightGray bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4A2FCC]"></div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-sm md:text-base font-medium text-secondary font-nunito transition-colors `}
                  >
                    {status}
                  </span>
                </label>
              );
            })}
          </div>
          {touched.furnishedStatus && errors?.furnishedStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.furnishedStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RentDetailsStep;
