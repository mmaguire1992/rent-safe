import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FiSearch } from "react-icons/fi";
import {
  allMessages,
  messageRequests,
  getChatMessages,
  getTenantData,
} from "@/constant";
import TenantProfileDetail from "@/components/Messages/TenantProfileDetail";
import ChatView from "@/components/Messages/ChatView";
import SendOfferModal from "@/components/TenantProfile/SendOfferModal";
import BlueSearchIcon from "../../svg/blueSearchIcon";
import MediumCheckedIcon from "../../svg/mediumCheckedIcon";
import ChatBlueStartIcon from "../../svg/chatBlueStartIcon";

function Messages() {
  const [activeTab, setActiveTab] = useState("requests"); // "all" or "requests"
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerFormData, setOfferFormData] = useState({
    property: "",
    monthlyRent: "",
    requirements: "",
  });

  const conversations = activeTab === "all" ? allMessages : messageRequests;

  const chatMessages = getChatMessages(selectedConversation?.id);

  const tenantData =
    selectedConversation && showProfileDetail
      ? getTenantData(selectedConversation.id)
      : null;

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Handle send message logic here
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  const handleSendOffer = () => {
    setIsOfferModalOpen(true);
  };

  const handleOfferSubmit = () => {
    console.log("Sending offer:", offerFormData);
    setIsOfferModalOpen(false);
    setOfferFormData({
      property: "",
      monthlyRent: "",
      requirements: "",
    });
  };

  const handleProfileClick = () => {
    if (selectedConversation) {
      setShowProfileDetail(true);
    }
  };

  const handleBackToChat = () => {
    setShowProfileDetail(false);
  };

  return (
    <DashboardLayout>
      <div className="block">
        <h1 className="text-xl xl:text-2xl font-bold text-secondary mb-4">
          Messages{" "}
        </h1>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => {
              setActiveTab("all");
              setSelectedConversation(null);
            }}
            className={`relative pb-2 px-2 font-semibold text-base xl:text-lg font-nunito flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === "all"
                ? "text-[#6B4EFF]  border-[#6B4EFF]"
                : "text-darkGray border-transparent"
            }`}
          >
            All Messages
            <span
              className={`${
                activeTab === "all"
                  ? "text-white bg-[#6B4EFF]"
                  : "text-[#4A2FCC] bg-[#E8E2FF]"
              } relative text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center`}
            >
              {allMessages.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("requests");
              setSelectedConversation(null);
            }}
            className={`relative pb-2 font-semibold px-2 text-base xl:text-lg font-nunito flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === "requests"
                ? "text-[#6B4EFF]  border-[#6B4EFF]"
                : "text-darkGray border-transparent"
            }`}
          >
            Message Requests
            <span
              className={`${
                activeTab === "requests"
                  ? "text-white bg-[#6B4EFF]"
                  : "text-[#4A2FCC] bg-[#E8E2FF]"
              } relative text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center`}
            >
              {messageRequests.length}
            </span>
          </button>
        </div>

        <div
          className={`flex gap-0 bg-white rounded-[20px]   ${
            !showProfileDetail && "border border-lightGray"
          }`}
        >
          {/* Left Panel - Message List */}
          {!showProfileDetail && (
            <div className="w-full md:w-96 lg:w-[400px] rounded-tl-[20px] rounded-bl-[20px] bg-white border-r border-lightGray flex flex-col">
              {/* Header */}
              <div className="p-4 6 border-b border-lightGray">
                {/* Tabs */}

                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg md:text-xl">
                    <BlueSearchIcon />
                  </span>

                  <input
                    type="text"
                    placeholder="Search Messages"
                    className="w-full pl-9 md:pl-10 pr-3 h-12 md:pr-4 py-1.5 md:py-2 border border-lightGray rounded-xl focus:outline-none focus:ring-0 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1  overflow-y-auto max-h-[calc(100vh-200px)]">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                    }}
                    className={`p-4 bg-[#F8F8F8] border-b border-lightGray cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? "bg-purple-50"
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
                          <div className="w-12 h-12 rounded-full bg-white  flex items-center justify-center text-[#6B4EFF] font-bold">
                            {conversation.initials}
                          </div>
                        )}
                        {conversation.unread > 0 && (
                          <span className="absolute -bottom-0 -right-1  text-green-600 bg-white rounded-full text-xl">
                            <MediumCheckedIcon />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-normal font-nunito text-[#0F172B] text-base truncate">
                            {conversation.name}
                          </h3>
                          <span className="text-white bg-[#009966] w-6 h-6 rounded-full flex items-center justify-center text-sm font-normal">
                            {conversation.unread}
                          </span>
                        </div>
                        <p className="text-sm font-normal font-nunito text-[#45556C] mb-1 truncate">
                          {conversation.property}
                        </p>
                        <p className="text-base font-normal font-nunito text-[#45556C] truncate">
                          {conversation.message}
                        </p>
                        <div>
                          {" "}
                          <span className="text-sm text-[#62748E] font-normal font-nunito">
                            {conversation.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right Panel - Chat View or Profile Detail */}
          <div
            className={`flex flex-col bg-white rounded-tr-[20px] rounded-br-[20px] overflow-y-auto ${
              showProfileDetail ? "w-full" : "flex-1"
            }`}
          >
            {showProfileDetail && tenantData ? (
              <TenantProfileDetail
                tenantData={tenantData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onBack={handleBackToChat}
                onSendOffer={handleSendOffer}
                allMessagesCount={allMessages.length}
                messageRequestsCount={messageRequests.length}
              />
            ) : selectedConversation ? (
              <ChatView
                selectedConversation={selectedConversation}
                chatMessages={chatMessages}
                messageText={messageText}
                setMessageText={setMessageText}
                onSendMessage={handleSendMessage}
                onSendOffer={handleSendOffer}
                onProfileClick={handleProfileClick}
              />
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center  bg-[#F9F9FC] justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center mx-auto mb-4">
                    <ChatBlueStartIcon />
                  </div>
                  <h3 className=" text-lg lg:text-2xl font-bold text-[#4A2FCC] mb-2">
                    No conversation selected
                  </h3>
                  <p className="text-darkGray text-base font-normal font-nunito">
                    Engage with potential renters
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Offer Modal */}
      <SendOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        formData={offerFormData}
        setFormData={setOfferFormData}
        onSend={handleOfferSubmit}
      />
    </DashboardLayout>
  );
}

export default Messages;
