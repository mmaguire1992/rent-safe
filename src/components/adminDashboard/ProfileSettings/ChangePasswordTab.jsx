'use client'

import { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";

function ChangePasswordTab({ onSave, onSuccess }) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }
    onSave(formData);
    // Reset form
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    // Show success modal
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
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
              className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              placeholder="Enter your old password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("old")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-secondary"
            >
              {showPasswords.old ? <BsEye /> : <BsEyeSlash />}
            </button>
          </div>
        </div>

        {/* New Password */}
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
              className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              placeholder="Enter your new password"
              required
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
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
            placeholder="Enter your confirm password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("confirm")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-secondary"
          >
            {showPasswords.confirm ? <BsEye /> : <BsEyeSlash />}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 w-full sm:w-auto py-3 bg-blueGradient text-white rounded-[10px] text-base shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors font-bold font-nunito"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

export default ChangePasswordTab;
