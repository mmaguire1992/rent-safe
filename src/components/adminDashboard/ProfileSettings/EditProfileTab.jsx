'use client'

import { useState } from "react";
import { FiUpload, FiCheckCircle } from "react-icons/fi";
import BlueUploadIcon from "@/svg/blueUploadIcon";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";

function EditProfileTab({ profileData, onSave }) {
  const [formData, setFormData] = useState({
    fullName: profileData.fullName || "",
    email: profileData.email || "",
    phoneNumber: profileData.phoneNumber || "",
    businessName: profileData.businessName || "",
    address: profileData.address || "",
    city: profileData.city || "",
    country: profileData.country || "",
    postcode: profileData.postcode || "",
  });
  const [profileImage, setProfileImage] = useState(
    profileData.profileImage || null
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, profileImage });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image Upload */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-[74px] h-[74px] mx-auto md:mx-0 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
          {profileImage ? (
            <img
              src={
                typeof profileImage === "string"
                  ? profileImage
                  : URL.createObjectURL(profileImage)
              }
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="text-6xl text-gray-400">🏔️</div>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center md:items-start justify-center">
          <div className="text-base font-semibold font-nunito text-secondary mb-2">
            upload Image <span className="text-errorColor">*</span>
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
            accept=".heic,.webp,.png,.jpg"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files)}
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
              className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              placeholder="Enter your email"
            />
            {profileData.isEmailVerified && (
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
            {!profileData.isPhoneVerified && (
              <button
                type="button"
                className="px-4 py-3 text-[#2177CE] text-sm font-bold font-nunito hover:underline absolute right-0 top-1/2 transform -translate-y-1/2"
              >
                Verify
              </button>
            )}
          </div>
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

export default EditProfileTab;
