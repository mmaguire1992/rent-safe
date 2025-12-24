'use client'

import Hero from "@/components/frontend/landing/Hero";
import SearchBar from "@/components/frontend/landing/SearchBar";
import ProfileSection from "@/components/frontend/landing/ProfileSection";
import NewestListing from "@/components/frontend/landing/NewestListing";
import BrowsePropertyUK from "@/components/frontend/landing/BrowsePropertyUK";
import OwnersAgentsSection from "@/components/frontend/landing/OwnersAgentsSection";
import Header from "@/components/frontend/common/header";
import Footer from "@/components/frontend/common/footer";
import WhyChooseSection from "@/components/frontend/landing/whyChooseSection";
import Features from "@/components/frontend/landing/features";

function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <Hero />
      <SearchBar />
      <ProfileSection />
      <NewestListing />
      <BrowsePropertyUK />
      <WhyChooseSection />
      <Features />
      <OwnersAgentsSection />
      <Footer />
    </div>
  );
}

export default LandingPage;
