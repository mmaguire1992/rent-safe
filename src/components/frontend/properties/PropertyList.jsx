import PropertyCard from "@/components/frontend/landing/PropertyCard";
import Button from "@/components/frontend/landing/Button";

function PropertyList({ properties, favoritedIds, onToggleFavorite, isSavedView = false }) {
  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary text-lg">No properties found</p>
      </div>
    );
  }

  const gridCols = isSavedView 
    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";

  return (
    <>
      <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
        {properties.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property}
            isFavorited={favoritedIds.has(property.id)}
            onToggleFavorite={() => onToggleFavorite(property.id)}
          />
        ))}
      </div>
      {properties.length > 0 && (
        <div className="mt-8 text-center">
          <Button variant="primary" className="px-8 py-3">
            Browse Listing
          </Button>
        </div>
      )}
    </>
  );
}

export default PropertyList;

