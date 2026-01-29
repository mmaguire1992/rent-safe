'use client'

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from '@/lib/react-router-compat';
import PropertiesHeader from "@/components/frontend/common/PropertiesHeader";
import Footer from "@/components/frontend/common/footer";
import { FiSearch } from "react-icons/fi";
import ChatView from "@/components/adminDashboard/Messages/ChatView";
import BlueSearchIcon from "@/svg/blueSearchIcon";
import MediumCheckedIcon from "@/svg/mediumCheckedIcon";
import ChatBlueStartIcon from "@/svg/chatBlueStartIcon";
import { getChatrooms, getChatroomMessages, uploadChatMedia, deleteChatroom, blockUnblockChatroom } from "@/api/chat";
import { getCurrentUser } from "@/api/users";
import { getWishlistPropertyIds } from "@/api/wishlists";
import { useSocket, SOCKET_EVENTS } from "@/hooks/useSocket";
import { toast } from "react-toastify";
import { isAuthenticated } from "@/utils/auth";
import RedCrossIcon from "@/svg/redCrossIcon";

function ChatMessage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const chatroomIdFromUrl = searchParams?.get('chatroomId');
  
  const [chatrooms, setChatrooms] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);
  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const {
    isConnected,
    isConnecting,
    hasAttemptedConnection,
    sendMessage,
    joinChatroom,
    leaveChatroom,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    on,
  } = useSocket();

  // Fetch all initial data in parallel for better performance
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [user, chatroomsData, wishlistData] = await Promise.allSettled([
          getCurrentUser().catch(() => null),
          getChatrooms().catch(() => []),
          isAuthenticated() ? getWishlistPropertyIds().catch(() => []) : Promise.resolve([])
        ]);
        
        // Set user
        if (user.status === 'fulfilled' && user.value) {
          setCurrentUser(user.value);
        }
        
        // Set chatrooms
        if (chatroomsData.status === 'fulfilled' && chatroomsData.value) {
          const normalizedChatrooms = (chatroomsData.value || []).map(chatroom => {
            if (chatroom.lastMessage && typeof chatroom.lastMessage === 'object') {
              return {
                ...chatroom,
                lastMessage: chatroom.lastMessage.text || chatroom.lastMessage || '',
              };
            }
            return chatroom;
          });
          setChatrooms(normalizedChatrooms);
        }
        
        // Set wishlist count
        if (wishlistData.status === 'fulfilled' && wishlistData.value) {
          setFavoriteCount(wishlistData.value?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load page');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Handle chatroomId from URL
  useEffect(() => {
    if (chatroomIdFromUrl && chatrooms.length > 0) {
      // Normalize chatroomId from URL to string
      const chatroomIdStr = String(chatroomIdFromUrl || '').trim();
      
      if (!chatroomIdStr || chatroomIdStr === 'undefined' || chatroomIdStr === 'null' || chatroomIdStr === '[object Object]') {
        console.error('Invalid chatroomId from URL:', chatroomIdFromUrl);
        return;
      }
      
      const chatroom = chatrooms.find(c => {
        const chatroomId = String(c._id || c.id || '');
        return chatroomId === chatroomIdStr;
      });
      
      if (chatroom) {
        handleSelectConversation(chatroom);
        // Remove chatroomId from URL
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('chatroomId');
          window.history.replaceState({}, '', url);
        }
      } else {
        console.warn('Chatroom not found for ID:', chatroomIdStr);
      }
    }
  }, [chatroomIdFromUrl, chatrooms]);

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
            
            // Mark as read since it's from other user AND conversation is selected
            markMessagesAsRead(chatroomIdStr);
            // Explicitly set unread count to 0 for selected conversation
            updateChatroomUnreadCount(chatroomIdStr, 0);
          }
        }

        // Check if this message is for the currently selected conversation
        const selectedId = String(selectedConversation?.id || selectedConversation?.chatroomId || '');
        const isForSelectedConversation = selectedId && chatroomIdStr && selectedId === chatroomIdStr;

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
      }
    });

    // Listen for messages marked as read
    const unsubscribeMessagesMarkedRead = on(SOCKET_EVENTS.MESSAGES_MARKED_READ, (data) => {
      if (data && data.success && data.data) {
        const { chatroomId } = data.data;
        if (chatroomId) {
          // Update unread count to 0 when messages are marked as read
          updateChatroomUnreadCount(chatroomId, 0);
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

    // Listen for socket errors (e.g., when trying to send message while blocked)
    const unsubscribeError = on(SOCKET_EVENTS.ERROR, (data) => {
      if (data && data.event === SOCKET_EVENTS.SEND_MESSAGE && data.message) {
        // Remove temporary message if it exists
        const errorMessage = data.message;
        if (errorMessage.includes('blocked')) {
          // Find and remove the last temporary message
          setChatMessages(prev => {
            // Remove the last message if it's a temporary one (has tempId)
            const filtered = prev.filter((m, index) => {
              // Keep all messages except the last one if it's temporary
              if (index === prev.length - 1 && m.tempId) {
                return false; // Remove last temporary message
              }
              return true;
            });
            return filtered;
          });
        }
        toast.error(errorMessage);
      }
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageSent();
      unsubscribeMessagesMarkedRead();
      unsubscribeChatroomUpdate();
      unsubscribeNewChatroom();
      unsubscribeError();
    };
  }, [isConnected, selectedConversation, currentUser, on]);

  // Join/leave chatroom when selection changes
  useEffect(() => {
    if (!isConnected) return;

    if (selectedConversation) {
      const chatroomId = String(selectedConversation.id || selectedConversation.chatroomId || '');
      if (chatroomId && chatroomId !== 'undefined' && chatroomId !== 'null') {
        joinChatroom(chatroomId);
        // Mark messages as read when user opens the conversation
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

  // Handle scroll to load more messages (infinite scroll)
  const handleScroll = (e) => {
    const container = e.target;
    // If scrolled near the top (within 200px), load more messages
    if (container.scrollTop <= 200 && hasMoreMessages && !loadingMoreMessages) {
      console.log('Loading more messages - scrollTop:', container.scrollTop, 'hasMore:', hasMoreMessages);
      loadMoreMessages();
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
      } else {
        // No messages - set empty array
        setChatMessages([]);
        setCurrentPage(page);
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      setChatMessages([]); // Clear on error
    } finally {
      setMessagesLoading(false); // Always set loading to false
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
    // Format chatroom to match expected conversation format
    // Normalize IDs for comparison (use same format as list rendering)
    const currentUserId = String(currentUser?._id || currentUser?.id || '');
    const chatroomUserId = String(chatroom.userId?._id || chatroom.userId?.id || chatroom.userId || '');
    const chatroomMemberId = String(chatroom.memberId?._id || chatroom.memberId?.id || chatroom.memberId || '');
    
    // Determine other user - check if current user is userId or memberId
    let otherUser = null;
    if (currentUserId && chatroomUserId && currentUserId === chatroomUserId) {
      // Current user is userId, so other user is memberId
      otherUser = chatroom.memberId;
    } else if (currentUserId && chatroomMemberId && currentUserId === chatroomMemberId) {
      // Current user is memberId, so other user is userId
      otherUser = chatroom.userId;
    } else {
      // Fallback: if we can't determine, try to use the one that's not null
      otherUser = chatroom.memberId || chatroom.userId;
    }

    // Ensure otherUser is an object, not just an ID string
    if (otherUser && typeof otherUser === 'string') {
      otherUser = null;
    }
    
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
    
    // Get profile image from userInfoId
    const profileImage = otherUser && typeof otherUser === 'object' 
      ? (otherUser.userInfoId?.profileImage || otherUser.userInfo?.profileImage || null)
      : null;
    
    const conversation = {
      id: chatroom._id || chatroom.id,
      chatroomId: chatroom._id || chatroom.id,
      name: otherUser 
        ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email
        : 'Unknown User',
      initials: otherUser 
        ? `${otherUser.firstName?.[0] || ''}${otherUser.lastName?.[0] || ''}`.toUpperCase() || otherUser.email?.[0]?.toUpperCase()
        : 'U',
      hasPhoto: !!profileImage,
      photoUrl: profileImage || null,
      unread: chatroom.unreadCount || 0,
      property: '', // TODO: Get property info if available
      message: '', // Last message will be shown
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

    // Removed verification check for renters - renters can send files regardless of verification status

    // Don't allow sending files if blocked
    if (selectedConversation.isBlockedByCurrentUser) {
      toast.error('You cannot send files because you have blocked this user. Please unblock to continue chatting.');
      return;
    }
    
    if (selectedConversation.isCurrentUserBlocked) {
      toast.error('You cannot send files because this user has blocked you.');
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
    
    // Removed verification check for renters - renters can send messages regardless of verification status
    
    // Don't allow sending if blocked
    if (selectedConversation.isBlockedByCurrentUser) {
      toast.error('You cannot send messages because you have blocked this user. Please unblock to continue chatting.');
      return;
    }
    
    if (selectedConversation.isCurrentUserBlocked) {
      toast.error('You cannot send messages because this user has blocked you.');
      return;
    }

    const chatroomId = selectedConversation.id || selectedConversation.chatroomId;
    if (!chatroomId) return;

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
    
    const chatroomId = selectedConversation.id || selectedConversation.chatroomId;
    if (!chatroomId) return;

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
            lastMessage: message.textDecrypted || message.textEncrypted || message.text || '',
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
        const updated = prev.map(c => 
          (c._id || c.id) === (updatedChatroom._id || updatedChatroom.id) ? updatedChatroom : c
        );
        
        // Update selected conversation if it's the updated chatroom
        if (selectedConversation && (selectedConversation.id === (updatedChatroom._id || updatedChatroom.id) || selectedConversation.chatroomId === (updatedChatroom._id || updatedChatroom.id))) {
          // Re-select conversation to update blocking status
          const updatedChatroomInList = updated.find(c => (c._id || c.id) === (updatedChatroom._id || updatedChatroom.id));
          if (updatedChatroomInList) {
            setTimeout(() => handleSelectConversation(updatedChatroomInList), 0);
          }
        }
        
        return updated;
      } else {
        return [updatedChatroom, ...prev];
      }
    });
  };

  const handleBackToMessageList = () => {
    setSelectedConversation(null);
    setChatMessages([]);
  };

  const handleDeleteChatroom = async (chatroomId) => {
    try {
      await deleteChatroom(chatroomId);
      toast.success('Conversation deleted successfully');
      
      // Remove chatroom from list
      setChatrooms(prev => prev.filter(c => (c._id || c.id) !== chatroomId));
      
      // If deleted chatroom is currently selected, clear selection
      if (selectedConversation && (selectedConversation.id === chatroomId || selectedConversation.chatroomId === chatroomId)) {
        setSelectedConversation(null);
        setChatMessages([]);
      }
      
      // Refresh chatrooms list
      const data = await getChatrooms();
      const normalizedChatrooms = (data || []).map(chatroom => {
        if (chatroom.lastMessage && typeof chatroom.lastMessage === 'object') {
          return {
            ...chatroom,
            lastMessage: chatroom.lastMessage.text || chatroom.lastMessage || '',
          };
        }
        return chatroom;
      });
      setChatrooms(normalizedChatrooms);
    } catch (error) {
      console.error('Error deleting chatroom:', error);
      toast.error(error.response?.data?.message || 'Failed to delete conversation');
    }
  };

  const handleBlockChatroom = async (chatroomId) => {
    try {
      const updatedChatroom = await blockUnblockChatroom(chatroomId, true);
      toast.success('User blocked successfully');
      
      // Update chatroom in list with timestamp fields
      setChatrooms(prev => {
        const updated = prev.map(c => {
          if ((c._id || c.id) === chatroomId) {
            const updatedChat = {
              ...c,
              ...updatedChatroom,
              // Ensure all block-related fields are updated
              isBlocked: true,
              blockedBy: updatedChatroom.blockedBy,
              status: 'blocked',
              blockedAtByUserId: updatedChatroom.blockedAtByUserId,
              blockedAtByMemberId: updatedChatroom.blockedAtByMemberId,
              unblockedAtByUserId: updatedChatroom.unblockedAtByUserId,
              unblockedAtByMemberId: updatedChatroom.unblockedAtByMemberId,
            };
            
            // Refresh selected conversation to recalculate block status using timestamp fields
            if (selectedConversation && (selectedConversation.id === chatroomId || selectedConversation.chatroomId === chatroomId)) {
              setTimeout(() => handleSelectConversation(updatedChat), 0);
            }
            
            return updatedChat;
          }
          return c;
        });
        return updated;
      });
    } catch (error) {
      console.error('Error blocking chatroom:', error);
      toast.error(error.response?.data?.message || 'Failed to block user');
    }
  };

  const handleUnblockChatroom = async (chatroomId) => {
    try {
      const updatedChatroom = await blockUnblockChatroom(chatroomId, false);
      toast.success('User unblocked successfully');
      
      // Update chatroom in list with timestamp fields
      setChatrooms(prev => {
        const updated = prev.map(c => {
          if ((c._id || c.id) === chatroomId) {
            const updatedChat = {
              ...c,
              ...updatedChatroom,
              // Ensure all block-related fields are updated
              isBlocked: updatedChatroom.isBlocked || false,
              blockedBy: updatedChatroom.blockedBy,
              status: updatedChatroom.status || 'active',
              blockedAtByUserId: updatedChatroom.blockedAtByUserId,
              blockedAtByMemberId: updatedChatroom.blockedAtByMemberId,
              unblockedAtByUserId: updatedChatroom.unblockedAtByUserId,
              unblockedAtByMemberId: updatedChatroom.unblockedAtByMemberId,
            };
            
            // Refresh selected conversation to recalculate block status using timestamp fields
            if (selectedConversation && (selectedConversation.id === chatroomId || selectedConversation.chatroomId === chatroomId)) {
              setTimeout(() => handleSelectConversation(updatedChat), 0);
            }
            
            return updatedChat;
          }
          return c;
        });
        return updated;
      });
    } catch (error) {
      console.error('Error unblocking chatroom:', error);
      toast.error(error.response?.data?.message || 'Failed to unblock user');
    }
  };

  // Filter chatrooms based on search
  // const filteredChatrooms = chatrooms.filter(chatroom => {
  //   if (!searchQuery.trim()) return true;
    
  //   const otherUser = currentUser?._id === (chatroom.userId?._id || chatroom.userId?.id) 
  //     ? chatroom.memberId 
  //     : chatroom.userId;
    
  //   const searchLower = searchQuery.toLowerCase();
  //   const name = otherUser 
  //     ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email
  //     : '';
    
  //   return name.toLowerCase().includes(searchLower) || 
  //          (otherUser?.email || '').toLowerCase().includes(searchLower);
  // });

  // Filter chatrooms based on search and exclude self-chats
  const filteredChatrooms = chatrooms.filter(chatroom => {
    // Get current user ID (normalize)
    const currentUserId = String(currentUser?._id || currentUser?.id || '');
    
    // Get chatroom user IDs (normalize)
    const chatroomUserId = String(chatroom.userId?._id || chatroom.userId?.id || chatroom.userId || '');
    const chatroomMemberId = String(chatroom.memberId?._id || chatroom.memberId?.id || chatroom.memberId || '');
    
    // Exclude self-chats (where userId === memberId)
    if (chatroomUserId === chatroomMemberId) {
      return false;
    }
    
    // Exclude if current user is chatting with themselves
    if (currentUserId && currentUserId === chatroomUserId && currentUserId === chatroomMemberId) {
      return false;
    }
    
    // Apply search filter if search query exists
    if (!searchQuery.trim()) return true;
    
    // Determine the other user - check if current user is userId or memberId
    let otherUser = null;
    if (currentUserId && chatroomUserId && currentUserId === chatroomUserId) {
      // Current user is userId, so other user is memberId
      otherUser = chatroom.memberId;
    } else if (currentUserId && chatroomMemberId && currentUserId === chatroomMemberId) {
      // Current user is memberId, so other user is userId
      otherUser = chatroom.userId;
    } else {
      // Fallback: if we can't determine, try to use the one that's not null
      otherUser = chatroom.memberId || chatroom.userId;
    }

    // Ensure otherUser is an object, not just an ID string
    if (otherUser && typeof otherUser === 'string') {
      otherUser = null;
    }
    
    const searchLower = searchQuery.toLowerCase();
    const name = otherUser 
      ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email || ''
      : '';
    
    return name.toLowerCase().includes(searchLower) || 
           (otherUser?.email || '').toLowerCase().includes(searchLower);
  });

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <PropertiesHeader 
        favoriteCount={favoriteCount}
        onHeartClick={() => navigate('/properties?saved=true')}
        isSavedView={false}
      />
      <main className="container mx-auto py-4 sm:py-6 lg:py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <div className="block">
          {/* Mobile: Show back button when conversation is selected */}
          {selectedConversation && (
            <button
              onClick={handleBackToMessageList}
              className="md:hidden flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-secondary hover:text-[#6B4EFF] hover:bg-purple-50 transition-all duration-200 group"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-200 group-hover:-translate-x-1"
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

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">
              Messages {hasAttemptedConnection && !isConnecting && !isConnected && <span className="text-xs font-normal text-red-500 ml-2">(Disconnected)</span>}
            </h1>
            <p className="text-sm text-[#62748E] font-normal">Connect with property owners and manage your conversations</p>
          </div>

          <div
            className={`flex gap-0 bg-white rounded-3xl shadow-sm transition-all duration-300 ${
              !selectedConversation && "border border-gray-100"
            } overflow-hidden`}
          >
            {/* Left Panel - Message List */}
            <div
              className={`${
                selectedConversation ? "hidden md:flex" : "flex"
              } w-full md:w-96 lg:w-[400px] bg-white border-r border-gray-100 flex flex-col transition-all duration-300`}
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg md:text-xl z-10">
                    <BlueSearchIcon />
                  </span>

                  <input
                    type="text"
                    placeholder="Search Messages"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.replace(/^\s+/, ''))}
                    className="w-full pl-11 md:pl-12 pr-4 h-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]/20 focus:border-[#6B4EFF] text-sm md:text-base bg-white transition-all duration-200 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)] md:max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#6B4EFF]/20"></div>
                      <div className="animate-spin rounded-full h-10 w-10 border-t-3 border-[#6B4EFF] absolute top-0 left-0"></div>
                    </div>
                  </div>
                ) : filteredChatrooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="mb-4 opacity-60">
                      <ChatBlueStartIcon />
                    </div>
                    <p className="text-gray-600 text-base font-medium font-nunito">
                      {searchQuery ? 'No messages found' : 'No messages yet'}
                    </p>
                    {!searchQuery && (
                      <p className="text-gray-400 text-sm font-normal font-nunito mt-2">
                        Start a conversation with property owners
                      </p>
                    )}
                  </div>
                ) : (
                  filteredChatrooms.map((chatroom) => {
                    // Use same ID normalization as handleSelectConversation
                    const currentUserId = String(currentUser?._id || currentUser?.id || '');
                    const chatroomUserId = String(chatroom.userId?._id || chatroom.userId?.id || chatroom.userId || '');
                    const chatroomMemberId = String(chatroom.memberId?._id || chatroom.memberId?.id || chatroom.memberId || '');
                    
                    // Determine the other user - check if current user is userId or memberId
                    let otherUser = null;
                    if (currentUserId && chatroomUserId && currentUserId === chatroomUserId) {
                      // Current user is userId, so other user is memberId
                      otherUser = chatroom.memberId;
                    } else if (currentUserId && chatroomMemberId && currentUserId === chatroomMemberId) {
                      // Current user is memberId, so other user is userId
                      otherUser = chatroom.userId;
                    } else {
                      // Fallback: if we can't determine, try to use the one that's not null
                      otherUser = chatroom.memberId || chatroom.userId;
                    }

                    // Ensure otherUser is an object, not just an ID string
                    if (otherUser && typeof otherUser === 'string') {
                      otherUser = null;
                    }
                    
                    const name = otherUser 
                      ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email || 'Unknown User'
                      : 'Unknown User';
                    
                    const initials = otherUser 
                      ? `${otherUser.firstName?.[0] || ''}${otherUser.lastName?.[0] || ''}`.toUpperCase() || otherUser.email?.[0]?.toUpperCase() || 'U'
                      : 'U';

                    // Get profile image from userInfoId
                    const profileImage = otherUser && typeof otherUser === 'object' 
                      ? (otherUser.userInfoId?.profileImage || otherUser.userInfo?.profileImage || null)
                      : null;
                    
                    // Check verification status for renters (only if otherUser is a valid object)
                    const otherUserType = otherUser && typeof otherUser === 'object' ? (otherUser.userType || null) : null;
                    const isOtherUserVerified = otherUser && typeof otherUser === 'object' 
                      ? (otherUser.userInfoId?.verificationStatus === 'verified' || 
                         otherUser.userInfo?.verificationStatus === 'verified' ||
                         false)
                      : false;
                    const showVerificationIcon = otherUserType === 'renter';
                    const isVerified = isOtherUserVerified;
                    
                    const chatroomId = chatroom._id || chatroom.id;
                    const isSelected = selectedConversation?.id === chatroomId;
                    const unreadCount = chatroom.unreadCount || 0;

                    return (
                      <div
                        key={chatroomId}
                        onClick={() => handleSelectConversation(chatroom)}
                        className={`p-4 cursor-pointer transition-all duration-200 border-b border-gray-50 ${
                          isSelected 
                            ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-l-[#6B4EFF]" 
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt={name}
                                className={`w-14 h-14 rounded-2xl object-cover shadow-sm transition-all duration-200 border-2 ${
                                  isSelected 
                                    ? "border-[#6B4EFF]/30" 
                                    : "border-gray-200"
                                }`}
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  e.target.style.display = 'none';
                                  const initialsDiv = e.target.parentElement.querySelector('.initials-fallback');
                                  if (initialsDiv) {
                                    initialsDiv.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#6B4EFF] font-bold text-base shadow-sm transition-all duration-200 initials-fallback ${
                                isSelected 
                                  ? "bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-[#6B4EFF]/30" 
                                  : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
                              } ${profileImage ? 'hidden' : ''}`}
                            >
                              {initials}
                            </div>
                            {/* Show verification icon for renters: cross if not verified, checkmark if verified */}
                            {showVerificationIcon && (
                              <span className="absolute -bottom-1 -right-1 bg-white rounded-full shadow-sm border-2 border-white">
                                {isVerified ? (
                                  <MediumCheckedIcon />
                                ) : (
                                  <RedCrossIcon />
                                )}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <h3 className={`font-semibold font-nunito text-base truncate transition-colors duration-200 ${
                                isSelected ? "text-[#6B4EFF]" : "text-[#0F172B]"
                              }`}>
                                {name}
                              </h3>
                              {unreadCount > 0 && (
                                <span className="text-white bg-[#009966] w-6 h-6 rounded-full flex items-center justify-center text-sm font-normal flex-shrink-0 ml-2">
                                  {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-normal font-nunito text-[#45556C] truncate mb-2">
                              {typeof chatroom.lastMessage === 'string' 
                                ? chatroom.lastMessage 
                                : (chatroom.lastMessage?.text || 'No messages yet')}
                            </p>
                            <div>
                              <span className="text-xs text-[#62748E] font-medium font-nunito">
                                {chatroom.lastMessageAt 
                                  ? new Date(chatroom.lastMessageAt).toLocaleDateString('en-US', { 
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

            {/* Right Panel - Chat View */}
            <div
              className={`${
                selectedConversation
                  ? "flex"
                  : "hidden md:flex"
              } flex-col bg-gradient-to-br from-gray-50/30 to-white overflow-y-auto flex-1 transition-all duration-300`}
            >
              {selectedConversation ? (
                <>
                  {messagesLoading && chatMessages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50/50 to-white">
                      <div className="text-center">
                        <div className="relative inline-block mb-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6B4EFF]/10"></div>
                          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#6B4EFF] absolute top-0 left-0"></div>
                        </div>
                        <p className="text-[#62748E] text-base font-medium font-nunito">Loading messages...</p>
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
                        onSendOffer={() => {}}
                        onProfileClick={() => {}}
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
                /* Empty State - Hidden on mobile when no conversation selected */
                <div className="hidden md:flex flex-1 items-center bg-gradient-to-br from-gray-50/50 to-white justify-center">
                  <div className="text-center px-6">
                    <div className="flex items-center justify-center mx-auto mb-6 opacity-60">
                      <ChatBlueStartIcon />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-[#4A2FCC] mb-3">
                      No conversation selected
                    </h3>
                    <p className="text-gray-600 text-base font-normal font-nunito max-w-md">
                      Select a conversation from the list to start messaging with property owners
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ChatMessage;
