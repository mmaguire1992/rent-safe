function CityCard({ city }) {
  return (
    <div className="bg-white p-3 rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-border flex-shrink-0 cursor-pointer">
      {/* City Image */}
      <div className="w-full h-[200px] sm:h-[200px] rounded-2xl overflow-hidden">
        <img
          src={city.image}
          alt={city.name}
          className="w-full h-full object-cover rounded-2xl"
        />
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
