/**
 * Check if user is verified
 * @param {Object} user - User object from Redux state
 * @returns {boolean} - Returns true if user is verified, false otherwise
 */
export const isUserVerified = (user) => {
  if (!user) return false;
  console.log("user", user);
  const verificationStatus = user?.userInfo?.verificationStatus || 'not_started';
  console.log("verificationStatus", verificationStatus);
  return verificationStatus === 'verified';
};

/**
 * Get verification message
 * @param {string} action - Action being performed (e.g., 'add property', 'chat')
 * @returns {string} - Verification message
 */
export const getVerificationMessage = (action = 'perform this action') => {
  return `Your profile is not approved yet. Please wait for admin verification to ${action}.`;
};

