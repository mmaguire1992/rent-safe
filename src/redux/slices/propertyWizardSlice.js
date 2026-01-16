import { createSlice } from '@reduxjs/toolkit';

// localStorage keys
const ADD_KEY = 'rentsafe:addPropertyWizard';
const EDIT_KEY_PREFIX = 'rentsafe:editPropertyWizard:'; // + <propertyId>

const defaultFormData = {
  propertyTitle: '',
  propertyType: '',
  propertyDescription: '',
  bedrooms: '',
  bathrooms: '',
  address: '',
  city: '',
  county: '',
  state: '',
  postcode: '',
  country: '',
  monthlyRent: '',
  availableFrom: '',
  additionalCharges: [{ type: '', amount: '' }],
  furnishedStatus: '',
  amenities: [],
  otherAmenities: [],
  utilities: [''],
  images: [],
  renterProfileDescription: '',
  preferredRenterTypes: [],
  additionalRequirements: '',
  coordinates: [], // [lng, lat]
};

function loadJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures (quota, privacy mode, etc.)
  }
}

function removeKey(key) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function deepCloneSerializable(value) {
  // Prefer structuredClone when available; fallback to JSON clone for plain data.
  try {
    // structuredClone exists in modern browsers + recent Node (used by Next tooling)
    // eslint-disable-next-line no-undef
    if (typeof structuredClone === 'function') return structuredClone(value);
  } catch {
    // ignore and fallback
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    // As a last resort, return a shallow copy to avoid hard crashes.
    if (Array.isArray(value)) return [...value];
    if (value && typeof value === 'object') return { ...value };
    return value;
  }
}

/**
 * Keep wizard data serializable and safe:
 * - Drop File objects (cannot be restored after refresh)
 * - Keep existing image URLs/objects (edit flow) when they don't include files
 */
function sanitizeFormData(formData) {
  // IMPORTANT: deep-clone input so we never store references to live component state in Redux.
  // Redux Toolkit freezes state in dev; if we store the same object references,
  // component local state becomes frozen and mutations like `newCharges[i].type = ...` will crash.
  const clonedInput = deepCloneSerializable(formData || {});
  const safe = { ...defaultFormData, ...clonedInput };

  const images = Array.isArray(safe.images) ? safe.images : [];
  safe.images = images
    .map((img) => {
      if (typeof img === 'string') return img;
      if (!img || typeof img !== 'object') return null;

      // Drop anything that looks like a newly selected file payload
      if (img.file) return null;

      // Keep existing image reference
      if (img.url) {
        const kept = { url: img.url };
        if (img.mediaId) kept.mediaId = img.mediaId;
        return kept;
      }
      return null;
    })
    .filter(Boolean);

  return safe;
}

const initialState = {
  add: loadJson(ADD_KEY, { currentStep: 1, formData: defaultFormData }),
  edit: { id: null, hasSaved: false, currentStep: 1, formData: defaultFormData },
};

const propertyWizardSlice = createSlice({
  name: 'propertyWizard',
  initialState,
  reducers: {
    saveAddWizard: (state, action) => {
      const payload = action.payload || {};
      const next = {
        currentStep: payload.currentStep || 1,
        formData: sanitizeFormData(payload.formData),
      };
      state.add = next;
      saveJson(ADD_KEY, next);
    },
    clearAddWizard: (state) => {
      state.add = { currentStep: 1, formData: defaultFormData };
      removeKey(ADD_KEY);
    },

    hydrateEditWizard: (state, action) => {
      const { id } = action.payload || {};
      if (!id) return;

      const saved = loadJson(EDIT_KEY_PREFIX + id, null);
      if (saved) {
        state.edit = {
          id,
          hasSaved: true,
          currentStep: saved.currentStep || 1,
          formData: sanitizeFormData(saved.formData),
        };
      } else {
        state.edit = { id, hasSaved: false, currentStep: 1, formData: defaultFormData };
      }
    },
    saveEditWizard: (state, action) => {
      const { id, currentStep, formData } = action.payload || {};
      if (!id) return;

      const next = {
        currentStep: currentStep || 1,
        formData: sanitizeFormData(formData),
      };

      state.edit = { id, hasSaved: true, ...next };
      saveJson(EDIT_KEY_PREFIX + id, next);
    },
    clearEditWizard: (state, action) => {
      const { id } = action.payload || {};
      if (!id) return;

      if (state.edit.id === id) {
        state.edit = { id: null, hasSaved: false, currentStep: 1, formData: defaultFormData };
      }
      removeKey(EDIT_KEY_PREFIX + id);
    },
  },
});

export const {
  saveAddWizard,
  clearAddWizard,
  hydrateEditWizard,
  saveEditWizard,
  clearEditWizard,
} = propertyWizardSlice.actions;

export default propertyWizardSlice.reducer;

