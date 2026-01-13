'use client'

import { useEffect, useRef, useState } from "react";
import {
  FiMoreVertical,
  FiPaperclip,
  FiSend,
  FiTrash2,
  FiSlash,
} from "react-icons/fi";
import MediumCheckedIcon from "@/svg/mediumCheckedIcon";
import ThreeDotsIcon from "@/svg/threeDotsIcon";
import BlockIcon from "@/svg/blockIcon";
import GrayRemoveIcon from "@/svg/grayRemoveIcon";
import BlueEditIcon from "@/svg/blueEditIcon";
import SendWhiteIcon from "@/svg/sendWhiteIcon";

function ChatView({
  selectedConversation,
  chatMessages,
  messageText,
  setMessageText,
  onSendMessage,
  onSendOffer,
  onProfileClick,
  messagesEndRef,
  messagesTopRef,
  onScroll,
  loadingMoreMessages,
  hasMoreMessages,
  messagesContainerRef,
  onFileSelect,
  onDeleteChatroom,
  onBlockChatroom,
  onUnblockChatroom,
  isBlocked = false,
  isBlockedByCurrentUser = false,
  isCurrentUserBlocked = false,
  isVerified = true,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleSelectOption = (action) => {
    setShowMenu(false);
    if (!selectedConversation) return;
    
    const chatroomId = selectedConversation.id || selectedConversation.chatroomId;
    
    if (action === "delete" && onDeleteChatroom) {
      onDeleteChatroom(chatroomId);
    } else if (action === "block" && onBlockChatroom) {
      onBlockChatroom(chatroomId);
    } else if (action === "unblock" && onUnblockChatroom) {
      onUnblockChatroom(chatroomId);
    }
  };

  const handleUnblockFromInput = () => {
    if (!onUnblockChatroom || !selectedConversation) return;
    const chatroomId = selectedConversation.id || selectedConversation.chatroomId;
    onUnblockChatroom(chatroomId);
  };

  return (
    <>
      {/* Chat Header */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-lightGray flex items-center justify-between relative">
        <div
          onClick={onProfileClick}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-1 min-w-0"
        >
          <div className="relative flex-shrink-0">
            {selectedConversation.hasPhoto ? (
              <img
                src={selectedConversation.photoUrl}
                alt={selectedConversation.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6B4EFF] flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {selectedConversation.initials}
              </div>
            )}
            {selectedConversation.unread > 0 && (
              <span className="absolute -bottom-0 -right-1 text-green-600 bg-white rounded-full">
                <MediumCheckedIcon />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-normal text-[#0F172B] text-sm sm:text-base font-nunito truncate">
              {selectedConversation.name}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#62748E] font-normal font-nunito truncate">
              {selectedConversation.property}
            </p>
          </div>
        </div>
        <div
          ref={menuRef}
          className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
        >
          {/* <button
            onClick={onSendOffer}
            className="bg-blueGradient text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-[10px] hover:bg-opacity-90 transition-colors text-xs sm:text-sm md:text-base font-nunito font-bold whitespace-nowrap"
          >
            Send Offer
          </button> */}
          <button
            onClick={handleToggleMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <ThreeDotsIcon />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-[62px] bg-white shadow-lg border border-lightGray rounded-lg w-32 z-10">
              {isBlockedByCurrentUser ? (
                <button
                  onClick={() => handleSelectOption("unblock")}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:bg-gray-50"
                >
                  <BlockIcon />
                  <span>Unblock</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSelectOption("block")}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:bg-gray-50"
                >
                  <BlockIcon />
                  <span>Block</span>
                </button>
              )}
              <button
                onClick={() => handleSelectOption("delete")}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:bg-gray-50 border-t border-lightGray"
              >
                <GrayRemoveIcon />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)] md:max-h-[calc(100vh-200px)]"
        style={{ overflowAnchor: 'none' }}
      >
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center">
              <p className="text-[#62748E] text-base font-normal font-nunito">No messages yet</p>
              <p className="text-[#62748E] text-sm font-normal font-nunito mt-2">Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          <>
            {/* Load more messages indicator */}
            {loadingMoreMessages && (
              <div className="flex items-center justify-center py-2">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#6B4EFF] border-t-transparent"></div>
              </div>
            )}
            {messagesTopRef && <div ref={messagesTopRef} className="h-1" />}
            {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "you" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender !== "you" && (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[#1447E6] font-normal text-xs sm:text-sm mr-2 sm:mr-3 flex-shrink-0">
                {msg.senderInitials}
              </div>
            )}
            <div
              className={`max-w-[75%] sm:max-w-[70%] ${
                msg.sender === "you" ? "order-2" : ""
              }`}
            >
              {msg.type === "offer" ? (
                <div className="border bg-[#E6E8EC] border-lightGray rounded-[18px] p-3 sm:p-4 overflow-hidden">
                  <div className="bg-[#E6E8EC] text-white flex items-center gap-2 mb-2">
                    <span className="font-semibold bg-[#4A2FCC] rounded-[10px] px-2 py-1 text-xs sm:text-sm">
                      {msg.message.rent}
                    </span>
                    <BlueEditIcon />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm sm:text-base font-normal font-nunito text-darkGray">
                        Property
                      </span>
                      <p className="font-normal font-nunito text-secondary text-xs sm:text-sm">
                        {msg.message.property}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm sm:text-base font-semibold font-nunito text-darkGray">
                        Requirements:
                      </span>
                      <p className="text-sm sm:text-base font-normal font-nunito text-secondary">
                        {msg.message.requirements}
                      </p>
                      <p className="text-xs sm:text-sm font-normal font-nunito text-[#62748E] mt-1">
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              ) : msg.type === "image" || msg.type === "video" || msg.type === "document" ? (
                <div className="bg-[#F1F5F9] rounded-[18px] p-2 sm:p-3 overflow-hidden">
                  {msg.type === "image" && msg.fileUrl && (
                    <div className="mb-2">
                      <img 
                        src={msg.fileUrl} 
                        alt={msg.fileName || "Image"} 
                        className="max-w-full h-auto rounded-lg cursor-pointer"
                        onClick={() => window.open(msg.fileUrl, '_blank')}
                      />
                    </div>
                  )}
                  {msg.type === "video" && msg.fileUrl && (
                    <div className="mb-2">
                      <video 
                        src={msg.fileUrl} 
                        controls 
                        className="max-w-full h-auto rounded-lg"
                        style={{ maxHeight: '400px' }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {msg.type === "document" && msg.fileUrl && (
                    <div className="mb-2 flex items-center gap-2 p-2 bg-white rounded-lg">
                      <FiPaperclip className="text-[#6B4EFF] text-xl" />
                      <a 
                        href={msg.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#6B4EFF] hover:underline text-sm sm:text-base font-normal font-nunito flex-1"
                      >
                        {msg.fileName || "Document"}
                      </a>
                      {msg.fileSize && (
                        <span className="text-xs text-[#62748E]">
                          {(msg.fileSize / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  )}
                  {msg.message && (
                    <p className="text-[#0F172B] text-sm sm:text-base font-normal font-nunito break-words">
                      {msg.message}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm font-normal font-nunito text-[#62748E] mt-1">
                    {msg.time}
                  </p>
                </div>
              ) : (
                <div className="bg-[#F1F5F9] rounded-[18px] px-3 sm:px-4 py-2 sm:py-3">
                  <p className="text-[#0F172B] text-sm sm:text-base font-normal font-nunito break-words">
                    {msg.message}
                  </p>
                  <p className="text-xs sm:text-sm font-normal font-nunito text-[#62748E] mt-1">
                    {msg.time}
                  </p>
                </div>
              )}
            </div>
            {msg.sender === "you" && (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#DBEAFE] flex items-center justify-center text-blue-600 font-bold text-xs sm:text-sm mr-2 sm:mr-3 flex-shrink-0 order-1">
                Y
              </div>
            )}
          </div>
            ))}
            {messagesEndRef && <div ref={messagesEndRef} className="h-1" />}
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        className="hidden"
      />

      {/* Message Input */}
      <div className="p-3 sm:p-4 md:p-6 border-t border-lightGray">
        {isCurrentUserBlocked ? (
          <div className="text-center py-4">
            <p className="text-gray-600 text-sm mb-2">
              {selectedConversation?.name || 'This user'} has blocked you
            </p>
          </div>
        ) : !isVerified ? (
          <div className="text-center py-4">
            <p className="text-gray-600 text-sm mb-2">
              Your profile is not approved yet. Please wait for admin verification to chat with other users.
            </p>
          </div>
        ) : isBlockedByCurrentUser ? (
          <div className="space-y-3">
            <div className="text-center py-2">
              <p className="text-gray-600 text-sm mb-3">
                You cannot chat as you blocked this user. Please unblock to chat.
              </p>
              <button
                onClick={handleUnblockFromInput}
                className="text-[#6B4EFF] hover:text-[#4A2FCC] font-semibold text-sm underline"
              >
                Unblock
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 opacity-50 pointer-events-none">
              <button 
                className="p-0 transition-colors flex-shrink-0"
                type="button"
                disabled
              >
                <FiPaperclip className="text-secondary text-lg sm:text-xl" />
              </button>
              <input
                type="text"
                value=""
                placeholder="Type a message..."
                disabled
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 h-[48px] sm:h-[56px] border border-lightGray rounded-xl focus:outline-none focus:ring-0 text-sm sm:text-base bg-gray-100"
              />
              <button
                disabled
                className="bg-gray-400 flex items-center justify-center w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] text-white p-2 sm:p-3 rounded-[10px] flex-shrink-0 cursor-not-allowed"
              >
                <SendWhiteIcon />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleAttachClick}
              className="p-0 transition-colors flex-shrink-0 hover:opacity-70"
              type="button"
            >
              <FiPaperclip className="text-secondary text-lg sm:text-xl" />
            </button>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 h-[48px] sm:h-[56px] border border-lightGray rounded-xl focus:outline-none focus:ring-0 text-sm sm:text-base"
            />
            <button
              onClick={onSendMessage}
              className="bg-[#6B4EFF] flex items-center justify-center w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] text-white p-2 sm:p-3 rounded-[10px] hover:bg-opacity-90 transition-colors flex-shrink-0"
            >
              <SendWhiteIcon />
            </button>
          </div>
        )}
      </div>

    </>
  );
}

export default ChatView;
