'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getWishlistPropertyIds } from '@/api/wishlists';
import { isAuthenticated } from '@/utils/auth';

const WishlistContext = createContext(null);

// Normalize ID helper function
const normalizeId = (value) => {
  if (value === undefined || value === null) return null;
  const str = String(value);
  if (!str || str === 'undefined' || str === 'null' || str === '[object Object]') return null;
  return str;
};

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  // Load wishlist on mount + when user logs in/out
  useEffect(() => {
    mountedRef.current = true;
    
    const loadWishlist = async () => {
      // Prevent duplicate concurrent loads
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      setIsLoading(true);
      setWishlistLoaded(false);

      if (!isAuthenticated()) {
        // Logged out: clear local wishlist state
        if (mountedRef.current) {
          setFavoritedIds(new Set());
          setWishlistLoaded(true);
          setIsLoading(false);
        }
        loadingRef.current = false;
        return;
      }

      try {
        const propertyIds = await getWishlistPropertyIds();
        const normalized = Array.isArray(propertyIds)
          ? propertyIds.map((pid) => normalizeId(pid)).filter(Boolean)
          : [];
        
        if (mountedRef.current) {
          setFavoritedIds(new Set(normalized));
          setWishlistLoaded(true);
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
        if (mountedRef.current) {
          setWishlistLoaded(true);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        loadingRef.current = false;
      }
    };

    loadWishlist();

    return () => {
      mountedRef.current = false;
    };
  }, [userId]);

  // Update wishlist when a property is added/removed
  const updateWishlist = (propertyId, isFavorited) => {
    setFavoritedIds((prev) => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.add(normalizeId(propertyId));
      } else {
        newSet.delete(normalizeId(propertyId));
      }
      return newSet;
    });
  };

  // Refresh wishlist from server
  const refreshWishlist = async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);

    if (!isAuthenticated()) {
      setFavoritedIds(new Set());
      setWishlistLoaded(true);
      setIsLoading(false);
      loadingRef.current = false;
      return;
    }

    try {
      const propertyIds = await getWishlistPropertyIds();
      const normalized = Array.isArray(propertyIds)
        ? propertyIds.map((pid) => normalizeId(pid)).filter(Boolean)
        : [];
      setFavoritedIds(new Set(normalized));
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  const value = {
    favoritedIds,
    favoriteCount: favoritedIds.size,
    wishlistLoaded,
    isLoading,
    updateWishlist,
    refreshWishlist,
    isFavorited: (propertyId) => favoritedIds.has(normalizeId(propertyId)),
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
