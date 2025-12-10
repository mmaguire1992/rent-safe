import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FileUpload from "@/components/FileUpload";
import CustomDropdown from "@/components/common/CustomDropdown";
import {
  FiMapPin,
  FiHome,
  FiShare2,
  FiEdit,
  FiTrash2,
  FiEye,
  FiUser,
  FiWifi,
  FiThermometer,
  FiSearch,
  FiX,
  FiFilter,
} from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import {
  getPropertyData,
  listingStatusTabs,
  dateOptions,
  propertyTypeOptions,
  bedroomOptions,
  bathroomOptions,
  priceRangeOptions,
  areaOptions,
  statusFilterOptions,
} from "@/constant";

function PropertyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [readMore, setReadMore] = useState(false);
  const [showRentOutForm, setShowRentOutForm] = useState(false);
  const [showRenterDetails, setShowRenterDetails] = useState(false);
  const [renterEmail, setRenterEmail] = useState("");
  const [documents, setDocuments] = useState([]);
  const [renterFeedback, setRenterFeedback] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "active", "pending", "draft", "archived"
  const [dateAdded, setDateAdded] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [area, setArea] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rentPrice, setRentPrice] = useState("");
  const [rentDescription, setRentDescription] = useState("");

  const propertyData = getPropertyData(id);

  const [selectedImage, setSelectedImage] = useState(propertyData.mainImage);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-darkGray">
          <button
            onClick={() => navigate("/dashboard/properties")}
            className="hover:text-secondary"
          >
            My Properties
          </button>
          <span>/</span>
          <span className="text-secondary font-semibold">
            {propertyData.title}
          </span>
        </div>

        {/* Listing Status Section */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">
            Listing Status
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-lightGray">
            {listingStatusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
                  activeTab === tab.value
                    ? "text-[#6B4EFF] border-[#6B4EFF]"
                    : "text-darkGray border-transparent hover:text-[#6B4EFF]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <div>
              <label className="block text-xs text-darkGray mb-1">
                Date Added
              </label>
              <CustomDropdown
                options={dateOptions}
                value={dateAdded}
                onChange={setDateAdded}
                placeholder="Date Added"
                className="h-[40px]"
                showFilterIcon={true}
              />
            </div>
            <div>
              <label className="block text-xs text-darkGray mb-1">
                Property Type
              </label>
              <CustomDropdown
                options={propertyTypeOptions}
                value={propertyType}
                onChange={setPropertyType}
                placeholder="Property Type"
                className="h-[40px]"
                showFilterIcon={true}
              />
            </div>
            <div>
              <label className="block text-xs text-darkGray mb-1">
                Bedrooms
              </label>
              <CustomDropdown
                options={bedroomOptions}
                value={bedrooms}
                onChange={setBedrooms}
                placeholder="Bedrooms"
                className="h-[40px]"
                showFilterIcon={true}
              />
            </div>
            <div>
              <label className="block text-xs text-darkGray mb-1">
                Bathrooms
              </label>
              <CustomDropdown
                options={bathroomOptions}
                value={bathrooms}
                onChange={setBathrooms}
                placeholder="Bathrooms"
                className="h-[40px]"
                showFilterIcon={true}
              />
            </div>
            <div>
              <label className="block text-xs text-darkGray mb-1">
                Price Range
              </label>
              <CustomDropdown
                options={priceRangeOptions}
                value={priceRange}
                onChange={setPriceRange}
                placeholder="Price Range"
                className="h-[40px]"
                showFilterIcon={true}
              />
            </div>
            <div>
              <label className="block text-xs text-darkGray mb-1">Area</label>
              <CustomDropdown
                options={areaOptions}
                value={area}
                onChange={setArea}
                placeholder="Area"
                className="h-[40px]"
                showFilterIcon={true}
              />
            </div>
            <div>
              <label className="block text-xs text-darkGray mb-1">Status</label>
              <CustomDropdown
                options={statusFilterOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Status"
                className="h-[40px]"
                showFilterIcon={true}
              />
            </div>
          </div>
        </div>

        {/* Rent Out Details Section - Show when Edit button is clicked */}
        {showRentOutForm && (
          <div className="bg-white rounded-lg border border-lightGray p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-secondary mb-2">
                Rent Out Details
              </h2>
              <p className="text-sm text-darkGray">
                Add your renter details whom you rented this property.
              </p>
            </div>

            <div className="space-y-6">
              {/* Renter's Email Address */}
              <div>
                <label className="block text-base font-semibold text-secondary mb-2">
                  Renter's Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={renterEmail}
                    onChange={(e) => setRenterEmail(e.target.value)}
                    placeholder="Search renter's email address"
                    className="w-full px-4 py-3 pr-12 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent bg-gray-50"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-[#6B4EFF] rounded-lg hover:bg-opacity-90 transition-colors">
                    <FiSearch className="text-white" />
                  </button>
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <label className="block text-base font-semibold text-secondary mb-2">
                  Documents
                </label>
                <FileUpload
                  onFilesChange={setDocuments}
                  acceptedTypes=".pdf,.doc,.docx,.png"
                  maxFiles={3}
                  uploadedFiles={documents}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  // Handle save logic here
                  console.log("Saving rent out details:", {
                    renterEmail,
                    documents,
                  });
                  setShowRentOutForm(false);
                  setShowRenterDetails(true);
                  // Don't reset form - keep the data for display
                }}
                className="bg-[#6B4EFF] text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Renter Details Section - Show after Save */}
        {showRenterDetails && (
          <div className="space-y-6">
            {/* Renter Section */}
            <div className="bg-white rounded-lg border border-lightGray p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src="https://via.placeholder.com/80x80"
                      alt="David Wanner"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <FiCheckCircle className="absolute -bottom-1 -right-1 text-green-600 bg-white rounded-full text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-secondary mb-1">
                      David Wanner
                    </h2>
                    <span className="inline-flex items-center gap-1 text-green-600 text-sm font-semibold">
                      <FiCheckCircle className="text-sm" />
                      Verified
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRenterDetails(false);
                      setShowRentOutForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-[#6B4EFF] text-[#6B4EFF] rounded-lg hover:bg-purple-50 transition-colors font-semibold"
                  >
                    <FiEdit className="text-[#6B4EFF]" />
                    <span>Edit</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold">
                    <FiTrash2 className="text-red-600" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-lg border border-lightGray p-6">
              <h2 className="text-xl font-bold text-secondary mb-4">
                Documents
              </h2>
              <div>
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.length > 0 ? (
                    documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 border border-lightGray rounded-lg"
                      >
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-600"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-secondary">
                            {doc.name || `Document ${index + 1}.pdf`}
                          </p>
                          <p className="text-xs text-darkGray">
                            {doc.size
                              ? `${(doc.size / 1024).toFixed(0)} KB`
                              : "Unknown size"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-4 border border-lightGray rounded-lg">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-600"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-secondary">
                            Rental Agreement.pdf
                          </p>
                          <p className="text-xs text-darkGray">124 KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border border-lightGray rounded-lg">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-600"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-secondary">
                            Tenant Application.pdf
                          </p>
                          <p className="text-xs text-darkGray">14 KB</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Renter Feedback Section */}
            <div className="bg-white rounded-lg border border-lightGray p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-secondary">
                  Renter Feedback
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowRenterDetails(false);
                      setShowRentOutForm(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiEdit className="text-[#6B4EFF]" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <FiTrash2 className="text-red-600" />
                  </button>
                </div>
              </div>
              <textarea
                value={renterFeedback}
                onChange={(e) => setRenterFeedback(e.target.value)}
                placeholder="Add your property renter feedback"
                rows="4"
                className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {/* Pending Tab - Show Renter Details */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-lg border border-lightGray p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-secondary mb-2">
                  Listing Status
                </h2>
                <p className="text-sm text-darkGray">Name: John Doe</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-lightGray rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-secondary">
                  View
                </button>
                <button className="px-4 py-2 bg-[#6B4EFF] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-semibold">
                  Edit
                </button>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-bold text-secondary mb-4">
                Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border border-lightGray rounded-lg">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-600"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary">
                      Rental Agreement.pdf
                    </p>
                    <p className="text-xs text-darkGray">124 KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-lightGray rounded-lg">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-600"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary">
                      Tenant Application.pdf
                    </p>
                    <p className="text-xs text-darkGray">14 KB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Feedback */}
            <div>
              <h3 className="text-lg font-bold text-secondary mb-4">
                Rental Feedback
              </h3>
              <textarea
                placeholder="Add your property renter feedback"
                rows="4"
                className="w-full px-4 py-3 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {/* Property Status Info Card */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">
            Property Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <p className="text-xs text-darkGray mb-1">Status</p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                {propertyData.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-darkGray mb-1">Date Added</p>
              <p className="text-sm font-semibold text-secondary">
                {propertyData.dateAdded}
              </p>
            </div>
            <div>
              <p className="text-xs text-darkGray mb-1">Approved On</p>
              <p className="text-sm font-semibold text-secondary">
                {propertyData.approvedOn}
              </p>
            </div>
            <div>
              <p className="text-xs text-darkGray mb-1">Valid Until</p>
              <p className="text-sm font-semibold text-secondary">
                {propertyData.validUntil}
              </p>
            </div>
            <div>
              <p className="text-xs text-darkGray mb-1">Views</p>
              <div className="flex items-center gap-2">
                <FiEye className="text-darkGray" />
                <p className="text-sm font-semibold text-secondary">
                  {propertyData.views}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-darkGray mb-1">Leads</p>
              <div className="flex items-center gap-2">
                <FiUser className="text-darkGray" />
                <p className="text-sm font-semibold text-secondary">
                  {propertyData.leads}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Property Title & Actions */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-secondary mb-2">
                {propertyData.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-darkGray">
                  <FiMapPin />
                  <span className="text-sm">{propertyData.address}</span>
                </div>
                <span className="text-sm text-darkGray">
                  ID: {propertyData.id}
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-darkGray"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span className="text-sm text-secondary">
                      {propertyData.bedrooms}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-darkGray"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span className="text-sm text-secondary">
                      {propertyData.bathrooms}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-lightGray rounded-lg hover:bg-gray-50 transition-colors">
                <FiShare2 className="text-secondary" />
                <span className="text-sm font-semibold text-secondary">
                  Share
                </span>
              </button>
              <button
                onClick={() => setShowRentOutForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#6B4EFF] text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <FiEdit className="text-white" />
                <span className="text-sm font-semibold">Edit</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-opacity-90 transition-colors">
                <FiTrash2 className="text-white" />
                <span className="text-sm font-semibold">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Property Images */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <div className="mb-4">
            <img
              src={selectedImage}
              alt={propertyData.title}
              className="w-full h-[400px] md:h-[500px] object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[propertyData.mainImage, ...propertyData.thumbnails].map(
              (img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === img
                      ? "border-[#6B4EFF]"
                      : "border-lightGray hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-24 md:h-32 object-cover"
                  />
                </button>
              )
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">Description</h2>
          <p className="text-darkGray leading-relaxed">
            {propertyData.description}
          </p>
        </div>

        {/* Property Details & Amenities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Details */}
          <div className="bg-white rounded-lg border border-lightGray p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">
              Property Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-darkGray mb-1">Monthly Rent</p>
                <p className="text-lg font-semibold text-secondary">
                  {propertyData.monthlyRent}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Property Type</p>
                <p className="text-sm font-semibold text-secondary">
                  {propertyData.propertyType}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Furnished Status</p>
                <p className="text-sm font-semibold text-secondary">
                  {propertyData.furnishedStatus}
                </p>
              </div>
              <div>
                <p className="text-xs text-darkGray mb-1">Available From</p>
                <p className="text-sm font-semibold text-secondary">
                  {propertyData.availableFrom}
                </p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg border border-lightGray p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">Amenities</h2>
            <div className="grid grid-cols-2 gap-4">
              {propertyData.amenities.map((amenity, index) => {
                const Icon = amenity.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    {Icon && <Icon className="text-[#6B4EFF] text-xl" />}
                    <span className="text-sm text-secondary">
                      {amenity.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Utilities */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">Utilities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyData.utilities.map((utility, index) => {
              const Icon = utility.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  {Icon && <Icon className="text-yellow-500 text-xl" />}
                  <span className="text-sm text-secondary">{utility.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">Location</h2>
          <div className="mb-4">
            <div className="flex items-center gap-2 text-darkGray mb-4">
              <FiMapPin />
              <span className="text-sm">{propertyData.address}</span>
            </div>
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-lightGray">
              <div className="text-center">
                <FiMapPin className="text-gray-400 text-4xl mx-auto mb-2" />
                <p className="text-darkGray">Map preview</p>
              </div>
            </div>
          </div>
        </div>

        {/* Renter Profile Description */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">
            Renter Profile Description
          </h2>
          <p className="text-darkGray leading-relaxed">
            {readMore
              ? propertyData.renterProfileDescription
              : `${propertyData.renterProfileDescription.substring(0, 150)}...`}
          </p>
          <button
            onClick={() => setReadMore(!readMore)}
            className="text-[#6B4EFF] font-semibold mt-2 hover:underline"
          >
            {readMore ? "Read less" : "Read more"}
          </button>
        </div>

        {/* Preferred Renter Type */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">
            Preferred Renter Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {propertyData.preferredRenterTypes.map((type, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    type.checked
                      ? "bg-[#6B4EFF] border-[#6B4EFF]"
                      : "border-lightGray bg-white"
                  }`}
                >
                  {type.checked && (
                    <FiCheckCircle className="text-white text-sm" />
                  )}
                </div>
                <span className="text-sm text-secondary">{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Requirements */}
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">
            Additional Requirements
          </h2>
          <p className="text-darkGray leading-relaxed">
            {propertyData.additionalRequirements}
          </p>
        </div>
      </div>

      {/* Rent Out Details Section */}
      {showRentOutForm && (
        <div className="bg-white rounded-lg border border-lightGray p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-secondary mb-2">
              Rent Out Details
            </h2>
            <p className="text-sm text-darkGray">
              Add your renter details whom you rented this property.
            </p>
          </div>

          <div className="space-y-6">
            {/* Renter's Email Address */}
            <div>
              <label className="block text-base font-semibold text-secondary mb-2">
                Renter's Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={renterEmail}
                  onChange={(e) => setRenterEmail(e.target.value)}
                  placeholder="Search renter's email address"
                  className="w-full px-4 py-3 pr-12 border border-lightGray rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent bg-gray-50"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-[#6B4EFF] rounded-lg hover:bg-opacity-90 transition-colors">
                  <FiSearch className="text-white" />
                </button>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <label className="block text-base font-semibold text-secondary mb-2">
                Documents
              </label>
              <FileUpload
                onFilesChange={setDocuments}
                acceptedTypes=".pdf,.doc,.docx,.png"
                maxFiles={3}
                uploadedFiles={documents}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                // Handle save logic here
                console.log("Saving rent out details:", {
                  renterEmail,
                  documents,
                });
                setShowRentOutForm(false);
                // Reset form
                setRenterEmail("");
                setDocuments([]);
              }}
              className="bg-[#6B4EFF] text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-opacity"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default PropertyDetail;
