import { useState, useEffect, useRef } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import { addPropertyTypeOptions } from "@/constant";
import BlueAIIcon from "@/svg/blueAIIcon";

function BasicInfoStep({ formData, setFormData, setShowAIModal, errors, setErrors }) {
  const [touched, setTouched] = useState({});
  const lastInputValueRef = useRef({});

  // Mark all fields as touched when errors are set from parent (e.g., on Next click)
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const allTouched = {
        propertyTitle: true,
        propertyType: true,
        propertyDescription: true,
        bedrooms: true,
        bathrooms: true,
      };
      setTouched(allTouched);
    }
  }, [errors]);

  // Validate fields
  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "propertyTitle":
        if (!value || !value.trim()) {
          error = "Property Title is required";
        }
        break;
      case "propertyType":
        if (!value || !value.trim()) {
          error = "Property Type is required";
        }
        break;
      case "propertyDescription":
        if (!value || !value.trim()) {
          error = "Property Description is required";
        }
        break;
      case "bedrooms":
        if (!value || value === "") {
          error = "Bedrooms is required";
        } else {
          // Check if value contains only digits (no hyphens, decimals, or other characters)
          const isValidNumber = /^\d+$/.test(value.toString().trim());
          if (!isValidNumber || parseInt(value) < 0) {
            error = "Please enter a valid bedroom number";
          }
        }
        break;
      case "bathrooms":
        if (!value || value === "") {
          error = "Bathrooms is required";
        } else {
          // Check if value contains only digits (no hyphens, decimals, or other characters)
          const isValidNumber = /^\d+$/.test(value.toString().trim());
          if (!isValidNumber || parseInt(value) < 0) {
            error = "Please enter a valid bathroom number";
          }
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleBlur = (fieldName) => {
    // Only mark as touched, don't validate - validation happens only on Next button click
    setTouched({ ...touched, [fieldName]: true });
  };

  const handleChange = (fieldName, value) => {
    // For number fields, only allow digits (0-9)
    if (fieldName === "bedrooms" || fieldName === "bathrooms") {
      // Store original value to check if it contains invalid characters (for validation on Next click)
      const originalValue = value.toString().trim();

      // Store the original input value for validation when Next is clicked
      lastInputValueRef.current[fieldName] = originalValue;

      // Remove all non-digit characters to clean the value
      const cleanedValue = originalValue.replace(/[^0-9]/g, "");

      // Prevent negative values
      let finalValue = cleanedValue;
      if (cleanedValue !== "" && parseInt(cleanedValue) < 0) {
        finalValue = "0";
      }

      // Clear error when user starts typing
      if (errors && errors[fieldName] && setErrors) {
        setErrors({ ...errors, [fieldName]: "" });
      }

      // Don't set errors here - validation happens only when Next button is clicked
      // Just clean the value and update formData
      // Also store original input in a hidden field for validation
      value = finalValue;
      setFormData({
        ...formData,
        [fieldName]: value,
        [`${fieldName}Original`]: originalValue // Store original for validation
      });
      return;
    }

    // Clear error when user starts typing
    if (errors && errors[fieldName] && setErrors) {
      setErrors({ ...errors, [fieldName]: "" });
    }

    setFormData({ ...formData, [fieldName]: value });
  };

  // Prevent scroll from changing number input values
  const handleWheel = (e) => {
    e.target.blur();
  };

  const handleIncrement = (field) => {
    const currentValue = parseInt(formData[field]) || 0;
    const newValue = (currentValue + 1).toString();
    setFormData({
      ...formData,
      [field]: newValue,
      [`${field}Original`]: newValue // Store as original since it's a valid number
    });
    setTouched({ ...touched, [field]: true });
  };

  const handleDecrement = (field) => {
    const currentValue = parseInt(formData[field]) || 0;
    const newValue = Math.max(0, currentValue - 1).toString(); // Ensure value never goes below 0
    setFormData({
      ...formData,
      [field]: newValue,
      [`${field}Original`]: newValue // Store as original since it's a valid number
    });
    setTouched({ ...touched, [field]: true });
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
              Property Title<span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.propertyTitle}
              onChange={(e) => handleChange("propertyTitle", e.target.value)}
              onBlur={() => handleBlur("propertyTitle")}
              placeholder="Enter your property title"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${touched.propertyTitle && errors?.propertyTitle
                  ? "border-red-500"
                  : "border-lightGray"
                }`}
            />
            {touched.propertyTitle && errors?.propertyTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.propertyTitle}</p>
            )}
          </div>

          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Property Type <span className="text-red-600">*</span>
            </label>
            <CustomDropdown
              options={addPropertyTypeOptions}
              value={formData.propertyType}
              onChange={(value) => {
                handleChange("propertyType", value);
                setTouched({ ...touched, propertyType: true });
              }}
              placeholder="Select your property type"
              error={touched.propertyType && !!errors?.propertyType}
            />
            {touched.propertyType && errors?.propertyType && (
              <p className="mt-1 text-sm text-red-600">{errors.propertyType}</p>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary">
              Property Description<span className="text-red-600">*</span>
            </label>
          </div>
          <div className="relative">
            <textarea
              value={formData.propertyDescription}
              onChange={(e) => handleChange("propertyDescription", e.target.value)}
              onBlur={() => handleBlur("propertyDescription")}
              placeholder="Enter your property description"
              rows="6"
              className={`w-full px-4 py-3 border rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 resize-none ${touched.propertyDescription && errors?.propertyDescription
                  ? "border-red-500"
                  : "border-lightGray"
                }`}
            />
            {/* <button
              onClick={() => setShowAIModal(true)}
              className="md:absolute bottom-3 right-2 flex items-center gap-2 px-4 py-2 bg-[#E8E2FF] text-[#6B4EFF] rounded-[10px] font-bold hover:bg-opacity-90 transition-colors text-base"
            >
              <BlueAIIcon />
              AI Content Generator
            </button> */}
          </div>
          {touched.propertyDescription && errors?.propertyDescription && (
            <p className="mt-1 text-sm text-red-600">{errors.propertyDescription}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Bedrooms<span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formData.bedrooms}
                onChange={(e) => handleChange("bedrooms", e.target.value)}
                onBlur={() => handleBlur("bedrooms")}
                onWheel={handleWheel}
                placeholder="Enter number of bedrooms"
                className={`w-full px-4 py-3 pr-12 h-[52px] border rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${touched.bedrooms && errors?.bedrooms
                    ? "border-red-500"
                    : "border-lightGray"
                  }`}
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
            {touched.bedrooms && errors?.bedrooms && (
              <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>
            )}
          </div>

          <div>
            <label className="block text-sm md:text-base font-nunito font-bold text-secondary mb-1">
              Bathrooms<span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formData.bathrooms}
                onChange={(e) => handleChange("bathrooms", e.target.value)}
                onBlur={() => handleBlur("bathrooms")}
                onWheel={handleWheel}
                placeholder="Enter number of bathrooms"
                className={`w-full px-4 py-3 pr-12 h-[52px] border rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${touched.bathrooms && errors?.bathrooms
                    ? "border-red-500"
                    : "border-lightGray"
                  }`}
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
            {touched.bathrooms && errors?.bathrooms && (
              <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BasicInfoStep;
