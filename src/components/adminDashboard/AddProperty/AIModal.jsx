'use client'

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import GrayCopyIcon from "@/svg/grayCopyIcon";
import GrayPencilIcon from "@/svg/grayPencilIcon";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

function AIModal({
  showAIModal,
  setShowAIModal,
  formData,
  setFormData,
  aiDescription,
  setAiDescription,
  handleGenerateAI,
  handleSaveAIContent,
  currentStep,
}) {
  const [showAIGenerated, setShowAIGenerated] = useState(false);
  useBodyScrollLock(showAIModal);

  // Reset showAIGenerated when modal opens
  useEffect(() => {
    if (showAIModal) {
      setShowAIGenerated(false);
      setAiDescription("");
    }
  }, [showAIModal]);

  const handleGenerate = () => {
    handleGenerateAI();
    setShowAIGenerated(true);
  };

  if (!showAIModal) return null;

  // Step-wise configuration
  const getStepConfig = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Property Description",
          field: "propertyDescription",
          placeholder:
            "Enter property details like number of bedrooms, bathrooms, property type, and key features...",
          aiPlaceholder:
            "Beautiful, modern apartment in the heart of Manchester city centre. This stunning 2-bedroom property features contemporary design, floor-to-ceiling windows with city views, and high-quality finishes throughout. Perfect for professionals or couples looking for city living at its finest.",
        };
      case 6:
        return {
          title: "Renter Profile Description",
          field: "renterProfileDescription",
          placeholder:
            "Describe what type of renter you are looking for, including preferences, requirements, and expectations...",
          aiPlaceholder:
            "We are looking for responsible, professional tenants who will treat this property as their own. Ideal candidates are working professionals or couples with stable income, good references, and a commitment to maintaining the property in excellent condition.",
        };
      default:
        return {
          title: "Property Description",
          field: "propertyDescription",
          placeholder: "Enter your description...",
          aiPlaceholder:
            "Beautiful, modern property with excellent features and amenities.",
        };
    }
  };

  const stepConfig = getStepConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
        <div className="p-3 md:p-5 flex items-start justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-secondary mb-0">
              AI Content Generator
            </h2>
            <p className="text-base font-normal text-darkGray mt-1">
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

        <div className="px-3 md:px-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-semibold text-secondary">
                {stepConfig.title}
              </label>
              <div className="flex gap-1">
                <button
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={async () => {
                    try {
                      const textToCopy = formData[stepConfig.field] || "";
                      if (textToCopy) {
                        await navigator.clipboard.writeText(textToCopy);
                        toast.success("Copied to clipboard!");
                      } else {
                        toast.info("Nothing to copy");
                      }
                    } catch (error) {
                      console.error('Failed to copy:', error);
                      toast.error("Failed to copy");
                    }
                  }}
                  title="Copy"
                >
                  <GrayCopyIcon />
                </button>
                <button
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => {
                    if (aiDescription) {
                      setFormData({
                        ...formData,
                        [stepConfig.field]: aiDescription,
                      });
                      toast.success("AI content copied to description!");
                    } else {
                      toast.info("No AI content to copy");
                    }
                  }}
                  title="Copy AI content to description"
                >
                  <GrayPencilIcon />
                </button>
              </div>
            </div>
            <textarea
              value={formData[stepConfig.field] || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [stepConfig.field]: e.target.value,
                })
              }
              placeholder={stepConfig.placeholder}
              rows="6"
              className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 resize-none"
            />
          </div>

          {showAIGenerated && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-base font-semibold text-[#6B4EFF]">
                  AI Generated Description
                </label>
                <span className="text-sm font-normal text-midGray">
                  Save to edit the AI generated content
                </span>
              </div>
              <textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder={stepConfig.aiPlaceholder}
                rows="6"
                className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 resize-none"
              />
            </div>
          )}
        </div>

        <div className="p-3 md:p-6  flex justify-end">
          {!showAIGenerated && (
            <button
              onClick={handleGenerate}
              className="bg-blueGradient shadow-[0px_2px_10px_0px_#00000033] text-white px-6 py-3 rounded-[10px] font-bold hover:bg-opacity-90 transition-opacity"
            >
              Generate
            </button>
          )}
          {showAIGenerated && (
            <button
              onClick={() => {
                if (aiDescription) {
                  setFormData({
                    ...formData,
                    [stepConfig.field]: aiDescription,
                  });
                  setShowAIModal(false);
                }
              }}
              className="bg-blueGradient shadow-[0px_2px_10px_0px_#00000033] text-white px-6 py-3 rounded-[10px] font-bold hover:bg-opacity-90 transition-opacity"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIModal;
