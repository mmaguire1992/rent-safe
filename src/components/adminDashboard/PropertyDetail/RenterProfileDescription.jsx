'use client'

import { useState } from "react";
import { getPreferredRenterIcon } from "@/constant";
function RenterProfileDescription({
  description,
  preferredRenterTypes,
  requirements,
}) {
  const [readMore, setReadMore] = useState(false);
  const maxLength = 150;

  return (
    <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4">
      <h2 className="md:text-xl text-base font-bold font-nunito text-secondary mb-2">
        Renter Profile Description
      </h2>

      <p className="text-base font-normal font-nunito text-darkGray leading-relaxed">
        {readMore ? description : `${description?.substring(0, maxLength)}...`}{" "}
        {description?.length > maxLength && (
          <span
            onClick={() => setReadMore(!readMore)}
            className="text-[#6B4EFF] font-semibold mt-2 hover:underline"
          >
            {readMore ? "Read less" : "Read more"}
          </span>
        )}
      </p>

      <div className="block mt-4">
        <h2 className="md:text-xl text-base font-bold font-nunito text-secondary mb-2">
          Preferred Renter Type
        </h2>
        <div className="flex items-start md:items-center flex-col md:flex-row gap-0 md:space-x-4 flex-wrap">
          {preferredRenterTypes?.map((type, index) => {
            const Icon = getPreferredRenterIcon(type.label);
            return (
              <div
                key={index}
                className={`flex items-center gap-2 py-3 transition-colors`}
              >
                {Icon && (
                  <span className="bg-[#FFDDEE] w-[36px] h-[36px] rounded-[10px] flex items-center justify-center">
                    <Icon />
                  </span>
                )}
                <span
                  className={`text-base font-normal font-nunito text-darkGray`}
                >
                  {type.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="block mt-4">
        <h2 className="text-xl font-bold font-nunito text-secondary mb-4">
          Additional Requirements
        </h2>
        <p className="text-base font-normal font-nunito text-darkGray leading-relaxed">
          {requirements}
        </p>
      </div>
    </div>
  );
}

export default RenterProfileDescription;
