import { useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
import RentOutDetailsForm from "@/components/PropertyDetail/RentOutDetailsForm";
import RenterDetailsSection from "@/components/PropertyDetail/RenterDetailsSection";
import PropertyStatusCard from "@/components/PropertyDetail/PropertyStatusCard";
import PropertyGallery from "@/components/PropertyDetail/PropertyGallery";
import PropertyDescription from "@/components/PropertyDetail/PropertyDescription";
import PropertyDetailsGrid from "@/components/PropertyDetail/PropertyDetailsGrid";
import LocationSection from "@/components/PropertyDetail/LocationSection";
import RenterProfileDescription from "@/components/PropertyDetail/RenterProfileDescription";
import { getPropertyData } from "@/constant";

function PropertyDetail() {
  const { id } = useParams();
  const [showRentOutForm, setShowRentOutForm] = useState(false);
  const [showRenterDetails, setShowRenterDetails] = useState(false);
  const [renterEmail, setRenterEmail] = useState("");
  const [documents, setDocuments] = useState([]);
  const [renterFeedback, setRenterFeedback] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateAdded, setDateAdded] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [area, setArea] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const propertyData = getPropertyData(id);
  const [selectedImage, setSelectedImage] = useState(propertyData?.mainImage);

  const handleSaveRentOutDetails = () => {
    console.log("Saving rent out details:", { renterEmail, documents });
    setShowRentOutForm(false);
    setShowRenterDetails(true);
  };

  const handleEditRenter = () => {
    setShowRenterDetails(false);
    setShowRentOutForm(true);
  };

  const handleDeleteRenter = () => {
    // Handle delete logic
    console.log("Delete renter");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb customLabels={{ propertyTitle: propertyData.title }} />

        <PropertyStatusCard propertyData={propertyData} />
        {showRentOutForm && (
          <RentOutDetailsForm
            renterEmail={renterEmail}
            setRenterEmail={setRenterEmail}
            documents={documents}
            setDocuments={setDocuments}
            onSave={handleSaveRentOutDetails}
          />
        )}

        {showRenterDetails && (
          <RenterDetailsSection
            documents={documents}
            renterFeedback={renterFeedback}
            setRenterFeedback={setRenterFeedback}
            onEdit={handleEditRenter}
            onDelete={handleDeleteRenter}
          />
        )}
        <PropertyGallery
          propertyData={propertyData}
          onEdit={() => setShowRentOutForm(true)}
          onShare={() => console.log("Share property")}
          onDelete={() => console.log("Delete property")}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          showRenterDetails={showRenterDetails}
        />

        <PropertyDescription description={propertyData.description} />

        <PropertyDetailsGrid propertyData={propertyData} />

        <LocationSection address={propertyData.address} />

        <RenterProfileDescription
          description={propertyData.renterProfileDescription}
          preferredRenterTypes={propertyData.preferredRenterTypes}
          requirements={propertyData.additionalRequirements}
        />
      </div>
    </DashboardLayout>
  );
}

export default PropertyDetail;
