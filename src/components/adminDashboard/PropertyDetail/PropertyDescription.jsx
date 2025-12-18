function PropertyDescription({ description }) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4">
      <h2 className="md:text-xl text-base font-bold font-nunito text-secondary mb-3">
        Description
      </h2>
      <p className="text-base font-normal font-nunito text-darkGray leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default PropertyDescription;
