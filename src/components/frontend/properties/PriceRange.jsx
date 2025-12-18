function PriceRange({ min, max, onChange }) {
  return (
    <div className="px-4 sm:px-6">
      <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-text-primary mb-3">Select Price Range</h3>
      </div>
      <div className="space-y-4">
        <input
          type="range"
          min="0"
          max="10000"
          value={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between">
        <div className="flex justify-between text-sm items-center text-text-secondary gap-3 ">
        <p className="text-text-secondary text-2xl">€</p>
          <span className="border border-gray-300 rounded-lg flex items-center justify-start px-2 w-[100px] h-[30px]"> {min}</span>
        </div>
        <div className="flex justify-between text-sm items-center text-text-secondary gap-3 ">
        <p className="text-text-secondary text-2xl">€</p>
          <span className="border border-gray-300 rounded-lg px-2 h-[30px] flex items-center justify-start w-[150px]">{max}</span>
        </div>
        </div>
      </div>
    </div>
  );
}

export default PriceRange;
