import { useState } from "react";
import BlueUserIcon from "@/svg/blueUserIcon";
import BlueUploadIcon from "@/svg/blueUploadIcon";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";
import SectionHeader from "./SectionHeader";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { FiTrash2 } from "react-icons/fi";

function BasicInformationSection({
  formData,
  handleChange,
  handleImageUpload,
  onRemoveProfilePicture,
}) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-3 sm:p-6">
      <SectionHeader icon={BlueUserIcon} title="Basic Information" />

      <div className="space-y-4">
        <div className="block mb-6">
          {/* Profile Image Upload */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-6">
            <div className="w-[74px] h-[74px] mx-auto bg-gray-100 rounded-full flex items-center justify-center relative">
              {formData.profileImage ? (
                <>
                  <div className="w-full h-full rounded-full overflow-hidden">
                <img
                  src={
                    typeof formData.profileImage === "string"
                      ? formData.profileImage
                      : URL.createObjectURL(formData.profileImage)
                  }
                  alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {onRemoveProfilePicture && (
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(true)}
                      className="absolute -top-2 -right-2 bg-errorColor text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg border-2 border-white z-10"
                      title="Remove profile picture"
                      disabled={removing}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : (
                <div className="text-6xl text-gray-400">🏔️</div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center items-center sm:items-start">
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
                accept=".heic,.webp,.png,.jpg"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
              <p className="text-xs font-normal font-nunito text-center md:text-left text-[#BCBCBC] mt-2">
                HEIC, WEBP, PNG, or JPG. Recommended: 512x512 pixels minimum.
              </p>
            </div>
          </div>

          {/* Basic Info Fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Type your description"
                rows={3}
                className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                  Email Address
                </label>
                <div className="flex items-center relative gap-2">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    readOnly
                    className="flex-1 px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary bg-gray-100 cursor-not-allowed opacity-70"
                    placeholder="Email cannot be changed"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <GreenCheckedIcon />
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                  Phone Number
                </label>
                <div className="flex items-center gap-2 relative">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
                  />
                  <button
                    type="button"
                    className="px-4 py-3 text-[#2177CE] text-sm font-bold font-nunito absolute right-0 top-1/2 transform -translate-y-1/2"
                  >
                    Verify
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter your country"
                  className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  placeholder="Enter your postcode"
                  className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Enter your designation"
                  className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-secondary mb-1">
                  Monthly Income (£)
                </label>
                <input
                  type="text"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  placeholder="Enter your monthly income"
                  className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 text-base font-normal font-nunito text-secondary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Profile Picture Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          setRemoving(true);
          try {
            await onRemoveProfilePicture();
            setDeleteModalOpen(false);
          } catch (error) {
            // Error is already handled in the parent component
          } finally {
            setRemoving(false);
          }
        }}
        title="Remove Profile Picture"
        message="Are you sure you want to remove your profile picture? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        isProcessing={removing}
      />
    </div>
  );
}

export default BasicInformationSection;
