'use client'

import { useState, useEffect } from "react";
import { FiUpload, FiCheckCircle } from "react-icons/fi";
import BlueUploadIcon from "@/svg/blueUploadIcon";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";
import { toast } from "react-toastify";

function EditProfileTab({ profileData, onSave, loading = false, error = null }) {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profileData?.fullName || "",
    email: profileData?.email || "",
    phoneNumber: profileData?.phoneNumber || "",
    businessName: profileData?.businessName || "",
    address: profileData?.address || "",
    city: profileData?.city || "",
    county: profileData?.county || "",
    country: profileData?.country || "",
    postcode: profileData?.postcode || "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [profileImage, setProfileImage] = useState(
    profileData?.profileImage || null
  );
  const [imagePreview, setImagePreview] = useState(null);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update form data when profileData changes
  useEffect(() => {
    if (profileData) {
      setFormData({
        fullName: profileData.fullName || "",
        email: profileData.email || "",
        phoneNumber: profileData.phoneNumber || "",
        businessName: profileData.businessName || "",
        address: profileData.address || "",
        city: profileData.city || "",
        county: profileData.county || "",
        country: profileData.country || "",
        postcode: profileData.postcode || "",
      });
      
      // Handle profile image - can be URL string or File object
      if (profileData.profileImage) {
        if (typeof profileData.profileImage === 'string') {
          // It's a URL string from the API
          setProfileImage(null); // Don't set as File
          setImagePreview(profileData.profileImage); // Set preview to URL
        } else if (profileData.profileImage instanceof File) {
          // It's a File object (newly selected)
          setProfileImage(profileData.profileImage);
          // imagePreview will be set by the other useEffect
        }
      } else {
        setProfileImage(null);
        setImagePreview(null);
      }
    }
  }, [profileData]);

  // Update image preview when profileImage (File) changes
  // Note: URL strings from API are handled in the profileData useEffect above
  useEffect(() => {
    if (profileImage instanceof File) {
      const preview = URL.createObjectURL(profileImage);
      setImagePreview(preview);
      return () => URL.revokeObjectURL(preview);
    }
    // Only clear preview if profileImage is explicitly null and no profileData image exists
    if (!profileImage && !profileData?.profileImage) {
      setImagePreview(null);
    }
  }, [profileImage, profileData?.profileImage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error as user edits
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName?.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!formData.phoneNumber?.trim()) {
      nextErrors.phoneNumber = "Phone number is required.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleImageUpload = (files) => {
    // Handle both event object and FileList
    const fileList = files instanceof FileList ? files : (files?.target?.files || files);
    
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      
      // Validate file type
      const validTypes = ['image/heic', 'image/webp', 'image/png', 'image/jpeg', 'image/jpg'];
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      const isValidType = validTypes.includes(fileType) || 
                         fileName.endsWith('.heic') || 
                         fileName.endsWith('.webp') || 
                         fileName.endsWith('.png') || 
                         fileName.endsWith('.jpg') || 
                         fileName.endsWith('.jpeg');
      
      if (!isValidType) {
        toast.error('Please select a valid image file (HEIC, WEBP, PNG, or JPG).');
        // Clear input so user can re-select the same file
        if (files?.target) files.target.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('Image size must be less than 5MB.');
        if (files?.target) files.target.value = '';
        return;
      }
      
      setProfileImage(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave({ ...formData, profileImage });
  };

  return (
    <form
      noValidate
      onInvalid={(e) => e.preventDefault()}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Profile Image Upload */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-[74px] h-[74px] mx-auto md:mx-0 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
          {isMounted && imagePreview ? (
            <img
              src={imagePreview}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                // Fallback if image fails to load
                e.target.style.display = 'none';
                e.target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          {(!isMounted || !imagePreview) && (
            <div className="text-6xl text-gray-400 flex items-center justify-center">
              <span>🏔️</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center md:items-start justify-center">
          <div className="text-base font-semibold font-nunito text-secondary mb-2">
            Upload Image <span className="text-errorColor">*</span>
          </div>
          <button
            type="button"
            onClick={() =>
              document.getElementById("profile-image-upload").click()
            }
            className="px-6 py-2 w-[190px] bg-white border border-[#4A2FCC] text-white rounded-[10px] hover:bg-opacity-90 transition-colors font-semibold font-nunito flex items-center justify-center gap-2"
          >
            <span className="text-base font-bold font-nunito text-[#4A2FCC]">
              Upload Image
            </span>
            <BlueUploadIcon />
          </button>
          <input
            id="profile-image-upload"
            type="file"
            accept=".heic,.webp,.png,.jpg,.jpeg,image/heic,image/webp,image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              if (e.target && e.target.files) {
                handleImageUpload(e.target.files);
              }
            }}
          />
          <p className="text-xs font-normal text-center md:text-left font-nunito text-[#BCBCBC] mt-2">
            HEIC, WEBP, PNG, or JPG. Recommended: 512x512 pixels minimum.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm md:text-base font-semibold font-nunito text-secondary mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
            placeholder="Enter your full name"
          />
          {fieldErrors.fullName ? (
            <p className="mt-1 text-sm text-errorColor">{fieldErrors.fullName}</p>
          ) : null}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm md:text-base font-semibold font-nunito text-secondary mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled
              className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary bg-gray-100 cursor-not-allowed opacity-70"
              placeholder="Enter your email"
            />
            {isMounted && profileData?.isEmailVerified && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <GreenCheckedIcon />
              </span>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm md:text-base font-semibold font-nunito text-secondary mb-1">
            Phone Number
          </label>
          <div className="flex items-center relative gap-2">
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="flex-1 px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              placeholder="Enter your phone number"
            />
            {isMounted && !profileData?.isPhoneVerified && (
              <button
                type="button"
                className="px-4 py-3 text-[#2177CE] text-sm font-bold font-nunito hover:underline absolute right-0 top-1/2 transform -translate-y-1/2"
              >
                Verify
              </button>
            )}
          </div>
          {fieldErrors.phoneNumber ? (
            <p className="mt-1 text-sm text-errorColor">{fieldErrors.phoneNumber}</p>
          ) : null}
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-sm md:text-base font-semibold font-nunito text-secondary mb-1">
            Business Name{" "}
            <span className="text-darkGray font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
            placeholder="Enter your business name"
          />
        </div>
      </div>

      {/* Business Address */}
      <div>
        <h2 className="block text-sm md:text-base font-bold font-nunito text-secondary mb-3">
          Business Address (Optional)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm md:text-base font-semibold font-nunito text-secondary mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              placeholder="Enter your address"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-semibold font-nunito text-secondary mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              placeholder="Enter your city"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-semibold font-nunito text-secondary mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              placeholder="Enter your country"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-semibold font-nunito text-secondary mb-1">
              Postcode
            </label>
            <input
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              placeholder="Enter your postcode"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 w-full sm:w-auto py-3 bg-blueGradient text-white rounded-[10px] text-base shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors font-bold font-nunito disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default EditProfileTab;
