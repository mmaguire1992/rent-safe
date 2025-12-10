import { FiX, FiCopy, FiEdit } from "react-icons/fi";

function AIModal({
  showAIModal,
  setShowAIModal,
  formData,
  setFormData,
  aiDescription,
  setAiDescription,
  handleGenerateAI,
  handleSaveAIContent,
}) {
  if (!showAIModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-lightGray flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-secondary">
              AI Content Generator
            </h2>
            <p className="text-sm text-darkGray mt-1">
              Generate your property description with AI
            </p>
          </div>
          <button
            onClick={() => setShowAIModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="text-secondary text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-semibold text-secondary">
                Property Description
              </label>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiCopy className="text-[#6B4EFF]" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiEdit className="text-[#6B4EFF]" />
                </button>
              </div>
            </div>
            <textarea
              value={formData.propertyDescription}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  propertyDescription: e.target.value,
                })
              }
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua..."
              rows="6"
              className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-semibold text-[#6B4EFF]">
                AI Generated Description
              </label>
              <span className="text-xs text-darkGray">
                Save to edit the AI generated content
              </span>
            </div>
            <textarea
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua..."
              rows="6"
              className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-lightGray flex justify-end">
          <button
            onClick={handleGenerateAI}
            className="bg-[#6B4EFF] text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-opacity mr-3"
          >
            Generate
          </button>
          <button
            onClick={handleSaveAIContent}
            className="bg-[#6B4EFF] text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIModal;

