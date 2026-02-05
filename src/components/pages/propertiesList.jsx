'use client'

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from '@/lib/react-router-compat';
import PropertiesHeader from "@/components/frontend/common/PropertiesHeader";
import PageHeading from "@/components/frontend/common/PageHeading";
import PropertySearch from "@/components/frontend/properties/PropertySearch";
import PropertyFilters from "@/components/frontend/properties/PropertyFilters";
import PropertyList from "@/components/frontend/properties/PropertyList";
import { getAllProperties, getPropertiesByCity } from "@/api/properties";
import { addToWishlist, removeFromWishlist, getWishlistPropertyIds, getUserWishlist } from "@/api/wishlists";
import { useAuth } from "@/context/AuthContext";
import { isAuthenticated } from "@/utils/auth";
import { FiSliders } from "react-icons/fi";
import Footer from "@/components/frontend/common/footer";
import { PROPERTY_PLACEHOLDER_IMAGE } from "@/constant";

function PropertiesList() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  // Initialize search query from URL (prioritize 'q' param, fallback to 'city' param)
  const initialQuery = searchParams.get("q") || searchParams.get("city") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialQuery);
  const [isDebouncedSearchFromUser, setIsDebouncedSearchFromUser] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  // Initialize showSavedOnly from URL parameter
  const [showSavedOnly, setShowSavedOnly] = useState(() => {
    const saved = searchParams.get("saved");
    return saved === "true";
  });
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Initialize pagination from URL parameter or default to 1
  const initialPageParam = searchParams.get("page");
  const initialPage = initialPageParam ? parseInt(initialPageParam, 10) : 1;
  const [pagination, setPagination] = useState({
    page: initialPage > 0 ? initialPage : 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  // Extract city from URL params (only once on mount or when city changes)
  const cityParam = searchParams.get("city");

  // Initialize filters - check URL params on mount
  const getInitialPropertyType = () => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      return typeParam.toLowerCase();
    }
    return "all";
  };

  const getInitialSelectedType = () => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      return typeParam.toLowerCase();
    }
    return "apartment"; // Default to apartment
  };

  const [filters, setFilters] = useState({
    propertyType: getInitialPropertyType() === 'all' ? [] : [getInitialPropertyType()],
    amenities: [],
    bhk: [],
    priceMin: 0,
    priceMax: 10000,
  });

  // Debounced filters state - used for API calls (initialize immediately with URL params)
  const [debouncedFilters, setDebouncedFilters] = useState({
    propertyType: getInitialPropertyType() === 'all' ? [] : [getInitialPropertyType()],
    amenities: [],
    bhk: [],
    priceMin: 0,
    priceMax: 10000,
  });
  const filterTimeoutRef = useRef(null);

  // Initialize selectedPropertyType from URL
  const [selectedPropertyType, setSelectedPropertyType] = useState(getInitialSelectedType);
  
  // Track if we've initialized from URL to prevent infinite loops
  const initializedFromUrlRef = useRef(false);
  // Track if URL update was user-initiated (from filter change)
  const isUserInitiatedUrlUpdateRef = useRef(false);
  // Track if search query change was user-initiated (from typing)
  const isUserInitiatedSearchRef = useRef(false);
  // Track the source of debouncedSearchQuery changes
  const debouncedSearchSourceRef = useRef('url'); // 'url' or 'user'
  // Track when URL was last updated to prevent immediate re-reading
  const lastUrlUpdateTimeRef = useRef(0);
  // Track if saved parameter update was user-initiated
  const isUserInitiatedSavedUpdateRef = useRef(false);
  // Track if page parameter update was user-initiated
  const isUserInitiatedPageUpdateRef = useRef(false);

  // Track if we've initialized page from URL
  const initializedPageFromUrlRef = useRef(false);

  // Read page from URL on component mount or when URL changes (but not when user changes page)
  useEffect(() => {
    // Skip if this page change was user-initiated
    if (isUserInitiatedPageUpdateRef.current) {
      isUserInitiatedPageUpdateRef.current = false;
      return;
    }

    // Skip if URL was just updated (within last 500ms) to prevent reading back our own changes
    const timeSinceLastUpdate = Date.now() - lastUrlUpdateTimeRef.current;
    if (timeSinceLastUpdate < 500 && initializedPageFromUrlRef.current) {
      return;
    }

    const pageParam = searchParams.get("page");
    const urlPage = pageParam ? parseInt(pageParam, 10) : 1;
    const validUrlPage = urlPage > 0 ? urlPage : 1;

    // Always sync with URL page parameter (even if it's 1)
    // This ensures we restore the correct page when navigating back
    setPagination(prev => {
      if (prev.page !== validUrlPage) {
        return { ...prev, page: validUrlPage };
      }
      return prev;
    });
    
    initializedPageFromUrlRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when page changes (user-initiated page change or filter/search change)
  useEffect(() => {
    // Skip if we haven't initialized from URL yet
    if (!initializedPageFromUrlRef.current) {
      return;
    }

    const currentPageParam = searchParams.get("page");
    const urlPage = currentPageParam ? parseInt(currentPageParam, 10) : 1;
    const newPage = pagination.page;

    // Update URL if page changed and it's different from URL param
    // This handles both user-initiated page changes and filter/search resets to page 1
    if (newPage !== urlPage && newPage > 0) {
      // Mark as user-initiated for non-initial changes
      isUserInitiatedPageUpdateRef.current = true;
      lastUrlUpdateTimeRef.current = Date.now();

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        
        if (newPage === 1) {
          // Remove page parameter when on page 1
          newParams.delete("page");
        } else {
          // Update page parameter
          newParams.set("page", newPage.toString());
        }
        
        return newParams;
      }, { replace: false }); // Use replace: false to preserve history for back navigation

      // Reset the flag after a short delay
      setTimeout(() => {
        isUserInitiatedPageUpdateRef.current = false;
      }, 100);
    }
  }, [pagination.page, searchParams, setSearchParams]);

  // Read search query and type from URL on component mount or when URL changes
  useEffect(() => {
    // Skip if this URL change was user-initiated (from filter change or search change)
    if (isUserInitiatedUrlUpdateRef.current || isUserInitiatedSearchRef.current) {
      return;
    }
    
    // Skip if URL was just updated (within last 500ms) to prevent reading back our own changes
    const timeSinceLastUpdate = Date.now() - lastUrlUpdateTimeRef.current;
    if (timeSinceLastUpdate < 500) {
      return;
    }
    
    const queryParam = searchParams.get("q");
    const cityParam = searchParams.get("city");
    const typeParam = searchParams.get("type");
    
    // Only update if values actually changed to prevent unnecessary re-renders
    const currentType = typeParam ? typeParam.toLowerCase() : null;
    // Prioritize 'q' param, but if city param exists and no 'q', use city
    const currentQuery = queryParam || cityParam || "";
    
    // Check if we need to update - compare with both current state and debounced state
    // Normalize propertyType for comparison (convert array to string for comparison)
    const currentFiltersPropertyType = Array.isArray(filters.propertyType) 
      ? (filters.propertyType.length === 1 ? filters.propertyType[0] : (filters.propertyType.length > 0 ? filters.propertyType.join(',') : null))
      : (filters.propertyType === 'all' || !filters.propertyType ? null : filters.propertyType);
    
    const currentDebouncedPropertyType = Array.isArray(debouncedFilters.propertyType)
      ? (debouncedFilters.propertyType.length === 1 ? debouncedFilters.propertyType[0] : (debouncedFilters.propertyType.length > 0 ? debouncedFilters.propertyType.join(',') : null))
      : (debouncedFilters.propertyType === 'all' || !debouncedFilters.propertyType ? null : debouncedFilters.propertyType);
    
    const shouldUpdateType = currentType !== currentDebouncedPropertyType && 
                             currentType !== currentFiltersPropertyType;
    const shouldUpdateQuery = currentQuery !== debouncedSearchQuery && 
                              currentQuery !== searchQuery;
    
    // Only proceed if something actually changed
    if (!shouldUpdateType && !shouldUpdateQuery && initializedFromUrlRef.current) {
      return; // No changes, skip update
    }
    
    if (shouldUpdateQuery) {
      // Mark source as URL when reading from URL
      debouncedSearchSourceRef.current = 'url';
      setIsDebouncedSearchFromUser(false); // Reset state when reading from URL
      isUserInitiatedSearchRef.current = false; // Ensure this is false when reading from URL
      if (currentQuery) {
        setSearchQuery(currentQuery);
        setDebouncedSearchQuery(currentQuery); // Set debounced immediately for URL params
      } else {
        // Clear if param removed - this handles when user clears search and URL is updated
        setSearchQuery("");
        setDebouncedSearchQuery("");
      }
    }
    
    if (shouldUpdateType) {
      if (currentType) {
        const normalizedType = currentType;
        
        // Update filters immediately
        const newFilters = {
          propertyType: normalizedType ? [normalizedType] : [],
          amenities: [],
          bhk: [],
          priceMin: 0,
          priceMax: 10000,
        };
        setFilters(newFilters);
        // Also update debouncedFilters immediately for URL params (no debounce delay)
        setDebouncedFilters(newFilters);
        
        // Update selectedPropertyType for PropertySearch component
        setSelectedPropertyType(normalizedType);
      } else if (!initializedFromUrlRef.current) {
        // Only reset to defaults on initial mount if no type param
        const defaultFilters = {
          propertyType: [],
          amenities: [],
          bhk: [],
          priceMin: 0,
          priceMax: 10000,
        };
        setFilters(defaultFilters);
        setDebouncedFilters(defaultFilters);
        setSelectedPropertyType("apartment");
      } else if (currentType === null && (Array.isArray(filters.propertyType) ? filters.propertyType.length > 0 : filters.propertyType !== "all")) {
        // URL param was removed (user selected "All"), update filter to empty array
        const newFilters = {
          ...filters,
          propertyType: [],
        };
        setFilters(newFilters);
        setDebouncedFilters(newFilters);
      }
    }
    
    initializedFromUrlRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Track previous filters to prevent unnecessary updates
  const prevFiltersRef = useRef(filters);
  
  // Track previous propertyType for URL updates
  const prevPropertyTypeForUrlRef = useRef(null);

  // Update URL when propertyType filter changes
  useEffect(() => {
    if (!initializedFromUrlRef.current) {
      // Don't update URL until we've initialized from URL
      prevPropertyTypeForUrlRef.current = Array.isArray(filters.propertyType) 
        ? (filters.propertyType.length === 1 ? filters.propertyType[0] : (filters.propertyType.length > 0 ? filters.propertyType.join(',') : null))
        : (filters.propertyType === 'all' || !filters.propertyType ? null : filters.propertyType);
      return;
    }
    
    const currentTypeParam = searchParams.get("type");
    const newPropertyType = Array.isArray(filters.propertyType) 
      ? filters.propertyType.length === 1 ? filters.propertyType[0] : (filters.propertyType.length > 1 ? filters.propertyType.join(',') : null)
      : (filters.propertyType === 'all' || !filters.propertyType ? null : filters.propertyType);
    
    // Only update URL if propertyType actually changed and it's different from URL param
    if (prevPropertyTypeForUrlRef.current !== newPropertyType && newPropertyType !== currentTypeParam) {
      // Mark this as a user-initiated URL update
      isUserInitiatedUrlUpdateRef.current = true;
      lastUrlUpdateTimeRef.current = Date.now(); // Record when we update the URL
      
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        
        if (!newPropertyType || (Array.isArray(filters.propertyType) && filters.propertyType.length === 0)) {
          // Remove type parameter when "All" is selected or array is empty
          newParams.delete("type");
        } else {
          // Update type parameter with first value (for backward compatibility with URL)
          const typeValue = Array.isArray(filters.propertyType) ? filters.propertyType[0] : newPropertyType;
          newParams.set("type", typeValue);
        }
        
        return newParams;
      }, { replace: true }); // Use replace to avoid adding to history
      
      // Update the ref to track this change
      prevPropertyTypeForUrlRef.current = newPropertyType;
      
      // Reset the flag after a short delay to allow URL update to complete
      setTimeout(() => {
        isUserInitiatedUrlUpdateRef.current = false;
      }, 100);
    } else {
      // Update ref even if we don't update URL
      prevPropertyTypeForUrlRef.current = newPropertyType;
    }
  }, [filters.propertyType, searchParams, setSearchParams]);

  // Debounce filter changes - wait 500ms after user stops changing filters
  useEffect(() => {
    // Check if filters actually changed
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
    
    if (!filtersChanged) {
      return; // No change, skip debounce
    }

    prevFiltersRef.current = filters;

    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = setTimeout(() => {
      // Check if filters actually changed compared to current debounced filters
      const filtersActuallyChanged = JSON.stringify(filters) !== JSON.stringify(debouncedFilters);
      setDebouncedFilters(filters);
      
      // Only reset to page 1 if filters actually changed (user action)
      // Don't reset if we're just syncing from URL or initial mount
      if (filtersActuallyChanged && initializedFromUrlRef.current) {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500); // 500ms debounce delay

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [filters, debouncedFilters]);

  // Track previous search query to prevent unnecessary updates
  const prevSearchQueryRef = useRef(searchQuery);

  // Debounce search query changes - wait 500ms after user stops typing
  useEffect(() => {
    // Check if search query actually changed
    if (searchQuery === prevSearchQueryRef.current) {
      return; // No change, skip debounce
    }

    prevSearchQueryRef.current = searchQuery;
    
    // If this change is not from URL reading (i.e., not from isUserInitiatedUrlUpdateRef), 
    // and we've initialized, then it's user input
    const isUserInput = initializedFromUrlRef.current && !isUserInitiatedUrlUpdateRef.current;
    
    if (isUserInput) {
      // This is user typing, mark as user-initiated
      isUserInitiatedSearchRef.current = true;
      debouncedSearchSourceRef.current = 'user'; // Mark source as user input
    } else {
      // This came from URL or initial mount
      debouncedSearchSourceRef.current = 'url'; // Mark source as URL
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Store the source for this specific debounce operation
    const sourceForThisUpdate = isUserInput ? 'user' : 'url';

    // If search is cleared (empty), update immediately without debounce
    const isCleared = searchQuery.trim() === '';
    
    if (isCleared) {
      // Update immediately when cleared to avoid showing stale data
      debouncedSearchSourceRef.current = sourceForThisUpdate;
      setIsDebouncedSearchFromUser(sourceForThisUpdate === 'user');
      if (sourceForThisUpdate === 'user') {
        isUserInitiatedSearchRef.current = true;
      }
      // Reset to page 1 if search was cleared by user
      if (sourceForThisUpdate === 'user') {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
      setDebouncedSearchQuery('');
    } else {
      // Debounce for non-empty search queries (when user is typing)
      searchTimeoutRef.current = setTimeout(() => {
        // Set the source right before updating debouncedSearchQuery
        debouncedSearchSourceRef.current = sourceForThisUpdate;
        setIsDebouncedSearchFromUser(sourceForThisUpdate === 'user');
        if (sourceForThisUpdate === 'user') {
          isUserInitiatedSearchRef.current = true;
        }
        // Only reset to page 1 if search actually changed and it was user-initiated
        const searchChanged = searchQuery !== debouncedSearchQuery;
        if (searchChanged && sourceForThisUpdate === 'user') {
          setPagination(prev => ({ ...prev, page: 1 }));
        }
        setDebouncedSearchQuery(searchQuery);
      }, 500); // 500ms debounce delay for typing
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Update URL when debounced search query changes (user-initiated search)
  useEffect(() => {
    // Skip on initial mount - only update URL for user-initiated changes
    if (!initializedFromUrlRef.current) {
      return;
    }

    // Only update URL if this was a user-initiated change
    if (!isDebouncedSearchFromUser) {
      // Not user-initiated, skip URL update
      return;
    }

    const currentQueryParam = searchParams.get("q") || "";
    const currentCityParam = searchParams.get("city") || "";
    const newQuery = debouncedSearchQuery.trim();

    // Always update URL if source is 'user' and query changed (including clearing)
    if (currentQueryParam !== newQuery || currentCityParam !== newQuery) {
      isUserInitiatedUrlUpdateRef.current = true;
      isUserInitiatedSearchRef.current = true; // Keep this true to prevent URL-reading effect from interfering
      lastUrlUpdateTimeRef.current = Date.now(); // Record when we update the URL
      
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        
        if (newQuery) {
          // Set both 'q' and 'city' params when user types
          newParams.set("q", newQuery);
          newParams.set("city", newQuery);
        } else {
          // Remove both parameters if search is cleared
          newParams.delete("q");
          newParams.delete("city");
        }
        
        return newParams;
      }, { replace: true }); // Use replace to avoid adding to history
      
      // Reset the flags after a longer delay to ensure URL update completes
      // and URL-reading effect doesn't interfere
      setTimeout(() => {
        isUserInitiatedUrlUpdateRef.current = false;
        isUserInitiatedSearchRef.current = false;
        setIsDebouncedSearchFromUser(false); // Reset state after URL update
        debouncedSearchSourceRef.current = 'url'; // Reset source after URL update
      }, 300);
    } else {
      // Reset flags if no URL update needed (query matches URL already)
      isUserInitiatedSearchRef.current = false;
      setIsDebouncedSearchFromUser(false);
      debouncedSearchSourceRef.current = 'url';
    }
  }, [debouncedSearchQuery, isDebouncedSearchFromUser, searchParams, setSearchParams]);

  // Transform API properties to match PropertyCard format
  const transformProperties = (apiProperties) => {
    return apiProperties.map((property) => {
      // Extract image URL from primaryImageId
      let imageUrl = null;
      if (property.primaryImageId) {
        if (typeof property.primaryImageId === 'string') {
          imageUrl = property.primaryImageId;
        } else if (property.primaryImageId.url) {
          imageUrl = property.primaryImageId.url;
        }
      }
      // Fallback to media array if primaryImageId is not available
      if (!imageUrl && property.media && property.media.length > 0) {
        const firstImage = property.media.find(m => m.mediaType === 'image');
        if (firstImage) {
          imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url;
        }
      }
      // Fallback placeholder
      if (!imageUrl) {
        imageUrl = PROPERTY_PLACEHOLDER_IMAGE;
      }

      // Build address string
      const addressParts = [];
      if (property.address) {
        if (property.address.address) addressParts.push(property.address.address);
        if (property.address.city) addressParts.push(property.address.city);
        if (property.address.county) addressParts.push(property.address.county);
        if (property.address.postcode) addressParts.push(property.address.postcode);
      }
      const address = addressParts.length > 0 ? addressParts.join(', ') : 'Address not available';

      // Format price with currency
      const currency = property.currency || 'GBP';
      const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '';
      const price = property.rent ? `${currencySymbol}${property.rent.toLocaleString()}` : 'N/A';

      // Format property type
      const type = property.propertyType 
        ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
        : 'N/A';

      return {
        id: property._id || property.id,
        image: imageUrl,
        title: property.title || 'Untitled Property',
        price: price,
        address: address,
        beds: property.bedrooms || 0,
        baths: property.bathrooms || 0,
        type: type,
      };
    });
  };

  // Fetch properties from API
  useEffect(() => {
    // Don't fetch if showing saved properties (they're fetched separately)
    if (showSavedOnly && isAuthenticated()) {
      return;
    }

    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        let result;

        // Build API parameters with all filters
        const apiParams = {
          page: pagination.page,
          limit: pagination.limit,
          status: 'active',
          search: debouncedSearchQuery || '',
        };

        // Add city filter if present (from URL parameter)
        // cityParam will be empty/null when user clears search and URL is updated
        if (cityParam) {
          apiParams.city = cityParam;
        }

        // Add property type filter (using debounced filters) - support multiple selections
        if (debouncedFilters.propertyType) {
          const propertyTypes = Array.isArray(debouncedFilters.propertyType) 
            ? debouncedFilters.propertyType 
            : (debouncedFilters.propertyType === "all" || !debouncedFilters.propertyType ? [] : [debouncedFilters.propertyType]);
          
          if (propertyTypes.length > 0) {
            apiParams.propertyType = propertyTypes.join(',');
          }
        }

        // Add bedrooms filter (using debounced filters) - support multiple selections
        if (debouncedFilters.bhk) {
          const bhkValues = Array.isArray(debouncedFilters.bhk) 
            ? debouncedFilters.bhk 
            : (debouncedFilters.bhk === "all" || !debouncedFilters.bhk ? [] : [debouncedFilters.bhk]);
          
          if (bhkValues.length > 0) {
            apiParams.bedrooms = bhkValues.join(',');
          }
        }

        // Add price range filters (using debounced filters)
        if (debouncedFilters.priceMin && debouncedFilters.priceMin > 0) {
          apiParams.priceMin = debouncedFilters.priceMin.toString();
        }
        if (debouncedFilters.priceMax && debouncedFilters.priceMax > 0 && debouncedFilters.priceMax < 100000) {
          apiParams.priceMax = debouncedFilters.priceMax.toString();
        }

        // Add amenities filter (using debounced filters)
        if (debouncedFilters.amenities && Array.isArray(debouncedFilters.amenities) && debouncedFilters.amenities.length > 0) {
          apiParams.amenities = debouncedFilters.amenities.join(',');
        }

        // Use general properties endpoint with all filters
        result = await getAllProperties(apiParams);

        const transformed = transformProperties(result.properties || []);

        setProperties(transformed);
        setPagination(prev => ({
          ...prev,
          total: result.total || 0,
          totalPages: result.totalPages || 0,
        }));
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err.message || 'Failed to load properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearchQuery, 
    JSON.stringify(debouncedFilters.propertyType), // Use JSON.stringify for array comparison
    JSON.stringify(debouncedFilters.bhk), // Use JSON.stringify for array comparison
    debouncedFilters.priceMin, 
    debouncedFilters.priceMax, 
    debouncedFilters.amenities?.length || 0, // Use length to avoid object reference issues
    pagination.page, 
    pagination.limit, 
    cityParam,
    showSavedOnly // Add showSavedOnly to dependencies
  ]);

  // Prevent body scroll when filter is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFilterOpen]);

  // Track if we've initialized saved state from URL
  const initializedSavedFromUrlRef = useRef(false);
  // Track the last saved param value we processed to avoid redundant updates
  const lastProcessedSavedParamRef = useRef(null);

  // Check for saved parameter in URL on mount and when URL changes (external navigation)
  useEffect(() => {
    // Skip if this was a user-initiated URL update
    if (isUserInitiatedSavedUpdateRef.current) {
      isUserInitiatedSavedUpdateRef.current = false;
      // Update the ref to track what we just set
      lastProcessedSavedParamRef.current = searchParams.get("saved");
      return;
    }

    // Skip if URL was just updated (within last 500ms) to prevent reading back our own changes
    const timeSinceLastUpdate = Date.now() - lastUrlUpdateTimeRef.current;
    if (timeSinceLastUpdate < 500) {
      return;
    }

    const savedParam = searchParams.get("saved");
    
    // Skip if we've already processed this value
    if (lastProcessedSavedParamRef.current === savedParam) {
      return;
    }
    
    const shouldShowSaved = savedParam === "true";
    
    // Only update if state doesn't match URL
    if (shouldShowSaved !== showSavedOnly) {
      lastProcessedSavedParamRef.current = savedParam;
      setShowSavedOnly(shouldShowSaved);
      if (!initializedSavedFromUrlRef.current) {
        initializedSavedFromUrlRef.current = true;
      }
    }
  }, [searchParams]); // Only depend on searchParams

  // Update URL when showSavedOnly changes (user-initiated toggle)
  useEffect(() => {
    // Skip on initial mount - let the URL reading effect handle initial sync
    if (!initializedSavedFromUrlRef.current) {
      return;
    }

    const currentSavedParam = searchParams.get("saved");
    const shouldHaveSavedParam = showSavedOnly;
    
    // Only update URL if there's a mismatch
    if (shouldHaveSavedParam && currentSavedParam !== "true") {
      isUserInitiatedSavedUpdateRef.current = true;
      lastUrlUpdateTimeRef.current = Date.now();
      lastProcessedSavedParamRef.current = "true";
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("saved", "true");
        return newParams;
      }, { replace: true });
    } else if (!shouldHaveSavedParam && currentSavedParam === "true") {
      isUserInitiatedSavedUpdateRef.current = true;
      lastUrlUpdateTimeRef.current = Date.now();
      lastProcessedSavedParamRef.current = null;
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("saved");
        return newParams;
      }, { replace: true });
    }
  }, [showSavedOnly, setSearchParams]); // Only depend on showSavedOnly and setSearchParams

  // Load wishlist on mount
  useEffect(() => {
    const loadWishlist = async () => {
      if (!isAuthenticated()) {
        return;
      }

      try {
        const propertyIds = await getWishlistPropertyIds();
        setFavoritedIds(new Set(propertyIds));
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    };

    loadWishlist();
  }, []);

  const toggleFavorite = async (propertyId) => {
    if (!isAuthenticated()) {
      // If not authenticated, just update local state (for guest users)
      setFavoritedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(propertyId)) {
          newSet.delete(propertyId);
        } else {
          newSet.add(propertyId);
        }
        return newSet;
      });
      return;
    }

    // Update local state immediately for better UX
    const wasFavorited = favoritedIds.has(propertyId);
    setFavoritedIds((prev) => {
      const newSet = new Set(prev);
      if (wasFavorited) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });

    // Call API
    try {
      if (wasFavorited) {
        await removeFromWishlist(propertyId);
      } else {
        await addToWishlist(propertyId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setFavoritedIds((prev) => {
        const newSet = new Set(prev);
        if (wasFavorited) {
          newSet.add(propertyId);
        } else {
          newSet.delete(propertyId);
        }
        return newSet;
      });
    }
  };

  const favoriteCount = favoritedIds.size;

  // Fetch saved properties from wishlist when showSavedOnly is true
  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (!showSavedOnly || !isAuthenticated()) {
        // If not showing saved or not authenticated, ensure loading is false
        if (showSavedOnly && !isAuthenticated()) {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setLoadingWishlist(true);
        setError(null);
        // Fetch all wishlist properties (with high limit to get all)
        const wishlistData = await getUserWishlist({ page: 1, limit: 1000 });
        let transformed = transformProperties(wishlistData.properties || []);
        
        // Filter by search query if provided
        if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
          const searchTerm = debouncedSearchQuery.trim().toLowerCase();
          transformed = transformed.filter((property) => {
            // Search in title
            const titleMatch = property.title?.toLowerCase().includes(searchTerm);
            // Search in address
            const addressMatch = property.address?.toLowerCase().includes(searchTerm);
            // Search in property type
            const typeMatch = property.type?.toLowerCase().includes(searchTerm);
            // Search in price
            const priceMatch = property.price?.toLowerCase().includes(searchTerm);
            
            return titleMatch || addressMatch || typeMatch || priceMatch;
          });
        }
        
        setProperties(transformed);
        setPagination(prev => ({
          ...prev,
          total: transformed.length,
          totalPages: 1,
          page: 1,
        }));
      } catch (error) {
        console.error('Error fetching saved properties:', error);
        setError(error.message || 'Failed to load saved properties');
        setProperties([]);
      } finally {
        setLoading(false);
        setLoadingWishlist(false);
      }
    };

    fetchSavedProperties();
  }, [showSavedOnly, debouncedSearchQuery]);

  // Filter for saved properties only (for non-authenticated users or when not fetching from API)
  // Also apply search filter if needed
  const filteredProperties = useMemo(() => {
    let filtered = properties;
    
    // For non-authenticated users showing saved only, filter by favoritedIds
    if (showSavedOnly && !isAuthenticated()) {
      filtered = filtered.filter((property) => favoritedIds.has(property.id));
    }
    
    // Apply search filter if there's a search query and we're showing saved properties
    // (For authenticated users, search is already applied in fetchSavedProperties)
    if (showSavedOnly && !isAuthenticated() && debouncedSearchQuery && debouncedSearchQuery.trim()) {
      const searchTerm = debouncedSearchQuery.trim().toLowerCase();
      filtered = filtered.filter((property) => {
        const titleMatch = property.title?.toLowerCase().includes(searchTerm);
        const addressMatch = property.address?.toLowerCase().includes(searchTerm);
        const typeMatch = property.type?.toLowerCase().includes(searchTerm);
        const priceMatch = property.price?.toLowerCase().includes(searchTerm);
        return titleMatch || addressMatch || typeMatch || priceMatch;
      });
    }
    
    return filtered;
  }, [properties, showSavedOnly, favoritedIds, debouncedSearchQuery]);

  const handleHomeClick = () => {
    // Reset saved view to show all properties
    setShowSavedOnly(false);
    // URL will be updated by the useEffect that watches showSavedOnly
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <PropertiesHeader
        favoriteCount={favoriteCount}
        onHeartClick={() => setShowSavedOnly(!showSavedOnly)}
        isSavedView={showSavedOnly}
        onHomeClick={handleHomeClick}
      />
      <div className="py-6 sm:py-8 lg:py-10 bg-blueWhiteGradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {showSavedOnly && (
            <div className="mb-6 sm:mb-8">
              <PageHeading>Saved Properties</PageHeading>
            </div>
          )}
          <PropertySearch
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              // Page reset is handled by debounce useEffect
            }}
            onSearch={() => {
              // Clear any pending debounce
              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
              }
              // Mark as user-initiated
              isUserInitiatedSearchRef.current = true;
              debouncedSearchSourceRef.current = 'user';
              setIsDebouncedSearchFromUser(true);
              // Immediately update debounced search query and trigger URL update
              setDebouncedSearchQuery(searchQuery);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            selectedType={selectedPropertyType}
            onTypeChange={(value) => {
              setSelectedPropertyType(value);
              setFilters((prev) => ({
                ...prev,
                propertyType: value === 'all' ? [] : [value],
              }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          />

          {/* Mobile Filter Button */}
          {!showSavedOnly && (
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#4A2FCC] rounded-[10px] text-[#4A2FCC] text-sm font-bold font-nunito  transition-colors"
              >
                <FiSliders size={20} />
                Filters
              </button>
            </div>
          )}

          {/* Mobile Filter Overlay */}
          {!showSavedOnly && (
            <>
              {/* Backdrop */}
              {isFilterOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
                  onClick={() => setIsFilterOpen(false)}
                />
              )}

              {/* Filter Panel */}
              <div
                className={`fixed top-0 left-0 right-0 bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto max-h-screen ${
                  isFilterOpen
                    ? "translate-y-0"
                    : "-translate-y-full pointer-events-none"
                }`}
              >
                <div className="sticky top-0 bg-white border-b border-lightGray px-4 py-4 flex items-center justify-between z-10">
                  <h2 className="text-xl font-bold text-secondary">Filters</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <PropertyFilters 
                    initialFilters={filters}
                    onFilterChange={(newFilters) => {
                      setFilters(newFilters);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }} 
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {!showSavedOnly && (
              <aside className="hidden lg:block w-full lg:w-1/3">
                <PropertyFilters 
                  initialFilters={filters}
                  onFilterChange={(newFilters) => {
                    setFilters(newFilters);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }} 
                />
              </aside>
            )}
            <main className={showSavedOnly ? "w-full" : "flex-1"}>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6B4EFF] border-t-transparent"></div>
                  <p className="mt-4 text-[#5A5E67]">Loading properties...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchProperties}
                    className="px-6 py-2 bg-blueGradient text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <PropertyList
                  properties={filteredProperties}
                  favoritedIds={favoritedIds}
                  onToggleFavorite={toggleFavorite}
                  isSavedView={showSavedOnly}
                  pagination={pagination}
                />
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PropertiesList;
