import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Breadcrumb from "@/components/adminDashboard/common/Breadcrumb";
import ProfileHeader from "@/components/adminDashboard/TenantProfile/ProfileHeader";
import CreditCheck from "@/components/adminDashboard/TenantProfile/CreditCheck";
import IdentityInfo from "@/components/adminDashboard/TenantProfile/IdentityInfo";
import CurrentAddress from "@/components/adminDashboard/TenantProfile/CurrentAddress";
import EmploymentDetails from "@/components/adminDashboard/TenantProfile/EmploymentDetails";
import Documents from "@/components/adminDashboard/TenantProfile/Documents";
import RentalHistory from "@/components/adminDashboard/TenantProfile/RentalHistory";
import References from "@/components/adminDashboard/TenantProfile/References";
import GuarantorInfo from "@/components/adminDashboard/TenantProfile/GuarantorInfo";
import SendOfferModal from "@/components/adminDashboard/TenantProfile/SendOfferModal";
import { getTenantData } from "@/constant";

function TenantProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    property: "",
    monthlyRent: "",
    requirements: "",
  });

  const tenantData = getTenantData(id);

  const handleSendOffer = () => {
    console.log("Sending offer:", formData);
    setIsModalOpen(false);
    setFormData({
      property: "",
      monthlyRent: "",
      requirements: "",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb
          customLabels={{ tenantName: `${tenantData.name}'s Profile` }}
        />

        <ProfileHeader
          tenantData={tenantData}
          onSendOffer={() => setIsModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <CreditCheck tenantData={tenantData} />
          <IdentityInfo identity={tenantData.identity} />
          <CurrentAddress address={tenantData.currentAddress} />
        </div>
        <div className="block">
          <EmploymentDetails
            employment={tenantData.employment}
            proofOfIncome={tenantData.proofOfIncome}
          />
        </div>
        <Documents documents={tenantData.documents} />
        <RentalHistory rentalHistory={tenantData.rentalHistory} />
        <References references={tenantData.references} />
        <GuarantorInfo guarantor={tenantData.guarantor} />
      </div>

      <SendOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSend={handleSendOffer}
      />
    </DashboardLayout>
  );
}

export default TenantProfile;
