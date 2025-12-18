import { FiMapPin } from "react-icons/fi";
import BlueLocationIcon from "@/svg/blueLocationIcon";

function LocationSection({ address }) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold font-nunito text-secondary mb-3">
        Location
      </h2>
      <div className="mb-4">
        <div className="flex items-start gap-2 text-darkGray mb-4">
          <BlueLocationIcon className="mt-0.5 shrink-0" />
          <span className="text-sm sm:text-base font-normal font-nunito text-secondary break-words">
            {address}
          </span>
        </div>
        <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-100 rounded-xl flex items-center justify-center border border-lightGray">
          <div className="text-center">
            <FiMapPin className="text-[#6B4EFF] text-3xl sm:text-4xl mx-auto mb-2" />
            <p className="text-sm sm:text-base text-darkGray font-normal font-nunito">
              Map preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationSection;
