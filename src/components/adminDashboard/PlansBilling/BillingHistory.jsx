import { FiDownload } from "react-icons/fi";
import { dateOptions } from "@/constant";
import ButtonDropdown from "@/components/adminDashboard/common/buttonDropdown";

function BillingHistory({ billingHistory, dateFilter, setDateFilter }) {
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-[#DFFFE6] text-[#00893A]";
      case "failed":
        return "bg-[#FFEAEA] text-[#D24343]";
      case "pending":
        return "bg-[#FFF5CC] text-[#D19600]";
      default:
        return "bg-[#E6E8EC] text-[#5A5E67]";
    }
  };
  const getDateDisplayText = (value) => {
    if (!value || value === "") return "Date";
    const option = dateOptions.find((opt) => opt.value === value);
    return option ? option.label : "Date";
  };

  return (
    <div className="block">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="lg:text-2xl text-xl font-bold font-nunito text-secondary mb-0">
          Billing History
        </h2>
        <div className="flex gap-3">
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <ButtonDropdown
              options={dateOptions}
              value={dateFilter}
              onChange={setDateFilter}
              placeholder={getDateDisplayText(dateFilter)}
              className="h-[40px]"
              showFilterIcon={true}
            />
          </div>
          <button className="bg-white border border-[#4A2FCC] h-[38px] text-[#4A2FCC] px-3 md:px-6 py-1.5 md:py-2 rounded-[10px] font-bold font-nunito hover:bg-opacity-90 transition-colors flex items-center gap-2 md:gap-3 text-sm md:text-base">
            <span className="hidden sm:inline">Export</span>
            <FiDownload className="text-sm md:text-base" />
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-lightGray rounded-[20px] overflow-x-auto overflow-y-visible">
        <div className="min-w-[800px]">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-lightGray">
                <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                  Description
                </th>
                <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-darkGray font-bold text-base">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-lightGray hover:bg-gray-50 transition-colors"
                >
                  <td className=" py-4 px-4 font-nunito text-secondary text-base">
                    <span className="text-midGray text-base mr-2">
                      {index + 1}.
                    </span>
                    <span className="text-secondary text-base font-nunito font-bold">
                      {item.date}
                    </span>
                  </td>
                  <td className="text-secondary py-4 px-4  text-base font-nunito font-normal">
                    {item.description}
                  </td>
                  <td className="font-bold py-4 px-4 text-secondary text-base font-nunito">
                    {item.amount}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold font-nunito ${getStatusBadgeClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-2 hover:bg-gray-100 text-[#4A2FCC] rounded-lg transition-colors">
                      <FiDownload className="text-sm md:text-base text-[#4A2FCC]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 border border-lightGray rounded-[20px]">
        {billingHistory.map((item, index) => (
          <div
            key={index}
            className=" bg-white rounded-t-[20px] rounded-tr-[20px] last-of-type:rounded-b-[20px] last-of-type:rounded-br-[20px] last-of-type:border-b-0 border-b border-lightGray"
          >
            <div className="p-4 ">
              <div className="flex items-end justify-between mb-2">
                <div className="block ">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-midGray text-sm font-nunito">
                      #{index + 1}
                    </span>
                    <span className="text-secondary text-base font-nunito font-bold">
                      {item.date}
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="text-secondary text-sm font-nunito font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 text-[#4A2FCC] rounded-lg transition-colors flex-shrink-0">
                  <FiDownload className="text-base text-[#4A2FCC]" />
                </button>
              </div>

              <div className="flex items-center justify-start gap-2 ">
                <span className="font-bold text-secondary text-base font-nunito">
                  {item.amount}
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold font-nunito ${getStatusBadgeClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BillingHistory;
