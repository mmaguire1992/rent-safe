import { useEffect, useRef, useState } from "react";
import {
  FiMoreVertical,
  FiPaperclip,
  FiSend,
  FiTrash2,
  FiSlash,
} from "react-icons/fi";
import MediumCheckedIcon from "../../svg/mediumCheckedIcon";
import ThreeDotsIcon from "../../svg/threeDotsIcon";
import BlockIcon from "../../svg/blockIcon";
import GrayRemoveIcon from "../../svg/grayRemoveIcon";
import BlueEditIcon from "../../svg/blueEditIcon";
import SendWhiteIcon from "../../svg/sendWhiteIcon";

function ChatView({
  selectedConversation,
  chatMessages,
  messageText,
  setMessageText,
  onSendMessage,
  onSendOffer,
  onProfileClick,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

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

  const handleSelectOption = (action) => {
    console.log(`Clicked ${action} for`, selectedConversation?.name);
    setShowMenu(false);
  };

  return (
    <>
      {/* Chat Header */}
      <div className="p-4 md:p-6 border-b border-lightGray flex items-center justify-between relative">
        <div
          onClick={onProfileClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            {selectedConversation.hasPhoto ? (
              <img
                src={selectedConversation.photoUrl}
                alt={selectedConversation.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#6B4EFF] flex items-center justify-center text-white font-bold">
                {selectedConversation.initials}
              </div>
            )}
            {selectedConversation.unread > 0 && (
              <span className="absolute -bottom-0 -right-1  text-green-600 bg-white rounded-full text-xl">
                <MediumCheckedIcon />
              </span>
            )}
          </div>
          <div>
            <h2 className="font-normal text-[#0F172B] text-base font-nunito">
              {selectedConversation.name}
            </h2>
            <p className="text-base text-[#62748E] font-normal font-nunito">
              {selectedConversation.property}
            </p>
          </div>
        </div>
        <div ref={menuRef} className="flex items-center gap-3">
          <button
            onClick={onSendOffer}
            className="bg-blueGradient text-white px-4 py-2 rounded-[10px]  hover:bg-opacity-90 transition-colors text-base font-nunito font-bold"
          >
            Send Offer
          </button>
          <button
            onClick={handleToggleMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <ThreeDotsIcon />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-[62px] bg-white shadow-lg border border-lightGray rounded-lg w-32 z-10">
              <button
                onClick={() => handleSelectOption("block")}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:bg-gray-50"
              >
                <BlockIcon />
                <span>Block</span>
              </button>
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[calc(100vh-200px)]">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "you" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender !== "you" && (
              <div className="w-9 h-9 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[#1447E6] font-normal text-sm mr-3 flex-shrink-0">
                {msg.senderInitials}
              </div>
            )}
            <div
              className={`max-w-[70%]  ${
                msg.sender === "you" ? "order-2" : ""
              }`}
            >
              {msg.type === "offer" ? (
                <div className=" border bg-[#E6E8EC] border-lightGray rounded-[18px] p-4 overflow-hidden">
                  <div className="bg-[#E6E8EC] text-white flex items-center gap-2">
                    <span className="font-semibold bg-[#4A2FCC] rounded-[10px] px-2 py-1">
                      {msg.message.rent}
                    </span>
                    <BlueEditIcon />
                  </div>
                  <div className=" space-y-2">
                    <div>
                      <span className="text-base font-normal font-nunito text-darkGray">
                        Property
                      </span>
                      <p className="font-normal font-nunito text-secondary text-sm">
                        {msg.message.property}
                      </p>
                    </div>
                    <div>
                      <span className="text-base font-semibold font-nunito text-darkGray">
                        Requirements:
                      </span>
                      <p className="text-base font-normal font-nunito text-secondary">
                        {msg.message.requirements}
                      </p>
                      <p className="text-sm font-normal font-nunito text-[#62748E] mt-1">
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#F1F5F9] rounded-[18px] px-4 py-3">
                  <p className="text-[#0F172B] text-base font-normal font-nunito">
                    {msg.message}
                  </p>
                  <p className="text-sm font-normal font-nunito text-[#62748E] mt-1">
                    {msg.time}
                  </p>
                </div>
              )}
            </div>
            {msg.sender === "you" && (
              <div className="w-9 h-9 rounded-full bg-[#DBEAFE] flex items-center justify-center text-blue-600 font-bold text-sm mr-3 flex-shrink-0 order-1">
                Y
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 md:p-6 border-t border-lightGray">
        <div className="flex items-center gap-3">
          <button className="p-0 transition-colors">
            <FiPaperclip className="text-secondary text-xl" />
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
            className="flex-1 px-4 py-3 h-[56px] border border-lightGray rounded-xl focus:outline-none focus:ring-0"
          />
          <button
            onClick={onSendMessage}
            className="bg-[#6B4EFF] flex items-center justify-center w-[56px] h-[56px] text-white p-3 rounded-[10px] hover:bg-opacity-90 transition-colors"
          >
            <SendWhiteIcon />
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatView;
