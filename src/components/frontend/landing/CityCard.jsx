function CityCard({ city }) {
  // Handle image - it might be an imported module object or a string URL
  const getImageSrc = () => {
    if (!city.image) return '';
    
    // If it's already a string, return it
    if (typeof city.image === 'string') {
      return city.image;
    }
    
    // If it's an object (imported module), try to get the URL
    // Next.js/webpack can return { default: url } or { src: url } or just the url
    if (typeof city.image === 'object') {
      return city.image.default || city.image.src || city.image || '';
    }
    
    return '';
  };

  const imageSrc = getImageSrc();

  return (
    <div className="bg-white p-3 rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-border flex-shrink-0 cursor-pointer">
      {/* City Image */}
      <div className="w-full h-[200px] sm:h-[200px] rounded-2xl overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={city.name}
            className="w-full h-full object-cover rounded-2xl"
            onError={(e) => {
              // Hide image on error
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center">
            <span className="text-gray-400 text-sm">{city.name}</span>
          </div>
        )}
      </div>

      {/* City Info */}
      <div className="p-4 sm:p-5 text-center">
        <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">
          {city.name}
        </h3>
        <p className="text-sm sm:text-base text-text-secondary">
          {city.propertiesCount} Properties
        </p>
      </div>
    </div>
  );
}

export default CityCard;
