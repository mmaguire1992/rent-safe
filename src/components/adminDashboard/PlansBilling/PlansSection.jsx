import { useState, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import { getOwnerPlans, getRenterPlan } from "@/api/subscriptions";
import { getUserType } from "@/utils/auth";

function PlansSection({ currentPlan, onSwitchPlan, onPlansLoaded }) {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    // Get user type
    const type = getUserType();
    setUserType(type);
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let fetchedPlans = [];
        
        // Fetch plans based on user type
        if (userType === 'owner') {
          fetchedPlans = await getOwnerPlans();
        } else if (userType === 'renter') {
          // For renters, there's typically only one active plan
          const renterPlan = await getRenterPlan();
          fetchedPlans = renterPlan ? [renterPlan] : [];
        } else {
          // Default to owner plans if user type not determined
          fetchedPlans = await getOwnerPlans();
        }
        
        // Transform plans to match UI structure
        const transformedPlans = fetchedPlans.map((plan) => {
          const price = plan.billing?.price || plan.monthlyPrice || 0;
          
          // Build features array dynamically based on user type
          const features = [];
          
          if (userType === 'owner') {
            // Owner-specific features
            const propertyLimit = plan.features?.propertyLimit || 0;
            const featuredListings = plan.features?.featuredListings || 0;
            
            // Property limit - dynamic based on plan
            if (propertyLimit === -1) {
              features.push("Unlimited active listings");
            } else if (propertyLimit > 0) {
              features.push(`${propertyLimit} active listing${propertyLimit > 1 ? 's' : ''}`);
            } else {
              features.push("1 active listing");
            }
            
            // Featured listings - dynamic
            if (featuredListings > 0) {
              if (featuredListings === 1) {
                features.push("Featured listing (1)");
              } else {
                features.push(`Featured listings (${featuredListings})`);
              }
            }
            
            // Common features
            features.push("Verified renter messages");
            
            // Analytics based on plan level
            if (plan.planKey === 'premium') {
              features.push("Advanced analytics");
            } else {
              features.push("Basic analytics");
            }
            
            // Support based on plan level
            if (plan.planKey === 'premium') {
              features.push("Priority phone support");
            } else if (plan.planKey === 'standard') {
              features.push("Priority email support");
            } else {
              features.push("Email support");
            }
            
            // Additional premium features
            if (plan.planKey === 'premium') {
              features.push("Promoted in search");
            }
            
            // Common to all plans
            features.push("No per-listing fees");
          } else if (userType === 'renter') {
            // Renter-specific features
            const chatContactLimit = plan.features?.chatContactLimit || 5;
            
            features.push(`${chatContactLimit} chat contacts`);
            features.push("Verified property access");
            features.push("Message property owners");
            features.push("Save favorite properties");
            features.push("Email notifications");
            features.push("Priority customer support");
          }
          
          // Determine badge
          let badge = null;
          if (plan.planKey === 'basic') {
            badge = "NEW";
          } else if (plan.planKey === 'premium') {
            badge = "POPULAR";
          }
          
          return {
            id: plan.planKey || plan._id || plan.id,
            name: plan.name || 'Unnamed Plan',
            badge: badge,
            description: plan.description || 'Choose the perfect plan for your needs',
            price: `€${price.toFixed(2)}`,
            period: "/ one-time payment",
            features: features,
            planData: plan, // Keep original plan data for reference
          };
        });
        
        setPlans(transformedPlans);
        // Notify parent component about loaded plans
        if (onPlansLoaded) {
          onPlansLoaded(transformedPlans);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load plans. Please try again later.');
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userType) {
      fetchPlans();
    }
  }, [userType]);

  if (isLoading) {
    return (
      <div className="block">
        <div className="mb-6">
          <h2 className="lg:text-2xl text-xl font-bold font-nunito text-secondary mb-0">
            Plans & Billing
          </h2>
          <p className="text-base font-normal font-nunito text-darkGray">
            Choose the perfect plan for your needs
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-darkGray">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="block">
        <div className="mb-6">
          <h2 className="lg:text-2xl text-xl font-bold font-nunito text-secondary mb-0">
            Plans & Billing
          </h2>
          <p className="text-base font-normal font-nunito text-darkGray">
            Choose the perfect plan for your needs
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="block">
        <div className="mb-6">
          <h2 className="lg:text-2xl text-xl font-bold font-nunito text-secondary mb-0">
            Plans & Billing
          </h2>
          <p className="text-base font-normal font-nunito text-darkGray">
            Choose the perfect plan for your needs
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-darkGray">No plans available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="block">
      <div className="mb-6">
        <h2 className="lg:text-2xl text-xl font-bold font-nunito text-secondary mb-0">
          Plans & Billing
        </h2>
        <p className="text-base font-normal font-nunito text-darkGray">
          Choose the perfect plan for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`rounded-[20px] border-2 p-4 flex flex-col ${
                isCurrentPlan
                  ? "border-[#6B4EFF] bg-[#6B4EFF] text-white"
                  : "border-lightGray bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xl font-bold font-nunito mb-0 ${
                    isCurrentPlan ? "text-white" : "text-secondary"
                  }`}
                >
                  {plan.name}
                </h3>
                {plan.badge && (
                  <div className="mb-0">
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                        isCurrentPlan
                          ? "bg-white text-[#6B4EFF]"
                          : plan.badge === "NEW"
                          ? "bg-[#009966] text-white"
                          : "bg-purple-100 text-[#6B4EFF]"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}
              </div>
              <p
                className={`text-sm font-normal font-nunito mb-4 ${
                  isCurrentPlan ? "text-white opacity-90" : "text-darkGray"
                }`}
              >
                {plan.description}
              </p>

              <div
                className={`mb-4 border-b  pb-1 ${
                  isCurrentPlan ? "border-b-white" : "border-b-lightGray"
                }`}
              >
                <span
                  className={`text-3xl font-bold font-nunito ${
                    isCurrentPlan ? "text-white" : "text-[#4A2FCC]"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-base font-normal font-nunito ml-2 ${
                    isCurrentPlan ? "text-white opacity-90" : "text-midGray"
                  }`}
                >
                  {plan.period}
                </span>
              </div>

              <div className="flex-1 space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <FiCheck
                      className={`mt-0.5 text-xl flex-shrink-0 ${
                        isCurrentPlan ? "text-white" : "text-[#009966]"
                      }`}
                    />
                    <span
                      className={`text-base font-normal font-nunito ${
                        isCurrentPlan ? "text-white" : "text-darkGray"
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSwitchPlan(plan.id)}
                className={`w-full py-3 rounded-[10px] font-bold text-base font-nunito transition-colors ${
                  isCurrentPlan
                    ? "bg-white text-[#6B4EFF] hover:bg-gray-100"
                    : "bg-blueGradient text-white hover:bg-opacity-90"
                }`}
              >
                {isCurrentPlan ? "Current Plan" : "Switch Plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlansSection;
