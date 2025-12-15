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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Old Password */}
      <div>
        <label className="block text-base font-medium text-secondary mb-2">
          Old Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.old ? "text" : "password"}
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito pr-12"
            placeholder="Enter your old password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("old")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-secondary"
          >
            {showPasswords.old ? <BsEyeSlash /> : <BsEye />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-base font-medium text-secondary mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito pr-12"
            placeholder="Enter your new password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("new")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-secondary"
          >
            {showPasswords.new ? <BsEyeSlash /> : <BsEye />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-base font-medium text-secondary mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito pr-12"
            placeholder="Enter your confirm password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("confirm")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-secondary"
          >
            {showPasswords.confirm ? <BsEyeSlash /> : <BsEye />}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-[#6B4EFF] text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold font-nunito"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

export default ChangePasswordTab;





