'use client'

import { useState, useEffect } from "react";
import { getCurrentUser, updateUserProfile, uploadProfilePicture, deleteProfilePicture } from "@/api/users";
import { getMyDocuments, storeDocuments } from "@/api/verification";
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
import FeedbackSection from "./FeedbackSection";
import GuarantorInformationSection from "./editprofilesection/GuarantorInformationSection";

function EditProfileSection() {
  const { userType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [identityDocuments, setIdentityDocuments] = useState([]);
  const [proofOfAddressDocuments, setProofOfAddressDocuments] = useState([]);
  const [paySlipDocuments, setPaySlipDocuments] = useState([]);
  const [otherDocuments, setOtherDocuments] = useState([]);
  const [documentSectionDocuments, setDocumentSectionDocuments] = useState([]);
  const [creditScoreDocuments, setCreditScoreDocuments] = useState([]);
  const [pendingDocumentsByKey, setPendingDocumentsByKey] = useState({});
  const [pendingResetToken, setPendingResetToken] = useState(0);
  
  // Field name mapping for user-friendly validation messages
  const fieldLabels = {
    creditScore: 'Credit score',
    identityFullName: 'Full name',
    dateOfBirth: 'Date of birth',
    nationalInsurance: 'National insurance',
    identityPhone: 'Phone number',
    currentAddress: 'Address',
    currentCity: 'City',
    currentCountry: 'Country',
    currentPostcode: 'Postcode',
    residencyLength: 'Residency length',
    incomeType: 'Income type',
    incomeDate: 'Income date',
    grossMonthly: 'Gross monthly',
    netMonthly: 'Net monthly',
    documentType: 'Document type',
    documentNumber: 'Document number',
    documentExpire: 'Document expiry date',
    guarantorName: 'Guarantor name',
    guarantorRelationship: 'Guarantor relationship',
    guarantorOccupation: 'Guarantor occupation',
    guarantorAnnualIncome: 'Guarantor annual income',
    guarantorEmail: 'Guarantor email',
    guarantorPhone: 'Guarantor phone',
    guarantorAddress: 'Guarantor address',
    guarantorCity: 'Guarantor city',
    guarantorCountry: 'Guarantor country',
    guarantorPostcode: 'Guarantor postcode',
  };
  
  // Helper function to get field-specific required error message
  const getRequiredErrorMessage = (fieldName) => {
    const fieldLabel = fieldLabels[fieldName] || fieldName;
    return `${fieldLabel} is required`;
  };
  
  // Helper function to check if an error is a required field error for a specific field
  const isRequiredError = (fieldName, errorMessage) => {
    const expectedMessage = getRequiredErrorMessage(fieldName);
    return errorMessage === expectedMessage;
  };

  const handlePendingDocumentsChange = (key, docs) => {
    if (!key) return;
    setPendingDocumentsByKey((prev) => ({
      ...(prev || {}),
      [key]: Array.isArray(docs) ? docs : [],
    }));
  };
  
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
          // Keep legacy credit score doc values for backward compatibility (older uploads stored in user_info)
          creditScoreDocument: userInfo.creditScoreDocument || prev.creditScoreDocument,
          creditScoreDocumentMetaData: userInfo.creditScoreDocumentMetaData || prev.creditScoreDocumentMetaData,
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
          
            // Load identity documents (only identity_proof, not passport/driving_license/national_id)
            const identityDocs = getDocumentsByType('identity_proof');
            setIdentityDocuments(identityDocs);
            
            // Load documents section documents (passport, driving_license, national_id)
            let docSectionDocs = [];
            const docSectionTypes = ['passport', 'driving_license', 'national_id'];
            docSectionTypes.forEach(docType => {
              const docs = getDocumentsByType(docType);
              docSectionDocs = [...docSectionDocs, ...docs];
            });
            setDocumentSectionDocuments(docSectionDocs);
            
            // Load proof of address documents
            const proofOfAddressDocs = getDocumentsByType('proof_of_address');
            setProofOfAddressDocuments(proofOfAddressDocs);
            
            // Load pay slip documents
            const paySlipDocs = getDocumentsByType('pay_slip');
            setPaySlipDocuments(paySlipDocs);
            
            // Load other documents (for guarantor section)
            const otherDocs = getDocumentsByType('other');
            setOtherDocuments(otherDocs);

            // Load credit score document(s)
            const creditDocs = getDocumentsByType('credit_score');

            // If legacy user_info.creditScoreDocument exists but no user_docs entry yet, show it as a "legacy" doc
            const legacyUrl = userData?.userInfo?.creditScoreDocument || null;
            const legacyMeta = userData?.userInfo?.creditScoreDocumentMetaData || null;
            if ((!creditDocs || creditDocs.length === 0) && legacyUrl) {
              setCreditScoreDocuments([
                {
                  id: 'legacy-credit-score',
                  docType: 'credit_score',
                  fileUrl: legacyUrl,
                  metaData: legacyMeta || {},
                  isLegacyCreditScore: true,
                  createdAt: legacyMeta?.uploadedAt || null,
                },
              ]);
            } else {
              setCreditScoreDocuments(creditDocs || []);
            }
            
            console.log('Reloaded documents:', {
              identity: identityDocs.length,
              documentSection: docSectionDocs.length,
              proofOfAddress: proofOfAddressDocs.length,
              paySlip: paySlipDocs.length,
              other: otherDocs.length,
              creditScore: (creditDocs || []).length,
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
    // { value: "landlord", label: "Landlord" },
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
    creditScoreDocument: null, // string URL (from DB) or File (selected for upload)
    creditScoreDocumentMetaData: null, // { originalFileName, fileSize, uploadedAt }
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

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Fields that should only accept numbers
    const numericFields = ['creditScore', 'annualSalary', 'grossMonthly', 'netMonthly', 'monthlyIncome'];
    // Phone number fields - should only accept numbers and formatting characters
    const phoneFields = ['phoneNumber', 'identityPhone', 'guarantorPhone'];
    // Postcode fields - UK postcodes can contain letters and numbers
    const postcodeFields = ['postcode', 'currentPostcode'];
    // Date fields - should not have leading spaces
    const dateFields = ['dateOfBirth', 'startDate', 'incomeDate', 'documentExpire'];
    
    let processedValue = value;
    
    // Prevent leading spaces for all text fields (except numeric fields which are handled separately)
    // Note: numeric fields and date fields don't need leading space removal as they have their own validation
    if (!numericFields.includes(name) && !dateFields.includes(name)) {
      processedValue = processedValue.replace(/^\s+/, '');
    }
    
    if (numericFields.includes(name)) {
      // Check if original value contains non-numeric characters
      if (value && /[^0-9.]/.test(value)) {
        const fieldLabel = name === 'creditScore' ? 'Credit score' : 
                          name === 'annualSalary' ? 'Annual salary' :
                          name === 'grossMonthly' ? 'Gross monthly' :
                          name === 'netMonthly' ? 'Net monthly' :
                          'Monthly income';
        setErrors((prev) => ({
          ...prev,
          [name]: `${fieldLabel} must contain only numbers`,
        }));
      } else {
        // Clear error if valid
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
      // Allow only numbers and decimal point (for salary/income fields)
      if (name === 'creditScore') {
        processedValue = value.replace(/[^0-9]/g, '');
      } else {
        // For salary/income fields, allow numbers and one decimal point
        processedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      }
    } else if (phoneFields.includes(name)) {
      // Check if original value contains alphabetic characters
      if (value && /[a-zA-Z]/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          [name]: 'Phone number must contain only numbers and formatting characters (+, -, spaces, parentheses)',
        }));
      } else {
        // Clear error if valid
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
      // Allow only numbers and common phone formatting characters
      processedValue = value.replace(/[^0-9+\-().\s]/g, '');
    } else if (postcodeFields.includes(name)) {
      // Allow only letters, numbers and spaces (UK postcode style). Disallow other special chars.
      if (value && /[^a-zA-Z0-9\s]/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          [name]: 'Postcode can contain only letters and numbers',
        }));
      } else {
        // Clear error if valid
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
      // Keep only letters/numbers/spaces and normalize to uppercase
      processedValue = value.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase();
    }

    // Clear required-field error as soon as user provides a value
    if (String(processedValue || '').trim()) {
      setErrors((prev) => {
        const next = { ...(prev || {}) };
        if (isRequiredError(name, next[name])) delete next[name];
        return next;
      });
    }
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: processedValue };
      // Keep designation and jobTitle in sync
      if (name === 'designation') {
        updated.jobTitle = processedValue;
      } else if (name === 'jobTitle') {
        updated.designation = processedValue;
      }
      
      // Validate gross vs net salary
      if (name === 'grossMonthly' || name === 'netMonthly') {
        const grossValue = name === 'grossMonthly' ? processedValue : updated.grossMonthly;
        const netValue = name === 'netMonthly' ? processedValue : updated.netMonthly;
        
        // Only validate if both values are provided and are valid numbers
        if (grossValue && netValue) {
          const grossNum = parseFloat(grossValue);
          const netNum = parseFloat(netValue);
          
          if (!isNaN(grossNum) && !isNaN(netNum)) {
            if (grossNum < netNum) {
              setErrors((prev) => ({
                ...prev,
                grossMonthly: 'Gross monthly salary cannot be less than net monthly salary',
                netMonthly: 'Net monthly salary cannot be greater than gross monthly salary',
              }));
            } else {
              // Clear errors if validation passes
              setErrors((prev) => {
                const newErrors = { ...prev };
                // Only clear the specific validation error
                if (newErrors.grossMonthly === 'Gross monthly salary cannot be less than net monthly salary') {
                  delete newErrors.grossMonthly;
                }
                if (newErrors.netMonthly === 'Net monthly salary cannot be greater than gross monthly salary') {
                  delete newErrors.netMonthly;
                }
                return newErrors;
              });
            }
          }
        } else {
          // Clear validation errors if one field is empty
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.grossMonthly === 'Gross monthly salary cannot be less than net monthly salary') {
              delete newErrors.grossMonthly;
            }
            if (newErrors.netMonthly === 'Net monthly salary cannot be greater than gross monthly salary') {
              delete newErrors.netMonthly;
            }
            return newErrors;
          });
        }
      }
      
      return updated;
    });
  };

  const handleDateChange = (name, value) => {
    // Defensive validation for date fields (even though UI calendar constrains selection)
    if (name === 'dateOfBirth' && value) {
      const selected = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);

      // Must not be in the future
      if (!isNaN(selected.getTime()) && selected.getTime() > today.getTime()) {
        setErrors((prev) => ({ ...prev, dateOfBirth: 'Date of birth cannot be a future date' }));
      } else {
        // Must be at least 18 years old
        const eighteenYearsAgo = new Date(today);
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        eighteenYearsAgo.setHours(0, 0, 0, 0);

        if (!isNaN(selected.getTime()) && selected.getTime() > eighteenYearsAgo.getTime()) {
          setErrors((prev) => ({ ...prev, dateOfBirth: 'DOB cannot be less than 18 years' }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            if (next.dateOfBirth === 'Date of birth cannot be a future date') delete next.dateOfBirth;
            if (next.dateOfBirth === 'DOB cannot be less than 18 years') delete next.dateOfBirth;
            return next;
          });
        }
      }
    }

    if (name === 'documentExpire' && value) {
      setFormData((prev) => {
        const next = { ...prev, [name]: value };

        // Expiry date must never be in the past (Passport / Driving License / ID Card)
        const selected = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);

        if (!isNaN(selected.getTime()) && selected.getTime() < today.getTime()) {
          setErrors((prevErr) => ({ ...prevErr, documentExpire: 'Expiry date cannot be in the past' }));
        } else {
          setErrors((prevErr) => {
            const nextErr = { ...prevErr };
            if (nextErr.documentExpire === 'Expiry date cannot be in the past') delete nextErr.documentExpire;
            return nextErr;
          });
        }

        return next;
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear required error for date fields once a value is picked
    if (String(value || '').trim()) {
      setErrors((prev) => {
        const next = { ...(prev || {}) };
        if (isRequiredError(name, next[name])) delete next[name];
        return next;
      });
    }
  };

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (String(value || '').trim()) {
      setErrors((prev) => {
        const next = { ...(prev || {}) };
        if (isRequiredError(name, next[name])) delete next[name];
        return next;
      });
    }
  };

  const handleReferenceChange = (index, field, value) => {
    const newReferences = [...references];
    // Prevent leading spaces for reference fields
    let processedValue = value;
    if (typeof value === 'string') {
      processedValue = processedValue.replace(/^\s+/, '');
    }
    newReferences[index][field] = processedValue;
    setReferences(newReferences);
  };

  const handleKeyDown = (e) => {
    // Prevent Enter key from submitting the form when pressed in input fields
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      return false;
    }
    
    // Prevent space from being entered if field is empty or cursor is at the start
    if (e.key === ' ' || e.key === 'Spacebar') {
      const input = e.target;
      const cursorPosition = input.selectionStart;
      const fieldValue = input.value || '';
      const fieldName = input.name || '';
      
      // Skip for numeric fields, date fields, and phone fields (they have their own validation)
      const numericFields = ['creditScore', 'annualSalary', 'grossMonthly', 'netMonthly', 'monthlyIncome'];
      const dateFields = ['dateOfBirth', 'startDate', 'incomeDate', 'documentExpire'];
      const phoneFields = ['phoneNumber', 'identityPhone', 'guarantorPhone'];
      
      if (numericFields.includes(fieldName) || dateFields.includes(fieldName) || phoneFields.includes(fieldName)) {
        return; // Allow space handling for these fields through their own logic
      }
      
      // If cursor is at the start (position 0) or field is empty, prevent space
      if (cursorPosition === 0 || fieldValue.length === 0) {
        e.preventDefault();
        return false;
      }
    }
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
            creditScoreDocument: userInfo.creditScoreDocument || null,
            creditScoreDocumentMetaData: userInfo.creditScoreDocumentMetaData || null,
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
            
            // Load identity documents (only identity_proof, not passport/driving_license/national_id)
            const identityDocs = getDocumentsByType('identity_proof');
            setIdentityDocuments(identityDocs);
            
            // Load documents section documents (passport, driving_license, national_id)
            let docSectionDocs = [];
            const docSectionTypes = ['passport', 'driving_license', 'national_id'];
            docSectionTypes.forEach(docType => {
              const docs = getDocumentsByType(docType);
              docSectionDocs = [...docSectionDocs, ...docs];
            });
            setDocumentSectionDocuments(docSectionDocs);
            
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
        // Validate that the file is an image
        const validImageTypes = ['image/heic', 'image/webp', 'image/png', 'image/jpeg', 'image/jpg'];
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        const isValidImage = validImageTypes.includes(fileType) || 
                           fileName.endsWith('.heic') || 
                           fileName.endsWith('.webp') || 
                           fileName.endsWith('.png') || 
                           fileName.endsWith('.jpg') || 
                           fileName.endsWith('.jpeg');
        
        if (!isValidImage) {
          toast.error('Please select only image files (HEIC, WEBP, PNG, or JPG)');
          return;
        }
        
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
      // --- Save-time validation: for every section that has a doc (pending or already stored),
      // enforce that the related fields are filled. ---
      const isBlank = (v) => !String(v ?? '').trim();
      const nextErrors = {};

      const hasDoc = (pendingKey, existingDocs) => {
        const pendingCount = Array.isArray(pendingDocumentsByKey?.[pendingKey]) ? pendingDocumentsByKey[pendingKey].length : 0;
        const existingCount = Array.isArray(existingDocs) ? existingDocs.length : 0;
        return pendingCount > 0 || existingCount > 0;
      };

      const requireField = (fieldName) => {
        if (isBlank(formData[fieldName])) {
          nextErrors[fieldName] = getRequiredErrorMessage(fieldName);
        }
      };

      // Credit score doc -> credit score required
      if (hasDoc('credit_score', creditScoreDocuments)) {
        requireField('creditScore');
      }

      // Identity doc -> identity fields required
      if (hasDoc('identity_proof', identityDocuments)) {
        requireField('identityFullName');
        requireField('dateOfBirth');
        requireField('nationalInsurance');
        requireField('identityPhone');
      }

      // Current address doc -> current address fields required
      if (hasDoc('proof_of_address', proofOfAddressDocuments)) {
        requireField('currentAddress');
        requireField('currentCity');
        requireField('currentCountry');
        requireField('currentPostcode');
        requireField('residencyLength');
      }

      // Proof of income docs -> income fields required
      if (hasDoc('pay_slip', paySlipDocuments)) {
        requireField('incomeType');
        requireField('incomeDate');
        requireField('grossMonthly');
        requireField('netMonthly');
      }

      // Documents section doc(s) -> document fields required
      if (hasDoc('documents_section', documentSectionDocuments)) {
        requireField('documentType');
        requireField('documentNumber');
        requireField('documentExpire');
      }

      // Guarantor doc -> guarantor fields required
      if (hasDoc('guarantor_other', otherDocuments)) {
        requireField('guarantorName');
        requireField('guarantorRelationship');
        requireField('guarantorOccupation');
        requireField('guarantorAnnualIncome');
        requireField('guarantorEmail');
        requireField('guarantorPhone');
        requireField('guarantorAddress');
        requireField('guarantorCity');
        requireField('guarantorCountry');
        requireField('guarantorPostcode');
      }

      if (Object.keys(nextErrors).length > 0) {
        setErrors((prev) => ({ ...(prev || {}), ...nextErrors }));
        return;
      } else {
        // Clear any previous required error entries for the fields we validate here
        const validatedFields = [
          'creditScore',
          'identityFullName',
          'dateOfBirth',
          'nationalInsurance',
          'identityPhone',
          'currentAddress',
          'currentCity',
          'currentCountry',
          'currentPostcode',
          'residencyLength',
          'incomeType',
          'incomeDate',
          'grossMonthly',
          'netMonthly',
          'documentType',
          'documentNumber',
          'documentExpire',
          'guarantorName',
          'guarantorRelationship',
          'guarantorOccupation',
          'guarantorAnnualIncome',
          'guarantorEmail',
          'guarantorPhone',
          'guarantorAddress',
          'guarantorCity',
          'guarantorCountry',
          'guarantorPostcode',
        ];
        setErrors((prev) => {
          const next = { ...(prev || {}) };
          validatedFields.forEach((f) => {
            if (isRequiredError(f, next[f])) delete next[f];
          });
          return next;
        });
      }

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

      // Store any pending documents in DB only after profile save succeeds
      const pendingDocs = Object.values(pendingDocumentsByKey || {}).flat().filter(Boolean);
      if (pendingDocs.length > 0) {
        await storeDocuments(pendingDocs);
        setPendingDocumentsByKey({});
        setPendingResetToken((t) => t + 1);
      }

      toast.success('Profile updated successfully!');
      await reloadUserDataAndDocuments();
      
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

  const handleFormKeyDown = (e) => {
    // Prevent Enter key from submitting the form when pressed anywhere in the form
    // (except in textareas where Enter should work normally)
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
      e.preventDefault();
      return false;
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6" noValidate>
      <BasicInformationSection
        formData={formData}
        handleChange={handleChange}
        handleImageUpload={handleImageUpload}
        onRemoveProfilePicture={handleRemoveProfilePicture}
        errors={errors}
      />

      <CreditCheckSection
        formData={formData}
        handleChange={handleChange}
        existingCreditScoreDocuments={creditScoreDocuments}
        pendingCreditScoreKey="credit_score"
        onPendingDocumentsChange={handlePendingDocumentsChange}
        onDocumentsUpdated={reloadUserDataAndDocuments}
        pendingResetToken={pendingResetToken}
        errors={errors}
      />

      <IdentityInformationSection
        formData={formData}
        handleChange={handleChange}
        handleKeyDown={handleKeyDown}
        handleDateChange={handleDateChange}
        existingDocuments={identityDocuments}
        onDocumentsUpdated={reloadDocuments}
        deferDbSave
        pendingKey="identity_proof"
        onPendingDocumentsChange={handlePendingDocumentsChange}
        pendingResetToken={pendingResetToken}
        errors={errors}
      />

      <CurrentAddressSection 
        formData={formData} 
        handleChange={handleChange}
        handleKeyDown={handleKeyDown}
        existingDocuments={proofOfAddressDocuments}
        onDocumentsUpdated={reloadUserDataAndDocuments}
        deferDbSave
        pendingKey="proof_of_address"
        onPendingDocumentsChange={handlePendingDocumentsChange}
        pendingResetToken={pendingResetToken}
        errors={errors}
      />

      <EmploymentDetailsSection
        formData={formData}
        handleChange={handleChange}
        handleKeyDown={handleKeyDown}
        handleDateChange={handleDateChange}
        handleDropdownChange={handleDropdownChange}
        employmentTypeOptions={employmentTypeOptions}
        errors={errors}
      />

      <ProofOfIncomeSection
        formData={formData}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        handleDropdownChange={handleDropdownChange}
        incomeTypeOptions={incomeTypeOptions}
        existingDocuments={paySlipDocuments}
        onDocumentsUpdated={reloadUserDataAndDocuments}
        deferDbSave
        pendingKey="pay_slip"
        onPendingDocumentsChange={handlePendingDocumentsChange}
        pendingResetToken={pendingResetToken}
        errors={errors}
      />

      <DocumentsSection
        formData={formData}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        handleDropdownChange={handleDropdownChange}
        documentTypeOptions={documentTypeOptions}
        onDocumentsUpdated={reloadUserDataAndDocuments}
        existingDocuments={documentSectionDocuments}
        deferDbSave
        pendingKey="documents_section"
        onPendingDocumentsChange={handlePendingDocumentsChange}
        pendingResetToken={pendingResetToken}
        errors={errors}
      />

      <ReferencesSection
        references={references}
        handleReferenceChange={handleReferenceChange}
        addReference={addReference}
        referenceTypeOptions={referenceTypeOptions}
      />

      <FeedbackSection />

      <GuarantorInformationSection
        formData={formData}
        handleChange={handleChange}
        handleKeyDown={handleKeyDown}
        existingDocuments={otherDocuments}
        onDocumentsUpdated={reloadUserDataAndDocuments}
        deferDbSave
        pendingKey="guarantor_other"
        onPendingDocumentsChange={handlePendingDocumentsChange}
        pendingResetToken={pendingResetToken}
        errors={errors}
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
