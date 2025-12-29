import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return 'light';
};

const initialState = {
  sidebarOpen: true,
  theme: getInitialTheme(),
  notifications: [],
  loading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }
    },
    addNotification: (state, action) => {
      const notification = {
        id: action.payload.id || Date.now() + Math.random(),
        type: action.payload.type || 'success',
        message: action.payload.message,
        duration: action.payload.duration !== undefined ? action.payload.duration : 5000,
      };
      state.notifications.push(notification);
      // Persist to localStorage for cross-page notifications (like logout)
      if (action.payload.persist && typeof window !== 'undefined') {
        localStorage.setItem('pendingNotification', JSON.stringify(notification));
      }
    },
    loadPendingNotification: (state) => {
      if (typeof window === 'undefined') return;
      const pending = localStorage.getItem('pendingNotification');
      if (pending) {
        try {
          const notification = JSON.parse(pending);
          state.notifications.push(notification);
          localStorage.removeItem('pendingNotification');
        } catch (e) {
          // Ignore parse errors
        }
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  addNotification,
  removeNotification,
  loadPendingNotification,
  setLoading,
} = uiSlice.actions;
export default uiSlice.reducer;

