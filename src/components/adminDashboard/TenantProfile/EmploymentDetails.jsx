import BlueOccupationIcon from "@/svg/blueOccupationIcon";
import BlueUserIcon from "@/svg/blueUserIcon";
import EmployCheckIcon from "@/svg/employCheckIcon";
import GrayAnnualIcon from "@/svg/grayAnnualIcon";
import GrayBuildingIcon from "@/svg/grayBuildingIcon";
import GrayCalendarIcon from "@/svg/grayCalendarIcon";
import GrayDesignationIcon from "@/svg/grayDesignationIcon";
import GrayLocationIcon from "@/svg/grayLocationIcon";
import GrayUserIcon from "@/svg/grayUserIcon";
import WhiteIncomeIcon from "@/svg/whiteIncomeIcon";

function EmploymentDetails({ employment, proofOfIncome }) {
  return (
    <>
      <div className=" bg-lightGrayGradient shadow-[0px_0px_40px_0px_#4A4A4A14] rounded-[10px] border border-lightGray p-4 md:p-6">
        <div className="block">
          <div className="flex items-center justify-start gap-4 mb-6">
            <span className="bg-[#E8E2FF] rounded-[10px] p-2">
              <BlueOccupationIcon />
            </span>
            <h2 className="text-lg md:text-xl font-bold text-secondary font-nunito mb-0">
              Employment Details
            </h2>
          </div>
          <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center justify-start gap-4">
              <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
                <GrayDesignationIcon />
              </span>
              <div>
                <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
                  Job Title
                </p>
                <p className="font-normal text-secondary text-base font-nunito">
                  {employment.jobTitle}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4">
              <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
                <GrayBuildingIcon />
              </span>
              <div>
                <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
                  Company
                </p>
                <p className="font-normal text-secondary text-base font-nunito">
                  {employment.company}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4">
              <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
                <GrayCalendarIcon />
              </span>
              <div>
                <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
                  Start Date
                </p>
                <p className="font-normal text-secondary text-base font-nunito">
                  {employment.startDate}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4">
              <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
                <EmployCheckIcon />
              </span>
              <div>
                <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
                  Employment Type
                </p>
                <p className="font-normal text-secondary text-base font-nunito">
                  {employment.employmentType}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4">
              <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
                <GrayAnnualIcon />
              </span>
              <div>
                <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
                  Annual Salary
                </p>
                <p className="font-normal text-[#4A2FCC] text-base font-nunito">
                  {employment.annualSalary}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-start gap-4">
              <span className="bg-[#F9F9FC] border border-lightGray w-9 h-9 rounded-[10px] p-2">
                <GrayLocationIcon />
              </span>
              <div>
                <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
                  Work Location
                </p>
                <p className="font-normal text-secondary text-base font-nunito">
                  {employment.workLocation}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#E8E2FF] rounded-[10px] border border-white p-4">
          <div className="flex items-center justify-start gap-4 mb-4">
            <span className="bg-[#6B4EFF] shadow-[0px_0px_40px_0px_#4A4A4A14] rounded-[10px] p-2">
              <WhiteIncomeIcon />
            </span>
            <h2 className="text-base font-bold text-secondary font-nunito mb-0">
              Proof of Income
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-0">
            <div>
              <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
                Type
              </p>
              <p className="font-normal text-secondary text-base font-nunito">
                {proofOfIncome.type}
              </p>
            </div>
            <div>
              <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
                Date
              </p>
              <p className="font-normal text-secondary text-base font-nunito">
                {proofOfIncome.date}
              </p>
            </div>
            <div>
              <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
                Gross Monthly
              </p>
              <p className="font-normal text-secondary text-base font-nunito">
                {proofOfIncome.grossMonthly}
              </p>
            </div>
            <div>
              <p className="text-xs text-midGray font-nunito font-normal mb-0.5">
                Net Monthly
              </p>
              <p className="font-normal text-secondary text-base font-nunito">
                {proofOfIncome.netMonthly}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EmploymentDetails;
