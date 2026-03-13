'use client'

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from '@/lib/react-router-compat';
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Breadcrumb from "@/components/adminDashboard/common/Breadcrumb";
import EditProfileTab from "@/components/adminDashboard/ProfileSettings/EditProfileTab";
import ChangePasswordTab from "@/components/adminDashboard/ProfileSettings/ChangePasswordTab";
import DeleteAccountTab from "@/components/adminDashboard/ProfileSettings/DeleteAccountTab";
import DeleteAccountModal from "@/components/adminDashboard/ProfileSettings/DeleteAccountModal";
import PasswordSuccessModal from "@/components/adminDashboard/ProfileSettings/PasswordSuccessModal";
import ProfileOtpModal from "@/components/adminDashboard/ProfileSettings/ProfileOtpModal";
import CustomDropdown from "@/components/adminDashboard/common/CustomDropdown";
import {
  fetchUserInfo,
  updateUserInfo,
  uploadUserProfilePicture,
  changeUserPassword,
  requestUserPhoneUpdate,
  verifyUserPhoneUpdate,
  deleteUserAccount,
  clearUserInfo,
} from "@/redux/slices/userSlice";
import { logout } from "@/redux/slices/authSlice";

function ProfileSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();
  const { userInfo, loading, updating, uploading, changingPassword, error } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("edit");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordSuccessModalOpen, setIsPasswordSuccessModalOpen] = useState(false);
  const [isProfileOtpOpen, setIsProfileOtpOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [pendingPhoneUpdate, setPendingPhoneUpdate] = useState(null);
  const [pendingProfileUpdate, setPendingProfileUpdate] = useState(null);

  // Fetch user info on mount and when component becomes visible
  // Always fetch to get latest data from server
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        await dispatch(fetchUserInfo()).unwrap();
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Error is handled by Redux state
      }
    };
    
    loadUserProfile();
  }, [dispatch]);

  // Refresh user info when tab changes to edit (to get latest data)
  useEffect(() => {
    if (activeTab === 'edit' && userInfo) {
      // Optionally refresh when switching to edit tab to ensure fresh data
      // This is debounced to avoid excessive API calls
      const refreshTimer = setTimeout(() => {
        dispatch(fetchUserInfo());
      }, 300);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [activeTab, dispatch]); // Only depend on activeTab to avoid loops

  const formatFullName = (first, last) => {
    const safeFirst = String(first || '').trim();
    const safeLast = String(last || '').trim();
    if (!safeFirst && !safeLast) return '';
    if (!safeLast || safeFirst.toLowerCase() === safeLast.toLowerCase()) return safeFirst;
    return `${safeFirst} ${safeLast}`.trim();
  };

  // Transform userInfo to profileSettingsData format
  const profileSettingsData = userInfo ? {
    fullName: formatFullName(
      userInfo.firstName || userInfo.userInfo?.name?.first,
      userInfo.lastName || userInfo.userInfo?.name?.last
    ),
    email: userInfo.email || '',
    phoneNumber: userInfo.phone || userInfo.userInfo?.phone || '',
    businessName: userInfo.userInfo?.businessName || '',
    address: userInfo.userInfo?.address?.street || '',
    city: userInfo.userInfo?.address?.city || '',
    county: userInfo.userInfo?.address?.county || '',
    country: userInfo.userInfo?.address?.country || '',
    postcode: userInfo.userInfo?.address?.postcode || '',
    profileImage: userInfo.userInfo?.profileImage || userInfo.userInfo?.profilePicture || userInfo.profileImage || userInfo.profilePicture || null,
    isEmailVerified: userInfo.isEmailVerified || false,
    isPhoneVerified: userInfo.isPhoneVerified || userInfo.phone ? true : false,
  } : {
    fullName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    address: '',
    city: '',
    county: '',
    country: '',
    postcode: '',
    profileImage: null,
    isEmailVerified: false,
    isPhoneVerified: false,
  };

  const handleSaveProfile = async (data) => {
    try {
      // Prepare update data
      // Split full name into first and last
      // If only one name, use as firstName only, leave lastName empty
      const nameParts = data.fullName.trim().split(/\s+/).filter(part => part.length > 0);
      const firstName = nameParts[0] || null;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
      
      const updateData = {
        firstName: firstName,
        lastName: lastName,
        userInfo: {
          name: {
            first: firstName || undefined,
            last: lastName,
          },
          address: {
            street: data.address || '',
            city: data.city || '',
            county: data.county || '', // Include county in address
            postcode: data.postcode || '',
            country: data.country || '',
          },
          businessName: data.businessName || '',
        },
      };
      
      // Only add lastName to updateData if it's provided (not null)
      if (lastName) {
        updateData.lastName = lastName;
      }

      // If phone number changed, request OTP first
      if (data.phoneNumber && data.phoneNumber !== profileSettingsData.phoneNumber) {
        // Request phone update (sends OTP)
        await dispatch(requestUserPhoneUpdate(data.phoneNumber)).unwrap();
        setPendingPhoneUpdate(data.phoneNumber);
        setPendingProfileUpdate(updateData); // Store profile update data for after OTP verification
        setOtpEmail(userInfo?.email || '');
        setIsProfileOtpOpen(true);
        // Don't update profile yet - wait for OTP verification
        return;
      }

      // Upload profile picture first if provided (so it's included in the profile)
      if (data.profileImage && data.profileImage instanceof File) {
        const uploadResult = await dispatch(uploadUserProfilePicture(data.profileImage)).unwrap();
        const uploadedProfileImage = uploadResult?.profileImage || null;

        // Update AuthContext immediately so header/profile icon reflects without waiting for refetch
        if (uploadedProfileImage && updateUser) {
          updateUser({
            userInfo: {
              ...user?.userInfo,
              profileImage: uploadedProfileImage,
            },
          });
        }

        // Notify headers immediately with the latest image URL
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('profileImageUpdated', {
              detail: { profileImage: uploadedProfileImage },
            })
          );
        }

        // Refresh user info after picture upload to get updated profile
        const refreshedUserInfo = await dispatch(fetchUserInfo()).unwrap();
        
        // Dispatch event to notify Header component about profile image update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('profileImageUpdated', {
              detail: { profileImage: refreshedUserInfo?.userInfo?.profileImage || uploadedProfileImage },
            })
          );
        }
        
        // Update AuthContext with new profile image if available
        if (refreshedUserInfo?.userInfo?.profileImage && updateUser) {
          updateUser({ 
            userInfo: { 
              ...user?.userInfo, 
              profileImage: refreshedUserInfo.userInfo.profileImage 
            } 
          });
        }
      }

      // Update profile (no phone change or phone already verified)
      const updatedProfile = await dispatch(updateUserInfo(updateData)).unwrap();
      
      // The updateUserInfo already returns the complete updated profile from backend
      // But we'll refresh to ensure we have the latest data including any server-side changes
      const refreshedUserInfo = await dispatch(fetchUserInfo()).unwrap();

      // Keep AuthContext/localStorage userData in sync so header name and image updates immediately
      if (updateUser) {
        updateUser({ 
          firstName, 
          lastName,
          userInfo: {
            ...user?.userInfo,
            profileImage: refreshedUserInfo?.userInfo?.profileImage || user?.userInfo?.profileImage
          }
        });
      }
      
      // Dispatch event to notify Header component about profile image update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profileImageUpdated'));
      }
      
      // Show success message
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // When using Redux Toolkit's .unwrap(), the rejected value is the error itself
      // Extract validation errors from different possible locations
      let validationErrors = null;
      
      // Check if error itself has validationErrors (when rejected with object)
      if (error && typeof error === 'object' && error.validationErrors && Array.isArray(error.validationErrors)) {
        validationErrors = error.validationErrors;
      }
      // Check if it's nested in payload
      else if (error?.payload?.validationErrors && Array.isArray(error.payload.validationErrors)) {
        validationErrors = error.payload.validationErrors;
      }
      // Check direct axios response
      else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        validationErrors = error.response.data.errors;
      }
      
      // Display only the first validation error (one toast at a time)
      if (validationErrors && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        // Show just the error message, not the field name for cleaner UX
        toast.error(firstError.message || 'Validation failed');
      } else {
      // Extract error message - could be string (from Redux) or object (from axios)
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (typeof error === 'string') {
        errorMessage = error;
        } else if (error && typeof error === 'object') {
          // When Redux rejects with object, check message property
          if (error.message && typeof error.message === 'string') {
            errorMessage = error.message;
          } else if (error?.payload) {
            errorMessage = typeof error.payload === 'string' ? error.payload : (error.payload.message || error.payload.error || errorMessage);
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
          }
      }
      
      toast.error(errorMessage);
      }
      
      throw error; // Re-throw to let component handle it
    }
  };

  const handleVerifyOtp = async (otp) => {
    try {
      if (pendingPhoneUpdate) {
        // Verify phone update
        await dispatch(verifyUserPhoneUpdate(otp)).unwrap();
        setPendingPhoneUpdate(null);
        
        // If there's a pending profile update, complete it now
        if (pendingProfileUpdate) {
          // Upload profile picture first if it was part of the update
          // Note: profileImage would need to be stored separately if needed
          await dispatch(updateUserInfo(pendingProfileUpdate)).unwrap();
          setPendingProfileUpdate(null);
        }
        
        // Always refresh user info after phone verification to get complete updated profile
        const refreshedUserInfo = await dispatch(fetchUserInfo()).unwrap();
        
        // Dispatch event to notify Header component about profile image update (if image was updated)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('profileImageUpdated'));
        }
        
        // Update AuthContext with new profile image if available
        if (refreshedUserInfo?.userInfo?.profileImage && updateUser) {
          updateUser({ 
            userInfo: { 
              ...user?.userInfo, 
              profileImage: refreshedUserInfo.userInfo.profileImage 
            } 
          });
        }
        
        // Show success message
        toast.success('Phone number verified and profile updated successfully!');
      }
      setIsProfileOtpOpen(false);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      // Extract validation errors from different possible locations
      let validationErrors = null;
      if (error?.validationErrors && Array.isArray(error.validationErrors)) {
        validationErrors = error.validationErrors;
      } else if (error?.payload?.validationErrors && Array.isArray(error.payload.validationErrors)) {
        validationErrors = error.payload.validationErrors;
      } else if (error?.payload && typeof error.payload === 'object' && Array.isArray(error.payload)) {
        validationErrors = error.payload;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        validationErrors = error.response.data.errors;
      }
      
      // Display only the first validation error (one toast at a time)
      if (validationErrors && validationErrors.length > 0) {
        const firstError = validationErrors[0];
        // Show just the error message
        toast.error(firstError.message || 'Validation failed');
      } else {
      // Extract error message - could be string (from Redux) or object (from axios)
      let errorMessage = "Failed to verify OTP. Please try again.";
      
      if (typeof error === 'string') {
        errorMessage = error;
        } else if (error?.payload) {
          errorMessage = typeof error.payload === 'string' ? error.payload : (error.payload.message || error.payload.error || errorMessage);
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      }
      
      throw error; // Let the modal handle the error display
    }
  };

  const handleSavePassword = async (data) => {
    try {
      if (!userInfo?.email) {
        toast.error('User email not found');
        throw new Error('User email not found');
      }

      await dispatch(changeUserPassword({
        email: userInfo.email,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })).unwrap();

      // Show success message
      toast.success('Password changed successfully. Please login again with your new password.');
      
      // Clear user info from userSlice
      dispatch(clearUserInfo());
      
      // Logout user after successful password change (security best practice)
      await dispatch(logout()).unwrap();
      
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error changing password:', error);
      // Extract error message from Redux rejected action or axios error
      // When using .unwrap(), rejectWithValue(string) throws the string directly
      // API returns { success: false, error: "message" } or { success: false, message: "message" }
      let errorMessage = "Failed to change password. Please try again.";
      
      if (typeof error === 'string') {
        // Redux thunk rejected with a string message
        errorMessage = error;
      } else if (error?.response?.data?.error) {
        // API returned { success: false, error: "message" }
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        // API returned { success: false, message: "message" }
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        // Standard error object
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteUserAccount()).unwrap();
      setIsDeleteModalOpen(false);
      // Redirect to login after account deletion
      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      // Extract error message - could be string (from Redux) or object (from axios)
      let errorMessage = "Failed to delete account. Please try again.";
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const tabs = [
    { id: "edit", label: "Edit Profile" },
    { id: "password", label: "Change Password" },
    { id: "delete", label: "Delete Account" },
  ];

  const tabOptions = tabs.map((tab) => ({
    value: tab.id,
    label: tab.label,
  }));

  const getSelectedTabLabel = () => {
    const selectedTab = tabs.find((tab) => tab.id === activeTab);
    return selectedTab ? selectedTab.label : "Edit Profile";
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb />

        <div className="block">
          <h1 className="text-xl sm:text-2xl font-bold font-nunito text-secondary mb-4 sm:mb-6">
            Profile Setting
          </h1>

          {/* Mobile: Dropdown for tabs */}
          <div className="md:hidden mb-4">
            <CustomDropdown
              options={tabOptions}
              value={activeTab}
              onChange={handleTabChange}
              placeholder={getSelectedTabLabel()}
              className="w-full h-[52px]"
            />
          </div>

          {/* Desktop: Tabs */}
          <div className="hidden md:flex gap-4 mb-0 pl-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-2 text-base lg:text-lg font-medium font-nunito transition-colors relative ${
                  activeTab === tab.id
                    ? "text-[#4A2FCC] font-semibold"
                    : "text-darkGray hover:text-secondary"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#4A2FCC]"></div>
                )}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-lightGray p-4">
          <div className="bg-white rounded-xl border border-lightGray p-4">
            {/* Loading State */}
            {loading && !userInfo && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4EFF]"></div>
                <p className="ml-4 text-darkGray">Loading profile...</p>
              </div>
            )}

            {/* Tab Content */}
            {(!loading || userInfo) && (
              <div>
                {activeTab === "edit" && (
                  <EditProfileTab
                    profileData={profileSettingsData}
                    onSave={handleSaveProfile}
                    loading={updating || uploading}
                    error={null}
                  />
                )}
              {activeTab === "password" && (
                <ChangePasswordTab
                  onSave={handleSavePassword}
                  onSuccess={() => setIsPasswordSuccessModalOpen(true)}
                  loading={changingPassword}
                  error={error}
                />
              )}
                {activeTab === "delete" && (
                  <DeleteAccountTab onDelete={handleDeleteAccount} />
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <PasswordSuccessModal
        isOpen={isPasswordSuccessModalOpen}
        onClose={() => setIsPasswordSuccessModalOpen(false)}
      />
      <ProfileOtpModal
        isOpen={isProfileOtpOpen}
        onClose={() => {
          setIsProfileOtpOpen(false);
          setPendingPhoneUpdate(null);
          setPendingProfileUpdate(null);
        }}
        onVerify={handleVerifyOtp}
        email={otpEmail}
      />
    </DashboardLayout>
  );
}

export default ProfileSettings;
