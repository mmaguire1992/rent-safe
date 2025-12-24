'use client'

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from '@/lib/react-router-compat';
import PropertiesHeader from "@/components/frontend/common/PropertiesHeader";
import PageHeading from "@/components/frontend/common/PageHeading";
import PropertySearch from "@/components/frontend/properties/PropertySearch";
import PropertyFilters from "@/components/frontend/properties/PropertyFilters";
import PropertyList from "@/components/frontend/properties/PropertyList";
import { propertyListings } from "@/websitedata/propertyListings";
import { FiSliders } from "react-icons/fi";
import Footer from "../components/frontend/common/footer";

function PropertiesList() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] =
    useState("flat/apartment");
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: "all",
    amenities: [],
    bhk: "all",
    priceMin: 0,
    priceMax: 10000,
  });

  // Read search query from URL on component mount
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

  const filteredProperties = useMemo(() => {
    let result = [...propertyListings];

    if (showSavedOnly) {
      result = result.filter((property) => favoritedIds.has(property.id));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (property) =>
          property.title.toLowerCase().includes(query) ||
          property.address.toLowerCase().includes(query)
      );
    }

    if (filters.propertyType !== "all") {
      const typeMap = {
        apartments: ["apartment", "flat"],
        house: ["house"],
        floor: ["floor"],
        plot: ["plot", "land"],
        studio: ["studio"],
        penthouse: ["penthouse"],
        villa: ["villa"],
        agriculture: ["agriculture"],
      };
      const searchTypes = typeMap[filters.propertyType] || [];
      result = result.filter((property) => {
        const propType = property.type.toLowerCase();
        return searchTypes.some((type) => propType.includes(type));
      });
    }

    if (filters.bhk !== "all") {
      if (filters.bhk === "6+") {
        result = result.filter((property) => property.beds >= 6);
      } else {
        const bhkNum = parseInt(filters.bhk);
        result = result.filter((property) => property.beds === bhkNum);
      }
    }

    const priceNum = (price) => parseInt(price.replace("€", ""));
    result = result.filter((property) => {
      const propPrice = priceNum(property.price);
      return propPrice >= filters.priceMin && propPrice <= filters.priceMax;
    });

    return result;
  }, [searchQuery, filters, showSavedOnly, favoritedIds]);

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
            onChange={setSearchQuery}
            onSearch={() => {}}
            selectedType={selectedPropertyType}
            onTypeChange={(value) => {
              setSelectedPropertyType(value);
              setFilters((prev) => ({
                ...prev,
                propertyType: value === "flat/apartment" ? "all" : value,
              }));
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
                <PropertyFilters onFilterChange={setFilters} />
              </div>
            </div>
          </>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {!showSavedOnly && (
              <aside className="hidden lg:block w-full lg:w-1/3">
                <PropertyFilters onFilterChange={setFilters} />
              </aside>
            )}
            <main className={showSavedOnly ? "w-full" : "flex-1"}>
              <PropertyList
                properties={filteredProperties}
                favoritedIds={favoritedIds}
                onToggleFavorite={toggleFavorite}
                isSavedView={showSavedOnly}
              />
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PropertiesList;
