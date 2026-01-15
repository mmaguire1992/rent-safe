'use client'

import { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { toast } from "react-toastify";

function ChangePasswordTab({ onSave, onSuccess, loading = false, error = null }) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const validatePassword = (password) => {
    const errors = [];

    if (!/[A-Z]/.test(password)) {
      errors.push("Must Include 1 Uppercase letter");
    }

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[@$!%*?&#]/.test(password)) {
      errors.push("Use special character (eg. @,!,etc)");
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.oldPassword?.trim()) {
      nextErrors.oldPassword = "Old password is required.";
    }
    if (!formData.newPassword?.trim()) {
      nextErrors.newPassword = "New password is required.";
    }
    if (!formData.confirmPassword?.trim()) {
      nextErrors.confirmPassword = "Confirm password is required.";
    }

    // Password specification (match backend update-password validator):
    // Match Create Password rules:
    // - at least 8 characters
    // - at least one uppercase letter
    // - at least one special character
    if (formData.newPassword?.trim()) {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        nextErrors.newPassword = passwordErrors.join(", ");
      }
    }

    if (
      formData.newPassword?.trim() &&
      formData.confirmPassword?.trim() &&
      formData.newPassword !== formData.confirmPassword
    ) {
      nextErrors.confirmPassword = "New password and confirm password do not match.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onSave(formData);
      // Reset form
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setFieldErrors({});
      // Show success modal
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by parent component and toast
      console.error('Password change error:', error);
      // Clear inline errors - only show toast notification
      setFieldErrors({});
    }
  };

  return (
    <form
      noValidate
      onInvalid={(e) => e.preventDefault()}
      onSubmit={handleSubmit}
      className="space-y-4 w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Old Password */}
        <div>
          <label className="block text-base font-semibold font-nunito text-secondary mb-1">
            Old Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.old ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
                fieldErrors.oldPassword
                  ? "border-errorColor focus:border-errorColor"
                  : "border-lightGray"
              }`}
              placeholder="Enter your old password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("old")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-secondary"
            >
              {showPasswords.old ? <BsEye /> : <BsEyeSlash />}
            </button>
          </div>
          {fieldErrors.oldPassword ? (
            <p className="mt-1 text-sm text-errorColor">{fieldErrors.oldPassword}</p>
          ) : null}
        </div>

        {/* New Password */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-semibold font-nunito text-secondary mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
                fieldErrors.newPassword
                  ? "border-errorColor focus:border-errorColor"
                  : "border-lightGray"
              }`}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-secondary"
            >
              {showPasswords.new ? <BsEye /> : <BsEyeSlash />}
            </button>
          </div>
        </div>
      
      {/* Confirm Password */}
      <div>
        <label className="block text-base font-semibold font-nunito text-secondary mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
              fieldErrors.confirmPassword
                ? "border-errorColor focus:border-errorColor"
                : "border-lightGray"
            }`}
            placeholder="Enter your confirm password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("confirm")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-secondary"
          >
            {showPasswords.confirm ? <BsEye /> : <BsEyeSlash />}
          </button>
        </div>
        {fieldErrors.confirmPassword ? (
          <p className="mt-1 text-sm text-errorColor">{fieldErrors.confirmPassword}</p>
        ) : null}
      </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 w-full sm:w-auto py-3 bg-blueGradient text-white rounded-[10px] text-base shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors font-bold font-nunito disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Changing Password..." : "Save Changes"}
        </button>
      </div>
      </div>
    </form>
  );
}

export default ChangePasswordTab;
