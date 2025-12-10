import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FiCheckCircle, FiPhone, FiMapPin, FiUser } from "react-icons/fi";
import { MdKeyboardArrowRight } from "react-icons/md";
import SmallCheckIcon from "../svg/smallCheckIcon";
import GrayBuildingIcon from "../svg/grayBuildingIcon";
import WhiteLocationIcon from "../svg/whiteLocationIcon";
import { reviewsData, getTenantData } from "@/constant";

function RentalHistory() {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-secondary">
              Reviews
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="hover:text-secondary text-base font-normal text-midGray"
            >
              Dashboard
            </button>
            <span>
              <MdKeyboardArrowRight className="text-xl text-midGray" />
            </span>
            <button
              onClick={() => navigate(`/dashboard/tenant/${id}`)}
              className="hover:text-secondary text-base font-normal text-midGray"
            >
              {getTenantData(id).name}'s Profile
            </button>
            <span>
              <MdKeyboardArrowRight className="text-xl text-midGray" />
            </span>
            <span className="text-[#6B4EFF] text-base font-normal">
              12 Reviews
            </span>
          </div>
        </div>
        {/* Title */}

        {/* Reviews Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
          {reviewsData.map((history, index) => (
            <div className="bg-white">
              <div className="border border-lightGray rounded-[20px] p-4 bg-white ">
                <div className="flex flex-row items-start gap-4">
                  {/* Rental History Details - 60% (Left Side) */}
                  <div className="flex-[0_0_50%] min-w-0 border-r border-lightGray space-y-3">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-[#6B4EFF] rounded-[10px] w-9 h-9 flex items-center justify-center mt-1">
                        <WhiteLocationIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base text-secondary font-nunito font-bold mb-1">
                          Address
                        </p>
                        <p className="font-normal text-darkGray text-sm font-nunito">
                          {history.address}
                        </p>
                      </div>
                    </div>

                    {/* Tenancy Dates */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                        <GrayBuildingIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                          Tenancy Dates
                        </p>
                        <p className="font-normal text-secondary text-base font-nunito">
                          {history.tenancyDates}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                        <GrayBuildingIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                          Location
                        </p>
                        <p className="font-normal text-secondary text-base font-nunito">
                          {history.location}
                        </p>
                      </div>
                    </div>

                    {/* Monthly Rent */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                        <GrayBuildingIcon className="text-[#6B4EFF] text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                          Monthly Rent
                        </p>
                        <p className="font-normal text-secondary text-base font-nunito">
                          {history.monthlyRent}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                        <GrayBuildingIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                          Phone
                        </p>
                        <p className="font-normal text-secondary text-base font-nunito">
                          {history.phone}
                        </p>
                      </div>
                    </div>

                    {/* Reason for Leaving */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-[#F9F9FC] border border-lightGray rounded-[10px] w-9 h-9 flex items-center justify-center shadow-[0px_0px_40px_0px_#4A4A4A14]">
                        <GrayBuildingIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-midGray font-nunito font-normal mb-0.5">
                          Reason for Leaving
                        </p>
                        <p className="font-normal text-secondary text-base font-nunito">
                          {history.reasonForLeaving}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Landlord Recommendation - 40% (Right Side) */}
                  {history.landlordRecommendation ? (
                    <div className=" min-w-0  ">
                      <p className="font-normal text-darkGray text-base font-nunito mb-4 leading-relaxed">
                        {history.landlordRecommendation.text}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-4">
                        <div className="block min-w-0">
                          <span className="block font-bold text-secondary text-base font-nunito">
                            {history.landlordRecommendation.name}
                          </span>
                          <span className="text-darkGray text-sm font-nunito font-normal">
                            Owner
                          </span>
                        </div>
                        {history.landlordRecommendation.verified && (
                          <span className="bg-[#DFFFE6] text-[#00893A] px-2 py-1 rounded-full text-xs font-normal font-nunito flex items-center gap-1 flex-shrink-0">
                            Verified <SmallCheckIcon />
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-[0_0_40%] min-w-0 border-l border-lightGray pl-4">
                      <p className="text-darkGray text-sm font-nunito font-normal">
                        No recommendation available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RentalHistory;
