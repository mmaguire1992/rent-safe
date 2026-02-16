import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentUser } from '../../api/users';
import { getWishlistPropertyIds } from '../../api/wishlists';
import { getUserVerificationPayment } from '../../api/subscriptions';

// Async thunk to fetch header data (profile image, wishlist count, payment status)
export const fetchHeaderData = createAsyncThunk(
  'header/fetchHeaderData',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const isAuthenticated = auth?.isAuthenticated;
      const userType = auth?.userType;
      const userId = auth?.user?.id || auth?.user?._id;

      if (!isAuthenticated || !userId) {
        return {
          profileImage: null,
          favoriteCount: 0,
          hasPaidVerification: false,
          remainingContacts: null,
          contactLimit: 5,
        };
      }

      // Fetch user data and wishlist in parallel
      const [userData, wishlistIds] = await Promise.all([
        getCurrentUser().catch(() => null),
        getWishlistPropertyIds().catch(() => []),
      ]);

      let hasPaidVerification = false;
      let remainingContacts = null;
      let contactLimit = 5;

      if (userData) {
        remainingContacts = userData.remainingContacts ?? null;
        contactLimit = userData.chatContactLimit ?? 5;

        // Check payment status only for renters
        if (userType === 'renter') {
          try {
            const payment = await getUserVerificationPayment();
            hasPaidVerification = !!(payment && payment.status === 'succeeded');
          } catch (error) {
            // If 404 or error, user hasn't paid
            hasPaidVerification = false;
          }
        }
      }

      return {
        profileImage: userData?.userInfo?.profileImage || null,
        favoriteCount: Array.isArray(wishlistIds) ? wishlistIds.length : 0,
        hasPaidVerification,
        remainingContacts,
        contactLimit,
        lastFetched: new Date().toISOString(),
        userId, // Store userId to detect user changes
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch header data');
    }
  }
);

// Async thunk to refresh profile image only
export const refreshProfileImage = createAsyncThunk(
  'header/refreshProfileImage',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await getCurrentUser();
      if (userData?.userInfo?.profileImage) {
        // Add cache-busting parameter
        const imageUrl = userData.userInfo.profileImage + 
          (userData.userInfo.profileImage.includes('?') ? '&' : '?') + 
          '_t=' + Date.now();
        return imageUrl;
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to refresh profile image');
    }
  }
);

// Async thunk to update favorite count
export const updateFavoriteCount = createAsyncThunk(
  'header/updateFavoriteCount',
  async (count, { rejectWithValue }) => {
    try {
      return count;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update favorite count');
    }
  }
);

const initialState = {
  profileImage: null,
  favoriteCount: 0,
  hasPaidVerification: false,
  remainingContacts: null,
  contactLimit: 5,
  loading: false,
  error: null,
  lastFetched: null,
  userId: null, // Track which user this data belongs to
};

const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    setProfileImage: (state, action) => {
      state.profileImage = action.payload;
    },
    setFavoriteCount: (state, action) => {
      state.favoriteCount = action.payload;
    },
    setPaymentStatus: (state, action) => {
      state.hasPaidVerification = action.payload.hasPaidVerification;
      state.remainingContacts = action.payload.remainingContacts;
      state.contactLimit = action.payload.contactLimit;
    },
    clearHeaderData: (state) => {
      state.profileImage = null;
      state.favoriteCount = 0;
      state.hasPaidVerification = false;
      state.remainingContacts = null;
      state.contactLimit = 5;
      state.lastFetched = null;
      state.userId = null;
    },
    // Reset if user changed (login/logout)
    resetIfUserChanged: (state, action) => {
      const newUserId = action.payload;
      if (state.userId && state.userId !== newUserId) {
        // User changed, clear data
        return initialState;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Header Data
      .addCase(fetchHeaderData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeaderData.fulfilled, (state, action) => {
        state.loading = false;
        state.profileImage = action.payload.profileImage;
        state.favoriteCount = action.payload.favoriteCount;
        state.hasPaidVerification = action.payload.hasPaidVerification;
        state.remainingContacts = action.payload.remainingContacts;
        state.contactLimit = action.payload.contactLimit;
        state.lastFetched = action.payload.lastFetched;
        state.userId = action.payload.userId;
        state.error = null;
      })
      .addCase(fetchHeaderData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Refresh Profile Image
      .addCase(refreshProfileImage.fulfilled, (state, action) => {
        state.profileImage = action.payload;
      })
      // Update Favorite Count
      .addCase(updateFavoriteCount.fulfilled, (state, action) => {
        state.favoriteCount = action.payload;
      });
  },
});

export const { 
  setProfileImage, 
  setFavoriteCount, 
  setPaymentStatus, 
  clearHeaderData,
  resetIfUserChanged 
} = headerSlice.actions;

export default headerSlice.reducer;
