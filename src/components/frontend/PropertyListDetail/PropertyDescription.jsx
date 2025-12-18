function PropertyDescription({ description }) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-4">
        Description
      </h3>
      <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default PropertyDescription;
