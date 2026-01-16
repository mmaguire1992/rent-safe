import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';
import propertyReducer from './slices/propertySlice';
import verificationReducer from './slices/verificationSlice';
import propertyWizardReducer from './slices/propertyWizardSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  user: userReducer,
  property: propertyReducer,
  verification: verificationReducer,
  propertyWizard: propertyWizardReducer,
});

