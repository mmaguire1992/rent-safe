import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileHeader from "@/components/TenantProfile/ProfileHeader";
import CreditCheck from "@/components/TenantProfile/CreditCheck";
import IdentityInfo from "@/components/TenantProfile/IdentityInfo";
import CurrentAddress from "@/components/TenantProfile/CurrentAddress";
import EmploymentDetails from "@/components/TenantProfile/EmploymentDetails";
import Documents from "@/components/TenantProfile/Documents";
import RentalHistory from "@/components/TenantProfile/RentalHistory";
import References from "@/components/TenantProfile/References";
import GuarantorInfo from "@/components/TenantProfile/GuarantorInfo";
import SendOfferModal from "@/components/TenantProfile/SendOfferModal";
import { MdKeyboardArrowRight } from "react-icons/md";
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-secondary text-base font-normal text-midGray"
          >
            Dashboard
          </button>
          <span>
            <MdKeyboardArrowRight className="text-xl text-midGray" />
          </span>
          <span className="text-[#6B4EFF] text-base font-normal">
            {tenantData.name}'s Profile
          </span>
        </div>

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
