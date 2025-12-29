/**
 * Google Maps Utility
 * Handles loading Google Maps API script once at application level
 */

let googleMapsLoadPromise = null;
let isGoogleMapsLoaded = false;

/**
 * Load Google Maps API script
 * @returns {Promise<void>} Promise that resolves when Google Maps is loaded
 */
export const loadGoogleMaps = () => {
  // Only run on client side
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only be loaded on the client side'));
  }

  // If already loaded, return resolved promise
  if (isGoogleMapsLoaded && window.google && window.google.maps) {
    return Promise.resolve();
  }

  // If already loading, return the existing promise
  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  // Create new promise to load Google Maps
  googleMapsLoadPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );

    if (existingScript) {
      // Script exists, wait for it to load
      if (window.google && window.google.maps) {
        isGoogleMapsLoaded = true;
        resolve();
        return;
      }

      // Wait for existing script to load
      existingScript.addEventListener('load', () => {
        isGoogleMapsLoaded = true;
        resolve();
      });
      existingScript.addEventListener('error', reject);
      return;
    }

    // Create and load new script
    const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API;

    if (!googleKey) {
      reject(new Error('Google Maps API key not found in environment variables. Please set NEXT_PUBLIC_GOOGLE_MAP_API'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isGoogleMapsLoaded = true;
      // Suppress console warnings about deprecated APIs and API key exposure
      const originalWarn = console.warn;
      const originalError = console.error;
      
      console.warn = function(...args) {
        const message = args[0]?.toString() || '';
        // Suppress deprecation warnings for Autocomplete
        if (message.includes('google.maps.places.Autocomplete') || 
            message.includes('PlaceAutocompleteElement')) {
          return;
        }
        originalWarn.apply(console, args);
      };
      
      // Suppress API key exposure in error messages
      console.error = function(...args) {
        const message = args[0]?.toString() || '';
        if (message.includes('AIzaSy') || message.includes('API key')) {
          // Log generic error instead
          originalError.apply(console, ['Google Maps API error occurred']);
          return;
        }
        originalError.apply(console, args);
      };
      
      resolve();
    };
    script.onerror = () => {
      googleMapsLoadPromise = null;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
};

/**
 * Check if Google Maps is loaded
 * @returns {boolean}
 */
export const isGoogleMapsReady = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return isGoogleMapsLoaded && window.google && window.google.maps;
};

/**
 * Get Google Maps API key
 * @returns {string|null}
 */
export const getGoogleMapsApiKey = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_GOOGLE_MAP_API || null;
  }
  return process.env.NEXT_PUBLIC_GOOGLE_MAP_API || null;
};

