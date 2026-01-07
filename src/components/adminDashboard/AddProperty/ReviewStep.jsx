'use client'

import { useState, useEffect, useRef } from "react";
import { FiMapPin, FiHome, FiCircle } from "react-icons/fi";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { loadGoogleMaps } from "@/utils/googleMaps";

import BlueCarIcon from "@/svg/blueCarIcon";
import BlueWIFIIcon from "@/svg/blueWIFIIcon";
import BlueGardenIcon from "@/svg/blueGardenIcon";
import BlueHeatingIcon from "@/svg/blueHeatingIcon";
import OrangeElectrityIcon from "@/svg/orangeElectrityIcon";
import OrangeGasIcon from "@/svg/orangeGasIcon";
import SingleFemaleIcon from "@/svg/singleFemaleIcon";
import RedMaleIcon from "@/svg/redMaleIcon";
import CoupleIcon from "@/svg/coupleIcon";
import FamilyIcon from "@/svg/familyIcon";
import StudentIcon from "@/svg/studentIcon";
import ProfessionalIcon from "@/svg/professionalIcon";
import SelfEmployedIcon from "@/svg/selfEmployedIcon";
import RetiredIcon from "@/svg/retiredIcon";
import SharersIcon from "@/svg/sharersIcon";
import CarporateTenantIcon from "@/svg/carporateTenantIcon";
import {
  amenitiesList,
  utilitiesList,
  addPropertyTypeOptions,
  addPropertyCityOptions,
  countyOptions,
  chargeTypeOptions,
  preferredRenterTypeOptions,
} from "@/constant";
import BlueLocationIcon from "@/svg/blueLocationIcon";
import GrayBedIcon from "@/svg/grayBedIcon";
import GrayBathIcon from "@/svg/grayBathIcon";

