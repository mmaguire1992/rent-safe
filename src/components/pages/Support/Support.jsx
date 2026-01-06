'use client'

import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Breadcrumb from "@/components/adminDashboard/common/Breadcrumb";
import SupportContent from "./SupportContent";

function Support() {
  return (
    <DashboardLayout>
      <SupportContent showBreadcrumb={true} BreadcrumbComponent={Breadcrumb} />
    </DashboardLayout>
  );
}

export default Support;
