'use client'

import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/react-router-compat';
import DashboardLayout from '@/components/adminDashboard/dashboard/DashboardLayout';
import Navbar from '@/components/frontend/common/header';
import Footer from '@/components/frontend/common/footer';
import { getNotifications, markNotificationAsRead } from '@/api/notifications';
import { FiCheck, FiFilter, FiSearch, FiCheckCircle, FiChevronLeft } from 'react-icons/fi';
import Pagination from '@/components/adminDashboard/common/Pagination';
import CustomDropdown from '@/components/adminDashboard/common/CustomDropdown';

// Notification type options based on enum
const NOTIFICATION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'verification_approved', label: 'Verification Approved' },
  { value: 'verification_rejected', label: 'Verification Rejected' },
  { value: 'property_interest', label: 'Property Interest' },
  { value: 'property_approved', label: 'Property Approved' },
  { value: 'property_rejected', label: 'Property Rejected' },
  { value: 'property_created', label: 'Property Created' },
  { value: 'document_reuploaded', label: 'Document Reuploaded' },
  { value: 'subscription_expiring', label: 'Subscription Expiring' },
  { value: 'subscription_activated', label: 'Subscription Activated' },
  { value: 'subscription_canceled', label: 'Subscription Canceled' },
  { value: 'subscription_created', label: 'Subscription Created' },
  { value: 'payment_success', label: 'Payment Success' },
  { value: 'payment_failed', label: 'Payment Failed' },
];

// Status filter options
const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
];

// Get icon for notification type
const getNotificationIcon = (type) => {
  const iconStyle = "w-6 h-6";
  switch (type) {
    case 'verification_approved':
    case 'property_approved':
      return <div className={`${iconStyle} rounded-full bg-green-100 flex items-center justify-center`}>
        <FiCheckCircle className="text-green-600 text-sm" />
      </div>;
    case 'verification_rejected':
    case 'property_rejected':
      return <div className={`${iconStyle} rounded-full bg-red-100 flex items-center justify-center`}>
        <FiCheckCircle className="text-red-600 text-sm" />
      </div>;
    case 'property_interest':
      return <div className={`${iconStyle} rounded-full bg-blue-100 flex items-center justify-center`}>
        <FiCheckCircle className="text-blue-600 text-sm" />
      </div>;
    case 'property_created':
    case 'document_reuploaded':
      return <div className={`${iconStyle} rounded-full bg-purple-100 flex items-center justify-center`}>
        <FiCheckCircle className="text-purple-600 text-sm" />
      </div>;
    default:
      return <div className={`${iconStyle} rounded-full bg-gray-100 flex items-center justify-center`}>
        <FiCheckCircle className="text-gray-600 text-sm" />
      </div>;
  }
};

function NotificationsPage({ layout = 'dashboard' }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' or 'unread'
  const [typeFilter, setTypeFilter] = useState(''); // Notification type
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications
  const fetchNotifications = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: itemsPerPage,
        isRead: statusFilter === 'unread' ? false : undefined,
        type: typeFilter || undefined,
      };
      
      const data = await getNotifications(params);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setPagination(data.pagination || {});
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [statusFilter, typeFilter]);

  // Handle page change
  const handlePageChange = (page) => {
    fetchNotifications(page);
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      setIsMarkingRead(true);
      await markNotificationAsRead({ notificationId });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          (notif._id === notificationId || notif.id === notificationId)
            ? { ...notif, isRead: true }
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
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

  // Filter notifications by search query
  const filteredNotifications = notifications.filter(notif => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (notif.title || '').toLowerCase().includes(query) ||
      (notif.message || '').toLowerCase().includes(query)
    );
  });

  const content = (
    <div className="block">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-3 py-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors font-nunito"
            >
              <FiChevronLeft className="text-lg" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary mb-1 sm:mb-2 font-nunito">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-darkGray font-nunito">
            Manage and view all your system alerts and updates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingRead}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-nunito"
              >
                <FiCheck className="text-lg" />
                <span className="text-sm font-medium">Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}


        {/* Search and Type Filter */}
       <div className='flex items-center justify-between gap-2'>
       <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="sm:w-80 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-midGray text-lg" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.replace(/^\s+/, ''))}
              className="w-full pl-10 pr-10 py-2.5 border border-lightGray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-nunito"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-midGray hover:text-secondary"
              >
                <FiFilter className="text-lg" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="sm:w-64">
            <CustomDropdown
              options={NOTIFICATION_TYPES}
              value={typeFilter}
              onChange={(value) => setTypeFilter(value)}
              placeholder="All Types"
              className="h-[42px]"
            />
          </div>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm font-nunito transition-colors ${
                statusFilter === filter.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-secondary hover:bg-gray-100 border border-lightGray'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
       </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg border border-lightGray shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-midGray font-nunito">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-midGray font-nunito">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y divide-lightGray">
              {filteredNotifications.map((notification) => {
                const isRead = notification.isRead;
                const notificationId = notification._id || notification.id;
                
                return (
                  <div
                    key={notificationId}
                    className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors ${
                      !isRead ? 'bg-blue-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className={`font-semibold text-base font-nunito ${
                                  !isRead ? 'text-secondary' : 'text-midGray'
                                }`}
                              >
                                {notification.title || 'Notification'}
                              </h3>
                              {!isRead && (
                                <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full font-medium font-nunito">
                                  New
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-sm mt-2 font-nunito ${
                                !isRead ? 'text-secondary' : 'text-midGray opacity-70'
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-midGray mt-3 font-nunito">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>

                          {/* Mark as Read Button */}
                          {!isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notificationId)}
                              disabled={isMarkingRead}
                              className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                              title="Mark as read"
                            >
                              <FiCheckCircle className="text-primary text-xl" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-lightGray">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalCount || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                itemName="notifications"
                showInfo={false}
              />
            </div>
          )}

          {/* Results Count */}
          {!isLoading && filteredNotifications.length > 0 && (
            <div className="p-4 border-t border-lightGray">
              <p className="text-sm text-midGray text-center font-nunito">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.totalCount || 0)} of {pagination.totalCount || 0} results
              </p>
            </div>
          )}
        </div>
    </div>
  );

  if (layout === 'public') {
    return (
      <>
        <Navbar />
        <main className="min-h-[60vh] px-4 sm:px-6 lg:px-8 py-6">
          {content}
        </main>
        <Footer />
      </>
    );
  }

  return <DashboardLayout>{content}</DashboardLayout>;
}

export default NotificationsPage;

