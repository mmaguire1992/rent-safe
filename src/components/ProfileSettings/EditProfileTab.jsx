import { useState } from "react";
import { FiUpload, FiCheckCircle } from "react-icons/fi";

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
  const [profileImage, setProfileImage] = useState(profileData.profileImage || null);

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
        <div className="w-full md:w-[200px] h-[200px] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {profileImage ? (
            <img
              src={
                typeof profileImage === "string"
                  ? profileImage
                  : URL.createObjectURL(profileImage)
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl text-gray-400">🏔️</div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <button
            type="button"
            onClick={() => document.getElementById("profile-image-upload").click()}
            className="w-full md:w-auto px-6 py-2 bg-[#6B4EFF] text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold font-nunito flex items-center justify-center gap-2"
          >
            <FiUpload />
            <span>Upload Image</span>
          </button>
          <input
            id="profile-image-upload"
            type="file"
            accept=".heic,.webp,.png,.jpg"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
          <p className="text-sm font-normal font-nunito text-darkGray mt-2">
            HEIC, WEBP, PNG, or JPG. Recommended: 512x512 pixels minimum.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-base font-medium text-secondary mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-base font-medium text-secondary mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito pr-10"
              placeholder="Enter your email"
            />
            {profileData.isEmailVerified && (
              <FiCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl" />
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-base font-medium text-secondary mb-2">
            Phone Number
          </label>
          <div className="flex items-center gap-2">
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="flex-1 px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito"
              placeholder="Enter your phone number"
            />
            {!profileData.isPhoneVerified && (
              <button
                type="button"
                className="px-4 py-3 text-[#6B4EFF] font-semibold font-nunito hover:underline"
              >
                Verify
              </button>
            )}
          </div>
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-base font-medium text-secondary mb-2">
            Business Name <span className="text-darkGray font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito"
            placeholder="Enter your business name"
          />
        </div>
      </div>

      {/* Business Address */}
      <div>
        <label className="block text-base font-medium text-secondary mb-2">
          Business Address <span className="text-darkGray font-normal">(Optional)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito"
            placeholder="Enter your address"
          />
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito"
            placeholder="Enter your city"
          />
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito"
            placeholder="Enter your country"
          />
          <input
            type="text"
            name="postcode"
            value={formData.postcode}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito"
            placeholder="Enter your postcode"
          />
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

export default EditProfileTab;

