'use client'

import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import { FiSearch } from "react-icons/fi";
import TenantProfileDetail from "@/components/adminDashboard/Messages/TenantProfileDetail";
import ChatView from "@/components/adminDashboard/Messages/ChatView";
import SendOfferModal from "@/components/adminDashboard/TenantProfile/SendOfferModal";
import BlueSearchIcon from "@/svg/blueSearchIcon";
import MediumCheckedIcon from "@/svg/mediumCheckedIcon";
import ChatBlueStartIcon from "@/svg/chatBlueStartIcon";
import { getChatrooms, getChatroomMessages } from "@/api/chat";
import { getCurrentUser, getUserById } from "@/api/users";
import { useSocket, SOCKET_EVENTS } from "@/hooks/useSocket";
import { toast } from "react-toastify";

function Messages() {
  const [chatrooms, setChatrooms] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  // Initialize activeTab from localStorage or default to "all"
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('messagesActiveTab');
      return savedTab === 'requests' ? 'requests' : 'all';
    }
    return 'all';
  });
  const [tenantProfileData, setTenantProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const {
    isConnected,
    sendMessage: socketSendMessage,
    joinChatroom,
    leaveChatroom,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    on,
  } = useSocket();

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch chatrooms
  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        setLoading(true);
        const data = await getChatrooms();
        // Normalize lastMessage to object format if it's a string
        const normalizedChatrooms = (data || []).map(chatroom => {
          if (chatroom.lastMessage && typeof chatroom.lastMessage === 'string') {
            return {
              ...chatroom,
              lastMessage: {
                text: chatroom.lastMessage,
                createdAt: chatroom.lastMessageAt,
              },
            };
          } else if (chatroom.lastMessage && typeof chatroom.lastMessage === 'object' && !chatroom.lastMessage.text) {
            // If it's an object but doesn't have text property, extract it
            return {
              ...chatroom,
              lastMessage: {
                text: chatroom.lastMessage.text || chatroom.lastMessage || '',
                createdAt: chatroom.lastMessage.createdAt || chatroom.lastMessageAt,
                userId: chatroom.lastMessage.userId,
              },
            };
          }
          return chatroom;
        });
        setChatrooms(normalizedChatrooms);
      } catch (error) {
        console.error('Error fetching chatrooms:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchChatrooms();
  }, []);

  // Auto-select conversation if there's only one
  useEffect(() => {
    if (chatrooms.length === 1 && !selectedConversation && currentUser && !loading) {
      const chatroom = chatrooms[0];
      // Normalize IDs for comparison
      const currentUserId = String(currentUser?._id || currentUser?.id || '');
      const chatroomUserId = String(chatroom.userId?._id || chatroom.userId?.id || chatroom.userId || '');
      const otherUser = currentUserId && chatroomUserId && currentUserId === chatroomUserId
        ? chatroom.memberId
        : chatroom.userId;

      const conversation = {
        id: chatroom._id || chatroom.id,
        chatroomId: chatroom._id || chatroom.id,
        name: otherUser
          ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email
          : 'Unknown User',
        initials: otherUser
          ? `${otherUser.firstName?.[0] || ''}${otherUser.lastName?.[0] || ''}`.toUpperCase() || otherUser.email?.[0]?.toUpperCase()
          : 'U',
        hasPhoto: false,
        photoUrl: null,
        unread: chatroom.unreadCount || 0,
        property: '',
        message: chatroom.lastMessage?.text || '',
        time: chatroom.lastMessageAt ? new Date(chatroom.lastMessageAt).toLocaleDateString() : '',
        otherUser,
      };

      setSelectedConversation(conversation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatrooms.length, selectedConversation, currentUser, loading]);

  // Socket event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Listen for new messages
    const unsubscribeNewMessage = on(SOCKET_EVENTS.NEW_MESSAGE, (data) => {
      if (data && data.data) {
        const message = data.data;
        // Extract chatroomId - handle both string and populated object
        const chatroomId = message.chatroomId?._id || message.chatroomId?.id || message.chatroomId || '';
        const chatroomIdStr = String(chatroomId);

        // Check if message is from current user - if so, skip it here (MESSAGE_SENT will handle it)
        const currentUserId = String(currentUser?._id || currentUser?.id || '');
        const messageUserId = String(message.userId?._id || message.userId?.id || message.userId || '');
        const isFromCurrentUser = currentUserId && messageUserId && currentUserId === messageUserId;

        // Add message if it's for the current chatroom and NOT from current user
        // (Current user's messages are handled by MESSAGE_SENT event)
        if (selectedConversation && chatroomIdStr && chatroomIdStr !== 'undefined' && chatroomIdStr !== 'null' && !isFromCurrentUser) {
          const selectedId = String(selectedConversation.id || selectedConversation.chatroomId || '');
          if (selectedId === chatroomIdStr) {
            const formattedMessage = formatMessage(message);
            setChatMessages(prev => {
              // Avoid duplicates by checking both id and tempId
              const exists = prev.find(m => {
                const mId = String(m.id || '');
                const mTempId = String(m.tempId || '');
                const msgId = String(formattedMessage.id || '');
                const msgTempId = String(formattedMessage.tempId || '');
                return (mId && msgId && mId === msgId) || (mTempId && msgTempId && mTempId === msgTempId);
              });
              if (exists) return prev;
              return [...prev, formattedMessage];
            });
            scrollToBottom();

            // Mark as read since it's from other user
            markMessagesAsRead(chatroomIdStr);
          }
        }

        // Update chatroom list with last message and increment unread count (for all messages, including own)
        if (chatroomIdStr && chatroomIdStr !== 'undefined' && chatroomIdStr !== 'null') {
          updateChatroomLastMessage(chatroomIdStr, message);
        }
      }
    });

    // Listen for message sent confirmation (only for sender)
    const unsubscribeMessageSent = on(SOCKET_EVENTS.MESSAGE_SENT, (data) => {
      if (data && data.success && data.data) {
        const message = data.data;
        const formattedMessage = formatMessage(message);
        setChatMessages(prev => {
          // Remove any temporary message by tempId or uniqueId
          const filtered = prev.filter(m => {
            const mTempId = String(m.tempId || '');
            const mId = String(m.id || '');
            const msgUniqueId = String(message.uniqueId || '');
            const msgId = String(formattedMessage.id || '');
            // Keep message if it doesn't match tempId and doesn't already exist with same id
            return mTempId !== msgUniqueId && mId !== msgId;
          });

          // Check if message already exists (avoid duplicate)
          const exists = filtered.find(m => {
            const mId = String(m.id || '');
            const msgId = String(formattedMessage.id || '');
            return mId && msgId && mId === msgId;
          });

          if (exists) return filtered;
          return [...filtered, formattedMessage];
        });
        scrollToBottom();
      }
    });

    // Listen for chatroom updates
    const unsubscribeChatroomUpdate = on(SOCKET_EVENTS.CHATROOM_UPDATED, (data) => {
      if (data && data.data) {
        updateChatroomInList(data.data);
      }
    });

    // Listen for new chatrooms
    const unsubscribeNewChatroom = on(SOCKET_EVENTS.NEW_CHATROOM, (data) => {
      if (data && data.data) {
        // Refresh chatrooms list
        getChatrooms().then(data => {
          setChatrooms(data || []);
        }).catch(console.error);
      }
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageSent();
      unsubscribeChatroomUpdate();
      unsubscribeNewChatroom();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, selectedConversation, currentUser]);

  // Join/leave chatroom when selection changes
  useEffect(() => {
    if (!isConnected) return;

    if (selectedConversation) {
      const chatroomId = String(selectedConversation.id || selectedConversation.chatroomId || '');
      if (chatroomId && chatroomId !== 'undefined' && chatroomId !== 'null') {
        joinChatroom(chatroomId);
        // Mark messages as read when owner opens the conversation
        markMessagesAsRead(chatroomId);
        // Update unread count to 0 after marking as read
        updateChatroomUnreadCount(chatroomId, 0);
      }
    }

    return () => {
      if (selectedConversation) {
        const chatroomId = String(selectedConversation.id || selectedConversation.chatroomId || '');
        if (chatroomId && chatroomId !== 'undefined' && chatroomId !== 'null') {
          leaveChatroom(chatroomId);
        }
      }
    };
  }, [selectedConversation, isConnected, joinChatroom, leaveChatroom, markMessagesAsRead]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setCurrentPage(1);
      setHasMoreMessages(false);
      fetchMessages(selectedConversation, 1, 20); // Load first 20 messages
    } else {
      setChatMessages([]);
      setCurrentPage(1);
      setHasMoreMessages(false);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive (not when loading older messages)
  useEffect(() => {
    if (selectedConversation && chatMessages.length > 0 && !messagesLoading && !loadingMoreMessages) {
      // Only scroll to bottom if we're not loading older messages
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [chatMessages.length, selectedConversation, messagesLoading, loadingMoreMessages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const loadMoreMessages = async () => {
    if (!selectedConversation || loadingMoreMessages || !hasMoreMessages) {
      console.log('loadMoreMessages blocked:', { selectedConversation: !!selectedConversation, loadingMoreMessages, hasMoreMessages });
      return;
    }

    const chatroomId = String(selectedConversation.id || selectedConversation.chatroomId || '');
    if (!chatroomId || chatroomId === 'undefined' || chatroomId === 'null') return;

    try {
      setLoadingMoreMessages(true);
      const nextPage = currentPage + 1;
      console.log('Loading page:', nextPage, 'for chatroom:', chatroomId);

      const result = await getChatroomMessages(chatroomId, nextPage, 20);
      console.log('Received messages:', result?.messages?.length, 'pagination:', result?.pagination);

      if (result && result.messages && result.messages.length > 0) {
        // Backend returns newest first, so page 2 has older messages
        // We need to reverse them to show oldest first when prepending
        const formattedMessages = result.messages.reverse().map(msg => formatMessage(msg));

        // Save current scroll position
        const container = messagesContainerRef.current;
        const previousScrollHeight = container?.scrollHeight || 0;
        const previousScrollTop = container?.scrollTop || 0;

        console.log('Prepending', formattedMessages.length, 'messages. Previous scroll height:', previousScrollHeight);

        // Prepend older messages to the beginning
        setChatMessages(prev => {
          const newMessages = [...formattedMessages, ...prev];
          console.log('Total messages after prepend:', newMessages.length);
          return newMessages;
        });
        setCurrentPage(nextPage);
        setHasMoreMessages(result.pagination?.hasMore || false);

        // Restore scroll position after new messages are added
        setTimeout(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            const scrollDifference = newScrollHeight - previousScrollHeight;
            // Maintain scroll position relative to the top
            container.scrollTop = previousScrollTop + scrollDifference;
            console.log('Restored scroll position. New scrollTop:', container.scrollTop);
          }
        }, 100);
      } else {
        console.log('No more messages to load');
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      toast.error('Failed to load more messages');
    } finally {
      setLoadingMoreMessages(false);
    }
  };


  // Handle scroll to load more messages (infinite scroll)
  const handleScroll = useCallback((e) => {
    const container = e.target || e.currentTarget;
    if (!container) return;

    // If scrolled near the top (within 200px), load more messages
    const scrollTop = container.scrollTop || 0;
    if (scrollTop <= 200 && hasMoreMessages && !loadingMoreMessages) {
      console.log('Loading more messages - scrollTop:', scrollTop, 'hasMore:', hasMoreMessages, 'loading:', loadingMoreMessages);
      loadMoreMessages();
    }
  }, [hasMoreMessages, loadingMoreMessages, loadMoreMessages]);


  const fetchMessages = async (conversation, page = 1, limit = 20) => {
    if (!conversation) return;

    const chatroomId = String(conversation._id || conversation.id || conversation.chatroomId || '');
    if (!chatroomId || chatroomId === 'undefined' || chatroomId === 'null') return;

    try {
      setMessagesLoading(true);
      setChatMessages([]); // Clear previous messages
      const result = await getChatroomMessages(chatroomId, page, limit);
      if (result && result.messages) {
        // Messages are sorted newest first from backend - reverse to show newest at bottom
        const formattedMessages = result.messages.reverse().map(msg => formatMessage(msg));
        setChatMessages(formattedMessages);
        setCurrentPage(page);
        setHasMoreMessages(result.pagination?.hasMore || false);

        // Scroll to bottom after messages are set (newest messages)
        setTimeout(() => {
          scrollToBottom();
        }, 200);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const formatMessage = (msg) => {
    // Normalize user IDs for comparison
    const currentUserId = String(currentUser?._id || currentUser?.id || '');
    const messageUserId = String(msg.userId?._id || msg.userId?.id || msg.userId || '');
    const isCurrentUser = currentUserId && messageUserId && currentUserId === messageUserId;

    return {
      id: msg._id || msg.id,
      message: msg.textDecrypted || msg.textEncrypted || msg.text || '',
      sender: isCurrentUser ? "you" : "other",
      senderInitials: isCurrentUser
        ? (currentUser?.firstName?.[0] || '') + (currentUser?.lastName?.[0] || '')
        : (msg.userId?.firstName?.[0] || '') + (msg.userId?.lastName?.[0] || '') || (msg.userId?.email?.[0]?.toUpperCase() || 'U'),
      time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) : '',
      type: msg.type || 'text',
      isRead: msg.isRead,
      isDelivered: msg.isDelivered,
      tempId: msg.uniqueId,
    };
  };

  const handleSelectConversation = (chatroom) => {
    // Normalize IDs for comparison
    const currentUserId = String(currentUser?._id || currentUser?.id || '');
    const chatroomUserId = String(chatroom.userId?._id || chatroom.userId?.id || chatroom.userId || '');
    const otherUser = currentUserId && chatroomUserId && currentUserId === chatroomUserId
      ? chatroom.memberId
      : chatroom.userId;

    const conversation = {
      id: chatroom._id || chatroom.id,
      chatroomId: chatroom._id || chatroom.id,
      name: otherUser
        ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email
        : 'Unknown User',
      initials: otherUser
        ? `${otherUser.firstName?.[0] || ''}${otherUser.lastName?.[0] || ''}`.toUpperCase() || otherUser.email?.[0]?.toUpperCase()
        : 'U',
      hasPhoto: false,
      photoUrl: null,
      unread: chatroom.unreadCount || 0,
      property: '',
      message: chatroom.lastMessage?.text || '',
      time: chatroom.lastMessageAt ? new Date(chatroom.lastMessageAt).toLocaleDateString() : '',
      otherUser,
    };

    setSelectedConversation(conversation);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation || !isConnected) return;

    const chatroomId = String(selectedConversation.id || selectedConversation.chatroomId || '');
    if (!chatroomId || chatroomId === 'undefined' || chatroomId === 'null') return;

    // Add temporary message for instant feedback
    const uniqueId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempMessage = {
      id: uniqueId,
      tempId: uniqueId,
      message: messageText,
      sender: "you",
      senderInitials: (currentUser?.firstName?.[0] || '') + (currentUser?.lastName?.[0] || ''),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      type: 'text',
      isRead: false,
      isDelivered: false,
    };

    setChatMessages(prev => [...prev, tempMessage]);
    setMessageText("");
    scrollToBottom();

    // Send via socket with uniqueId for matching
    try {
      socketSendMessage(chatroomId, messageText, uniqueId);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove temporary message on error
      setChatMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  const handleTyping = () => {
    if (!selectedConversation || !isConnected) return;

    const chatroomId = String(selectedConversation.id || selectedConversation.chatroomId || '');
    if (!chatroomId || chatroomId === 'undefined' || chatroomId === 'null') return;

    startTyping(chatroomId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(chatroomId);
    }, 3000);
  };

  const updateChatroomLastMessage = (chatroomId, message) => {
    const chatroomIdStr = String(chatroomId || '');
    if (!chatroomIdStr || chatroomIdStr === 'undefined' || chatroomIdStr === 'null') return;

    setChatrooms(prev => prev.map(chatroom => {
      const currentId = String(chatroom._id || chatroom.id || '');
      if (currentId === chatroomIdStr) {
        const isFromOtherUser = message.userId?._id !== currentUser?._id && message.userId?.id !== currentUser?.id;
        return {
          ...chatroom,
          lastMessage: {
            text: message.textDecrypted || message.textEncrypted || message.text,
            createdAt: message.createdAt,
            userId: message.userId,
          },
          lastMessageAt: message.createdAt || new Date(),
          unreadCount: isFromOtherUser
            ? (chatroom.unreadCount || 0) + 1
            : (chatroom.unreadCount || 0),
        };
      }
      return chatroom;
    }));
  };

  const updateChatroomUnreadCount = (chatroomId, count) => {
    const chatroomIdStr = String(chatroomId || '');
    if (!chatroomIdStr || chatroomIdStr === 'undefined' || chatroomIdStr === 'null') return;

    setChatrooms(prev => prev.map(chatroom => {
      const currentId = String(chatroom._id || chatroom.id || '');
      if (currentId === chatroomIdStr) {
        return {
          ...chatroom,
          unreadCount: count,
        };
      }
      return chatroom;
    }));
  };

  const updateChatroomInList = (updatedChatroom) => {
    setChatrooms(prev => {
      const exists = prev.find(c => (c._id || c.id) === (updatedChatroom._id || updatedChatroom.id));
      if (exists) {
        return prev.map(c =>
          (c._id || c.id) === (updatedChatroom._id || updatedChatroom.id) ? updatedChatroom : c
        );
      } else {
        return [updatedChatroom, ...prev];
      }
    });
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

  const handleProfileClick = async () => {
    if (selectedConversation && selectedConversation.otherUser) {
      try {
        setLoadingProfile(true);
        const userId = selectedConversation.otherUser._id || selectedConversation.otherUser.id;
        if (userId) {
          const userData = await getUserById(userId);
          // Format user data to match TenantProfileDetail expected structure
          const formattedTenantData = {
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
            profileImage: userData.userInfo?.profilePicture || userData.profileImage || '/default-avatar.png',
            verified: userData.isEmailVerified || userData.userInfo?.verificationStatus === 'approved',
            description: userData.userInfo?.bio || '',
            designation: userData.userInfo?.employment?.jobTitle || 'N/A',
            location: userData.userInfo?.address
              ? `${userData.userInfo.address.city || ''}, ${userData.userInfo.address.country || ''}`.trim()
              : 'N/A',
            monthlyIncome: userData.userInfo?.employment?.monthlyIncome || 'N/A',
            creditScore: userData.userInfo?.creditScore || 0,
            creditMax: 850,
            creditRating: userData.userInfo?.creditRating || 'N/A',
            creditDescription: userData.userInfo?.creditDescription || '',
            identity: userData.userInfo?.identity || {},
            currentAddress: userData.userInfo?.address || {},
            employment: userData.userInfo?.employment || {},
            proofOfIncome: userData.userInfo?.proofOfIncome || {},
          };
          setTenantProfileData(formattedTenantData);
          setShowProfileDetail(true);
        }
      } catch (error) {
        console.error('Error fetching tenant profile:', error);
        toast.error('Failed to load tenant profile');
        // Still show profile detail with basic info
        setTenantProfileData({
          name: `${selectedConversation.otherUser.firstName || ''} ${selectedConversation.otherUser.lastName || ''}`.trim() || selectedConversation.otherUser.email,
          profileImage: '/default-avatar.png',
          verified: false,
          description: '',
          designation: 'N/A',
          location: 'N/A',
          monthlyIncome: 'N/A',
          creditScore: 0,
          creditMax: 850,
          creditRating: 'N/A',
          creditDescription: '',
          identity: {},
          currentAddress: {},
          employment: {},
          proofOfIncome: {},
        });
        setShowProfileDetail(true);
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  const handleBackToChat = () => {
    setShowProfileDetail(false);
    setTenantProfileData(null);
  };

  const handleBackToMessageList = () => {
    setSelectedConversation(null);
    setShowProfileDetail(false);
    setTenantProfileData(null);
  };

  const [offerFormData, setOfferFormData] = useState({
    property: "",
    monthlyRent: "",
    requirements: "",
  });

  // Filter chatrooms based on search and active tab
  const filteredChatrooms = chatrooms.filter(chatroom => {
    // Filter by tab: "requests" = unread messages, "all" = all messages
    if (activeTab === "requests") {
      if (!chatroom.unreadCount || chatroom.unreadCount === 0) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      // Normalize IDs for comparison to correctly identify the other user
      const currentUserId = String(currentUser?._id || currentUser?.id || '');
      const chatroomUserId = String(chatroom.userId?._id || chatroom.userId?.id || chatroom.userId || '');
      const otherUser = currentUserId && chatroomUserId && currentUserId === chatroomUserId
        ? chatroom.memberId
        : chatroom.userId;

      const searchLower = searchQuery.toLowerCase();
      const name = otherUser
        ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email
        : '';

      return name.toLowerCase().includes(searchLower) ||
        (otherUser?.email || '').toLowerCase().includes(searchLower);
    }

    return true;
  });

  // Calculate counts for tabs
  const allMessagesCount = chatrooms.length;
  const messageRequestsCount = chatrooms.filter(c => c.unreadCount && c.unreadCount > 0).length;

  return (
    <DashboardLayout>
      <div className="block">
        {/* Mobile: Show back button when conversation is selected */}
        {selectedConversation && (
          <button
            onClick={handleBackToMessageList}
            className="md:hidden flex items-center gap-2 mb-4 text-secondary hover:text-primary transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-base font-semibold font-nunito">Back</span>
          </button>
        )}

        <h1 className="text-xl xl:text-2xl font-bold text-secondary mb-4">
          Messages {!isConnected && <span className="text-xs text-red-500">(Disconnected)</span>}
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => {
              const newTab = "all";
              setActiveTab(newTab);
              localStorage.setItem('messagesActiveTab', newTab);
              setSelectedConversation(null);
            }}
            className={`relative pb-2 px-2 font-semibold text-base xl:text-lg font-nunito flex items-center gap-2 transition-colors border-b-2 ${activeTab === "all"
                ? "text-[#6B4EFF] border-[#6B4EFF]"
                : "text-darkGray border-transparent"
              }`}
          >
            All Messages
            <span
              className={`${activeTab === "all"
                  ? "text-white bg-[#6B4EFF]"
                  : "text-[#4A2FCC] bg-[#E8E2FF]"
                } relative text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center`}
            >
              {allMessagesCount}
            </span>
          </button>
          <button
            onClick={() => {
              const newTab = "requests";
              setActiveTab(newTab);
              localStorage.setItem('messagesActiveTab', newTab);
              setSelectedConversation(null);
            }}
            className={`relative pb-2 font-semibold px-2 text-base xl:text-lg font-nunito flex items-center gap-2 transition-colors border-b-2 ${activeTab === "requests"
                ? "text-[#6B4EFF] border-[#6B4EFF]"
                : "text-darkGray border-transparent"
              }`}
          >
            Message Requests
            <span
              className={`${activeTab === "requests"
                  ? "text-white bg-[#6B4EFF]"
                  : "text-[#4A2FCC] bg-[#E8E2FF]"
                } relative text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center`}
            >
              {messageRequestsCount}
            </span>
          </button>
        </div>

        <div
          className={`flex gap-0 bg-white rounded-[20px] ${!showProfileDetail && "border border-lightGray"
            }`}
        >
          {/* Left Panel - Message List */}
          {!showProfileDetail && (
            <div
              className={`${selectedConversation ? "hidden md:flex" : "flex"
                } w-full md:w-96 lg:w-[400px] rounded-tl-[20px] rounded-bl-[20px] md:rounded-tr-none md:rounded-br-none rounded-[20px] md:rounded-[0] bg-white border-r border-lightGray md:border-r flex flex-col`}
            >
              {/* Header */}
              <div className="p-4 border-b border-lightGray">
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg md:text-xl">
                    <BlueSearchIcon />
                  </span>

                  <input
                    type="text"
                    placeholder="Search Messages"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 md:pl-10 pr-3 h-12 md:pr-4 py-1.5 md:py-2 border border-lightGray rounded-xl focus:outline-none focus:ring-0 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B4EFF]"></div>
                  </div>
                ) : filteredChatrooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <ChatBlueStartIcon />
                    <p className="text-darkGray text-base font-normal font-nunito mt-4">
                      {searchQuery
                        ? 'No messages found'
                        : activeTab === "requests"
                          ? 'No message requests'
                          : 'No messages yet'}
                    </p>
                  </div>
                ) : (
                  filteredChatrooms.map((chatroom) => {
                    // Normalize IDs for comparison to correctly identify the other user
                    const currentUserId = String(currentUser?._id || currentUser?.id || '');
                    const chatroomUserId = String(chatroom.userId?._id || chatroom.userId?.id || chatroom.userId || '');
                    const otherUser = currentUserId && chatroomUserId && currentUserId === chatroomUserId
                      ? chatroom.memberId
                      : chatroom.userId;

                    const name = otherUser
                      ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email
                      : 'Unknown User';

                    const initials = otherUser
                      ? `${otherUser.firstName?.[0] || ''}${otherUser.lastName?.[0] || ''}`.toUpperCase() || otherUser.email?.[0]?.toUpperCase()
                      : 'U';

                    const chatroomId = chatroom._id || chatroom.id;
                    const isSelected = selectedConversation?.id === chatroomId;
                    const unreadCount = chatroom.unreadCount || 0;

                    return (
                      <div
                        key={chatroomId}
                        onClick={() => handleSelectConversation(chatroom)}
                        className={`p-4 bg-[#F8F8F8] border-b border-lightGray cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? "bg-purple-50" : ""
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6B4EFF] font-bold border border-lightGray">
                              {initials}
                            </div>
                            {unreadCount > 0 && (
                              <span className="absolute -bottom-0 -right-1 text-green-600 bg-white rounded-full">
                                <MediumCheckedIcon />
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-normal font-nunito text-[#0F172B] text-base truncate">
                                {name}
                              </h3>
                              {unreadCount > 0 && (
                                <span className="text-white bg-[#009966] w-6 h-6 rounded-full flex items-center justify-center text-sm font-normal flex-shrink-0 ml-2">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-normal font-nunito text-[#45556C] mb-1 truncate">
                              {chatroom.lastMessage?.text || 'No messages yet'}
                            </p>
                            <div>
                              <span className="text-sm text-[#62748E] font-normal font-nunito">
                                {chatroom.lastMessageAt
                                  ? new Date(chatroom.lastMessageAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })
                                  : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Right Panel - Chat View or Profile Detail */}
          <div
            className={`${selectedConversation || showProfileDetail
                ? "flex"
                : "hidden md:flex"
              } flex-col bg-white rounded-tr-[20px] rounded-br-[20px] md:rounded-tl-none md:rounded-bl-none rounded-[20px] md:rounded-[0] overflow-y-auto ${showProfileDetail ? "w-full" : "flex-1"
              }`}
          >
            {showProfileDetail && tenantProfileData ? (
              <TenantProfileDetail
                tenantData={tenantProfileData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onBack={handleBackToChat}
                onSendOffer={handleSendOffer}
                allMessagesCount={allMessagesCount}
                messageRequestsCount={messageRequestsCount}
              />
            ) : selectedConversation ? (
              <>
                {messagesLoading && chatMessages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center bg-[#F9F9FC]">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#6B4EFF] border-t-transparent mb-4"></div>
                      <p className="text-[#62748E] text-base font-normal font-nunito">Loading messages...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ChatView
                      selectedConversation={selectedConversation}
                      chatMessages={chatMessages}
                      messageText={messageText}
                      setMessageText={(text) => {
                        setMessageText(text);
                        handleTyping();
                      }}
                      onSendMessage={handleSendMessage}
                      onSendOffer={handleSendOffer}
                      onProfileClick={handleProfileClick}
                      messagesEndRef={messagesEndRef}
                      messagesTopRef={messagesTopRef}
                      onScroll={handleScroll}
                      loadingMoreMessages={loadingMoreMessages}
                      hasMoreMessages={hasMoreMessages}
                      messagesContainerRef={messagesContainerRef}
                    />
                  </>
                )}
              </>
            ) : (
              /* Empty State - Hidden on mobile when no conversation selected, or if there's only one conversation */
              filteredChatrooms.length > 1 && (
                <div className="hidden md:flex flex-1 items-center bg-[#F9F9FC] justify-center">
                  <div className="text-center">
                    <div className="flex items-center justify-center mx-auto mb-4">
                      <ChatBlueStartIcon />
                    </div>
                    <h3 className="text-lg lg:text-2xl font-bold text-[#4A2FCC] mb-2">
                      No conversation selected
                    </h3>
                    <p className="text-darkGray text-base font-normal font-nunito">
                      {activeTab === "requests"
                        ? "Select a message request to respond"
                        : "Engage with potential renters"}
                    </p>
                  </div>
                </div>
              )
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
