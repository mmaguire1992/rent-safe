'use client'

import DownArrowIcon from "@/svg/downArrowIcon";

function PriceRange({ min, max, onChange }) {
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
            <DownArrowIcon />
          </h3>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="range"
              min="0"
              max="10000"
              value={max}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full price-range-slider"
            />
          </div>
          <div className="flex justify-between">
            <div className="flex justify-between text-sm items-center text-text-secondary gap-3">
              <p className="text-text-secondary text-2xl">€</p>
              <span className="border border-gray-300 rounded-lg flex items-center justify-start px-2 w-[100px] h-[30px]"> {min}</span>
            </div>
            <div className="flex justify-between text-sm items-center text-text-secondary gap-3">
              <p className="text-text-secondary text-2xl">€</p>
              <span className="border border-gray-300 rounded-lg px-2 h-[30px] flex items-center justify-start w-[150px]">{max}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PriceRange;
