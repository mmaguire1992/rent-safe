/**
 * API Routes Configuration
 * Centralized endpoint definitions for all API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const BASE_URL = API_BASE_URL;

// Properties Routes
export const properties = {
  createProperty: '/properties',
  getAllProperties: '/properties',
  getMyProperties: '/properties/my-properties',
  getMyActiveProperties: '/properties/my-properties/active',
  getRecentActiveProperties: '/properties/recent',
  getPropertiesByCity: (city) => `/properties/by-city/${encodeURIComponent(city)}`,
  getCityPropertyCounts: '/properties/cities/counts',
  getPropertyById: (id) => `/properties/${id}`,
  updateProperty: (id) => `/properties/${id}`,
  deleteProperty: (id) => `/properties/${id}`,
  updatePropertyStatus: (id) => `/properties/${id}/status`,
  uploadPropertyMedia: (id) => `/properties/${id}/media`,
  uploadMultiplePropertyMedia: (id) => `/properties/${id}/media/multiple`,
  deletePropertyMedia: (id, mediaId) => `/properties/${id}/media/${mediaId}`,
};

// Auth Routes (for reference)
export const auth = {
  login: '/auth/login',
  signup: '/auth/signup',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyOTP: '/auth/verify-otp',
  resendOTP: '/auth/resend-otp',
};

// Verification Routes
export const verification = {
  uploadToS3: '/verification/upload-to-s3',
  storeDocument: '/verification/store-document',
  getMyDocuments: '/verification/my-documents',
  downloadDocument: (id) => `/verification/download/${id}`,
  deleteDocument: (id) => `/verification/document/${id}`,
};

// Chat Routes
export const chat = {
  createOrGetChatroom: '/chat/chatroom',
  getChatrooms: '/chat/chatrooms',
  getChatroomMessages: (chatroomId) => `/chat/chatrooms/${chatroomId}/messages`,
  uploadMedia: '/chat/upload-media',
  getRecentRequests: '/chat/recent-requests',
  updateChatroom: (chatroomId) => `/chat/chatrooms/${chatroomId}`,
  blockUnblockChatroom: (chatroomId) => `/chat/chatrooms/${chatroomId}/block`,
};

// Dashboard Routes
export const dashboard = {
  getOwnerStats: '/dashboard/owner-stats',
  deleteChatroom: (chatroomId) => `/chat/chatrooms/${chatroomId}`,
  blockUnblockChatroom: (chatroomId) => `/chat/chatrooms/${chatroomId}/block`,
};

// Support Tickets Routes
export const supportTickets = {
  create: '/support-tickets',
  getAll: '/support-tickets',
  getById: (id) => `/support-tickets/${id}`,
  uploadMedia: (id) => `/support-tickets/${id}/media`,
  uploadMultipleMedia: (id) => `/support-tickets/${id}/media/multiple`,
};

// Wishlist Routes
export const wishlists = {
  addToWishlist: '/wishlists',
  removeFromWishlist: (propertyId) => `/wishlists/${propertyId}`,
  getUserWishlist: '/wishlists',
  checkWishlist: (propertyId) => `/wishlists/check/${propertyId}`,
  getWishlistPropertyIds: '/wishlists/ids',
};

// Notifications Routes
export const notifications = {
  getNotifications: '/notifications',
  markAsRead: '/notifications/mark-read',
};

// Subscriptions/Plans Routes
export const subscriptions = {
  getAllPlans: '/stripe/subscriptions/plans', // Public endpoint for getting plans
  createCheckoutSession: '/stripe/subscriptions/checkout',
  downloadInvoice: (paymentId) => `/stripe/subscriptions/invoice/${paymentId}`,
};
