import { useEffect, useState } from 'react';
import { loadGoogleMaps, isGoogleMapsReady } from '@/utils/googleMaps';

/**
 * Hook to ensure Google Maps is loaded
 * @returns {{ isLoaded: boolean, error: Error | null }}
 */
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // If already loaded, no need to do anything
    if (isGoogleMapsReady()) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps
    loadGoogleMaps()
      .then(() => {
        setIsLoaded(true);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setIsLoaded(false);
      });
  }, []);

  return { isLoaded, error };
};

