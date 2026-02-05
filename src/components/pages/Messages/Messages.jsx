'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  const [mounted, setMounted] = useState(false);
  // Track which chatrooms have chat history (current user has sent messages)
  const [chatroomsWithHistory, setChatroomsWithHistory] = useState(new Set());
  // Track which chatrooms have been checked for history
  const [checkedChatrooms, setCheckedChatrooms] = useState(new Set());
  // Force re-render when history status changes
  const [historyCheckVersion, setHistoryCheckVersion] = useState(0);
  // PERMANENT history tracker using ref - never gets reset, persists across all operations
  // This ensures conversations with history NEVER move back to "Message Requests"
  const permanentHistoryRef = useRef(new Set());
  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedConversationRef = useRef(null);

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

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
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
        
        // CRITICAL: Check which chatrooms have chat history (current user has sent messages)
        // This determines which chatrooms should appear in "All Messages" vs "Message Requests"
        const currentUserId = String(currentUser?._id || currentUser?.id || user?._id || user?.id || '');
        if (currentUserId && normalizedChatrooms.length > 0) {
          // First, mark chatrooms where last message is from current user (definitely has history)
          const chatroomsWithUserHistory = new Set();
          const potentialNewRequests = [];
          
          normalizedChatrooms.forEach(chatroom => {
            const chatroomId = String(chatroom._id || chatroom.id || '');
            
            // If lastMessage exists and is from current user, mark as having history
            if (chatroom.lastMessage && chatroom.lastMessage.userId) {
              const lastMessageUserId = String(
                chatroom.lastMessage.userId?._id || 
                chatroom.lastMessage.userId?.id || 
                chatroom.lastMessage.userId || 
                ''
              );
              if (lastMessageUserId === currentUserId) {
                chatroomsWithUserHistory.add(chatroomId);
                setCheckedChatrooms(prev => new Set([...prev, chatroomId]));
              }
            }
            
            // CRITICAL: Mark chatrooms without unread messages as checked immediately
            // These can't be new requests, so they should show in "All Messages" right away
            if (!chatroom.unreadCount || chatroom.unreadCount === 0) {
              setCheckedChatrooms(prev => new Set([...prev, chatroomId]));
            }
            
            // Identify potential new requests: unread messages + last message from other user
            // These need async check before showing
            if (chatroom.unreadCount > 0 && !chatroomsWithUserHistory.has(chatroomId)) {
              if (chatroom.lastMessage && chatroom.lastMessage.userId) {
                const lastMessageUserId = String(
                  chatroom.lastMessage.userId?._id || 
                  chatroom.lastMessage.userId?.id || 
                  chatroom.lastMessage.userId || 
                  ''
                );
                if (lastMessageUserId && lastMessageUserId !== currentUserId) {
                  potentialNewRequests.push(chatroom);
                }
              }
            }
          });
          
          // Set initial history state for chatrooms where last message is from current user
          if (chatroomsWithUserHistory.size > 0) {
            // PERMANENT MARK: Add all to permanent ref
            chatroomsWithUserHistory.forEach(id => permanentHistoryRef.current.add(id));
            
            setChatroomsWithHistory(prev => new Set([...prev, ...chatroomsWithUserHistory]));
          }
          
          // Check message history for potential new requests (optimized - check only first and last page)
          if (potentialNewRequests.length > 0) {
            console.log(`[History Check] Checking ${potentialNewRequests.length} potential new requests`);
            const PAGE_SIZE = 100;
            const MAX_PAGES_TO_CHECK = 2; // Only check first and last page for performance
            
            // Process in batches to avoid overwhelming the server
            const BATCH_SIZE = 3; // Check 3 chatrooms at a time
            const batches = [];
            for (let i = 0; i < potentialNewRequests.length; i += BATCH_SIZE) {
              batches.push(potentialNewRequests.slice(i, i + BATCH_SIZE));
            }
            
            // Process batches sequentially to avoid overwhelming the server
            const processBatch = async (batch) => {
              return Promise.all(
                batch.map(async (chatroom) => {
                  try {
                    const chatroomId = String(chatroom._id || chatroom.id || '');
                    
                    // Get first page to know total pages
                    const firstPageResult = await getChatroomMessages(chatroomId, 1, PAGE_SIZE);
                    if (!firstPageResult || !firstPageResult.messages || firstPageResult.messages.length === 0) {
                      setCheckedChatrooms(prev => new Set([...prev, chatroomId]));
                      return { chatroomId, hasHistory: false };
                    }
                    
                    // Check first page (newest messages) - most likely to have user messages
                    let hasCurrentUserMessage = firstPageResult.messages.some(msg => {
                      const msgUserId = String(msg.userId?._id || msg.userId?.id || msg.userId || '');
                      return msgUserId === currentUserId;
                    });
                    
                    if (hasCurrentUserMessage) {
                      setCheckedChatrooms(prev => new Set([...prev, chatroomId]));
                      return { chatroomId, hasHistory: true };
                    }
                    
                    // Only check last page if there are multiple pages (optimization)
                    const totalPages = firstPageResult.pagination?.pages || 1;
                    if (totalPages > 1) {
                      const lastPageResult = await getChatroomMessages(chatroomId, totalPages, PAGE_SIZE);
                      if (lastPageResult && lastPageResult.messages && lastPageResult.messages.length > 0) {
                        hasCurrentUserMessage = lastPageResult.messages.some(msg => {
                          const msgUserId = String(msg.userId?._id || msg.userId?.id || msg.userId || '');
                          return msgUserId === currentUserId;
                        });
                        
                        if (hasCurrentUserMessage) {
                          setCheckedChatrooms(prev => new Set([...prev, chatroomId]));
                          return { chatroomId, hasHistory: true };
                        }
                      }
                    }
                    
                    // Mark as checked - if we got here, no messages from current user found
                    setCheckedChatrooms(prev => new Set([...prev, chatroomId]));
                    return { chatroomId, hasHistory: false };
                  } catch (error) {
                    console.error(`Error checking message history for chatroom ${chatroom._id}:`, error);
                    // On error, assume it has history (conservative - don't show in requests)
                    const chatroomId = String(chatroom._id || chatroom.id || '');
                    setCheckedChatrooms(prev => new Set([...prev, chatroomId]));
                    return { chatroomId, hasHistory: true };
                  }
                })
              );
            };
            
            // Process all batches sequentially
            (async () => {
              const allResults = [];
              for (const batch of batches) {
                const batchResults = await processBatch(batch);
                allResults.push(...batchResults);
                
                // Update state after each batch for better UX
                const newHistoryChatrooms = new Set();
                batchResults.forEach((result) => {
                  if (result.hasHistory) {
                    newHistoryChatrooms.add(result.chatroomId);
                  }
                });
                
                if (newHistoryChatrooms.size > 0) {
                  // PERMANENT MARK: Add all to permanent ref
                  newHistoryChatrooms.forEach(id => permanentHistoryRef.current.add(id));
                  
                  setChatroomsWithHistory(prev => {
                    const updated = new Set([...prev, ...newHistoryChatrooms]);
                    setHistoryCheckVersion(prev => prev + 1);
                    return updated;
                  });
                }
              }
            })();
          }
        }
      } catch (error) {
        console.error('Error fetching chatrooms:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchChatrooms();
  }, [currentUser, user]);

  // Auto-select conversation if there's only one
  useEffect(() => {
    if (chatrooms.length === 1 && !selectedConversation && (currentUser || user) && !loading) {
      const chatroom = chatrooms[0];
      // Normalize IDs for comparison
      const currentUserId = String(currentUser?._id || currentUser?.id || user?._id || user?.id || '');
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
          
          // CRITICAL: Check for history when new messages arrive from other users
          // If chatroom hasn't been checked yet, check it now
          if (!checkedChatrooms.has(chatroomIdStr) && !chatroomsWithHistory.has(chatroomIdStr)) {
            // Check message history immediately
            (async () => {
              try {
                const PAGE_SIZE = 100;
                const firstPageResult = await getChatroomMessages(chatroomIdStr, 1, PAGE_SIZE);
                if (firstPageResult && firstPageResult.messages && firstPageResult.messages.length > 0) {
                  const hasCurrentUserMessage = firstPageResult.messages.some(msg => {
                    const msgUserId = String(msg.userId?._id || msg.userId?.id || msg.userId || '');
                    return msgUserId === currentUserId;
                  });
                  
                  if (hasCurrentUserMessage) {
                    // PERMANENT MARK: Add to permanent ref
                    permanentHistoryRef.current.add(chatroomIdStr);
                    
                    setCheckedChatrooms(prev => new Set([...prev, chatroomIdStr]));
                    setChatroomsWithHistory(prev => {
                      const updated = new Set([...prev, chatroomIdStr]);
                      setHistoryCheckVersion(prev => prev + 1);
                      return updated;
                    });
                  } else {
                    setCheckedChatrooms(prev => new Set([...prev, chatroomIdStr]));
                  }
                }
              } catch (error) {
                console.error(`Error checking history for ${chatroomIdStr}:`, error);
                setCheckedChatrooms(prev => new Set([...prev, chatroomIdStr]));
              }
            })();
          }
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

    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageSent();
      unsubscribeMessagesMarkedRead();
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
  // Memoize currentUserId to avoid recalculating it multiple times
  const currentUserId = useMemo(() => {
    return String(currentUser?._id || currentUser?.id || user?._id || user?.id || '');
  }, [currentUser?._id, currentUser?.id, user?._id, user?.id]);

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
      
      // CRITICAL: Check if chatroom already has history BEFORE fetching messages
      // Use PERMANENT ref as primary source - this NEVER gets cleared
      const currentUserId = String(currentUser?._id || currentUser?.id || user?._id || user?.id || '');
      const hasPermanentHistory = permanentHistoryRef.current.has(chatroomId);
      const hasHistoryInState = chatroomsWithHistory.has(chatroomId);
      
      // Also check the chatroom in the list - if lastMessage is from current user, it has history
      const chatroomInList = chatrooms.find(c => String(c._id || c.id || '') === chatroomId);
      let hasHistoryFromLastMessage = false;
      if (chatroomInList && chatroomInList.lastMessage && currentUserId) {
        const lastMsgUserId = String(
          chatroomInList.lastMessage.userId?._id || 
          chatroomInList.lastMessage.userId?.id || 
          chatroomInList.lastMessage.userId || 
          ''
        );
        hasHistoryFromLastMessage = lastMsgUserId === currentUserId;
      }
      
      const alreadyHasHistory = hasPermanentHistory || hasHistoryInState || hasHistoryFromLastMessage;
      
      // CRITICAL: If we detect history from any source, mark it permanently immediately
      // This ensures the history is preserved before any async operations
      if (alreadyHasHistory && !hasPermanentHistory) {
        // PERMANENT MARK: Add to permanent ref - this NEVER gets cleared
        permanentHistoryRef.current.add(chatroomId);
        
        if (!hasHistoryInState) {
          setChatroomsWithHistory(prev => {
            if (!prev.has(chatroomId)) {
              const updated = new Set([...prev, chatroomId]);
              setHistoryCheckVersion(prev => prev + 1);
              return updated;
            }
            return prev;
          });
        }
        setCheckedChatrooms(prev => new Set([...prev, chatroomId]));
      }
      
      const result = await getChatroomMessages(chatroomId, page, limit);
      if (result && result.messages) {
        // Messages are sorted newest first from backend - reverse to show newest at bottom
        const formattedMessages = result.messages.reverse().map(msg => formatMessage(msg));
        setChatMessages(formattedMessages);
        setCurrentPage(page);
        setHasMoreMessages(result.pagination?.hasMore || false);

        // CRITICAL: Check if current user has sent ANY messages in this chatroom (has chat history)
        if (currentUserId) {
          // Mark as checked immediately
          setCheckedChatrooms(prev => new Set([...prev, chatroomId]));
          
          // CRITICAL: If chatroom already has history, preserve it (never remove)
          // This prevents conversations from "All Messages" from moving back to "Message Requests"
          
          if (alreadyHasHistory) {
            // PERMANENT MARK: Ensure it's in permanent ref
            permanentHistoryRef.current.add(chatroomId);
            
            // Already marked as having history - ensure it stays that way PERMANENTLY
            // No need to re-check, just ensure state is consistent
            setChatroomsWithHistory(prev => {
              if (!prev.has(chatroomId)) {
                const updated = new Set([...prev, chatroomId]);
                setHistoryCheckVersion(prev => prev + 1);
                return updated;
              }
              return prev; // Keep existing history - NEVER remove
            });
          } else {
            // Check if current user has sent messages in this chatroom
            // Check the first page (most recent messages) - if user has history, it's likely here
            let hasCurrentUserMessages = result.messages.some(msg => {
              const msgUserId = String(msg.userId?._id || msg.userId?.id || msg.userId || '');
              return msgUserId === currentUserId;
            });
            
            // If not found on first page and there are more pages, check the last page too
            // (User's first message might be on the last page if it's an old conversation)
            if (!hasCurrentUserMessages && result.pagination && result.pagination.pages > 1) {
              try {
                const lastPageResult = await getChatroomMessages(chatroomId, result.pagination.pages, 100);
                if (lastPageResult && lastPageResult.messages) {
                  hasCurrentUserMessages = lastPageResult.messages.some(msg => {
                    const msgUserId = String(msg.userId?._id || msg.userId?.id || msg.userId || '');
                    return msgUserId === currentUserId;
                  });
                }
              } catch (error) {
                console.error('Error checking last page for history:', error);
                // If error, assume it has history (conservative approach)
                hasCurrentUserMessages = true;
              }
            }
            
            // If found ANY message from current user, mark as having history PERMANENTLY
            // This ensures the chatroom appears in "All Messages" tab and NEVER moves back
            if (hasCurrentUserMessages) {
              // PERMANENT MARK: Add to permanent ref - this NEVER gets cleared
              permanentHistoryRef.current.add(chatroomId);
              
              setChatroomsWithHistory(prev => {
                // Once added, it NEVER gets removed
                const updated = new Set([...prev, chatroomId]);
                setHistoryCheckVersion(prev => prev + 1);
                return updated;
              });
            }
          }
          
          // Update the chatroom in the list to ensure UI reflects the latest message
          setChatrooms(prev => prev.map(chatroom => {
            const currentId = String(chatroom._id || chatroom.id || '');
            if (currentId === chatroomId) {
              // Ensure lastMessage reflects the latest message
              const latestMessage = result.messages[0]; // Messages are sorted newest first
              if (latestMessage) {
                return {
                  ...chatroom,
                  lastMessage: {
                    text: latestMessage.textDecrypted || latestMessage.textEncrypted || latestMessage.text || '',
                    createdAt: latestMessage.createdAt || new Date(),
                    userId: latestMessage.userId,
                    type: latestMessage.type || 'text',
                    fileUrl: latestMessage.fileUrl || null,
                  },
                  lastMessageAt: latestMessage.createdAt || new Date(),
                };
              }
              return chatroom;
            }
            return chatroom;
          }));
        }

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

  const handleSelectConversation = useCallback((chatroom) => {
    // Normalize IDs for comparison - use memoized currentUserId
    const chatroomId = String(chatroom._id || chatroom.id || '');
    const chatroomUserId = String(chatroom.userId?._id || chatroom.userId?.id || chatroom.userId || '');
    const chatroomMemberId = String(chatroom.memberId?._id || chatroom.memberId?.id || chatroom.memberId || '');
    
    // CRITICAL: Mark conversations as having history when selected to prevent incorrect tab movement
    // Strategy: If it's NOT a new message request, it has history - mark it permanently
    if (chatroomId && currentUserId) {
      // Check if lastMessage is from current user (definitive proof of history)
      let hasHistoryFromLastMessage = false;
      if (chatroom.lastMessage) {
        const lastMsgUserId = String(
          chatroom.lastMessage.userId?._id || 
          chatroom.lastMessage.userId?.id || 
          chatroom.lastMessage.userId || 
          ''
        );
        hasHistoryFromLastMessage = lastMsgUserId === currentUserId;
      }
      
      // Check if it's already marked as having history
      const hasPermanentHistory = permanentHistoryRef.current.has(chatroomId);
      const hasHistoryInState = chatroomsWithHistory.has(chatroomId);
      
      // If lastMessage is from current user, it DEFINITELY has history - mark permanently
      // OR if we're in "All Messages" tab, it has history - mark permanently
      // OR if it's already marked, ensure it stays marked
      if (hasHistoryFromLastMessage || activeTab === 'all' || hasPermanentHistory || hasHistoryInState) {
        if (!hasPermanentHistory) {
          permanentHistoryRef.current.add(chatroomId);
          if (!hasHistoryInState) {
            setChatroomsWithHistory(prev => {
              if (!prev.has(chatroomId)) {
                const updated = new Set([...prev, chatroomId]);
                setHistoryCheckVersion(prev => prev + 1);
                return updated;
              }
              return prev;
            });
          }
        }
      }
    }
    
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
      property: '',
      message: chatroom.lastMessage?.text || '',
      time: chatroom.lastMessageAt ? new Date(chatroom.lastMessageAt).toLocaleDateString() : '',
      otherUser,
      isBlocked,
      isBlockedByCurrentUser,
      isCurrentUserBlocked,
    };

    setSelectedConversation(conversation);
  }, [currentUserId, activeTab, chatroomsWithHistory]);

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
          const currentUserId = String(currentUser?._id || currentUser?.id || user?._id || user?.id || '');
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
          
          // CRITICAL: If current user sent a message, mark this chatroom as having chat history
          // This means it's no longer a new user request, so it moves to "All Messages"
          if (!isFromOtherUser) {
            // OPTIMISTIC UPDATE: Batch all state updates together for instant, smooth UX
            // React 18+ automatically batches these updates for optimal performance
            setCheckedChatrooms(prev => new Set([...prev, chatroomIdStr]));
            
            // CRITICAL: Once marked as having history, it NEVER gets removed
            // This ensures conversations stay in "All Messages" and never move back to "Message Requests"
            setChatroomsWithHistory(prev => {
              // If already has history, keep it (never remove)
              if (prev.has(chatroomIdStr)) {
                return prev;
              }
              // Otherwise, add it
              const updated = new Set([...prev, chatroomIdStr]);
              setHistoryCheckVersion(prev => prev + 1);
              return updated;
            });
            // No backend refresh needed - state updates are instant and smooth
          }
          
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
    if (!selectedConversation) return;
    
    try {
      setLoadingProfile(true);
      
      // Get user ID from otherUser if available, otherwise get from chatroom
      let userId = null;
      if (selectedConversation.otherUser) {
        userId = selectedConversation.otherUser._id || selectedConversation.otherUser.id;
      }
      
      // If otherUser is not available, get user ID from the chatroom data
      if (!userId) {
        // Find the chatroom in the chatrooms list to get the full data
        const chatroom = chatrooms.find(c => 
          (c._id || c.id) === (selectedConversation.id || selectedConversation.chatroomId)
        );
        
        if (chatroom) {
          // Determine which user is the "other user" (not the current user)
          const currentUserId = String(currentUser?._id || currentUser?.id || user?._id || user?.id || '');
          const chatroomUserId = String(chatroom.userId?._id || chatroom.userId?.id || chatroom.userId || '');
          const chatroomMemberId = String(chatroom.memberId?._id || chatroom.memberId?.id || chatroom.memberId || '');
          
          // Get the other user's ID
          if (currentUserId && chatroomUserId && currentUserId === chatroomUserId) {
            // Current user is userId, so other user is memberId
            userId = chatroomMemberId;
          } else if (currentUserId && chatroomMemberId && currentUserId === chatroomMemberId) {
            // Current user is memberId, so other user is userId
            userId = chatroomUserId;
          } else {
            // Fallback: use the one that's not the current user
            userId = currentUserId === chatroomUserId ? chatroomMemberId : chatroomUserId;
          }
          
          // If userId is still a populated object, extract the ID
          if (userId && typeof userId === 'object') {
            userId = userId._id || userId.id;
          }
        }
      }
      
      if (userId) {
        const userData = await getUserById(userId);
          
          // Format user data to match TenantProfileDetail expected structure
          // Get name - prioritize first name + last name, fallback to email only if no name available
          const userName = userData.userInfo?.name?.first && userData.userInfo?.name?.last
            ? `${userData.userInfo.name.first} ${userData.userInfo.name.last}`.trim()
            : userData.firstName && userData.lastName
            ? `${userData.firstName} ${userData.lastName}`.trim()
            : null; // Don't use email as name, will show initials instead
          
          const formattedTenantData = {
            id: userData._id || userData.id, // Add user ID for references
            name: userName || 'User', // Use 'User' as fallback instead of email
            profileImage: userData.userInfo?.profileImage || null, // Use null instead of default path
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
        } else {
          toast.error('Unable to load user profile. User ID not found.');
        }
      } catch (error) {
        console.error('Error fetching tenant profile:', error);
        toast.error('Failed to load tenant profile');
        // Still show profile detail with basic info if we have otherUser data
        if (selectedConversation.otherUser) {
          // Get name - prioritize first name + last name
          const fallbackUserName = `${selectedConversation.otherUser.firstName || ''} ${selectedConversation.otherUser.lastName || ''}`.trim() || 'User';
          
          setTenantProfileData({
            id: selectedConversation.otherUser._id || selectedConversation.otherUser.id,
            name: fallbackUserName,
          profileImage: null, // Use null instead of default path to show initials
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
            fullName: fallbackUserName,
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
        }
      } finally {
        setLoadingProfile(false);
      }
  };

  const handleBackToChat = useCallback(() => {
    setShowProfileDetail(false);
    setTenantProfileData(null);
  }, []);

  const handleBackToMessageList = useCallback(() => {
    setSelectedConversation(null);
    setShowProfileDetail(false);
    setTenantProfileData(null);
  }, []);

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

  // Helper function to check if a chatroom is a "new user" message request
  // A chatroom is a new user request if:
  // 1. The last message is from the OTHER user (not current user)
  // 2. There are unread messages (OR it's currently selected - to keep it visible when opened)
  // 3. The current user hasn't sent any messages yet (NO chat history from current user)
  // 4. It has been checked (to prevent flickering)
  const isNewUserMessageRequest = useCallback((chatroom) => {
    if (!currentUserId) return false;

    const chatroomId = String(chatroom._id || chatroom.id || '');
    
    // CRITICAL: Check PERMANENT history first - this NEVER gets cleared
    // If it's in permanent history, it's definitely NOT a new request
    if (permanentHistoryRef.current.has(chatroomId)) {
      return false;
    }
    
    // Also check state (for newly detected history)
    if (chatroomsWithHistory.has(chatroomId)) {
      return false;
    }

    // If we haven't checked this chatroom yet, don't show it (conservative approach)
    if (!checkedChatrooms.has(chatroomId)) {
      return false;
    }

    // Must have a last message
    if (!chatroom.lastMessage) {
      return false;
    }

    // Get the last message user ID
    const lastMessageUserId = String(
      chatroom.lastMessage.userId?._id || 
      chatroom.lastMessage.userId?.id || 
      chatroom.lastMessage.userId || 
      ''
    );

    // Last message must be from the OTHER user (not current user)
    if (!lastMessageUserId || lastMessageUserId === currentUserId) {
      return false;
    }

    // CRITICAL: Must have unread messages (this ensures only NEW message requests are shown)
    // EXCEPTION: If this is the currently selected conversation, show it even if unreadCount is 0
    // (This keeps it visible when opened, but once user responds, chatroomsWithHistory will exclude it)
    const isCurrentlySelected = selectedConversation && 
                                 (selectedConversation.id === chatroomId || selectedConversation.chatroomId === chatroomId);
    
    if (!isCurrentlySelected && (!chatroom.unreadCount || chatroom.unreadCount === 0)) {
      return false;
    }

    return true;
  }, [currentUserId, chatroomsWithHistory, selectedConversation]);

  // Helper function to check if a chatroom is a message request
  // Only shows NEW message requests (where current user hasn't responded yet)
  const isMessageRequestChatroom = useCallback((chatroom) => {
    // Use the same logic as isNewUserMessageRequest - only show actual new requests
    return isNewUserMessageRequest(chatroom);
  }, [isNewUserMessageRequest]);

  // Memoize history check logic to avoid recalculating
  const checkHistoryFromLastMessage = useCallback((chatroom) => {
    if (!chatroom.lastMessage || !currentUserId) return false;
    const lastMsgUserId = String(
      chatroom.lastMessage.userId?._id || 
      chatroom.lastMessage.userId?.id || 
      chatroom.lastMessage.userId || 
      ''
    );
    return lastMsgUserId === currentUserId;
  }, [currentUserId]);

  // Filter chatrooms based on search and active tab - MEMOIZED for performance
  const filteredChatrooms = useMemo(() => {
    // Track chatrooms that need history marking (batch state updates)
    const chatroomsToMark = [];
    
    const filtered = chatrooms.filter(chatroom => {
      const chatroomId = String(chatroom._id || chatroom.id || '');
      const isChecked = checkedChatrooms.has(chatroomId);
      
      // CRITICAL: Check PERMANENT history first - this is the most reliable source
      // It NEVER gets cleared, so conversations with history stay in "All Messages" forever
      const hasPermanentHistory = permanentHistoryRef.current.has(chatroomId);
      const hasHistoryInState = chatroomsWithHistory.has(chatroomId);
      
      // Additional check - if lastMessage is from current user, it definitely has history
      const hasHistoryFromLastMessage = checkHistoryFromLastMessage(chatroom);
      
      // If lastMessage indicates history, queue it for marking (batch update)
      if (hasHistoryFromLastMessage && !hasPermanentHistory) {
        chatroomsToMark.push(chatroomId);
      }
    
    // Final history check: permanent ref OR state OR lastMessage
    const finalHasHistory = hasPermanentHistory || hasHistoryInState || hasHistoryFromLastMessage;
    const isNewRequest = isNewUserMessageRequest(chatroom);
    
    // Filter by tab:
    // - "requests" tab: Only show NEW message requests (not responded to yet)
    // - "all" tab: Only show existing conversations (checked, has history, OR checked and no unread)
    
    if (activeTab === "requests") {
      // STRICT FILTER: Only show NEW message requests (not responded to yet)
      // This tab should NEVER show regular conversations or responded requests
      // CRITICAL: Must be checked first to prevent flickering
      if (!isChecked) {
        return false;
      }
      // CRITICAL: If it has history (from state OR lastMessage), NEVER show in requests
      if (finalHasHistory) {
        return false;
      }
      // Show ONLY if it's a new message request (no history from current user)
      // This ensures we only show actual message requests, not all messages
      if (!isNewRequest) {
        return false;
      }
    } else if (activeTab === "all") {
      // Only show existing conversations (where current user has responded)
      // CRITICAL: Don't show unchecked chatrooms - wait for check to complete
      // This prevents new requests from appearing in "All Messages" before check completes
      if (!isChecked) {
        return false;
      }
      
    // PRIMARY CHECK: Show chatrooms that have history (current user has sent messages)
    // PERMANENT ref check is the highest priority - if it's in permanent ref, ALWAYS show in "All Messages"
    if (hasPermanentHistory) {
      return true; // PERMANENTLY in "All Messages" - never moves back
    }
    
    // SECONDARY CHECK: Use finalHasHistory which includes both state and lastMessage check
    // This is the main criteria for "All Messages"
    if (finalHasHistory) {
      return true; // Definitely show it - user has responded
    }
      
      // SECONDARY CHECK: If no history, only show if:
      // 1. It's NOT a new request (safety check)
      // 2. It has no unread messages (old conversation, not a new request)
      // This handles edge cases where history check might not have completed yet
      if (isNewRequest) {
        return false; // Don't show new requests in "All Messages"
      }
      
      // If it's checked, not a new request, and has no unread, it's likely an old conversation
      // Show it in "All Messages" (this handles cases where history check is pending)
      if (!chatroom.unreadCount || chatroom.unreadCount === 0) {
        return true;
      }
      
      // Default: don't show if we're not sure
      return false;
    }

      // Filter by search query
      if (searchQuery.trim()) {
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

        const searchLower = searchQuery.toLowerCase();
        const name = otherUser
          ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.email || ''
          : '';

        return name.toLowerCase().includes(searchLower) ||
          (otherUser?.email || '').toLowerCase().includes(searchLower);
      }

      return true;
    });
    
    // Batch update history marking (single state update instead of multiple)
    if (chatroomsToMark.length > 0) {
      // Use setTimeout to batch updates and avoid blocking render
      setTimeout(() => {
        chatroomsToMark.forEach(chatroomId => {
          if (!permanentHistoryRef.current.has(chatroomId)) {
            permanentHistoryRef.current.add(chatroomId);
            setChatroomsWithHistory(prev => {
              if (!prev.has(chatroomId)) {
                const updated = new Set([...prev, chatroomId]);
                setHistoryCheckVersion(prev => prev + 1);
                return updated;
              }
              return prev;
            });
          }
        });
      }, 0);
    }
    
    return filtered;
  }, [chatrooms, activeTab, searchQuery, checkedChatrooms, chatroomsWithHistory, currentUserId, isNewUserMessageRequest, checkHistoryFromLastMessage]);

  // Memoize counts for tabs - only recalculate when dependencies change
  const { allMessagesCount, messageRequestsCount, messageRequestsUnreadCount } = useMemo(() => {
    const all = chatrooms.filter(c => !isNewUserMessageRequest(c)).length;
    const requests = chatrooms.filter(c => isNewUserMessageRequest(c)).length;
    const unread = chatrooms
      .filter(c => isNewUserMessageRequest(c))
      .reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    
    return {
      allMessagesCount: all,
      messageRequestsCount: requests,
      messageRequestsUnreadCount: unread
    };
  }, [chatrooms, isNewUserMessageRequest]);

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
      {showVerificationPage ? (
        <div className="block">
          <div className="flex items-center justify-center min-h-[60vh] bg-white rounded-[20px] border border-lightGray">
            <div className="text-center px-4 py-8">
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-red-500"
                  >
                    <path
                      d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-secondary mb-3 font-nunito">
                Profile Verification Required
              </h2>
              <p className="text-base md:text-lg text-darkGray max-w-md mx-auto font-nunito">
                {getVerificationMessage('chat with other users')}
              </p>
            </div>
          </div>
        </div>
      ) : (
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

        {!showProfileDetail && (
          <h1 className="text-xl xl:text-2xl font-bold text-secondary mb-4">
            Messages {mounted && hasAttemptedConnection && !isConnecting && !isConnected && <span className="text-xs text-red-500">(Disconnected)</span>}
          </h1>
        )}

        {/* Tabs */}
        {!showProfileDetail && (
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => {
              const newTab = "all";
              setActiveTab(newTab);
              localStorage.setItem('messagesActiveTab', newTab);
              
              // Smooth transition: Keep selected conversation if it belongs in "All Messages"
              if (selectedConversation) {
                const chatroomId = String(selectedConversation.id || selectedConversation.chatroomId || '');
                
                // CRITICAL: Check permanent ref first (most reliable)
                const hasPermanentHistory = permanentHistoryRef.current.has(chatroomId);
                const hasHistoryInState = chatroomsWithHistory.has(chatroomId);
                
                // If it's being viewed in "All Messages" tab, it MUST have history
                // Mark it permanently to prevent it from ever moving back to "Message Requests"
                if (!hasPermanentHistory && !hasHistoryInState) {
                  // Check if lastMessage indicates history
                  const chatroom = chatrooms.find(c => String(c._id || c.id || '') === chatroomId);
                  const currentUserId = String(currentUser?._id || currentUser?.id || user?._id || user?.id || '');
                  let hasHistoryFromLastMessage = false;
                  if (chatroom && chatroom.lastMessage && currentUserId) {
                    const lastMsgUserId = String(
                      chatroom.lastMessage.userId?._id || 
                      chatroom.lastMessage.userId?.id || 
                      chatroom.lastMessage.userId || 
                      ''
                    );
                    hasHistoryFromLastMessage = lastMsgUserId === currentUserId;
                  }
                  
                  // If we're switching to "All Messages" and this conversation is selected,
                  // it means it should have history - mark it permanently
                  if (hasHistoryFromLastMessage || hasPermanentHistory || hasHistoryInState) {
                    permanentHistoryRef.current.add(chatroomId);
                    setChatroomsWithHistory(prev => {
                      if (!prev.has(chatroomId)) {
                        const updated = new Set([...prev, chatroomId]);
                        setHistoryCheckVersion(prev => prev + 1);
                        return updated;
                      }
                      return prev;
                    });
                  }
                }
                
                const hasHistory = hasPermanentHistory || hasHistoryInState;
                // Only clear if it's still a message request (no history)
                // If it has history, keep it selected for smooth UX
                if (!hasHistory) {
                  setSelectedConversation(null);
                }
              }
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
              
              // Smooth transition: Keep selected conversation if it's still a message request
              if (selectedConversation) {
                const chatroomId = String(selectedConversation.id || selectedConversation.chatroomId || '');
                
                // CRITICAL: Check permanent ref first (most reliable)
                const hasPermanentHistory = permanentHistoryRef.current.has(chatroomId);
                const hasHistoryInState = chatroomsWithHistory.has(chatroomId);
                const hasHistory = hasPermanentHistory || hasHistoryInState;
                
                // Only clear if it has history (user has responded)
                // If no history, keep it selected for smooth UX
                if (hasHistory) {
                  setSelectedConversation(null);
                }
              }
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
            {/* {messageRequestsUnreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {messageRequestsUnreadCount > 99 ? '99+' : messageRequestsUnreadCount}
              </span>
            )} */}
          </button>
        </div>
        )}

        <div
          className={`flex gap-0 bg-white rounded-[20px] overflow-hidden ${!showProfileDetail && "border border-lightGray"
            }`}
          style={{ position: 'relative' }}
        >
          {/* Left Panel - Message List */}
          {!showProfileDetail && (
            <div
              className={`${selectedConversation ? "hidden md:flex" : "flex"
                } w-full md:w-96 lg:w-[400px] rounded-tl-[20px] rounded-bl-[20px] md:rounded-tr-none md:rounded-br-none rounded-[20px] md:rounded-[0] bg-white border-r border-lightGray md:border-r flex flex-col relative z-10`}
              style={{ pointerEvents: 'auto' }}
            >
              {/* Header */}
              <div className="p-3 border-b border-lightGray">
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg md:text-xl">
                    <BlueSearchIcon />
                  </span>

                  <input
                    type="text"
                    placeholder="Search Messages"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.replace(/^\s+/, ''))}
                    className="w-full pl-9 md:pl-10 pr-3 h-12 md:pr-4 py-1.5 md:py-2 border border-lightGray rounded-xl focus:outline-none focus:ring-0 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Message List */}
              <div 
                className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]"
                style={{ pointerEvents: 'auto' }}
              >
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
                    const currentUserId = String(currentUser?._id || currentUser?.id || user?._id || user?.id || '');
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
                      // This handles cases where currentUser might not be set yet
                      otherUser = chatroom.memberId || chatroom.userId;
                    }

                    // Ensure otherUser is an object, not just an ID string
                    if (otherUser && typeof otherUser === 'string') {
                      // If it's just an ID, we can't display user info
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
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleSelectConversation(chatroom);
                        }}
                        className={`p-4 bg-[#F8F8F8] border-b border-lightGray cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? "bg-purple-50" : ""
                          }`}
                        style={{ 
                          pointerEvents: 'auto',
                          opacity: 1,
                          cursor: 'pointer'
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectConversation(chatroom);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt={name}
                                className="w-12 h-12 rounded-full object-cover border border-lightGray"
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
                              className={`w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6B4EFF] font-bold border border-lightGray initials-fallback ${profileImage ? 'hidden' : ''}`}
                            >
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
              } relative z-0`}
            style={{ pointerEvents: 'auto' }}
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
      )}
    </DashboardLayout>
  );
}

export default Messages;
