import { useState, useEffect } from 'react';

function PriceRange({ min, max, onChange, onChangeMin, onChangeMax, minRange = 0, maxRange = 10000 }) {
  const [localMin, setLocalMin] = useState(min || minRange);
  const [localMax, setLocalMax] = useState(max || maxRange);

  // Update local state when props change
  useEffect(() => {
    setLocalMin(min || minRange);
  }, [min, minRange]);

  useEffect(() => {
    setLocalMax(max || maxRange);
  }, [max, maxRange]);

  const handleMinChange = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    
    // Ensure min doesn't exceed max
    const newMin = Math.max(minRange, Math.min(numValue, localMax));
    setLocalMin(newMin);
    
    if (onChangeMin) {
      onChangeMin(newMin);
    } else if (onChange) {
      // If only onChange is provided, pass both values
      onChange({ min: newMin, max: localMax });
    }
  };

  const handleMaxChange = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    
    // Ensure max doesn't go below min
    const newMax = Math.min(maxRange, Math.max(numValue, localMin));
    setLocalMax(newMax);
    
    if (onChangeMax) {
      onChangeMax(newMax);
    } else if (onChange) {
      // If only onChange is provided, pass both values
      onChange({ min: localMin, max: newMax });
    }
  };

  const handleSliderChange = (value) => {
    const numValue = Number(value);
    handleMaxChange(numValue);
  };

  return (
    <div className="px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary mb-3">Select Price Range</h3>
      </div>
      <div className="space-y-4">
        <input
          type="range"
          min={minRange}
          max={maxRange}
          value={localMax}
          onChange={(e) => handleSliderChange(e.target.value)}
          className="w-full"
        />
        <div className="flex justify-between">
          <div className="flex justify-between text-sm items-center text-text-secondary gap-3">
            <p className="text-text-secondary text-2xl">€</p>
            <input
              type="number"
              min={minRange}
              max={localMax}
              value={localMin}
              onChange={(e) => handleMinChange(e.target.value)}
              className="border border-gray-300 rounded-lg flex items-center justify-start px-2 w-[100px] h-[30px] text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
              placeholder="Min"
            />
          </div>
          <div className="flex justify-between text-sm items-center text-text-secondary gap-3">
            <p className="text-text-secondary text-2xl">€</p>
            <input
              type="number"
              min={localMin}
              max={maxRange}
              value={localMax}
              onChange={(e) => handleMaxChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 h-[30px] flex items-center justify-start w-[150px] text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
              placeholder="Max"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceRange;
