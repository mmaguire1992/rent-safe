function PropertyDescription({ description }) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-6">
      <h2 className="text-xl font-bold font-nunito text-secondary mb-3">
        Description
      </h2>
      <p className="text-base font-normal font-nunito text-darkGray leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default PropertyDescription;
