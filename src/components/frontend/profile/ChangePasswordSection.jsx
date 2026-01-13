'use client'

import { useState, useEffect } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { changePassword } from "@/api/users";
import { getCurrentUser } from "@/api/users";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { FiLock } from "react-icons/fi";
import SectionHeader from "./editprofilesection/SectionHeader";

function ChangePasswordSection() {
  const { logout } = useAuth();
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
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Load user email on mount
  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData?.email) {
          setUserEmail(userData.email);
        }
      } catch (error) {
        console.error('Error loading user email:', error);
      }
    };
    loadUserEmail();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Validate on change (but don't show error until blur or submit)
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "oldPassword":
        if (!value) {
          error = "Current password is required";
        }
        break;
      case "newPassword":
        if (!value) {
          error = "New password is required";
        } else {
          const validation = validatePassword(value);
          if (!validation.isValid) {
            const errors = Object.values(validation.errors).filter(Boolean);
            error = errors[0] || "Password does not meet requirements";
          }
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your new password";
        } else if (formData.newPassword && value !== formData.newPassword) {
          error = "Passwords do not match";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
      errors: {
        minLength: !minLength ? "Password must be at least 8 characters" : null,
        hasUpperCase: !hasUpperCase ? "Password must contain at least one uppercase letter" : null,
        hasLowerCase: !hasLowerCase ? "Password must contain at least one lowercase letter" : null,
        hasNumber: !hasNumber ? "Password must contain at least one number" : null,
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show validation messages
    setTouched({
      oldPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Validate all fields and collect errors
    const newErrors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Validate old password
    if (!formData.oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }

    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        const errors = Object.values(passwordValidation.errors).filter(Boolean);
        newErrors.newPassword = errors[0] || "Password does not meet requirements";
      }
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword && formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Set all errors at once
    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== "");

    if (hasErrors) {
      // Show toast for first error found
      if (newErrors.oldPassword) {
        toast.error(newErrors.oldPassword);
      } else if (newErrors.newPassword) {
        toast.error(newErrors.newPassword);
      } else if (newErrors.confirmPassword) {
        toast.error(newErrors.confirmPassword);
      }
      return;
    }

    if (!userEmail) {
      toast.error("User email not found. Please refresh the page.");
      return;
    }

    try {
      setLoading(true);

      await changePassword({
        email: userEmail,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      toast.success("Password changed successfully! Please login again with your new password.");
      
    // Reset form
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
      setErrors({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTouched({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
      });

      // Logout user after successful password change (security best practice)
      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 2000);

    } catch (error) {
      console.error('Error changing password:', error);
      
      // Extract validation errors from different possible locations
      let validationErrors = null;
      if (error?.validationErrors && Array.isArray(error.validationErrors)) {
        validationErrors = error.validationErrors;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        validationErrors = error.response.data.errors;
      }
      
      // Display only the first validation error (one toast at a time)
      if (validationErrors && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        // Show just the error message
        toast.error(firstError.message || 'Validation failed');
        
        // Set field-specific error in form for the first error only
        if (firstError.field === 'oldPassword' || firstError.field === 'email') {
          setErrors({ oldPassword: firstError.message, newPassword: "", confirmPassword: "" });
        } else if (firstError.field === 'newPassword' || firstError.field === 'password') {
          setErrors({ oldPassword: "", newPassword: firstError.message, confirmPassword: "" });
        } else {
          setErrors({ oldPassword: "", newPassword: "", confirmPassword: "" });
        }
      } else {
        // Display generic error message
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to change password. Please try again.';
      toast.error(errorMessage);
        setErrors({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-3 md:p-6">
      <SectionHeader 
        icon={() => <FiLock className="w-5 h-5 text-primary" />} 
        title="Change Password" 
      />

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Old Password */}
          <div>
            <label className="block text-sm md:text-base font-medium text-secondary mb-1">
              Current Password <span className="text-errorColor">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
                  touched.oldPassword && errors.oldPassword
                    ? "border-errorColor"
                    : "border-lightGray"
                }`}
                placeholder="Enter your current password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("old")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-secondary"
                disabled={loading}
              >
                {showPasswords.old ? <BsEye className="w-5 h-5" /> : <BsEyeSlash className="w-5 h-5" />}
              </button>
            </div>
            {touched.oldPassword && errors.oldPassword && (
              <p className="text-xs text-errorColor mt-1">{errors.oldPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm md:text-base font-medium text-secondary mb-1">
              New Password <span className="text-errorColor">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
                  touched.newPassword && errors.newPassword
                    ? "border-errorColor"
                    : "border-lightGray"
                }`}
                placeholder="Enter your new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-secondary"
                disabled={loading}
              >
                {showPasswords.new ? <BsEye className="w-5 h-5" /> : <BsEyeSlash className="w-5 h-5" />}
              </button>
            </div>
            {touched.newPassword && errors.newPassword && (
              <p className="text-xs text-errorColor mt-1">{errors.newPassword}</p>
            )}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm md:text-base font-medium text-secondary mb-1">
            Confirm New Password <span className="text-errorColor">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary ${
                touched.confirmPassword && errors.confirmPassword
                  ? "border-errorColor"
                  : "border-lightGray"
              }`}
              placeholder="Confirm your new password"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGray hover:text-secondary"
              disabled={loading}
            >
              {showPasswords.confirm ? <BsEye className="w-5 h-5" /> : <BsEyeSlash className="w-5 h-5" />}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="text-xs text-errorColor mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 w-full sm:w-auto bg-blueGradient text-white rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors shadow-[0px_2px_10px_0px_#00000033] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChangePasswordSection;
