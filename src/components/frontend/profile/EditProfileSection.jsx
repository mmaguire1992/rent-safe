'use client'

import { useState } from "react";
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
  // Options for dropdowns
  const employmentTypeOptions = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "self-employed", label: "Self-employed" },
  ];

  const incomeTypeOptions = [
    { value: "payslip", label: "Payslip" },
    { value: "bank-statement", label: "Bank Statement" },
    { value: "tax-return", label: "Tax Return" },
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
    fullName: "John Smith",
    email: "john.smith@example.com",
    phoneNumber: "+44 7700 100000",
    address: "",
    city: "",
    country: "",
    postcode: "",
    designation: "",
    monthlyIncome: "",

    // Credit Check
    creditScore: "",

    // Identity Information
    identityFullName: "",
    dateOfBirth: "",
    nationalInsurance: "",
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, profileImage: e.target.files[0] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData, references);
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInformationSection
        formData={formData}
        handleChange={handleChange}
        handleImageUpload={handleImageUpload}
      />

      <CreditCheckSection formData={formData} handleChange={handleChange} />

      <IdentityInformationSection
        formData={formData}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
      />

      <CurrentAddressSection formData={formData} handleChange={handleChange} />

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
      />

      <DocumentsSection
        formData={formData}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        handleDropdownChange={handleDropdownChange}
        documentTypeOptions={documentTypeOptions}
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
      />

      {/* Save Changes Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 w-full sm:w-auto bg-blueGradient text-white rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors shadow-[0px_2px_10px_0px_#00000033]"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

export default EditProfileSection;
