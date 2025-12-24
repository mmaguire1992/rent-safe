'use client'

import React, { useState } from "react";
import Header from "@/components/frontend/common/header";
import FileUpload from "@/components/FileUpload";
import SupportSuccessModal from "@/components/adminDashboard/Support/SupportSuccessModal";
import Footer from "@/components/frontend/common/footer";

function RentSupportPage() {
  const [formData, setFormData] = useState({
    email: "",
    notes: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting support request:", {
      ...formData,
      files: uploadedFiles,
    });

    // Reset form
    setFormData({
      email: "",
      notes: "",
    });
    setUploadedFiles([]);

    // Show success modal
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header />
      <main className="container mx-auto py-6 sm:py-10 px-4 md:px-0">
        <div className="block">
          <h1 className="text-2xl font-bold font-nunito text-secondary mb-6">
            Support
          </h1>
          <div className="bg-white rounded-[14px] border border-lightGray p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Add Details Section */}
              <div>
                <h2 className="text-xl hidden md:block font-semibold font-nunito text-secondary mb-4">
                  Add Details
                </h2>
                <div>
                  <label className="block text-base font-semibold text-secondary mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 font-nunito"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {/* Add Notes Section */}
              <div>
                <h2 className="text-base font-semibold font-nunito text-secondary mb-1">
                  Add Notes
                </h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-4 py-3 border border-lightGray rounded-[10px] focus:outline-none focus:ring-0 font-nunito resize-none"
                  placeholder="Enter your notes"
                  required
                />
              </div>

              {/* Upload Documents Section */}
              <div>
                <h2 className="text-base font-semibold font-nunito text-secondary mb-1">
                  Upload Documents
                </h2>
                <FileUpload
                  label=""
                  acceptedTypes=".pdf,.docx,.png"
                  maxFiles={3}
                  onFilesChange={setUploadedFiles}
                  uploadedFiles={uploadedFiles}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 w-full sm:w-auto bg-blueGradient text-white rounded-[10px] text-base hover:opacity-90 transition-opacity font-bold font-nunito"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      {/* Success Modal */}
      <SupportSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
      <Footer />
    </div>
  );
}

export default RentSupportPage;
