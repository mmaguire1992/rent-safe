import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCurrentUser,
  updateUserProfile,
  uploadProfilePicture,
  changePassword,
  requestPhoneUpdate,
  verifyPhoneUpdate,
  deleteAccount,
} from '../../api/users';

// Helper function to safely parse JSON from localStorage
const getStoredUserInfo = () => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('userInfo');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user info from localStorage:', error);
    localStorage.removeItem('userInfo');
    return null;
  }
};

const initialState = {
  userInfo: getStoredUserInfo(), // All user details stored here
  loading: false,
  updating: false,
  uploading: false,
  changingPassword: false,
  error: null,
  lastFetched: null, // Timestamp of last fetch
};

// Async thunk to fetch current user details
export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await getCurrentUser();
      return userData;
    } catch (error) {
      // API returns { success: false, error: "message" } or { success: false, message: "message" }
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch user info';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update user profile
export const updateUserInfo = createAsyncThunk(
  'user/updateUserInfo',
  async (updatedData, { rejectWithValue }) => {
    try {
      const userData = await updateUserProfile(updatedData);
      return userData;
    } catch (error) {
      // API returns { success: false, error: "message" } or { success: false, message: "message" }
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to update user info';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to upload profile picture
export const uploadUserProfilePicture = createAsyncThunk(
  'user/uploadProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const result = await uploadProfilePicture(file);
      return result;
    } catch (error) {
      // API returns { success: false, error: "message" } or { success: false, message: "message" }
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to upload profile picture';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to change password
export const changeUserPassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const result = await changePassword(passwordData);
      return result;
    } catch (error) {
      // API returns { success: false, error: "message" } or { success: false, message: "message" }
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to change password';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to request phone update
export const requestUserPhoneUpdate = createAsyncThunk(
  'user/requestPhoneUpdate',
  async (phone, { rejectWithValue }) => {
    try {
      const result = await requestPhoneUpdate(phone);
      return result;
    } catch (error) {
      // API returns { success: false, error: "message" } or { success: false, message: "message" }
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to request phone update';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to verify phone update
export const verifyUserPhoneUpdate = createAsyncThunk(
  'user/verifyPhoneUpdate',
  async (otp, { rejectWithValue }) => {
    try {
      const result = await verifyPhoneUpdate(otp);
      return result;
    } catch (error) {
      // API returns { success: false, error: "message" } or { success: false, message: "message" }
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to verify phone update';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to delete account
export const deleteUserAccount = createAsyncThunk(
  'user/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      const result = await deleteAccount();
      return result;
    } catch (error) {
      // API returns { success: false, error: "message" } or { success: false, message: "message" }
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to delete account';
      return rejectWithValue(errorMessage);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      state.error = null;
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('userInfo', JSON.stringify(action.payload));
        } else {
          localStorage.removeItem('userInfo');
        }
      }
    },
    clearUserInfo: (state) => {
      state.userInfo = null;
      state.error = null;
      state.lastFetched = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Info
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.lastFetched = new Date().toISOString();
        state.error = null;
        // Persist to localStorage
        if (typeof window !== 'undefined' && action.payload) {
          localStorage.setItem('userInfo', JSON.stringify(action.payload));
        }
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User Info
      .addCase(updateUserInfo.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.updating = false;
        // Replace entire userInfo with fresh data from server
        state.userInfo = action.payload;
        state.lastFetched = new Date().toISOString();
        state.error = null;
        // Persist to localStorage
        if (typeof window !== 'undefined' && state.userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        }
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Upload Profile Picture
      .addCase(uploadUserProfilePicture.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadUserProfilePicture.fulfilled, (state, action) => {
        state.uploading = false;
        // Update userInfo with profile picture data
        if (state.userInfo) {
          // Update userInfo.profileImage if returned (FIXED: was profilePicture)
          if (action.payload?.profileImage) {
            if (state.userInfo.userInfo) {
              state.userInfo.userInfo.profileImage = action.payload.profileImage;
            } else {
              state.userInfo.userInfo = { profileImage: action.payload.profileImage };
            }
          }
        }
        state.error = null;
        // Persist to localStorage
        if (typeof window !== 'undefined' && state.userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        }
      })
      .addCase(uploadUserProfilePicture.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      // Change Password
      .addCase(changeUserPassword.pending, (state) => {
        state.changingPassword = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.changingPassword = false;
        state.error = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.changingPassword = false;
        state.error = action.payload;
      })
      // Request Phone Update
      .addCase(requestUserPhoneUpdate.pending, (state) => {
        state.error = null;
      })
      .addCase(requestUserPhoneUpdate.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(requestUserPhoneUpdate.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Verify Phone Update
      .addCase(verifyUserPhoneUpdate.pending, (state) => {
        state.error = null;
      })
      .addCase(verifyUserPhoneUpdate.fulfilled, (state, action) => {
        if (state.userInfo && action.payload?.phone) {
          state.userInfo = { ...state.userInfo, phone: action.payload.phone };
        }
        state.error = null;
        // Persist to localStorage
        if (typeof window !== 'undefined' && state.userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        }
      })
      .addCase(verifyUserPhoneUpdate.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete Account
      .addCase(deleteUserAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.error = null;
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userInfo');
          localStorage.removeItem('userToken');
        }
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUserInfo, clearUserInfo, clearError } = userSlice.actions;
export default userSlice.reducer;

