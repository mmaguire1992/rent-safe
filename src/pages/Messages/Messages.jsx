import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FiSearch, FiMoreVertical, FiPaperclip, FiSend, FiChevronLeft, FiMail, FiPhone } from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import {
  allMessages,
  messageRequests,
  getChatMessages,
  getTenantData as getTenantDataFromConstant,
} from "@/constant";

function Messages() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("requests"); // "all" or "requests"
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showRequestDetail, setShowRequestDetail] = useState(false);
  const [messageText, setMessageText] = useState("");

  const conversations = activeTab === "all" ? allMessages : messageRequests;

  const chatMessages = getChatMessages(selectedConversation?.id);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Handle send message logic here
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  const handleSendOffer = () => {
    // Navigate to send offer or open modal
    navigate(`/dashboard/tenant/${selectedConversation?.id}/offer`);
  };

  const tenantData = selectedConversation && showRequestDetail && activeTab === "requests"
    ? getTenantDataFromConstant(selectedConversation.id)
    : null;

  const creditPercentage = tenantData
    ? (tenantData.creditScore / tenantData.creditMax) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-80px)] bg-gray-50">
        {/* Left Panel - Message List */}
        <div className="w-full md:w-96 lg:w-[400px] bg-white border-r border-lightGray flex flex-col">
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-lightGray">
            <h1 className="text-2xl font-bold text-secondary mb-4">Messages</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSelectedConversation(null);
                }}
                className={`relative pb-2 font-semibold transition-colors ${
                  activeTab === "all"
                    ? "text-[#6B4EFF] border-b-2 border-[#6B4EFF]"
                    : "text-darkGray"
                }`}
              >
                All Messages
                <span className="absolute -top-1 -right-6 bg-[#6B4EFF] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {allMessages.length}
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("requests");
                  setSelectedConversation(null);
                }}
                className={`relative pb-2 font-semibold transition-colors ${
                  activeTab === "requests"
                    ? "text-[#6B4EFF] border-b-2 border-[#6B4EFF]"
                    : "text-darkGray"
                }`}
              >
                Message Requests
                <span className="absolute -top-1 -right-6 bg-[#6B4EFF] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {messageRequests.length}
                </span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-darkGray" />
              <input
                type="text"
                placeholder="Search Messages"
                className="w-full pl-10 pr-4 py-2 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  if (activeTab === "requests") {
                    setShowRequestDetail(true);
                  } else {
                    setShowRequestDetail(false);
                  }
                }}
                className={`p-4 border-b border-lightGray cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? "bg-purple-50 border-l-4 border-[#6B4EFF]"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    {conversation.hasPhoto ? (
                      <img
                        src={conversation.photoUrl}
                        alt={conversation.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#6B4EFF] flex items-center justify-center text-white font-bold">
                        {conversation.initials}
                      </div>
                    )}
                    {conversation.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {conversation.unread}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-secondary text-sm truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-darkGray ml-2">
                        {conversation.time}
                      </span>
                    </div>
                    <p className="text-xs text-darkGray mb-1 truncate">
                      {conversation.property}
                    </p>
                    <p className="text-sm text-darkGray truncate">
                      {conversation.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Chat View or Request Detail */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          {showRequestDetail && activeTab === "requests" && tenantData ? (
            /* Message Request Detail View */
            <div className="p-4 md:p-6 space-y-6">
              {/* Back Button */}
              <button
                onClick={() => {
                  setShowRequestDetail(false);
                  setSelectedConversation(null);
                }}
                className="flex items-center gap-2 text-[#6B4EFF] font-semibold mb-4 hover:underline"
              >
                <FiChevronLeft />
                <span>Back</span>
              </button>

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
                      onClick={() => {
                        setShowRequestDetail(false);
                      }}
                      className="bg-[#6B4EFF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/tenant/${selectedConversation.id}`)}
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
                      <p className="text-xs text-darkGray mb-1">Employment Type</p>
                      <p className="font-semibold text-secondary">
                        {tenantData.employment.employmentType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-darkGray mb-1">Company</p>
                      <p className="font-semibold text-secondary">
                        {tenantData.employment.company}
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
              </div>
            </div>
          ) : selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-lightGray flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedConversation.hasPhoto ? (
                    <img
                      src={selectedConversation.photoUrl}
                      alt={selectedConversation.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#6B4EFF] flex items-center justify-center text-white font-bold">
                      {selectedConversation.initials}
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-secondary">
                      {selectedConversation.name}
                    </h2>
                    <p className="text-sm text-darkGray">
                      {selectedConversation.property}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSendOffer}
                    className="bg-[#6B4EFF] text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-sm"
                  >
                    Send Offer
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <FiMoreVertical className="text-secondary" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "you" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender !== "you" && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm mr-2 flex-shrink-0">
                        {msg.senderInitials}
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] ${
                        msg.sender === "you" ? "order-2" : ""
                      }`}
                    >
                      {msg.type === "offer" ? (
                        <div className="bg-white border border-lightGray rounded-lg overflow-hidden">
                          <div className="bg-[#6B4EFF] text-white px-4 py-2 flex items-center justify-between">
                            <span className="font-semibold">{msg.message.rent}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-white"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </div>
                          <div className="p-4 space-y-2">
                            <div>
                              <span className="text-xs text-darkGray">Property</span>
                              <p className="font-semibold text-secondary text-sm">
                                {msg.message.property}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-darkGray">
                                Requirements:
                              </span>
                              <p className="text-sm text-secondary">
                                {msg.message.requirements}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-lg px-4 py-3">
                          <p className="text-secondary text-sm">{msg.message}</p>
                        </div>
                      )}
                      <p className="text-xs text-darkGray mt-1">
                        {msg.time}
                      </p>
                    </div>
                    {msg.sender === "you" && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm ml-2 flex-shrink-0 order-1">
                        Y
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 md:p-6 border-t border-lightGray">
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <FiPaperclip className="text-secondary text-xl" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-[#6B4EFF] text-white p-3 rounded-full hover:bg-opacity-90 transition-colors"
                  >
                    <FiSend className="text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B4EFF"
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#6B4EFF] mb-2">
                  No conversation selected
                </h3>
                <p className="text-darkGray">
                  Engage with potential renters
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Messages;

