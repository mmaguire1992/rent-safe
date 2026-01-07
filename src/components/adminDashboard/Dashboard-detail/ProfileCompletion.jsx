import { FiX } from "react-icons/fi";

function ProfileCompletion({
  completionPercentage = 95,
  pendingTask = "upload image",
}) {
  return (
    <div className="bg-[#EDFFF4] rounded-[20px] p-3 sm:p-4 my-3 sm:my-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="block mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-secondary mb-1 sm:mb-2">
              Profile Completion Pending
            </h3>
            <p className="text-secondary text-xs sm:text-sm md:text-base font-normal font-nunito">
              Complete your profile. Pending: <span className="font-semibold">{pendingTask}</span>.
            </p>
          </div>


        </div>
        <div className="flex-shrink-0">
          <span className="text-[#00893A] font-bold text-base sm:text-lg md:text-xl">
            {completionPercentage}% Completed
          </span>
        </div>
      </div>
      <div className="w-full bg-[#E6E8EC] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#00893A] h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
    </div>
  );
}

export default ProfileCompletion;
