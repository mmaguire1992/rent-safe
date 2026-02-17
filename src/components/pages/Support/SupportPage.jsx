'use client'

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useNavigate } from '@/lib/react-router-compat';
import DashboardLayout from "@/components/adminDashboard/dashboard/DashboardLayout";
import Breadcrumb from "@/components/adminDashboard/common/Breadcrumb";
import Header from "@/components/frontend/common/header";
import PropertiesHeader from "@/components/frontend/common/PropertiesHeader";
import Footer from "@/components/frontend/common/footer";
import SupportContent from "./SupportContent";

function SupportPage() {
  const { userType } = useAuth();
  const { favoriteCount } = useWishlist();
  const navigate = useNavigate();
  const isOwner = userType === 'owner';

  if (isOwner) {
    return (
      <DashboardLayout>
        <SupportContent showBreadcrumb={true} BreadcrumbComponent={Breadcrumb} />
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <PropertiesHeader
        favoriteCount={favoriteCount}
        onHeartClick={() => navigate('/properties?saved=true')}
        isSavedView={false}
      />
      <main className="container mx-auto py-6 sm:py-10 px-4 md:px-0 flex-1">
        <SupportContent showBreadcrumb={false} BreadcrumbComponent={null} />
      </main>
      <Footer />
    </div>
  );
}

export default SupportPage;

