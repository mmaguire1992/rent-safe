import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
import FileUpload from "@/components/FileUpload";
import SupportSuccessModal from "@/components/Support/SupportSuccessModal";

function Support() {
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
    console.log("Submitting support request:", { ...formData, files: uploadedFiles });
    
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
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb />

        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h1 className="text-2xl font-bold font-nunito text-secondary mb-6">
            Support
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Add Details Section */}
            <div>
              <h2 className="text-xl font-semibold font-nunito text-secondary mb-4">
                Add Details
              </h2>
              <div>
                <label className="block text-base font-medium text-secondary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Add Notes Section */}
            <div>
              <h2 className="text-xl font-semibold font-nunito text-secondary mb-4">
                Add Notes
              </h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="6"
                className="w-full px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] font-nunito resize-none"
                placeholder="Enter your notes"
                required
              />
            </div>

            {/* Upload Documents Section */}
            <div>
              <h2 className="text-xl font-semibold font-nunito text-secondary mb-4">
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
                className="px-8 py-3 bg-blueGradient text-white rounded-lg hover:opacity-90 transition-opacity font-semibold font-nunito"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <SupportSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </DashboardLayout>
  );
}

export default Support;





