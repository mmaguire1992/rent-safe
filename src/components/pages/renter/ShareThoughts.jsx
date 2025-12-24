'use client'

import { useState } from "react";
import { useNavigate, useLocation } from '@/lib/react-router-compat';
import AuthLayout from "@/components/AuthLayout";
import ProgressIndicator from "@/components/adminDashboard/common/ProgressIndicator";
import FileUpload from "@/components/FileUpload";


function ShareThoughts() {
  const [renterHistory, setRenterHistory] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [recommendationFiles, setRecommendationFiles] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.formData || {};

  const handleSubmit = (e) => {
    e.preventDefault();

    // Combine all form data
    const completeFormData = {
      ...formData,
      renterHistory,
      recommendations,
      recommendationFiles,
    };

    // Simulate account creation
    // In real app, this would create account via API
    setTimeout(() => {
      navigate("/signup/renter/success", {
        state: { formData: completeFormData },
      });
    }, 1000);
  };

  return (
    <AuthLayout>
      <div className="block max-w-[420px] mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <img src="/images/dashboard/mainLogo.png" alt="Logo" className="justify-center" />
        </div>

        {/* Title */}
        <div className="text-left mb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] lg:leading-[45px] font-bold text-secondary mb-2">
            Share Your Thoughts
          </h1>
          <p className="text-darkGray text-base md:text-lg font-normal">
            Help us improve your renting experience.
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={3} totalSteps={3} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Add Previous Renter History */}
          <div>
            <label
              htmlFor="renterHistory"
              className="block text-base font-medium text-secondary mb-1"
            >
              Add Previous Renter History
            </label>
            <textarea
              id="renterHistory"
              name="renterHistory"
              value={renterHistory}
              onChange={(e) => setRenterHistory(e.target.value)}
              placeholder="Type your previous renter history"
              rows="6"
              className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 resize-none"
            />
          </div>

          {/* Recommendations (optional) */}
          <div>
            <FileUpload
              label="Recommendations (optional)"
              acceptedTypes=".pdf,.docx,.png"
              maxFiles={3}
              onFilesChange={setRecommendationFiles}
              uploadedFiles={recommendationFiles}
            />
          </div>
          <div>
            {/* Finish Button */}
            <button
              type="submit"
              className="w-full bg-blueGradient text-white font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033]"
            >
              Sign Up
            </button>

            <button className="text-sm font-bold text-primary mx-auto block mt-4">
              Skip
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default ShareThoughts;
