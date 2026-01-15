import { FiPhone, FiMail } from "react-icons/fi";
import WhiteGuarantorIcon from "@/svg/whiteGuarantorIcon";
import SmallCheckIcon from "@/svg/smallCheckIcon";
import BlueUserIcon from "@/svg/blueUserIcon";
import BlueIncomeIcon from "@/svg/blueIncomeIcon";
import BlueCallIcon from "@/svg/blueCallIcon";
import BlueOccupationIcon from "@/svg/blueOccupationIcon";
import BlueEmailIcon from "@/svg/blueEmailIcon";
import BlueLocationIcon from "@/svg/blueLocationIcon";

function GuarantorInfo({ guarantor }) {
  return (
    <div className="bg-[#E8E2FF] rounded-[20px] border border-white p-4 md:p-6">
      <div className="flex items-center justify-start gap-4 mb-0">
        <span className="bg-[#6B4EFF] rounded-[10px] p-2">
          <WhiteGuarantorIcon />
        </span>
        <h2 className="text-lg md:text-xl font-bold text-secondary font-nunito mb-0">
          Guarantor Information
        </h2>
      </div>
      <div className="bg-[#F9F9FC] rounded-[20px] p-4 mt-6">
        <div className="flex items-center justify-start space-x-3 mb-4 border-b border-lightGray pb-4">
          <div className="flex items-center justify-between gap-3 ">
            <div className="flex-shrink-0 bg-[#6B4EFF] rounded-[10px] w-9 h-9 flex items-center justify-center text-white text-sm font-bold mt-1">
              SW
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base text-secondary font-nunito font-bold mb-0">
                {guarantor.name}
              </p>
            </div>
          </div>
          {guarantor?.verified && (
            <span className="bg-[#DFFFE6] text-[#00893A] px-2 py-1 rounded-full text-xs font-normal font-nunito flex items-center gap-1 flex-shrink-0">
              Verified <SmallCheckIcon />
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
              <BlueUserIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                Relationship
              </p>
              <p className="font-normal text-secondary text-base font-nunito">
                {guarantor.relationship}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
              <BlueOccupationIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                Occupation
              </p>
              <p className="font-normal text-secondary text-base font-nunito">
                {guarantor.occupation}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
              <BlueIncomeIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                Annual Income
              </p>
              <p className="font-normal text-secondary text-base font-nunito">
                {guarantor.annualIncome}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
              <BlueCallIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                Contact Number
              </p>
              <p className="font-normal text-secondary text-base font-nunito">
                {guarantor.contactNumber}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
              <BlueEmailIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                Email Address
              </p>
              <p className="font-normal text-secondary text-base font-nunito">
                {guarantor.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
              <BlueLocationIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                Address
              </p>
              <p className="font-normal text-secondary text-base font-nunito">
                {guarantor.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuarantorInfo;
