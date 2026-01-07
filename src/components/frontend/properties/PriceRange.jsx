import DownArrowIcon from '@/svg/downArrowIcon';
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
        <>
      <style>{`
        .price-range-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          outline: none;
          background: #E6E8EC;
        }
        
        .price-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6B4EFF;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          margin-top: -6px;
        }
        
        .price-range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6B4EFF;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          margin-top: -6px;
        }
        
        .price-range-slider::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
          background: #E6E8EC;
        }
        
        .price-range-slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #E6E8EC;
        }
      `}</style>
    <div className="px-4 sm:px-6 pb-10 md:pb-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2 justify-between w-full">
          Select Price Range
          <DownArrowIcon/>
        </h3>
      </div>
      <div className="space-y-4">
        <div className="relative">

          <input
            type="range"
            min={minRange}
            max={maxRange}
            value={localMax}
            onChange={(e) => handleSliderChange(e.target.value)}
            className="w-full"
          />
        </div>

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
    </>
  );
}

export default PriceRange;
