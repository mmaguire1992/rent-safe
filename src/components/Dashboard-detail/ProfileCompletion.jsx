import { FiX } from "react-icons/fi";

function ProfileCompletion({
  completionPercentage = 95,
  pendingTask = "upload image",
}) {
  return (
    <div className="bg-[#EDFFF4]  rounded-[20px] p-4 my-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="block mb-4">
            <h3 className="text-lg md:text-xl font-bold text-secondary">
              Profile Completion Pending
            </h3>
            <p className="text-secondary text-sm md:text-base font-normal font-nunito mb-2">
              Complete your profile. Pending: <span>{pendingTask}</span>.
            </p>
          </div>

          <div className="w-full bg-[#E6E8EC] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#00893A] h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="text-[#00893A] font-bold text-lg md:text-xl">
            {completionPercentage}% Completed
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProfileCompletion;
