'use client'

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@/lib/react-router-compat';
import { getNotifications, markNotificationAsRead } from '@/api/notifications';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';

/**
 * NotificationDropdown Component
 * Displays notifications with unread first (highlighted) and read (faded)
 * @param {boolean} isOpen - Whether dropdown is open
 * @param {Function} onClose - Callback when dropdown closes
 * @param {Function} onUnreadCountChange - Callback when unread count changes
 */
function NotificationDropdown({ isOpen, onClose, onUnreadCountChange }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchNotifications();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications({ page: 1, limit: 20 });
      setNotifications(data.notifications || []);
      const newUnreadCount = data.unreadCount || 0;
      setUnreadCount(newUnreadCount);
      // Notify parent of unread count change
      if (onUnreadCountChange) {
        onUnreadCountChange(newUnreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      setIsMarkingRead(true);
      await markNotificationAsRead({ notificationId });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId || notif.id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      const newUnreadCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newUnreadCount);
      // Notify parent of unread count change
      if (onUnreadCountChange) {
        onUnreadCountChange(newUnreadCount);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingRead(true);
      await markNotificationAsRead({ markAll: true });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      // Notify parent of unread count change
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-lg border border-lightGray shadow-xl z-50 max-h-[500px] flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-lightGray flex items-center justify-between">
        <h3 
          className="font-bold text-secondary text-lg font-nunito cursor-pointer hover:text-primary"
          onClick={() => {
            onClose();
            navigate('/dashboard/notifications');
          }}
        >
          Notifications
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingRead}
            className="text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-8 text-center text-midGray">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-midGray">
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-lightGray">
            {notifications.map((notification) => {
              const isRead = notification.isRead;
              const notificationId = notification._id || notification.id;
              
              return (
                <div
                  key={notificationId}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !isRead ? 'bg-blue-50/50' : 'bg-white'
                  }`}
                  onClick={() => {
                    onClose();
                    navigate('/dashboard/notifications');
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`font-semibold text-sm font-nunito ${
                            !isRead ? 'text-secondary' : 'text-midGray'
                          }`}
                        >
                          {notification.title || 'Notification'}
                        </h4>
                        {!isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p
                        className={`text-sm mt-1 font-nunito ${
                          !isRead ? 'text-secondary' : 'text-midGray opacity-70'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-midGray mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {!isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notificationId);
                        }}
                        disabled={isMarkingRead}
                        className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                        title="Mark as read"
                      >
                        <FiCheckCircle className="text-primary text-lg" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-lightGray text-center">
          <p className="text-xs text-midGray">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;

