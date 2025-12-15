import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
import PlansSection from "@/components/PlansBilling/PlansSection";
import CurrentPlanDetails from "@/components/PlansBilling/CurrentPlanDetails";
import BillingHistory from "@/components/PlansBilling/BillingHistory";
import PaymentMethod from "@/components/PlansBilling/PaymentMethod";
import {
  plansData,
  currentPlanData,
  billingHistoryData,
  paymentMethodData,
} from "@/constant";

function PlansBilling() {
  const [currentPlan, setCurrentPlan] = useState(currentPlanData.id);
  const [dateFilter, setDateFilter] = useState("");

  const handleSwitchPlan = (planId) => {
    setCurrentPlan(planId);
    console.log("Switching to plan:", planId);
  };

  const handleCancelPlan = () => {
    console.log("Cancel plan");
  };

  const handleUpgradePlan = () => {
    console.log("Upgrade plan");
  };

  const handleAddCard = () => {
    console.log("Add new card");
  };

  const handleUpdateCard = () => {
    console.log("Update card");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb />

        <PlansSection
          plans={plansData}
          currentPlan={currentPlan}
          onSwitchPlan={handleSwitchPlan}
        />

        <CurrentPlanDetails
          currentPlan={currentPlanData}
          onCancel={handleCancelPlan}
          onUpgrade={handleUpgradePlan}
        />

        <BillingHistory
          billingHistory={billingHistoryData}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />

        <PaymentMethod
          paymentMethod={paymentMethodData}
          onAddCard={handleAddCard}
          onUpdate={handleUpdateCard}
        />
      </div>
    </DashboardLayout>
  );
}

export default PlansBilling;