function ReviewStep({ formData }) {
  const [readMoreDescription, setReadMoreDescription] = useState(false);
  const [readMoreRequirements, setReadMoreRequirements] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const { isLoaded: isGoogleMapsLoaded, error: googleMapsError } = useGoogleMaps();

  const getLabelFromValue = (options, value) => {
    return options.find((opt) => opt.value === value)?.label || value;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Dummy icon component for amenities
  const DummyAmenityIcon = () => (
    <FiCircle className="w-5 h-5 text-[#6B4EFF]" strokeWidth="2" />
  );

  // Dummy icon component for utilities
  const DummyUtilityIcon = () => (
    <FiCircle className="w-5 h-5 text-yellow-500" strokeWidth="2" />
  );

  // Get amenity icon
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("parking")) return BlueCarIcon;
    if (amenityLower.includes("wifi") || amenityLower.includes("wi-fi"))
      return BlueWIFIIcon;
    if (amenityLower.includes("garden")) return BlueGardenIcon;
    if (amenityLower.includes("heating")) return BlueHeatingIcon;
    // Return dummy icon for amenities without specific icon
    return DummyAmenityIcon;
  };

  // Get utility icon
  const getUtilityIcon = (utility) => {
    if (utility.value === "electricity") return OrangeElectrityIcon;
    if (utility.value === "gas") return OrangeGasIcon;
    // Return dummy icon for utilities without specific icon
    return DummyUtilityIcon;
  };

  // Get preferred renter type icon
  const getPreferredRenterIcon = (value) => {
    switch (value) {
      case "single-male":
        return RedMaleIcon;
      case "single-female":
        return SingleFemaleIcon;
      case "couple":
        return CoupleIcon;
      case "family":
        return FamilyIcon;
      case "students":
        return StudentIcon;
      case "professionals":
        return ProfessionalIcon;
      case "self-employed":
        return SelfEmployedIcon;
      case "retired":
        return RetiredIcon;
      case "sharers":
        return SharersIcon;
      case "corporate":
        return CarporateTenantIcon;
      default:
        return null;
    }
  };

  // Get image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.url && !image.uploading) return image.url;
    if (image.file instanceof File) return URL.createObjectURL(image.file);
    if (typeof image === "string") return image;
    if (typeof image === "object" && image.url) return image.url;
    return null;
  };

  // Format currency
  const formatCurrency = (amount, currency = "GBP") => {
    if (!amount) return "";
    const currencySymbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "USD" ? "$" : "";
    return `${currencySymbol}${parseFloat(amount).toLocaleString()}`;
  };

  // Initialize map for review
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || typeof window === 'undefined') return;
      if (!formData.coordinates || formData.coordinates.length !== 2) return;

      try {
        await loadGoogleMaps();

        if (!window.google || !window.google.maps) {
          return;
        }

        const [lng, lat] = formData.coordinates; // Coordinates are stored as [longitude, latitude]
        const position = { lat, lng };

        const mapOptions = {
          center: position,
          zoom: 15,
          mapTypeId: "roadmap",
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
        };

        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

        // Create marker
        markerRef.current = new window.google.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          title: formData.address || "Property Location",
          animation: window.google.maps.Animation.DROP,
        });

        // Create info window
        infoWindowRef.current = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #1f2937;">
                ${formData.address || "Property Location"}
              </h3>
              ${formData.city ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">City: ${formData.city}</p>` : ""}
              ${formData.postcode ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">Postcode: ${formData.postcode}</p>` : ""}
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #9ca3af;">
                Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}
              </p>
            </div>
          `,
        });

        // Add click listener to marker
        markerRef.current.addListener("click", () => {
          infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
        });

        // Open info window by default
        infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };

    if (isGoogleMapsLoaded && formData.coordinates && formData.coordinates.length === 2) {
      initMap();
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    };
  }, [isGoogleMapsLoaded, formData.coordinates, formData.address, formData.city, formData.postcode]);

  const descriptionText = formData.renterProfileDescription || "";
  const requirementsText = formData.additionalRequirements || "";
  const maxDescriptionLength = 200;
  const maxRequirementsLength = 200;
  
  // Get currency from formData or default to GBP
  const currency = formData.currency || "GBP";
  
  // Filter additional charges to show only those with values
  const validAdditionalCharges = formData.additionalCharges?.filter(
    (charge) => charge.type && charge.type.trim() && charge.amount
  ) || [];

  return (
    <div className="block">
      {/* Property Overview */}
      <div className="bg-white p-0">
        <h3 className="text-2xl font-bold font-nunito text-secondary mb-1">
          {formData.propertyTitle || "2-Bed Apartment in City Centre"}
        </h3>
        <div className="flex md:flex-nowrap flex-wrap items-center gap-2 md:gap-8 mb-3 md:mb-0">
          {/* Address */}
          {(formData.address || formData.city || formData.postcode) && (
            <div className="flex items-start gap-2 text-darkGray md:mb-3 relative md:after:content-[''] md:after:absolute md:after:bottom-[5px] md:after:right-[-17px] md:after:w-[2px] md:after:h-[18px] md:after:bg-midGray">
              <BlueLocationIcon />
              <span className="text-base text-secondary font-normal font-nunito">
                {[
                  formData.address,
                  getLabelFromValue(addPropertyCityOptions, formData.city),
                  formData.postcode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}

          {/* Specifications */}
          <div className="flex items-center gap-4 md:mb-4">
            {formData.bedrooms && (
              <div className="flex items-center gap-2">
                <GrayBedIcon />
                <span className="text-base font-normal font-nunito text-darkGray">
                  {formData.bedrooms} beds
                </span>
              </div>
            )}
            {formData.bathrooms && (
              <div className="flex items-center gap-2">
                <GrayBathIcon />
                <span className="text-base font-normal font-nunito text-darkGray">
                  {formData.bathrooms} baths
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Image Gallery */}
        {formData.images.length > 0 && (
          <div className="mb-4">
            {/* Main Image */}
            <div className="mb-3">
              <img
                src={getImageUrl(formData.images[0])}
                alt="Property"
                className="w-full md:h-[400px] h-[250px] object-cover rounded-xl"
              />
            </div>
            {/* Thumbnails */}
            {formData.images.length > 1 && (
              <div className="flex gap-3">
                {formData.images.slice(0, 4).map((image, index) => {
                  const imageUrl = getImageUrl(image);
                  return (
                    <div key={index} className="relative">
                      {index === 0 && (
                        <span className="absolute top-[-1px] left-[-4px] z-10">
                          <img src="/images/dashboard/mainIcon.png" alt="Main" />
                        </span>
                      )}
                      <img
                        src={imageUrl}
                        alt={`Thumbnail ${index + 1}`}
                        className="md:w-[100px] md:h-[100px] w-[60px] h-[60px] rounded-[20px] object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {formData.propertyDescription && (
          <div className="mb-4 border border-lightGray rounded-xl p-3 md:p-6">
            <h4 className="text-base md:text-xl font-bold font-nunito text-secondary mb-1">
              Description
            </h4>
            <p className="text-base font-normal font-nunito text-darkGray">
              {formData.propertyDescription}
            </p>
          </div>
        )}

        {/* Property Details */}
        <div className="mb-4 border border-lightGray rounded-xl p-3 md:p-6">
          <h4 className="text-base md:text-xl font-bold font-nunito text-secondary mb-1">
            Property Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 gap-2 mt-4 md:mt-5">
            {formData.monthlyRent && (
              <div className="flex items-center gap-2">
                <p className="text-sm md:text-base min-w-[110px] font-normal font-nunito text-darkGray mb-1">
                  Monthly Rent:
                </p>
                <p className="text-sm md:text-base font-bold font-nunito text-secondary">
                  {formatCurrency(formData.monthlyRent, currency)}
                </p>
              </div>
            )}
            {validAdditionalCharges.length > 0 && validAdditionalCharges.map((charge, index) => (
              <div key={index} className="flex items-center gap-2">
                <p className="text-sm md:text-base min-w-[110px] font-normal font-nunito text-darkGray mb-1">
                  {charge.type}:
                </p>
                <p className="text-sm md:text-base font-bold font-nunito text-secondary">
                  {formatCurrency(charge.amount, currency)}
                </p>
              </div>
            ))}
            {formData.propertyType && (
              <div className="flex items-center gap-2">
                <p className="text-sm md:text-base min-w-[110px] font-normal font-nunito text-darkGray mb-1">
                  Property Type:
                </p>
                <p className="text-sm md:text-base font-bold font-nunito text-secondary">
                  {getLabelFromValue(
                    addPropertyTypeOptions,
                    formData.propertyType
                  )}
                </p>
              </div>
            )}
            {formData.furnishedStatus && (
              <div className="flex items-center gap-2">
                <p className="text-sm md:text-base min-w-[110px] font-normal font-nunito text-darkGray mb-1">
                  Furnished Status:
                </p>
                <p className="text-sm md:text-base font-bold font-nunito text-secondary capitalize">
                  {formData.furnishedStatus}
                </p>
              </div>
            )}
            {formData.availableFrom && (
              <div className="flex items-center gap-2">
                <p className="text-sm md:text-base min-w-[110px] font-normal font-nunito text-darkGray mb-1">
                  Available From:
                </p>
                <p className="text-sm md:text-base font-bold font-nunito text-secondary">
                  {formatDate(formData.availableFrom)}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="border border-lightGray rounded-xl p-3 md:p-6 mb-4">
          {/* Amenities */}
          {formData.amenities.length > 0 && (
            <div className="mb-4">
              <h4 className="text-base md:text-xl font-bold font-nunito text-secondary mb-3">
                Amenities
              </h4>
              <div className="flex items-start md:items-center gap-4 md:flex-wrap flex-col md:flex-row">
                {formData.amenities.map((amenity, index) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="bg-[#E8E2FF] w-[36px] h-[36px] rounded-[10px] flex items-center justify-center">
                        <Icon />
                      </span>
                      <span className="text-base font-normal font-nunito text-secondary">
                        {amenity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Utilities */}
          {formData.utilities.filter((u) => u).length > 0 && (
            <div className="mb-4">
              <h4 className="text-base md:text-xl font-bold font-nunito text-secondary mb-3">
                Utilities
              </h4>
              <div className="flex items-start md:items-center gap-4 md:flex-wrap flex-col md:flex-row">
                {formData.utilities
                  .filter((u) => u)
                  .map((utility, index) => {
                    const utilityObj =
                      utilitiesList.find((u) => u.value === utility) ||
                      utilitiesList.find((u) => u.label === utility);
                    if (!utilityObj) return null;
                    const Icon = getUtilityIcon(utilityObj);
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <span className="bg-[#FFF5CC] w-[36px] h-[36px] rounded-[10px] flex items-center justify-center">
                          <Icon />
                        </span>
                        <span className="text-base font-normal font-nunito text-secondary">
                          {utilityObj.label}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Other Amenities */}
          {formData.otherAmenities && formData.otherAmenities.length > 0 && (
            <div className="mb-4">
              <h4 className="text-base md:text-xl font-bold font-nunito text-secondary mb-3">
                Other Amenities
              </h4>
              <div className="flex items-start md:items-center gap-4 md:flex-wrap flex-col md:flex-row">
                {formData.otherAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="bg-[#E8E2FF] w-[36px] h-[36px] rounded-[10px] flex items-center justify-center">
                      <DummyAmenityIcon />
                    </span>
                    <span className="text-base font-normal font-nunito text-secondary">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="border border-lightGray rounded-xl p-3 md:p-6 mb-4">
          {/* Location */}
          {(formData.address || formData.city || formData.postcode) && (
            <div>
              <h4 className="text-base md:text-xl font-bold font-nunito text-secondary mb-3">
                Location
              </h4>
              <div className="flex items-start gap-2 text-darkGray mb-3 relative ">
                <BlueLocationIcon />
                <p className="text-base font-normal font-nunito text-darkGray mb-4">
                  {[
                    formData.address,
                    getLabelFromValue(addPropertyCityOptions, formData.city),
                    formData.county,
                    formData.state,
                    formData.postcode,
                    formData.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              {/* Map Display */}
              <div className="w-full h-64 rounded-xl overflow-hidden border border-lightGray relative">
                {isGoogleMapsLoaded && formData.coordinates && formData.coordinates.length === 2 ? (
                  <div 
                    ref={mapRef} 
                    className="w-full h-full"
                    style={{ background: "#e5e3df" }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      {googleMapsError ? (
                        <>
                          <FiMapPin className="text-red-500 text-4xl mx-auto mb-2" />
                          <p className="text-red-600 text-sm">
                            {googleMapsError?.message || "Failed to load map"}
                          </p>
                        </>
                      ) : (
                        <>
                          <FiMapPin className="text-[#6B4EFF] text-4xl mx-auto mb-2" />
                          <p className="text-darkGray text-sm">
                            {formData.coordinates && formData.coordinates.length === 2 
                              ? "Loading map..." 
                              : "No location coordinates available"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border border-lightGray rounded-xl p-3 md:p-6 mb-4 space-y-4">
        {/* Renter Profile Description */}
        {formData.renterProfileDescription && (
          <div className="block">
            <h4 className="text-base md:text-xl font-bold font-nunito text-secondary mb-2">
              Renter Profile Description
            </h4>
            <p className="text-sm md:text-base font-normal font-nunito text-darkGray">
              {readMoreDescription
                ? descriptionText
                : descriptionText.slice(0, maxDescriptionLength)}
              {descriptionText.length > maxDescriptionLength && (
                <>
                  {!readMoreDescription && "..."}
                  <button
                    onClick={() => setReadMoreDescription(!readMoreDescription)}
                    className="text-[#6B4EFF] font-semibold ml-1"
                  >
                    {readMoreDescription ? "Read less" : "Read more"}
                  </button>
                </>
              )}
            </p>
          </div>
        )}

        {/* Preferred Renter Type */}
        {formData.preferredRenterType && (
          <div className="block">
            <h4 className="text-base md:text-xl font-bold font-nunito text-secondary mb-1">
              Preferred Renter Type
            </h4>
            <div className="flex items-start md:items-center gap-2 md:gap-6  md:flex-wrap flex-col md:flex-row">
              {preferredRenterTypeOptions.map((option) => {
                const Icon = getPreferredRenterIcon(option.value);
                const isSelected =
                  formData.preferredRenterType === option.value ||
                  (formData.preferredRenterTypes &&
                    formData.preferredRenterTypes.includes(option.value));
                return (
                  <div
                    key={option.value}
                    className={`flex items-center gap-2 py-1 md:py-3 transition-colors ${
                      isSelected ? "opacity-100" : "opacity-100"
                    }`}
                  >
                    {Icon && (
                      <span className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center ${
                        isSelected ? "bg-[#FFDDEE]" : "bg-[#FFDDEE]"
                      }`}>
                        <Icon />
                      </span>
                    )}
                    <span
                      className={`text-base font-normal font-nunito ${
                        isSelected ? "text-secondary font-normal" : "text-secondary font-normal"
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Additional Requirements */}
        {formData.additionalRequirements && (
          <div className="block">
            <h4 className="text-base md:text-xl font-bold font-nunito text-secondary mb-2">
              Additional Requirements
            </h4>
            <p className="text-sm md:text-base font-normal font-nunito text-darkGray">
              {readMoreRequirements
                ? requirementsText
                : requirementsText.slice(0, maxRequirementsLength)}
              {requirementsText.length > maxRequirementsLength && (
                <>
                  {!readMoreRequirements && "..."}
                  <button
                    onClick={() =>
                      setReadMoreRequirements(!readMoreRequirements)
                    }
                    className="text-[#6B4EFF] font-semibold ml-1"
                  >
                    {readMoreRequirements ? "Read less" : "Read more"}
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewStep;
