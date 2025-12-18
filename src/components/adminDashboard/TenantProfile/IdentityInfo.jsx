import { FiMail, FiPhone } from "react-icons/fi";
import BlueUserIcon from "@/svg/blueUserIcon";
import GrayUserIcon from "@/svg/grayUserIcon";
import GrayCalendarIcon from "@/svg/grayCalendarIcon";
import GrayInsuranceIcon from "@/svg/grayInsuranceIcon";
import GrayCallIcon from "@/svg/grayCallIcon";
import GrayEmailIcon from "@/svg/grayEmailIcon";

function IdentityInfo({ identity }) {
  return (
    <div className="bg-lightGrayGradient rounded-lg border border-lightGray p-4 md:p-6">
      <div className="flex items-center justify-start gap-4 mb-6">
        <span className="bg-[#E8E2FF] rounded-[10px] p-2">
          <BlueUserIcon />
        </span>
        <h2 className="text-lg md:text-xl font-bold text-secondary font-nunito mb-0">
          Identity Information
        </h2>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-start gap-4">
          <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
            <GrayUserIcon />
          </span>
          <div>
            <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
              Full Name
            </p>
            <p className="font-normal text-secondary text-base font-nunito">
              {identity.fullName}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-start gap-4">
          <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
            <GrayCalendarIcon />
          </span>
          <div>
            <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
              Date of Birth
            </p>
            <p className="font-normal text-secondary text-base font-nunito">
              {identity.dateOfBirth}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-start gap-4">
          <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
            <GrayInsuranceIcon />
          </span>
          <div>
            <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
              National Insurance
            </p>
            <p className="font-normal text-secondary text-base font-nunito">
              {identity.nationalInsurance}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-start gap-4">
          <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
            <GrayCallIcon />
          </span>
          <div>
            <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
              Phone
            </p>
            <p className="font-normal text-secondary text-base font-nunito">
              {identity.phone}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-start gap-4">
          <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
            <GrayEmailIcon />
          </span>
          <div>
            <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
              Email Address
            </p>
            <p className="font-normal text-secondary text-base font-nunito">
              {identity.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdentityInfo;
