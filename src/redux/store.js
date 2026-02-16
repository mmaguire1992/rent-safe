import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';
import propertyReducer from './slices/propertySlice';
import verificationReducer from './slices/verificationSlice';
import propertyWizardReducer from './slices/propertyWizardSlice';
import headerReducer from './slices/headerSlice';

// Persist config for header slice only
const headerPersistConfig = {
  key: 'header',
  storage,
  // Only persist these fields (exclude loading and error states)
  whitelist: [
    'profileImage',
    'favoriteCount',
    'hasPaidVerification',
    'remainingContacts',
    'contactLimit',
    'lastFetched',
    'userId',
  ],
};

// Create persisted reducer for header
const persistedHeaderReducer = persistReducer(headerPersistConfig, headerReducer);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    user: userReducer,
    property: propertyReducer,
    verification: verificationReducer,
    propertyWizard: propertyWizardReducer,
    header: persistedHeaderReducer, // Persisted header reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for redux-persist
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
});

// Create persistor for the store
export const persistor = persistStore(store);
