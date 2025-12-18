import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import SummaryCards from "@/components/adminDashboard/Dashboard-detail/SummaryCards";
import RecentRequests from "@/components/adminDashboard/Dashboard-detail/RecentRequests";
import ActiveProperties from "@/components/adminDashboard/Dashboard-detail/ActiveProperties";
import ProfileCompletion from "@/components/adminDashboard/Dashboard-detail/ProfileCompletion";
import { summaryCards, recentRequests, activeProperties } from "@/constant";

function Dashboard() {
  return (
    <DashboardLayout>
      <div className="block">
        <div className="mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary mb-1 sm:mb-2">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-darkGray">
            Manage and track your rental listings
          </p>
        </div>

        <ProfileCompletion
          completionPercentage={95}
          pendingTask="upload image"
        />

        <SummaryCards summaryCards={summaryCards} />
        <RecentRequests recentRequests={recentRequests} />
        <ActiveProperties activeProperties={activeProperties} />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
