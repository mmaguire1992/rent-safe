'use client'

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Breadcrumb from "@/components/adminDashboard/common/Breadcrumb";
import PlansSection from "@/components/adminDashboard/PlansBilling/PlansSection";
import CurrentPlanDetails from "@/components/adminDashboard/PlansBilling/CurrentPlanDetails";
import BillingHistory from "@/components/adminDashboard/PlansBilling/BillingHistory";
import PaymentMethod from "@/components/adminDashboard/PlansBilling/PaymentMethod";
import { createCheckoutSession, getCurrentSubscription, getPaymentHistory } from "@/api/subscriptions";
import { getUserType } from "@/utils/auth";
import { paymentMethodData } from "@/constant";

function PlansBilling() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [userType, setUserType] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const type = getUserType();
    setUserType(type);
    
    // Only fetch subscription and payment history for owners
    if (type === 'owner') {
      fetchCurrentSubscription();
      fetchPaymentHistory();
    }
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      setLoadingPlan(true);
      const subscription = await getCurrentSubscription();
      console.log('Fetched subscription:', subscription);
      setCurrentPlan(subscription);
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      setCurrentPlan(null);
    } finally {
      setLoadingPlan(false);
    }
  };

  const fetchPaymentHistory = async (filters = {}) => {
    try {
      setLoadingHistory(true);
      const result = await getPaymentHistory({
        page: 1,
        limit: 50,
        ...filters,
      });
      console.log('Fetched payment history:', result);
      setBillingHistory(result.payments || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setBillingHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSwitchPlan = async (planId) => {
    try {
      // Find the plan data
      const selectedPlan = plans.find(p => p.id === planId);
      if (!selectedPlan || !selectedPlan.planData) {
        console.error('Plan not found:', planId);
        return;
      }

      const planData = selectedPlan.planData;
      const planKey = planData.planKey || planId;
      const type = userType || getUserType() || 'owner';

      // Get current URL for success/cancel redirects
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const successUrl = `${baseUrl}/payment-success?type=plan&userType=${type}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/payment-failure?type=plan&userType=${type}`;

      // Create checkout session
      const result = await createCheckoutSession(planKey, type, successUrl, cancelUrl);

      // Store session ID for status checking
      if (result?.sessionId && typeof window !== 'undefined') {
        localStorage.setItem('pending_payment_session_id', result.sessionId);
        localStorage.setItem('pending_payment_timestamp', Date.now().toString());
      }

      // Redirect to Stripe Checkout
      if (result?.url) {
        window.location.href = result.url;
      } else if (result?.sessionId) {
        // Fallback: construct Stripe checkout URL
        window.location.href = `https://checkout.stripe.com/c/pay/${result.sessionId}`;
      } else {
        console.error('Checkout session response:', result);
        alert('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to initiate payment';
      alert(errorMessage);
    }
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
          currentPlan={currentPlan}
          onSwitchPlan={handleSwitchPlan}
          onPlansLoaded={setPlans}
        />

        {userType === 'owner' && (
          <>
            <CurrentPlanDetails
              currentPlan={currentPlan}
              onUpgrade={handleUpgradePlan}
            />

            <BillingHistory
              billingHistory={billingHistory}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              loading={loadingHistory}
            />
          </>
        )}

        {/* <PaymentMethod
          paymentMethod={paymentMethodData}
          onAddCard={handleAddCard}
          onUpdate={handleUpdateCard}
        /> */}
      </div>
    </DashboardLayout>
  );
}

export default PlansBilling;

