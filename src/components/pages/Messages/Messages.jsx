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
import RedCrossIcon from "@/svg/redCrossIcon";
import { getChatrooms, getChatroomMessages, uploadChatMedia, updateChatroom } from "@/api/chat";
import { getCurrentUser, getUserById } from "@/api/users";
import { useSocket, SOCKET_EVENTS } from "@/hooks/useSocket";
import { toast } from "react-toastify";
import { useSelector } from 'react-redux';
import { isUserVerified, getVerificationMessage } from '@/utils/verificationUtils';

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
  const user = useSelector((state) => state.auth?.user);
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmChatroomId, setConfirmChatroomId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedConversationRef = useRef(null);

  const {
    isConnected,
    sendMessage,
    joinChatroom,
    leaveChatroom,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    on,
  } = useSocket();

  // Fetch current user (fresh data for verification check)
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

  // Sync selectedConversation ref with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Fetch chatrooms
  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        setLoading(true);
        const data = await getChatrooms();
        // Normalize lastMessage to object format if it's a string
        const normalizedChatrooms = (data || []).map(chatroom => {
          if (!chatroom.lastMessage) {
            return {
              ...chatroom,
              lastMessage: null,
            };
          }

          if (typeof chatroom.lastMessage === 'string') {
            return {
              ...chatroom,
              lastMessage: {
                text: chatroom.lastMessage,
                createdAt: chatroom.lastMessageAt,
              },
            };
          }

          if (typeof chatroom.lastMessage === 'object') {
            // Ensure it has a text property - check multiple possible fields
            const text = chatroom.lastMessage.text ||
              chatroom.lastMessage.textDecrypted ||
              chatroom.lastMessage.textEncrypted ||
              '';

            return {
              ...chatroom,
              lastMessage: {
                text: text,
                createdAt: chatroom.lastMessage.createdAt || chatroom.lastMessageAt,
                userId: chatroom.lastMessage.userId,
                type: chatroom.lastMessage.type || 'text',
                fileUrl: chatroom.lastMessage.fileUrl || null,
              },
            };
          }

          return {
            ...chatroom,
            lastMessage: null,
          };
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
        message: (() => {
          const lastMsg = chatroom.lastMessage;
          if (!lastMsg) return '';
          if (typeof lastMsg === 'string') return lastMsg;
          if (typeof lastMsg === 'object' && lastMsg.text) return lastMsg.text;
          return '';
        })(),
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

        // Check if this message is for the currently selected conversation
        const selectedId = String(selectedConversation?.id || selectedConversation?.chatroomId || '');
        const isForSelectedConversation = selectedId && chatroomIdStr && selectedId === chatroomIdStr;

        // Add message if it's for the current chatroom and NOT from current user
        // (Current user's messages are handled by MESSAGE_SENT event)
        if (isForSelectedConversation && !isFromCurrentUser) {
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

          // Mark as read since it's from other user AND conversation is selected
          markMessagesAsRead(chatroomIdStr);
          // Explicitly set unread count to 0 for selected conversation
          updateChatroomUnreadCount(chatroomIdStr, 0);
        }

        // Update chatroom list with last message and increment unread count
        // Only update if message is NOT from current user (current user's messages are handled by MESSAGE_SENT)
        // IMPORTANT: Update AFTER checking if selected, so unread count logic works correctly
        if (chatroomIdStr && chatroomIdStr !== 'undefined' && chatroomIdStr !== 'null' && !isFromCurrentUser) {
          updateChatroomLastMessage(chatroomIdStr, message, isForSelectedConversation);
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

        // Update chatroom list with last message (for sender's own messages)
        const chatroomIdStr = String(message.chatroomId || message.chatroom?._id || message.chatroom?.id || '');
        if (chatroomIdStr && chatroomIdStr !== 'undefined' && chatroomIdStr !== 'null') {
          // Check if this message is for the currently selected conversation
          const selectedId = String(selectedConversation?.id || selectedConversation?.chatroomId || '');
          const isForSelectedConversation = selectedId && chatroomIdStr && selectedId === chatroomIdStr;
          updateChatroomLastMessage(chatroomIdStr, message, isForSelectedConversation);
        }
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

    // Get verification status from message user (for renters - show cross icon if not verified)
    const messageUser = msg.userId;
    // Check verification status - handle populated userInfoId
    let isVerified = false;
    if (messageUser) {
      if (messageUser.userType === 'owner') {
        // Owners are always considered verified for display
        isVerified = true;
      } else if (messageUser.userType === 'renter') {
        // For renters, check verification status from userInfoId
        isVerified = messageUser?.userInfoId?.verificationStatus === 'verified' || false;
      } else {
        // If no userType or unknown type, assume verified (backward compatibility)
        isVerified = true;
      }
    }

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
      // Verification status for renter messages (to show cross icon if not verified)
      isVerified: isVerified,
      senderUserType: messageUser?.userType || null,
      // Media fields
      fileUrl: msg.fileUrl || null,
      fileName: msg.fileName || null,
      fileSize: msg.fileSize || null,
      mimeType: msg.mimeType || null,
      thumbnailUrl: msg.thumbnailUrl || null,
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

    // Determine block status using timestamp fields (handles mutual blocking)
    const isCurrentUserUserId = currentUserId === String(chatroom.userId?._id || chatroom.userId?.id || chatroom.userId || '');

    // Check if current user blocked the other user (using timestamp fields)
    const blockedAtByCurrentUser = isCurrentUserUserId
      ? chatroom.blockedAtByUserId
      : chatroom.blockedAtByMemberId;
    const unblockedAtByCurrentUser = isCurrentUserUserId
      ? chatroom.unblockedAtByUserId
      : chatroom.unblockedAtByMemberId;
    const isBlockedByCurrentUser = blockedAtByCurrentUser && !unblockedAtByCurrentUser;

    // Check if current user is blocked by the other user (using timestamp fields)
    const blockedAtByOtherUser = isCurrentUserUserId
      ? chatroom.blockedAtByMemberId
      : chatroom.blockedAtByUserId;
    const unblockedAtByOtherUser = isCurrentUserUserId
      ? chatroom.unblockedAtByMemberId
      : chatroom.unblockedAtByUserId;
    const isCurrentUserBlocked = blockedAtByOtherUser && !unblockedAtByOtherUser;

    // Legacy field for backward compatibility (but we use timestamp-based logic above)
    const isBlocked = isBlockedByCurrentUser || isCurrentUserBlocked;

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
      isBlocked,
      isBlockedByCurrentUser,
      isCurrentUserBlocked,
    };

    setSelectedConversation(conversation);
  };

  const handleFileSelect = async (file) => {
    if (!selectedConversation || !isConnected) return;

    // Check user verification status - use currentUser (fresh data) if available, otherwise use user from Redux
    const userForVerification = currentUser || user;
    if (!userForVerification) {
      toast.error('User data not available. Please refresh the page.');
      return;
    }
    if (!isUserVerified(userForVerification)) {
      toast.error(getVerificationMessage('chat with other users'));
      return;
    }

    const chatroomId = String(selectedConversation.id || selectedConversation.chatroomId || '');
    if (!chatroomId || chatroomId === 'undefined' || chatroomId === 'null') return;

    try {
      // Determine message type from file
      let messageType = 'document';
      if (file.type.startsWith('image/')) {
        messageType = 'image';
      } else if (file.type.startsWith('video/')) {
        messageType = 'video';
      }

      // Show loading state
      toast.info('Uploading file...');

      // Upload file to S3
      const uploadResult = await uploadChatMedia(chatroomId, file, messageType);

      // Check if the same file (same fileName and fileSize) already exists in chat messages
      // Compare with existing messages to detect if old and new screenshots are the same
      const currentUserId = String(currentUser?._id || currentUser?.id || '');
      const existingSameImage = chatMessages.find(msg => {
        // Only check messages from current user (owner)
        if (msg.sender !== "you") {
          return false;
        }

        // Check if message has the same file name and size, and same message type
        // This detects when old and new screenshots are the same
        const sameFileName = msg.fileName && uploadResult.fileName &&
          msg.fileName.toLowerCase() === uploadResult.fileName.toLowerCase();
        const sameFileSize = msg.fileSize && uploadResult.fileSize &&
          msg.fileSize === uploadResult.fileSize;
        const sameType = (msg.type === messageType || (msg.type === 'image' && messageType === 'image'));

        return sameType && sameFileName && sameFileSize;
      });

      // If old and new screenshots are the same, only show toast and don't add message to chat
      if (existingSameImage) {
        toast.info('Same image already sent. No changes made.');
        return;
      }

      // Add temporary message for instant feedback
      const uniqueId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempMessage = {
        id: uniqueId,
        tempId: uniqueId,
        message: messageText || '', // Optional caption
        sender: "you",
        senderInitials: (currentUser?.firstName?.[0] || '') + (currentUser?.lastName?.[0] || ''),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        type: messageType,
        isRead: false,
        isDelivered: false,
        fileUrl: uploadResult.fileUrl,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
      };

      setChatMessages(prev => [...prev, tempMessage]);
      setMessageText("");
      scrollToBottom();

      // Send via socket with media data
      sendMessage(chatroomId, messageText || '', messageType, uniqueId, {
        fileUrl: uploadResult.fileUrl,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
      });

      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation || !isConnected) return;

    // Check user verification status - use currentUser (fresh data) if available, otherwise use user from Redux
    const userForVerification = currentUser || user;
    if (!userForVerification) {
      toast.error('User data not available. Please refresh the page.');
      return;
    }
    if (!isUserVerified(userForVerification)) {
      toast.error(getVerificationMessage('chat with other users'));
      return;
    }

    // Don't allow sending if blocked
    if (selectedConversation.isBlockedByCurrentUser || selectedConversation.isCurrentUserBlocked) {
      return;
    }

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
      sendMessage(chatroomId, messageText, 'text', uniqueId);
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

  const updateChatroomLastMessage = (chatroomId, message, isSelected = false) => {
    const chatroomIdStr = String(chatroomId || '');
    if (!chatroomIdStr || chatroomIdStr === 'undefined' || chatroomIdStr === 'null') return;

    setChatrooms(prev => {
      return prev.map(chatroom => {
        const currentId = String(chatroom._id || chatroom.id || '');
        if (currentId === chatroomIdStr) {
          // Check if message is from other user - normalize IDs for comparison
          const messageUserId = String(message.userId?._id || message.userId?.id || message.userId || '');
          const currentUserId = String(currentUser?._id || currentUser?.id || '');
          const isFromOtherUser = messageUserId && currentUserId && messageUserId !== currentUserId;

          // Only increment unread if:
          // 1. Message is from other user (not current user)
          // 2. Conversation is NOT currently selected
          const shouldIncrementUnread = isFromOtherUser && !isSelected;

          // Calculate new unread count
          const currentUnreadCount = chatroom.unreadCount || 0;
          const newUnreadCount = shouldIncrementUnread
            ? currentUnreadCount + 1
            : currentUnreadCount;

          return {
            ...chatroom,
            lastMessage: {
              text: message.textDecrypted || message.textEncrypted || message.text || '',
              createdAt: message.createdAt || new Date(),
              userId: message.userId,
              type: message.type || 'text',
              fileUrl: message.fileUrl || null,
            },
            lastMessageAt: message.createdAt || new Date(),
            unreadCount: newUnreadCount,
          };
        }
        return chatroom;
      });
    });
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
            name: userData.userInfo?.name?.first && userData.userInfo?.name?.last
              ? `${userData.userInfo.name.first} ${userData.userInfo.name.last}`.trim()
              : userData.firstName && userData.lastName
                ? `${userData.firstName} ${userData.lastName}`.trim()
                : userData.email || 'N/A',
            profileImage: userData.userInfo?.profileImage || '/default-avatar.png',
            verified: userData.isEmailVerified || userData.userInfo?.verificationStatus === 'verified',
            description: userData.userInfo?.bio || '',
            designation: userData.userInfo?.employment?.jobTitle || 'N/A',
            location: userData.userInfo?.address
              ? [userData.userInfo.address.city, userData.userInfo.address.country]
                .filter(Boolean)
                .join(', ') || 'N/A'
              : 'N/A',
            monthlyIncome: userData.userInfo?.employment?.monthlyIncome
              ? `£${userData.userInfo.employment.monthlyIncome.toLocaleString()}`
              : userData.userInfo?.proofOfIncome?.grossMonthly
                ? `£${userData.userInfo.proofOfIncome.grossMonthly.toLocaleString()}`
                : 'N/A',
            creditScore: userData.userInfo?.creditScore || 0,
            creditMax: 850,
            creditRating: userData.userInfo?.creditRating || 'N/A',
            creditDescription: userData.userInfo?.creditDescription || '',
            identity: {
              fullName: userData.userInfo?.name?.first && userData.userInfo?.name?.last
                ? `${userData.userInfo.name.first} ${userData.userInfo.name.last}`.trim()
                : userData.firstName && userData.lastName
                  ? `${userData.firstName} ${userData.lastName}`.trim()
                  : 'N/A',
              dateOfBirth: userData.userInfo?.dateOfBirth
                ? new Date(userData.userInfo.dateOfBirth).toLocaleDateString()
                : 'N/A',
              nationalInsurance: userData.userInfo?.nationalInsurance || 'N/A',
              phone: userData.phone || 'N/A',
              email: userData.email || 'N/A',
            },
            currentAddress: {
              address: userData.userInfo?.address?.street || 'N/A',
              city: userData.userInfo?.address?.city || 'N/A',
              country: userData.userInfo?.address?.country || 'N/A',
              postcode: userData.userInfo?.address?.postcode || 'N/A',
              livingPeriod: userData.userInfo?.address?.livingPeriod || 'N/A',
            },
            employment: {
              jobTitle: userData.userInfo?.employment?.jobTitle || 'N/A',
              employmentType: userData.userInfo?.employment?.employmentType || 'N/A',
              company: userData.userInfo?.employment?.company || 'N/A',
              annualSalary: userData.userInfo?.employment?.annualSalary
                ? `£${userData.userInfo.employment.annualSalary.toLocaleString()}`
                : 'N/A',
              startDate: userData.userInfo?.employment?.startDate
                ? new Date(userData.userInfo.employment.startDate).toLocaleDateString()
                : 'N/A',
              workLocation: userData.userInfo?.employment?.workLocation || 'N/A',
            },
            proofOfIncome: {
              type: userData.userInfo?.proofOfIncome?.type || 'N/A',
              date: userData.userInfo?.proofOfIncome?.date
                ? new Date(userData.userInfo.proofOfIncome.date).toLocaleDateString()
                : 'N/A',
              grossMonthly: userData.userInfo?.proofOfIncome?.grossMonthly
                ? `£${userData.userInfo.proofOfIncome.grossMonthly.toLocaleString()}`
                : 'N/A',
              netMonthly: userData.userInfo?.proofOfIncome?.netMonthly
                ? `£${userData.userInfo.proofOfIncome.netMonthly.toLocaleString()}`
                : 'N/A',
            },
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
          identity: {
            fullName: `${selectedConversation.otherUser.firstName || ''} ${selectedConversation.otherUser.lastName || ''}`.trim() || selectedConversation.otherUser.email,
            dateOfBirth: 'N/A',
            nationalInsurance: 'N/A',
            phone: selectedConversation.otherUser.phone || 'N/A',
            email: selectedConversation.otherUser.email || 'N/A',
          },
          currentAddress: {
            address: 'N/A',
            city: 'N/A',
            country: 'N/A',
            postcode: 'N/A',
            livingPeriod: 'N/A',
          },
          employment: {
            jobTitle: 'N/A',
            employmentType: 'N/A',
            company: 'N/A',
            annualSalary: 'N/A',
            startDate: 'N/A',
            workLocation: 'N/A',
          },
          proofOfIncome: {
            type: 'N/A',
            date: 'N/A',
            grossMonthly: 'N/A',
            netMonthly: 'N/A',
          },
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

  const handleDeleteChatroom = (chatroomId) => {
    setConfirmAction('delete');
    setConfirmChatroomId(chatroomId);
    setShowConfirmModal(true);
  };

  const handleBlockChatroom = (chatroomId) => {
    setConfirmAction('block');
    setConfirmChatroomId(chatroomId);
    setShowConfirmModal(true);
  };

  const handleUnblockChatroom = async (chatroomId) => {
    try {
      setIsProcessing(true);
      await updateChatroom(chatroomId, 'unblock');

      // Refresh chatrooms list
      const data = await getChatrooms();
      const normalizedChatrooms = (data || []).map(chatroom => {
        if (!chatroom.lastMessage) {
          return { ...chatroom, lastMessage: null };
        }
        if (typeof chatroom.lastMessage === 'string') {
          return {
            ...chatroom,
            lastMessage: { text: chatroom.lastMessage, createdAt: chatroom.lastMessageAt },
          };
        }
        if (typeof chatroom.lastMessage === 'object') {
          const text = chatroom.lastMessage.text || chatroom.lastMessage.textDecrypted || chatroom.lastMessage.textEncrypted || '';
          return {
            ...chatroom,
            lastMessage: {
              text: text,
              createdAt: chatroom.lastMessage.createdAt || chatroom.lastMessageAt,
              userId: chatroom.lastMessage.userId,
              type: chatroom.lastMessage.type || 'text',
              fileUrl: chatroom.lastMessage.fileUrl || null,
            },
          };
        }
        return { ...chatroom, lastMessage: null };
      });
      setChatrooms(normalizedChatrooms);

      // Update selected conversation if it's the unblocked one
      if (selectedConversation && (selectedConversation.id === chatroomId || selectedConversation.chatroomId === chatroomId)) {
        const updatedChatroom = normalizedChatrooms.find(c => (c._id || c.id) === chatroomId);
        if (updatedChatroom) {
          handleSelectConversation(updatedChatroom);
        }
      }
    } catch (error) {
      console.error('Error unblocking chatroom:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmChatroomId || !confirmAction) return;

    try {
      setIsProcessing(true);
      await updateChatroom(confirmChatroomId, confirmAction);

      if (confirmAction === 'delete') {
        // Remove chatroom from list
        setChatrooms(prev => prev.filter(c => (c._id || c.id) !== confirmChatroomId));

        // If deleted chatroom is currently selected, clear selection
        if (selectedConversation && (selectedConversation.id === confirmChatroomId || selectedConversation.chatroomId === confirmChatroomId)) {
          setSelectedConversation(null);
          setChatMessages([]);
          setShowProfileDetail(false);
          setTenantProfileData(null);
        }
      } else if (confirmAction === 'block') {
        // Refresh chatrooms list
        const data = await getChatrooms();
        const normalizedChatrooms = (data || []).map(chatroom => {
          if (!chatroom.lastMessage) {
            return { ...chatroom, lastMessage: null };
          }
          if (typeof chatroom.lastMessage === 'string') {
            return {
              ...chatroom,
              lastMessage: { text: chatroom.lastMessage, createdAt: chatroom.lastMessageAt },
            };
          }
          if (typeof chatroom.lastMessage === 'object') {
            const text = chatroom.lastMessage.text || chatroom.lastMessage.textDecrypted || chatroom.lastMessage.textEncrypted || '';
            return {
              ...chatroom,
              lastMessage: {
                text: text,
                createdAt: chatroom.lastMessage.createdAt || chatroom.lastMessageAt,
                userId: chatroom.lastMessage.userId,
                type: chatroom.lastMessage.type || 'text',
                fileUrl: chatroom.lastMessage.fileUrl || null,
              },
            };
          }
          return { ...chatroom, lastMessage: null };
        });
        setChatrooms(normalizedChatrooms);

        // Update selected conversation if it's the blocked one
        if (selectedConversation && (selectedConversation.id === confirmChatroomId || selectedConversation.chatroomId === confirmChatroomId)) {
          const updatedChatroom = normalizedChatrooms.find(c => (c._id || c.id) === confirmChatroomId);
          if (updatedChatroom) {
            handleSelectConversation(updatedChatroom);
          }
        }
      }

      setShowConfirmModal(false);
      setConfirmAction(null);
      setConfirmChatroomId(null);
    } catch (error) {
      console.error(`Error ${confirmAction}ing chatroom:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    if (!isProcessing) {
      setShowConfirmModal(false);
      setConfirmAction(null);
      setConfirmChatroomId(null);
    }
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

  // Check verification status - use currentUser (fresh data) if available, otherwise use user from Redux
  const userForVerification = currentUser || user;
  const isVerified = isUserVerified(userForVerification);

  // Check if user has chat history
  const hasChatHistory = chatrooms && chatrooms.length > 0;

  // Show verification page only if: not verified AND no chat history
  // If not verified BUT has chat history, allow viewing but sending is blocked in handleSendMessage
  const showVerificationPage = !isVerified && !hasChatHistory;

  return (
    <DashboardLayout>
      <>
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

                      // Check verification status for renters
                      const otherUserType = otherUser?.userType || null;
                      const isOtherUserVerified = otherUser?.userInfoId?.verificationStatus === 'verified' ||
                        otherUser?.userInfo?.verificationStatus === 'verified' ||
                        false;
                      const showVerificationIcon = otherUserType === 'renter';
                      const isVerified = isOtherUserVerified;

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
                              {/* Show verification icon for renters: cross if not verified, checkmark if verified */}
                              {showVerificationIcon && (
                                <span className="absolute -bottom-0 -right-1 bg-white rounded-full">
                                  {isVerified ? (
                                    <MediumCheckedIcon />
                                  ) : (
                                    <RedCrossIcon />
                                  )}
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
                                {(() => {
                                  const lastMsg = chatroom.lastMessage;

                                  // If no lastMessage but lastMessageAt exists, there's a message but we don't have the data
                                  if (!lastMsg && chatroom.lastMessageAt) {
                                    return 'Message';
                                  }

                                  if (!lastMsg) return 'No messages yet';
                                  if (typeof lastMsg === 'string') return lastMsg;
                                  if (typeof lastMsg === 'object') {
                                    // Check if it's a media message FIRST (has fileUrl or type indicates media)
                                    const isMediaMessage = lastMsg.fileUrl ||
                                      (lastMsg.type && lastMsg.type !== 'text' && lastMsg.type !== 'system');

                                    if (isMediaMessage) {
                                      // If there's text (caption), show it, otherwise show media type indicator
                                      const text = lastMsg.text || '';
                                      if (text.trim()) {
                                        return text;
                                      }
                                      // Show appropriate media indicator
                                      if (lastMsg.type === 'image') {
                                        return '📷 Image';
                                      } else if (lastMsg.type === 'video') {
                                        return '🎥 Video';
                                      } else if (lastMsg.type === 'document') {
                                        return '📄 Document';
                                      }
                                      return '📎 Attachment';
                                    }
                                    // Regular text message - show text if available
                                    const text = lastMsg.text || lastMsg.textDecrypted || lastMsg.textEncrypted || '';
                                    return text.trim() || 'No messages yet';
                                  }
                                  return 'No messages yet';
                                })()}
                              </p>
                              <div>
                                <span className="text-sm text-[#62748E] font-normal font-nunito">
                                  {chatroom.lastMessageAt
                                    ? new Date(chatroom.lastMessageAt).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
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
                        onFileSelect={handleFileSelect}
                        onDeleteChatroom={handleDeleteChatroom}
                        onBlockChatroom={handleBlockChatroom}
                        onUnblockChatroom={handleUnblockChatroom}
                        isBlocked={selectedConversation?.isBlocked || false}
                        isBlockedByCurrentUser={selectedConversation?.isBlockedByCurrentUser || false}
                        isCurrentUserBlocked={selectedConversation?.isCurrentUserBlocked || false}
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

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[20px] p-6 max-w-[500px] w-full mx-4 relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isProcessing}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-bold font-nunito text-secondary text-left mb-4">
                {confirmAction === 'delete' ? 'Delete Chatroom' : confirmAction === 'block' ? 'Block User' : ''}
              </h2>

              <p className="text-base font-normal font-nunito text-darkGray text-left mb-6">
                {confirmAction === 'delete'
                  ? 'Are you sure you want to delete this chatroom? This action cannot be undone.'
                  : confirmAction === 'block'
                    ? 'Are you sure you want to block this user? You will not be able to send messages to them.'
                    : ''}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-[10px] font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-blueGradient text-white rounded-[10px] font-bold shadow-[0px_2px_10px_0px_#00000033] hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : (confirmAction === 'delete' ? 'Delete' : confirmAction === 'block' ? 'Block' : 'Confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </DashboardLayout>
  );
}

export default Messages;
