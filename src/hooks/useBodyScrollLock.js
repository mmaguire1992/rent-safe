import { useEffect } from 'react';

/**
 * Custom hook to prevent body scroll when modal is open
 * @param {boolean} isLocked - Whether to lock the body scroll
 */
export const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      // Save the current scroll position
      const scrollY = window.scrollY;
      
      // Apply styles to prevent scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scroll position and remove styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
};

export default useBodyScrollLock;

