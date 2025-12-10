import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SummaryCards from "@/components/Dashboard-detail/SummaryCards";
import RecentRequests from "@/components/Dashboard-detail/RecentRequests";
import ActiveProperties from "@/components/Dashboard-detail/ActiveProperties";
import ProfileCompletion from "@/components/Dashboard-detail/ProfileCompletion";
import {
  summaryCards,
  recentRequests,
  activeProperties,
  recentRequestsSliderSettings,
} from "@/constant";

function Dashboard() {
  return (
    <DashboardLayout>
      <div className="block">
        <div className="mb-3">
          <h1 className="text-xl md:text-2xl font-bold text-secondary mb-2">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-darkGray">
            Manage and track your rental listings
          </p>
        </div>

        <ProfileCompletion
          completionPercentage={95}
          pendingTask="upload image"
        />

        <SummaryCards summaryCards={summaryCards} />
        <RecentRequests
          recentRequests={recentRequests}
          sliderSettings={recentRequestsSliderSettings}
        />
        <ActiveProperties activeProperties={activeProperties} />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
