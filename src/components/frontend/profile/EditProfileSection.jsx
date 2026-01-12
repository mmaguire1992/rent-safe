'use client'

import { useState, useEffect } from "react";
import { getCurrentUser, updateUserProfile, uploadProfilePicture, deleteProfilePicture } from "@/api/users";
import { getMyDocuments } from "@/api/verification";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import BasicInformationSection from "./editprofilesection/BasicInformationSection";
import CreditCheckSection from "./editprofilesection/CreditCheckSection";
import IdentityInformationSection from "./editprofilesection/IdentityInformationSection";
import CurrentAddressSection from "./editprofilesection/CurrentAddressSection";
import EmploymentDetailsSection from "./editprofilesection/EmploymentDetailsSection";
import ProofOfIncomeSection from "./editprofilesection/ProofOfIncomeSection";
import DocumentsSection from "./editprofilesection/DocumentsSection";
import ReferencesSection from "./editprofilesection/ReferencesSection";
import GuarantorInformationSection from "./editprofilesection/GuarantorInformationSection";

function EditProfileSection() {
  const { userType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [identityDocuments, setIdentityDocuments] = useState([]);
  const [proofOfAddressDocuments, setProofOfAddressDocuments] = useState([]);
  const [paySlipDocuments, setPaySlipDocuments] = useState([]);
  const [otherDocuments, setOtherDocuments] = useState([]);
  
  // Function to reload user profile and documents
  const reloadUserDataAndDocuments = async () => {
    try {
      // Fetch both user profile and documents in parallel
      const [userData, documentsData] = await Promise.all([
        getCurrentUser().catch(() => null),
        getMyDocuments().catch(() => null)
      ]);
      
      // Reload user profile data if available
      if (userData) {
        const userInfo = userData.userInfo || {};
        const name = userInfo.name || {};
        const address = userInfo.address || {};
        const employment = userInfo.employment || {};
        const proofOfIncome = userInfo.proofOfIncome || {};
        
        // Get profile image
        let profileImageUrl = null;
        if (userInfo && typeof userInfo === 'object') {
          profileImageUrl = userInfo.profileImage || null;
        }
        
        // Update form data with latest user info
        setFormData((prev) => ({
          ...prev,
          profileImage: profileImageUrl,
          description: userInfo.bio || prev.description,
          fullName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || prev.fullName,
          email: userData.email || prev.email,
          phoneNumber: userData.phone || prev.phoneNumber,
          address: address.street || prev.address,
          city: address.city || prev.city,
          county: address.county || prev.county,
          country: address.country || prev.country,
          postcode: address.postcode || prev.postcode,
          monthlyIncome: employment.monthlyIncome || prev.monthlyIncome,
          creditScore: userInfo.creditScore || prev.creditScore,
          creditRating: userInfo.creditRating || prev.creditRating,
          creditDescription: userInfo.creditDescription || prev.creditDescription,
          identityFullName: `${name.first || ""} ${name.last || ""}`.trim() || prev.identityFullName,
          dateOfBirth: userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toISOString().split('T')[0] : prev.dateOfBirth,
          nationalInsurance: userInfo.nationalInsurance || prev.nationalInsurance,
          gender: userInfo.gender || prev.gender,
          currentAddress: address.street || prev.currentAddress,
          currentCity: address.city || prev.currentCity,
          currentCountry: address.country || prev.currentCountry,
          currentPostcode: address.postcode || prev.currentPostcode,
          residencyLength: address.livingPeriod || prev.residencyLength,
          jobTitle: employment.jobTitle || prev.jobTitle,
          company: employment.company || prev.company,
          startDate: employment.startDate ? new Date(employment.startDate).toISOString().split('T')[0] : prev.startDate,
          employmentType: employment.employmentType || prev.employmentType,
          annualSalary: employment.annualSalary || prev.annualSalary,
          workLocation: employment.workLocation || prev.workLocation,
          incomeType: proofOfIncome.type || prev.incomeType,
          incomeDate: proofOfIncome.date ? new Date(proofOfIncome.date).toISOString().split('T')[0] : prev.incomeDate,
          grossMonthly: proofOfIncome.grossMonthly || prev.grossMonthly,
          netMonthly: proofOfIncome.netMonthly || prev.netMonthly,
        }));
      }
      
      // Reload all documents by type if available
      if (documentsData) {
        console.log('Reloading documents - data received:', documentsData);
        
        // API returns: { documents: [{ docType: "identity_proof", docs: [...], count: N }, ...] }
        if (documentsData.documents && Array.isArray(documentsData.documents)) {
          // Helper function to extract documents by type
          const getDocumentsByType = (docType) => {
            const docGroup = documentsData.documents.find(
              (group) => group.docType === docType
            );
            return docGroup && docGroup.docs ? docGroup.docs : [];
          };
          
          // Load identity documents (identity_proof, passport, driving_license, national_id)
          let identityDocs = [];
          const identityDocTypes = ['identity_proof', 'passport', 'driving_license', 'national_id'];
          identityDocTypes.forEach(docType => {
            const docs = getDocumentsByType(docType);
            identityDocs = [...identityDocs, ...docs];
          });
          setIdentityDocuments(identityDocs);
          
          // Load proof of address documents
          const proofOfAddressDocs = getDocumentsByType('proof_of_address');
          setProofOfAddressDocuments(proofOfAddressDocs);
          
          // Load pay slip documents
          const paySlipDocs = getDocumentsByType('pay_slip');
          setPaySlipDocuments(paySlipDocs);
          
          // Load other documents (for guarantor section)
          const otherDocs = getDocumentsByType('other');
          setOtherDocuments(otherDocs);
          
          console.log('Reloaded documents:', {
            identity: identityDocs.length,
            proofOfAddress: proofOfAddressDocs.length,
            paySlip: paySlipDocs.length,
            other: otherDocs.length,
          });
        }
      }
    } catch (error) {
      console.error('Error reloading user data and documents:', error);
    }
  };
  
  // Keep the old function name for backward compatibility
  const reloadDocuments = reloadUserDataAndDocuments;
  // Options for dropdowns - values must match backend enum
  const employmentTypeOptions = [
    { value: "full_time", label: "Full-time" },
    { value: "part_time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "self_employed", label: "Self-employed" },
    { value: "unemployed", label: "Unemployed" },
    { value: "student", label: "Student" },
  ];

  const incomeTypeOptions = [
    { value: "pay_slip", label: "Payslip" },
    { value: "bank_statement", label: "Bank Statement" },
    { value: "tax_return", label: "Tax Return" },
    { value: "employment_letter", label: "Employment Letter" },
    { value: "other", label: "Other" },
  ];

  const documentTypeOptions = [
    { value: "passport", label: "Passport" },
    { value: "driving-license", label: "Driving License" },
    { value: "id-card", label: "ID Card" },
  ];

  const referenceTypeOptions = [
    { value: "professional", label: "Professional" },
    { value: "personal", label: "Personal" },
    { value: "landlord", label: "Landlord" },
  ];

  const [formData, setFormData] = useState({
    // Basic Information
    profileImage: null,
    description: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    county: "",
    country: "",
    postcode: "",
    designation: "",
    monthlyIncome: "",

    // Credit Check
    creditScore: "",
    creditRating: "",
    creditDescription: "",

    // Identity Information
    identityFullName: "",
    dateOfBirth: "",
    nationalInsurance: "",
    gender: "",
    identityEmail: "",
    identityPhone: "",

    // Current Address
    currentAddress: "",
    currentCity: "",
    currentCountry: "",
    currentPostcode: "",
    residencyLength: "",

    // Employment Details
    jobTitle: "",
    company: "",
    startDate: "",
    employmentType: "",
    annualSalary: "",
    monthlyIncome: "",
    workLocation: "",

    // Proof of Income
    incomeType: "",
    incomeDate: "",
    grossMonthly: "",
    netMonthly: "",

    // Documents
    documentType: "",
    documentNumber: "",
    documentExpire: "",

    // Guarantor
    guarantorName: "",
    guarantorRelationship: "",
    guarantorOccupation: "",
    guarantorAnnualIncome: "",
    guarantorEmail: "",
    guarantorPhone: "",
    guarantorAddress: "",
    guarantorCity: "",
    guarantorCountry: "",
    guarantorPostcode: "",
  });

  const [references, setReferences] = useState([
    {
      fullName: "",
      type: "",
      designation: "",
      email: "",
      phone: "",
      relationship: "",
    },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Keep designation and jobTitle in sync
      if (name === 'designation') {
        updated.jobTitle = value;
      } else if (name === 'jobTitle') {
        updated.designation = value;
      }
      return updated;
    });
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReferenceChange = (index, field, value) => {
    const newReferences = [...references];
    newReferences[index][field] = value;
    setReferences(newReferences);
  };

  const addReference = () => {
    setReferences([
      ...references,
      {
        fullName: "",
        type: "",
        designation: "",
        email: "",
        phone: "",
        relationship: "",
      },
    ]);
  };

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const [userData, documentsData] = await Promise.all([
          getCurrentUser(),
          getMyDocuments().catch(() => null) // Don't fail if documents API fails
        ]);
        
        // Populate form with existing user data
        if (userData) {
          // Debug: Log full response to see structure
          console.log('Full userData response:', userData);
          console.log('userInfo:', userData.userInfo);
          
          const userInfo = userData.userInfo || {};
          const name = userInfo.name || {};
          const address = userInfo.address || {};
          const employment = userInfo.employment || {};
          const proofOfIncome = userInfo.proofOfIncome || {};
          
          // Debug logging
          console.log('Loading user data:', {
            hasUserInfo: !!userData.userInfo,
            userInfoType: typeof userData.userInfo,
            userInfoIsNull: userData.userInfo === null,
            profileImage: userInfo.profileImage,
            profileImageType: typeof userInfo.profileImage,
            userInfoKeys: userInfo && typeof userInfo === 'object' ? Object.keys(userInfo) : 'N/A',
            fullUserInfo: userInfo,
          });
          
          // Get profile image - check multiple possible locations
          let profileImageUrl = null;
          if (userInfo && typeof userInfo === 'object') {
            profileImageUrl = userInfo.profileImage || null;
          }
          
          console.log('Setting profileImage to:', profileImageUrl);
          
          setFormData({
            profileImage: profileImageUrl, // URL string from server, or File object when uploading new image
            description: userInfo.bio || "",
            fullName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
            email: userData.email || "",
            phoneNumber: userData.phone || "",
            address: address.street || "",
            city: address.city || "",
            county: address.county || "",
            country: address.country || "",
            postcode: address.postcode || "",
            designation: employment.jobTitle || "",
            monthlyIncome: employment.monthlyIncome || "",
            
            // Credit Check
            creditScore: userInfo.creditScore || "",
            creditRating: userInfo.creditRating || "",
            creditDescription: userInfo.creditDescription || "",
            
            // Identity Information
            identityFullName: `${name.first || ""} ${name.last || ""}`.trim(),
            dateOfBirth: userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toISOString().split('T')[0] : "",
            nationalInsurance: userInfo.nationalInsurance || "",
            gender: userInfo.gender || "",
            identityEmail: userData.email || "",
            identityPhone: userData.phone || "",
            
            // Current Address (same as address for now)
            currentAddress: address.street || "",
            currentCity: address.city || "",
            currentCountry: address.country || "",
            currentPostcode: address.postcode || "",
            residencyLength: address.livingPeriod || "",
            
            // Employment Details
            jobTitle: employment.jobTitle || "",
            company: employment.company || "",
            startDate: employment.startDate ? new Date(employment.startDate).toISOString().split('T')[0] : "",
            employmentType: employment.employmentType || "",
            annualSalary: employment.annualSalary || "",
            monthlyIncome: employment.monthlyIncome || "",
            workLocation: employment.workLocation || "",
            
            // Proof of Income
            incomeType: proofOfIncome.type || "",
            incomeDate: proofOfIncome.date ? new Date(proofOfIncome.date).toISOString().split('T')[0] : "",
            grossMonthly: proofOfIncome.grossMonthly || "",
            netMonthly: proofOfIncome.netMonthly || "",
            
            // Documents
            documentType: "",
            documentNumber: "",
            documentExpire: "",
            
            // Guarantor (not in userInfo model, may need separate table)
            guarantorName: "",
            guarantorRelationship: "",
            guarantorOccupation: "",
            guarantorAnnualIncome: "",
            guarantorEmail: "",
            guarantorPhone: "",
            guarantorAddress: "",
            guarantorCity: "",
            guarantorCountry: "",
            guarantorPostcode: "",
          });
        }

        // Load all documents by type
        if (documentsData) {
          console.log('Documents data received:', documentsData);
          
          // API returns: { documents: [{ docType: "identity_proof", docs: [...], count: N }, ...] }
          if (documentsData.documents && Array.isArray(documentsData.documents)) {
            // Helper function to extract documents by type
            const getDocumentsByType = (docType) => {
              const docGroup = documentsData.documents.find(
                (group) => group.docType === docType
              );
              return docGroup && docGroup.docs ? docGroup.docs : [];
            };
            
            // Load identity documents (identity_proof, passport, driving_license, national_id)
            let identityDocs = [];
            const identityDocTypes = ['identity_proof', 'passport', 'driving_license', 'national_id'];
            identityDocTypes.forEach(docType => {
              const docs = getDocumentsByType(docType);
              identityDocs = [...identityDocs, ...docs];
            });
            setIdentityDocuments(identityDocs);
            
            // Load proof of address documents
            const proofOfAddressDocs = getDocumentsByType('proof_of_address');
            setProofOfAddressDocuments(proofOfAddressDocs);
            
            // Load pay slip documents
            const paySlipDocs = getDocumentsByType('pay_slip');
            setPaySlipDocuments(paySlipDocs);
            
            // Load other documents (for guarantor section)
            const otherDocs = getDocumentsByType('other');
            setOtherDocuments(otherDocs);
            
            console.log('Documents extracted:', {
              identity: identityDocs.length,
              proofOfAddress: proofOfAddressDocs.length,
              paySlip: paySlipDocs.length,
              other: otherDocs.length,
            });
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const handleRemoveProfilePicture = async () => {
    try {
      // Check if the image is from backend (URL string) or frontend preview (File or blob URL)
      const isBackendImage = formData.profileImage && 
                            typeof formData.profileImage === 'string' && 
                            !formData.profileImage.startsWith('blob:') &&
                            (formData.profileImage.startsWith('http://') || formData.profileImage.startsWith('https://'));
      
      const isFileObject = formData.profileImage instanceof File;
      const isBlobPreview = typeof formData.profileImage === 'string' && formData.profileImage.startsWith('blob:');
      
      // Only call API if it's a backend image (uploaded to S3)
      if (isBackendImage) {
        // Image is from backend - call API to delete from S3
        await deleteProfilePicture();
        toast.success('Profile picture removed successfully');
        
        // Refresh user data to get updated profile
        const updatedUserData = await getCurrentUser();
        const newProfileImage = updatedUserData?.userInfo?.profileImage || null;
        if (updatedUserData?.userInfo) {
          setFormData((prev) => ({ 
            ...prev, 
            profileImage: newProfileImage 
          }));
        }
        
        // Dispatch custom event to notify header/sidebar to refresh profile image
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('profileImageUpdated'));
        }, 100);
      } else if (isFileObject || isBlobPreview) {
        // Image is just a frontend preview - just remove from state
        setFormData((prev) => ({ ...prev, profileImage: null }));
        toast.success('Profile picture preview removed');
      } else {
        // No image to remove
        setFormData((prev) => ({ ...prev, profileImage: null }));
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove profile picture';
      toast.error(errorMessage);
      throw error; // Re-throw so the modal can handle it
    }
  };

  const handleImageUpload = (eOrFiles) => {
    try {
      let file = null;

      // Handle both cases: event object or FileList directly
      if (eOrFiles) {
        // Case 1: Event object with target.files
        if (eOrFiles.target && eOrFiles.target.files && eOrFiles.target.files[0]) {
          file = eOrFiles.target.files[0];
        } 
        // Case 2: FileList passed directly (from BasicInformationSection)
        else if (eOrFiles instanceof FileList && eOrFiles[0]) {
          file = eOrFiles[0];
    }
        // Case 3: Array-like object (FileList-like)
        else if (eOrFiles.length !== undefined && eOrFiles[0] instanceof File) {
          file = eOrFiles[0];
        }
        // Case 4: Direct File object
        else if (eOrFiles instanceof File) {
          file = eOrFiles;
        }
      }
      
      if (file) {
        setFormData((prev) => ({ ...prev, profileImage: file }));
      }
    } catch (error) {
      console.error('Error handling image upload:', error);
      toast.error('Failed to process image upload');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Upload profile image first if provided
      if (formData.profileImage && formData.profileImage instanceof File) {
        const uploadResult = await uploadProfilePicture(formData.profileImage);
        toast.success('Profile picture uploaded successfully');
        // Refresh user data to get updated profile with image URL
        const updatedUserData = await getCurrentUser();
        if (updatedUserData?.userInfo?.profileImage) {
          setFormData((prev) => ({ ...prev, profileImage: updatedUserData.userInfo.profileImage }));
          // Dispatch custom event to notify header/sidebar to refresh profile image
          // Use a small delay to ensure the server has processed the upload
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('profileImageUpdated'));
          }, 100);
        }
      }
      
      // Prepare update data according to backend API structure
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      const updateData = {
        firstName,
        lastName,
        userInfo: {
          name: {
            first: firstName,
            last: lastName,
            middle: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "",
          },
          bio: formData.description || "",
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender || undefined,
          address: {
            street: formData.address || "",
            city: formData.city || "",
            county: formData.county || "",
            postcode: formData.postcode || "",
            country: formData.country || "United Kingdom",
            livingPeriod: formData.residencyLength || "",
          },
          employment: {
            jobTitle: formData.designation || formData.jobTitle || "",
            company: formData.company || "",
            employmentType: formData.employmentType || undefined,
            annualSalary: formData.annualSalary ? parseFloat(formData.annualSalary) : undefined,
            monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined,
            startDate: formData.startDate || undefined,
            workLocation: formData.workLocation || "",
          },
          creditScore: formData.creditScore ? parseInt(formData.creditScore) : undefined,
          creditRating: formData.creditRating || "",
          creditDescription: formData.creditDescription || "",
          proofOfIncome: {
            type: formData.incomeType || undefined,
            date: formData.incomeDate || undefined,
            grossMonthly: formData.grossMonthly ? parseFloat(formData.grossMonthly) : undefined,
            netMonthly: formData.netMonthly ? parseFloat(formData.netMonthly) : undefined,
          },
          nationalInsurance: formData.nationalInsurance || "",
        },
      };
      
      // Remove undefined values
      const cleanUpdateData = JSON.parse(JSON.stringify(updateData));
      
      await updateUserProfile(cleanUpdateData);
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // Extract validation errors from different possible locations
      const validationErrors = error.validationErrors || 
                              error.response?.data?.errors || 
                              (Array.isArray(error.response?.data?.errors) ? error.response.data.errors : null);
      
      // Display only the first validation error (one toast at a time)
      if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        // Show just the error message, not the field name for cleaner UX
        toast.error(firstError.message || 'Validation failed');
      } else {
        // Display generic error message
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           'Failed to save profile';
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B4EFF]"></div>
        <span className="ml-3 text-darkGray">Loading profile data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInformationSection
        formData={formData}
        handleChange={handleChange}
        handleImageUpload={handleImageUpload}
        onRemoveProfilePicture={handleRemoveProfilePicture}
      />

      <CreditCheckSection formData={formData} handleChange={handleChange} />

      <IdentityInformationSection
        formData={formData}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        existingDocuments={identityDocuments}
        onDocumentsUpdated={reloadDocuments}
      />

      <CurrentAddressSection 
        formData={formData} 
        handleChange={handleChange}
        existingDocuments={proofOfAddressDocuments}
        onDocumentsUpdated={reloadUserDataAndDocuments}
      />

      <EmploymentDetailsSection
        formData={formData}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        handleDropdownChange={handleDropdownChange}
        employmentTypeOptions={employmentTypeOptions}
      />

      <ProofOfIncomeSection
        formData={formData}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        handleDropdownChange={handleDropdownChange}
        incomeTypeOptions={incomeTypeOptions}
        existingDocuments={paySlipDocuments}
        onDocumentsUpdated={reloadUserDataAndDocuments}
      />

      <DocumentsSection
        formData={formData}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        handleDropdownChange={handleDropdownChange}
        documentTypeOptions={documentTypeOptions}
        onDocumentsUpdated={reloadUserDataAndDocuments}
      />

      <ReferencesSection
        references={references}
        handleReferenceChange={handleReferenceChange}
        addReference={addReference}
        referenceTypeOptions={referenceTypeOptions}
      />

      <GuarantorInformationSection
        formData={formData}
        handleChange={handleChange}
        existingDocuments={otherDocuments}
        onDocumentsUpdated={reloadUserDataAndDocuments}
      />

      {/* Save Changes Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || saving}
          className="px-8 py-3 w-full sm:w-auto bg-blueGradient text-white rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors shadow-[0px_2px_10px_0px_#00000033] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default EditProfileSection;
