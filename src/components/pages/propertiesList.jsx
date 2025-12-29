'use client'

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from '@/lib/react-router-compat';
import PropertiesHeader from "@/components/frontend/common/PropertiesHeader";
import PageHeading from "@/components/frontend/common/PageHeading";
import PropertySearch from "@/components/frontend/properties/PropertySearch";
import PropertyFilters from "@/components/frontend/properties/PropertyFilters";
import PropertyList from "@/components/frontend/properties/PropertyList";
import { getAllProperties, getPropertiesByCity } from "@/api/properties";
import { FiSliders } from "react-icons/fi";
import Footer from "@/components/frontend/common/footer";

function PropertiesList() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchTimeoutRef = useRef(null);
  const [selectedPropertyType, setSelectedPropertyType] =
    useState("flat/apartment");
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    propertyType: "all",
    amenities: [],
    bhk: "all",
    priceMin: 0,
    priceMax: 10000,
  });

  // Debounced filters state - used for API calls
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const filterTimeoutRef = useRef(null);

  // Extract city from URL params (only once on mount or when city changes)
  const cityParam = searchParams.get("city");

  // Read search query and type from URL on component mount
  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam) {
      setSearchQuery(queryParam);
    }
    const typeParam = searchParams.get("type");
    if (typeParam) {
      setFilters((prev) => ({
        ...prev,
        propertyType: typeParam.toLowerCase(),
      }));
    }
  }, [searchParams]);

  // Debounce filter changes - wait 500ms after user stops changing filters
  useEffect(() => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
      // Reset to page 1 when filters change
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500); // 500ms debounce delay

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [filters]);

  // Debounce search query changes - wait 500ms after user stops typing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to page 1 when search changes
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500); // 500ms debounce delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

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
        imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
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

        // Add city filter if present
        if (cityParam) {
          apiParams.city = cityParam;
        }

        // Add property type filter (using debounced filters)
        if (debouncedFilters.propertyType && debouncedFilters.propertyType !== "all") {
          apiParams.propertyType = debouncedFilters.propertyType;
        }

        // Add bedrooms filter (using debounced filters)
        if (debouncedFilters.bhk && debouncedFilters.bhk !== "all") {
          apiParams.bedrooms = debouncedFilters.bhk;
        }

        // Add price range filters (using debounced filters)
        if (debouncedFilters.priceMin && debouncedFilters.priceMin > 0) {
          apiParams.priceMin = debouncedFilters.priceMin.toString();
        }
        if (debouncedFilters.priceMax && debouncedFilters.priceMax > 0 && debouncedFilters.priceMax < 100000) {
          apiParams.priceMax = debouncedFilters.priceMax.toString();
        }

        // Add amenities filter (using debounced filters)
        if (debouncedFilters.amenities && debouncedFilters.amenities.length > 0) {
          apiParams.amenities = debouncedFilters.amenities.join(',');
          console.log('Sending amenities filter to API:', debouncedFilters.amenities);
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
  }, [debouncedSearchQuery, debouncedFilters.propertyType, debouncedFilters.bhk, debouncedFilters.priceMin, debouncedFilters.priceMax, debouncedFilters.amenities, pagination.page, pagination.limit, cityParam]);

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

  const toggleFavorite = (propertyId) => {
    setFavoritedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const favoriteCount = favoritedIds.size;

  // Filter for saved properties only
  const filteredProperties = useMemo(() => {
    if (showSavedOnly) {
      return properties.filter((property) => favoritedIds.has(property.id));
    }
    return properties;
  }, [properties, showSavedOnly, favoritedIds]);

  const handleHomeClick = () => {
    // Reset saved view to show all properties
    setShowSavedOnly(false);
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
            onSearch={() => fetchProperties()}
            selectedType={selectedPropertyType}
            onTypeChange={(value) => {
              setSelectedPropertyType(value);
              setFilters((prev) => ({
                ...prev,
                propertyType: value === "flat/apartment" ? "all" : value,
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
                  onFilterChange={(newFilters) => {
                    setFilters(newFilters);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }} 
                />
              </div>
            </div>
          </>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {!showSavedOnly && (
              <aside className="hidden lg:block w-full lg:w-1/3">
                <PropertyFilters 
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
