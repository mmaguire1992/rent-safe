import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
  error: null,
  lastFetched: null, // Timestamp of last fetch
};

// Async thunk to fetch current user details
export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when user profile API is available
      // const response = await getUserProfile();
      // const userData = response?.data || response;
      // return userData;
      return rejectWithValue('User profile API not implemented yet');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch user info'
      );
    }
  }
);

// Async thunk to update user info (optimistic update)
export const updateUserInfo = createAsyncThunk(
  'user/updateUserInfo',
  async (updatedData, { rejectWithValue }) => {
    try {
      // This will be handled by the component that calls the API
      // We just update the local state optimistically
      return updatedData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update user info'
      );
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
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.userInfo = { ...state.userInfo, ...action.payload };
        // Persist to localStorage
        if (typeof window !== 'undefined' && state.userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        }
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setUserInfo, clearUserInfo, clearError } = userSlice.actions;
export default userSlice.reducer;

