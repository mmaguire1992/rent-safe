import BlueTrustedIcon from "../../../svg/websiteSvg/blueTrustedIcon";
import Badge from "./Badge";
import Button from "./Button";
import PropertyCard from "./PropertyCard";
import ShielIcon from "@/svg/websiteSvg/shielIcon";
import { propertyListings } from "@/websitedata/propertyListings";

function NewestListing() {
  return (
    <section
      id="newest-listing"
      className="w-full py-10 md:py-14 lg:py-16 bg-bg-primary scroll-mt-[88px]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4">
            <span className="border-[#6B4EFF33] border bg-badgeGradient rounded-2xl px-4 py-2 text-sm text-[#4A2FCC] font-semibold uppercase inline-flex items-center gap-2">
              <BlueTrustedIcon />
              VERIFIED LISTING
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-text-primary mb-4">
            Newest Listing
          </h2>

          <p className="text-base md:text-lg text-[#5A5E67] font-normal font-nunito max-w-2xl mx-auto">
            Every property is verified. Every landlord is checked. No scams, no
            fake listings.
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-12">
          {propertyListings.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Browse Listings Button */}
        <div className="flex justify-center w-full md:w-auto">
          <Button variant="primary">Browse listings</Button>
        </div>
      </div>
    </section>
  );
}

export default NewestListing;
