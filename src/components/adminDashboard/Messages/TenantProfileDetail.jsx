import { FiChevronLeft } from "react-icons/fi";
import ProfileHeader from "@/components/adminDashboard/TenantProfile/ProfileHeader";
import CreditCheck from "@/components/adminDashboard/TenantProfile/CreditCheck";
import IdentityInfo from "@/components/adminDashboard/TenantProfile/IdentityInfo";
import CurrentAddress from "@/components/adminDashboard/TenantProfile/CurrentAddress";
import EmploymentDetails from "@/components/adminDashboard/TenantProfile/EmploymentDetails";
import { MdKeyboardBackspace } from "react-icons/md";

function TenantProfileDetail({
  tenantData,
  activeTab,
  setActiveTab,
  onBack,
  onSendOffer,
  allMessagesCount,
  messageRequestsCount,
}) {
  return (
    <div className="flex-1 overflow-y-auto p-0 space-y-4">
      {/* Header with Tabs and Back Button */}
      <div className="bg-white rounded-lg p-0 mb-0">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-darkGray font-semibold"
          >
            <MdKeyboardBackspace className="text-xl text-darkGray" />
            <span className="text-darkGray text-sm font-bold font-nunito">
              Back
            </span>
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <ProfileHeader
        tenantData={tenantData}
        onSendOffer={onSendOffer}
        onChat={onBack}
      />

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <CreditCheck tenantData={tenantData} showDocument={false} />
        <IdentityInfo identity={tenantData.identity} />
        <CurrentAddress address={tenantData.currentAddress} />
      </div>

      {/* Employment Details */}
      <div className="block">
        <EmploymentDetails
          employment={tenantData.employment}
          proofOfIncome={tenantData.proofOfIncome}
        />
      </div>
    </div>
  );
}

export default TenantProfileDetail;
