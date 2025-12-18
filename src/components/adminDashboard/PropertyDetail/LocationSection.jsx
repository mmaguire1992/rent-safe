import { FiMapPin } from "react-icons/fi";
import BlueLocationIcon from "@/svg/blueLocationIcon";

function LocationSection({ address }) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4">
      <h2 className="md:text-xl text-base font-bold font-nunito text-secondary mb-3">
        Location
      </h2>
      <div className="mb-4">
        <div className="flex items-center gap-2 text-darkGray mb-4">
          <BlueLocationIcon />
          <span className="text-base font-normal font-nunito text-secondary">
            {address}
          </span>
        </div>
        <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center border border-lightGray">
          <div className="text-center">
            <FiMapPin className="text-[#6B4EFF] text-4xl mx-auto mb-2" />
            <p className="text-darkGray font-normal font-nunito">Map preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationSection;
