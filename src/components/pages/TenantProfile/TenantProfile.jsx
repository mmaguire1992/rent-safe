'use client'

import { useEffect, useState } from "react";
import { useNavigate, useParams } from '@/lib/react-router-compat';
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
import { getUserById } from "@/api/users";
import { toast } from "react-toastify";

function TenantProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenantData, setTenantData] = useState(() => getTenantData(id));
  const [formData, setFormData] = useState({
    property: "",
    monthlyRent: "",
    requirements: "",
  });

  // Fetch live tenant profile data (falls back to dummy constant data if API fails)
  useEffect(() => {
    const fetchTenant = async () => {
      if (!id) return;
      try {
        const userData = await getUserById(id);
        const formattedTenantData = {
          name: userData.userInfo?.name?.first && userData.userInfo?.name?.last
            ? `${userData.userInfo.name.first} ${userData.userInfo.name.last}`.trim()
            : userData.firstName && userData.lastName
            ? `${userData.firstName} ${userData.lastName}`.trim()
            : userData.email || 'N/A',
          profileImage: userData.userInfo?.profileImage || '/default-avatar.png',
          verified: userData.isEmailVerified || userData.userInfo?.verificationStatus === 'verified',
          description: userData.userInfo?.bio || '',
          designation: userData.userInfo?.employment?.jobTitle || 'N/A',
          location: userData.userInfo?.address
            ? [userData.userInfo.address.city, userData.userInfo.address.country]
                .filter(Boolean)
                .join(', ') || 'N/A'
            : 'N/A',
          monthlyIncome: userData.userInfo?.employment?.monthlyIncome
            ? `£${userData.userInfo.employment.monthlyIncome.toLocaleString()}`
            : userData.userInfo?.proofOfIncome?.grossMonthly
            ? `£${userData.userInfo.proofOfIncome.grossMonthly.toLocaleString()}`
            : 'N/A',
          creditScore: userData.userInfo?.creditScore || 0,
          creditScoreDocument: userData.userInfo?.creditScoreDocument || null,
          creditMax: 850,
          creditRating: userData.userInfo?.creditRating || 'N/A',
          creditDescription: userData.userInfo?.creditDescription || '',
          identity: {
            fullName: userData.userInfo?.name?.first && userData.userInfo?.name?.last
              ? `${userData.userInfo.name.first} ${userData.userInfo.name.last}`.trim()
              : userData.firstName && userData.lastName
              ? `${userData.firstName} ${userData.lastName}`.trim()
              : 'N/A',
            dateOfBirth: userData.userInfo?.dateOfBirth
              ? new Date(userData.userInfo.dateOfBirth).toLocaleDateString()
              : 'N/A',
            nationalInsurance: userData.userInfo?.nationalInsurance || 'N/A',
            phone: userData.phone || 'N/A',
            email: userData.email || 'N/A',
          },
          currentAddress: {
            address: userData.userInfo?.address?.street || 'N/A',
            city: userData.userInfo?.address?.city || 'N/A',
            country: userData.userInfo?.address?.country || 'N/A',
            postcode: userData.userInfo?.address?.postcode || 'N/A',
            livingPeriod: userData.userInfo?.address?.livingPeriod || 'N/A',
          },
          employment: {
            jobTitle: userData.userInfo?.employment?.jobTitle || 'N/A',
            employmentType: userData.userInfo?.employment?.employmentType || 'N/A',
            company: userData.userInfo?.employment?.company || 'N/A',
            annualSalary: userData.userInfo?.employment?.annualSalary
              ? `£${userData.userInfo.employment.annualSalary.toLocaleString()}`
              : 'N/A',
            startDate: userData.userInfo?.employment?.startDate
              ? new Date(userData.userInfo.employment.startDate).toLocaleDateString()
              : 'N/A',
            workLocation: userData.userInfo?.employment?.workLocation || 'N/A',
          },
          proofOfIncome: {
            type: userData.userInfo?.proofOfIncome?.type || 'N/A',
            date: userData.userInfo?.proofOfIncome?.date
              ? new Date(userData.userInfo.proofOfIncome.date).toLocaleDateString()
              : 'N/A',
            grossMonthly: userData.userInfo?.proofOfIncome?.grossMonthly
              ? `£${userData.userInfo.proofOfIncome.grossMonthly.toLocaleString()}`
              : 'N/A',
            netMonthly: userData.userInfo?.proofOfIncome?.netMonthly
              ? `£${userData.userInfo.proofOfIncome.netMonthly.toLocaleString()}`
              : 'N/A',
          },
          documents: userData.userInfo?.documents || [],
          rentalHistory: userData.userInfo?.rentalHistory || [],
          references: userData.userInfo?.references || [],
          guarantor: userData.userInfo?.guarantor || null,
        };
        setTenantData(formattedTenantData);
      } catch (error) {
        // Keep existing dummy data, but inform user once
        console.error('Error fetching tenant profile:', error);
        toast.error('Failed to load tenant profile');
      }
    };

    fetchTenant();
  }, [id]);

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
