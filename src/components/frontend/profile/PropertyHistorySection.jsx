import PropertyHistoryCard from "./PropertyHistoryCard";
import homelistOne from '@/assests/websiteImg/homelistOne.png';
import homelistTwo from '@/assests/websiteImg/homelistTwo.png';
import homelistThree from '@/assests/websiteImg/homelistThree.png';
import homelistFour from '@/assests/websiteImg/homelistFour.png';
import homelistFive from '@/assests/websiteImg/homelistFive.png';
import homelistSix from '@/assests/websiteImg/homelistSix.png';







// Mock data for property history
const propertyHistoryData = [
  {
    id: 1,
    image: homelistOne,
    title: "Amberwood Lane 5",
    price: "€1200",
    address: "101 Colonial Dr, New Castle, DE 19720",
    beds: 3,
    baths: 3,
    type: "Flat/Apartment",
    dateRange: "Nov 2025 - Now",
  },
  {
    id: 2,
    image: homelistTwo,
    title: "Amberwood Lane 5",
    price: "€1200",
    address: "101 Colonial Dr, New Castle, DE 19720",
    beds: 3,
    baths: 3,
    type: "Studio",
    dateRange: "Nov 2023 - Nov 2024",
  },
  {
    id: 3,
    image: homelistThree,
    title: "Amberwood Lane 5",
    price: "€1200",
    address: "101 Colonial Dr, New Castle, DE 19720",
    beds: 3,
    baths: 3,
    type: "Flat/Apartment",
    dateRange: "Feb 2024 - Jan 2025",
  },
  {
    id: 4,
    image: homelistFour,
    title: "Amberwood Lane 5",
    price: "€1200",
    address: "101 Colonial Dr, New Castle, DE 19720",
    beds: 3,
    baths: 3,
    type: "Flat/Apartment",
    dateRange: "Aug 2023 - Jan 2024",
  },
  {
    id: 5,
    image: homelistFive,
    title: "Amberwood Lane 5",
    price: "€1200",
    address: "101 Colonial Dr, New Castle, DE 19720",
    beds: 3,
    baths: 3,
    type: "House",
    dateRange: "Feb 2024 - Jan 2025",
  },
  {
    id: 6,
    image: homelistSix,
    title: "Amberwood Lane 5",
    price: "€1200",
    address: "101 Colonial Dr, New Castle, DE 19720",
    beds: 3,
    baths: 3,
    type: "Villa",
    dateRange: "Aug 2023 - Jan 2024",
  },
];

function PropertyHistorySection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[20px] md:border md:border-lightGray md:p-4">
        {propertyHistoryData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {propertyHistoryData.map((property) => (
              <PropertyHistoryCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary text-base font-nunito">
              You do not have any recent property activity yet. When you contact
              owners or save properties, they will appear here for quick access.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyHistorySection;
