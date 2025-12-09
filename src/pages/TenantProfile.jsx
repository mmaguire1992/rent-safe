import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CustomDropdown from "@/components/common/CustomDropdown";
import { FiCheckCircle, FiChevronLeft, FiMail, FiPhone, FiMapPin, FiX } from "react-icons/fi";

function TenantProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    property: "",
    monthlyRent: "",
    requirements: "",
  });

  // Sample data - in real app, this would come from API based on id
  const tenantData = {
    id: id || "1",
    name: "David Wanner",
    verified: true,
    profileImage: "https://via.placeholder.com/120x120",
    description: "Experienced marketing professional with excellent references from previous landlords. Looking for long-term rental with reliable payment history and strong community engagement.",
    designation: "Marketing Manager",
    location: "Manchester, UK",
    monthlyIncome: "€4,800",
    creditScore: 785,
    creditMax: 999,
    creditRating: "Excellent",
    creditDescription: "This Credit Score indicates excellent creditworthiness and payment reliability.",
    identity: {
      fullName: "Michael Min Chin",
      dateOfBirth: "5th July 1990",
      nationalInsurance: "CD0012E",
      phone: "+44 7445 987954",
      email: "michael.chin@email.com",
    },
    currentAddress: {
      address: "78 Canal Street",
      city: "Manchester",
      country: "United Kingdom",
      postcode: "M1 2RZ",
      livingPeriod: "3 years",
    },
    employment: {
      jobTitle: "Senior Marketing Manager",
      company: "Digital Marketing Hub Ltd",
      employmentType: "Full-time Permanent",
      annualSalary: "€57,600",
      startDate: "March 2011",
      workLocation: "Manchester Office",
    },
    proofOfIncome: {
      type: "Latest Payslip",
      date: "December 2024",
      grossMonthly: "€4,800",
      netMonthly: "€4,000",
    },
    documents: [
      {
        type: "Passport",
        documentNumber: "*****4321",
        expires: "November 2029",
        verified: true,
      },
      {
        type: "Driver's License",
        documentNumber: "*****038P",
        expires: "July 2026",
        verified: true,
      },
    ],
    rentalHistory: [
      {
        address: "34 King Street, Manchester M2 8AZ",
        tenancyDates: "Sep 2020 - Dec 2021",
        location: "Manchester",
        monthlyRent: "£1,450",
        phone: "+44 7445 987954",
        reasonForLeaving: "Seeking larger space",
        landlordRecommendation: {
          name: "Jane Casper",
          verified: true,
          text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in good condition. I would gladly rent to them again. I've never had any issues with David and I hope they continue to rent from me in the future.",
        },
      },
      {
        address: "34 King Street, Manchester M2 8AZ",
        tenancyDates: "Mar 2018 - Dec 2019",
        location: "Manchester",
        monthlyRent: "£1,450",
        phone: "+44 7445 987954",
        reasonForLeaving: "Seeking larger space",
      },
    ],
    references: [
      {
        name: "Sarah Williams",
        designation: "Marketing Director",
        phone: "+44 7445 987954",
        email: "michael.chin@email.com",
        relationship: "Direct manager for 3 years",
        type: "Professional",
      },
      {
        name: "Sarah Williams",
        designation: "Marketing Director",
        phone: "+44 7445 987954",
        email: "michael.chin@email.com",
        relationship: "Direct manager for 3 years",
        type: "Professional",
      },
      {
        name: "Sarah Williams",
        designation: "Marketing Director",
        phone: "+44 7445 987954",
        email: "michael.chin@email.com",
        relationship: "Direct manager for 3 years",
        type: "Professional",
      },
    ],
    guarantor: {
      name: "Sarah Williams",
      verified: true,
      relationship: "Mother",
      occupation: "Senior Nurse",
      contactNumber: "+44 7735 609800",
      email: "sara.chin@email.com",
      annualIncome: "€44,280",
      address: "09 Willow Avenue, Liverpool L30 1DE",
    },
  };

  const creditPercentage = (tenantData.creditScore / tenantData.creditMax) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-darkGray">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-secondary"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="text-secondary font-semibold">
            {tenantData.name}'s Profile
          </span>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <img
                src={tenantData.profileImage}
                alt={tenantData.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
              />
              {tenantData.verified && (
                <FiCheckCircle className="absolute bottom-0 right-0 text-green-600 bg-white rounded-full text-xl" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-secondary">
                  {tenantData.name}
                </h1>
                {tenantData.verified && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-darkGray mb-4 max-w-2xl">
                {tenantData.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-darkGray mb-1">Designation</p>
                  <p className="font-semibold text-secondary">
                    {tenantData.designation}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-darkGray mb-1">Location</p>
                  <p className="font-semibold text-secondary">
                    {tenantData.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-darkGray mb-1">Monthly Income</p>
                  <p className="font-semibold text-secondary">
                    {tenantData.monthlyIncome}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard/messages")}
                className="bg-[#6B4EFF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Chat
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#6B4EFF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>

        {/* Credit Check Card */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">Credit Check</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#10B981"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - creditPercentage / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-green-600">
                  {tenantData.creditScore}
                </span>
                <span className="text-xs text-darkGray">
                  out of {tenantData.creditMax}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                {tenantData.creditRating}
              </h3>
              <p className="text-darkGray">{tenantData.creditDescription}</p>
            </div>
          </div>
        </div>

        {/* Grid Layout for Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Identity Information */}
          <div className="bg-white rounded-lg border border-lightGray p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">
              Identity Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-darkGray mb-1">Full Name</p>
                <p className="font-semibold text-secondary">
                  {tenantData.identity.fullName}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Date of Birth</p>
                <p className="font-semibold text-secondary">
                  {tenantData.identity.dateOfBirth}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">National Insurance</p>
                <p className="font-semibold text-secondary">
                  {tenantData.identity.nationalInsurance}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-darkGray" />
                <p className="font-semibold text-secondary">
                  {tenantData.identity.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="text-darkGray" />
                <p className="font-semibold text-secondary">
                  {tenantData.identity.email}
                </p>
              </div>
            </div>
          </div>

          {/* Current Address */}
          <div className="bg-white rounded-lg border border-lightGray p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">
              Current Address
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-darkGray mb-1">Address</p>
                <p className="font-semibold text-secondary">
                  {tenantData.currentAddress.address}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">City</p>
                <p className="font-semibold text-secondary">
                  {tenantData.currentAddress.city}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Country</p>
                <p className="font-semibold text-secondary">
                  {tenantData.currentAddress.country}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Postcode</p>
                <p className="font-semibold text-secondary">
                  {tenantData.currentAddress.postcode}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Living Period</p>
                <p className="font-semibold text-secondary">
                  {tenantData.currentAddress.livingPeriod}
                </p>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white rounded-lg border border-lightGray p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">
              Employment Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-darkGray mb-1">Job Title</p>
                <p className="font-semibold text-secondary">
                  {tenantData.employment.jobTitle}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Company</p>
                <p className="font-semibold text-secondary">
                  {tenantData.employment.company}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Employment Type</p>
                <p className="font-semibold text-secondary">
                  {tenantData.employment.employmentType}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Annual Salary</p>
                <p className="font-semibold text-secondary">
                  {tenantData.employment.annualSalary}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Start Date</p>
                <p className="font-semibold text-secondary">
                  {tenantData.employment.startDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Work Location</p>
                <p className="font-semibold text-secondary">
                  {tenantData.employment.workLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Proof of Income */}
          <div className="bg-white rounded-lg border border-lightGray p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">
              Proof of Income
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-darkGray mb-1">Type</p>
                <p className="font-semibold text-secondary">
                  {tenantData.proofOfIncome.type}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Date</p>
                <p className="font-semibold text-secondary">
                  {tenantData.proofOfIncome.date}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Gross Monthly</p>
                <p className="font-semibold text-secondary">
                  {tenantData.proofOfIncome.grossMonthly}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Net Monthly</p>
                <p className="font-semibold text-secondary">
                  {tenantData.proofOfIncome.netMonthly}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenantData.documents.map((doc, index) => (
              <div
                key={index}
                className="border border-lightGray rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-secondary">{doc.type}</h3>
                  {doc.verified && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                      Verified
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-darkGray mb-1">
                      Document Number
                    </p>
                    <p className="font-semibold text-secondary">
                      {doc.documentNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Expires</p>
                    <p className="font-semibold text-secondary">
                      {doc.expires}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Rental History */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B4EFF"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-secondary">
                Previous Rental History & Landlord Recommendations
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/dashboard/tenant/${id}/rental-history`)}
                className="text-[#6B4EFF] font-semibold text-sm hover:underline"
              >
                View All
              </button>
              <span className="bg-[#6B4EFF] text-white text-xs font-bold rounded-full px-3 py-1">
                {tenantData.rentalHistory.length} References
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenantData.rentalHistory.map((history, index) => (
              <div
                key={index}
                className="border border-lightGray rounded-lg p-4"
              >
                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-darkGray mb-1">Address</p>
                    <p className="font-semibold text-secondary">
                      {history.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Tenancy Dates</p>
                    <p className="font-semibold text-secondary">
                      {history.tenancyDates}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Location</p>
                    <p className="font-semibold text-secondary">
                      {history.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Monthly Rent</p>
                    <p className="font-semibold text-secondary">
                      {history.monthlyRent}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Phone</p>
                    <p className="font-semibold text-secondary">
                      {history.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">
                      Reason for Leaving
                    </p>
                    <p className="font-semibold text-secondary">
                      {history.reasonForLeaving}
                    </p>
                  </div>
                </div>
                {history.landlordRecommendation && (
                  <div className="border-t border-lightGray pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-secondary">
                        {history.landlordRecommendation.name}
                      </span>
                      {history.landlordRecommendation.verified && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-darkGray">
                      {history.landlordRecommendation.text}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* References */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary">References</h2>
            <span className="bg-[#6B4EFF] text-white text-xs font-bold rounded-full px-3 py-1">
              {tenantData.references.length} References
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tenantData.references.map((ref, index) => (
              <div
                key={index}
                className="border border-lightGray rounded-lg p-4"
              >
                <div className="mb-3">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                    {ref.type}
                  </span>
                </div>
                <h3 className="font-semibold text-secondary mb-2">{ref.name}</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-darkGray mb-1">Designation</p>
                    <p className="font-semibold text-secondary text-sm">
                      {ref.designation}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-darkGray text-sm" />
                    <p className="font-semibold text-secondary text-sm">
                      {ref.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="text-darkGray text-sm" />
                    <p className="font-semibold text-secondary text-sm">
                      {ref.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGray mb-1">Relationship</p>
                    <p className="font-semibold text-secondary text-sm">
                      {ref.relationship}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantor Information */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">
            Guarantor Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-secondary">
                  {tenantData.guarantor.name}
                </h3>
                {tenantData.guarantor.verified && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                    Verified
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Relationship</p>
                <p className="font-semibold text-secondary">
                  {tenantData.guarantor.relationship}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Occupation</p>
                <p className="font-semibold text-secondary">
                  {tenantData.guarantor.occupation}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-darkGray" />
                <p className="font-semibold text-secondary">
                  {tenantData.guarantor.contactNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="text-darkGray" />
                <p className="font-semibold text-secondary">
                  {tenantData.guarantor.email}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-darkGray mb-1">Annual Income</p>
                <p className="font-semibold text-secondary">
                  {tenantData.guarantor.annualIncome}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Address</p>
                <p className="font-semibold text-secondary">
                  {tenantData.guarantor.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md relative">
            {/* Modal Header */}
            <div className="p-6 border-b border-lightGray">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-secondary">Send Offer</h2>
                  <p className="text-sm text-darkGray mt-1">2-Bed Apartment Manchester</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="text-secondary text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Property Dropdown */}
              <div>
                <label className="block text-base font-semibold text-secondary mb-1">
                  Property
                </label>
                <CustomDropdown
                  options={[
                    { value: "property1", label: "2-Bed Apartment Manchester" },
                    { value: "property2", label: "3-Bed House London" },
                    { value: "property3", label: "1-Bed Studio Birmingham" },
                  ]}
                  value={formData.property}
                  onChange={(value) =>
                    setFormData({ ...formData, property: value })
                  }
                  placeholder="Select property"
                />
              </div>

              {/* Monthly Rent */}
              <div>
                <label className="block text-base font-semibold text-secondary mb-1">
                  Monthly Rent (€)
                </label>
                <input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyRent: e.target.value })
                  }
                  placeholder="Enter your monthly rent"
                  className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent h-[52px]"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-base font-semibold text-secondary mb-1">
                  Requirements
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                  placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip."
                  rows="6"
                  className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-lightGray flex justify-end">
              <button
                onClick={() => {
                  // Handle send offer logic here
                  console.log("Sending offer:", formData);
                  setIsModalOpen(false);
                  // Reset form
                  setFormData({ property: "", monthlyRent: "", requirements: "" });
                }}
                className="bg-blueGradient text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default TenantProfile;

