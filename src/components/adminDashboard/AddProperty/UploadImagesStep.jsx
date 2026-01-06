'use client'

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiX, FiUpload } from "react-icons/fi";

function UploadImagesStep({ formData, setFormData, errors, setErrors }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [touched, setTouched] = useState(false);

  // Mark field as touched when errors are set from parent
  useEffect(() => {
    if (errors && errors.media) {
      setTouched(true);
    }
  }, [errors]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const allFiles = Array.from(files);
    const imageFiles = allFiles.filter((file) => {
      const fileType = file.type.toLowerCase();
      // Only accept image files
      return fileType.startsWith("image/");
    });

    // Check for invalid files
    const invalidFiles = allFiles.filter((file) => {
      const fileType = file.type.toLowerCase();
      return !fileType.startsWith("image/");
    });

    // Show error message for invalid files
    if (invalidFiles.length > 0) {
      const count = invalidFiles.length;
      const fileText = count === 1 ? 'file' : 'files';
      toast.error(`Invalid file format. ${count} ${fileText} rejected. Only image files (JPG, PNG, GIF, WEBP) are allowed.`);
    }

    if (imageFiles.length > 0) {
      const newImages = imageFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        uploading: true,
        progress: 0,
      }));

      setFormData({
        ...formData,
        images: [...formData.images, ...newImages],
      });

      // Clear error when user adds files
      setTouched(true);
      if (errors && errors.media && setErrors) {
        setErrors({ ...errors, media: "" });
      }

      // Simulate upload progress
      newImages.forEach((_, index) => {
        const actualIndex = formData.images.length + index;
        setUploadingIndex(actualIndex);
        simulateUpload(actualIndex);
      });
    }
  };

  const simulateUpload = (index) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setFormData((prev) => {
        const updatedImages = [...prev.images];
        if (updatedImages[index]) {
          updatedImages[index] = {
            ...updatedImages[index],
            progress,
            uploading: progress < 100,
          };
        }
        return { ...prev, images: updatedImages };
      });

      if (progress >= 100) {
        clearInterval(interval);
        setUploadingIndex(null);
      }
    }, 200);
  };

  const handleRemove = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const setAsMain = (index) => {
    const newImages = [...formData.images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base md:text-xl font-bold font-nunito text-secondary mb-0">
          Property Images
        </h2>
        <p className="text-darkGray text-sm md:text-base font-normal font-nunito">
          Upload high-quality photos of your property
        </p>
      </div>
      <div className=" border-2 border-dashed border-lightGray rounded-xl p-4 bg-white">
        {/* Drag and Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={` rounded-lg p-8 sm:p-12 mb-4 h-[200px] lg:h-[250px] flex items-center justify-center text-center transition-colors ${
            dragActive
              ? "border-[#6B4EFF] bg-purple-50"
              : "border-[#E8E2FF] bg-[#F9F9FC]"
          }`}
        >
          <input
            type="file"
            id="image-input"
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
              }
            }}
          />
          <label
            htmlFor="image-input"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="mb-2 flex items-center bg-white rounded-lg p-2 justify-center">
              <FiUpload className="w-4 h-4 text-[#5A5E67]" />
            </div>
            <p className="text-base font-medium text-darkGray mb-2">
              Drop your images here or browse
            </p>
            <p className="text-sm text-midGray font-medium">
              JPG, PNG, GIF, and other image formats
            </p>
          </label>
        </div>

        {/* Image Thumbnails */}
        {formData.images.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {formData.images.map((image, index) => {
              const imageUrl =
                image.url ||
                (image.file instanceof File
                  ? URL.createObjectURL(image.file)
                  : image.file?.url || image);

              return (
                <div
                  key={index}
                  className="relative  rounded-xl overflow-hidden bg-white aspect-square"
                >
                  {/* Main Label */}
                  {index === 0 && (
                    <span className="absolute top-[-1px] left-[-4px]   z-10 font-medium">
                      <img src="/images/dashboard/mainIcon.png" alt="Main" />
                    </span>
                  )}

                  {/* Image or Placeholder */}
                  {image.uploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-[#6B4EFF] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  ) : imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`Property image ${index + 1}`}
                      className="md:w-[100px] md:h-[100px] w-[60px] h-[60px] rounded-[20px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <span className="text-darkGray text-sm">No Preview</span>
                    </div>
                  )}

                  {/* Remove Button */}
                  {!image.uploading && (
                    <button
                      onClick={() => handleRemove(index)}
                      className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1 md:p-1.5 hover:bg-red-50 z-10 shadow-sm"
                    >
                      <FiX className="text-sm" />
                    </button>
                  )}

                  {/* Set as Main Button (if not first) */}
                  {index !== 0 && !image.uploading && (
                    <button
                      onClick={() => setAsMain(index)}
                      className="absolute md:block hidden bottom-2 left-2 right-2 bg-[#6B4EFF] text-white text-xs px-1 sm:px-2 py-1 rounded-lg z-10 font-medium hover:bg-opacity-90"
                    >
                      Set as Main
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {touched && errors?.media && (
          <p className="mt-2 text-sm text-red-600">{errors.media}</p>
        )}
      </div>
    </div>
  );
}

export default UploadImagesStep;
