import AddressIcon from "@/svg/addressIcon";
import BlueLocationIcon from "@/svg/blueLocationIcon";
import BlueUserIcon from "@/svg/blueUserIcon";
import CityIcon from "@/svg/cityIcon";
import CountryIcon from "@/svg/countryIcon";
import GrayUserIcon from "@/svg/grayUserIcon";
import PostCodeIcon from "@/svg/postCodeIcon";
import ResidencyIcon from "@/svg/residencyIcon";

function CurrentAddress({ address }) {
  return (
    <div className="bg-lightGrayGradient rounded-lg border border-lightGray p-4 md:p-6">
      <div className="flex items-center justify-start gap-4 mb-6">
        <span className="bg-[#E8E2FF] rounded-[10px] p-2">
          <BlueLocationIcon />
        </span>
        <h2 className="text-lg md:text-xl font-bold text-secondary font-nunito mb-0">
          Current Address
        </h2>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-start gap-4">
          <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
            <AddressIcon />
          </span>
          <div>
            <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
              Address
            </p>
            <p className="font-normal text-secondary text-base font-nunito">
              {address.address}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-start gap-4">
          <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
            <CityIcon />
          </span>
          <div>
            <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
              City
            </p>
            <p className="font-normal text-secondary text-base font-nunito">
              {address.city}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-start gap-4">
          <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
            <CountryIcon />
          </span>
          <div>
            <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
              Country
            </p>
            <p className="font-normal text-secondary text-base font-nunito">
              {address.country}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-start gap-4">
          <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
            <PostCodeIcon />
          </span>
          <div>
            <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
              Postcode
            </p>
            <p className="font-normal text-secondary text-base font-nunito">
              {address.postcode}
            </p>
          </div>
        </div>
        {/* <div className="flex items-center justify-start gap-4">
          <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
            <ResidencyIcon />
          </span>
          <div>
            <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
              Living Period
            </p>
            <p className="font-normal text-secondary text-base font-nunito">
              {address.livingPeriod}
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default CurrentAddress;
