import { FiShare2, FiEdit, FiTrash2 } from "react-icons/fi";
import BlueLocationIcon from "@/svg/blueLocationIcon";
import GrayBedIcon from "@/svg/grayBedIcon";
import GrayBathIcon from "@/svg/grayBathIcon";
import mainHotelImg from "@/assests/images/mainHotelImg.png";
import BlueEditIcon from "@/svg/blueEditIcon";

function PropertyHeader({
  propertyData,
  onEdit,
  onShare,
  onDelete,
  selectedImage,
  setSelectedImage,
  showRenterDetails = false,
}) {
  return (
    <div className="bg-white rounded-[20px] border border-lightGray p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-secondary mb-2">
            {propertyData.title}
          </h1>
          <div className="flex flex-wrap items-center gap-8 mb-4">
            <div className="flex items-center gap-2 text-darkGray relative after:content-[''] after:absolute after:bottom-[3px] after:right-[-17px] after:w-[2px] after:h-[18px] after:bg-midGray">
              <BlueLocationIcon />
              <span className="text-base font-normal font-nunito text-secondary">
                {propertyData.address}
              </span>
            </div>
            <span className="text-base font-normal font-nunito text-darkGray relative after:content-[''] after:absolute after:bottom-[3px] after:right-[-17px] after:w-[2px] after:h-[18px] after:bg-midGray">
              ID: {propertyData.id}
            </span>
            <div className="flex items-center gap-4">
              {propertyData.bedrooms && (
                <div className="flex items-center gap-2">
                  <GrayBedIcon />
                  <span className="text-base font-normal font-nunito text-darkGray">
                    {propertyData.bedrooms} beds
                  </span>
                </div>
              )}
              {propertyData.bathrooms && (
                <div className="flex items-center gap-2">
                  <GrayBathIcon />
                  <span className="text-base font-normal font-nunito text-darkGray">
                    {propertyData.bathrooms} baths
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-6 py-1.5 border border-lightGray rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiShare2 className="text-secondary" />
            <span className="text-sm font-semibold text-secondary">Share</span>
          </button>
          {!showRenterDetails && (
            <>
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-6 py-1.5 border border-[#4A2FCC] text-white rounded-[10px]   transition-colors"
              >
                <span className="text-base font-bold font-nunito text-[#4A2FCC]">
                  Edit
                </span>
                <BlueEditIcon className="text-[#4A2FCC]" />
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-6 py-1.5 border border-[#D24343] text-white rounded-[10px]  transition-colors"
              >
                <span className="text-base font-bold font-nunito text-[#D24343]">
                  Delete
                </span>
                <FiTrash2 className="text-[#D24343]" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="block">
        <div className="mb-4 relative">
          <img
            src={selectedImage}
            alt={propertyData.title}
            className="w-full h-[400px] md:h-[500px] object-cover rounded-lg"
          />
        </div>
        <div className="flex items-center flex-wrap gap-2">
          {[propertyData.mainImage, ...propertyData.thumbnails].map(
            (img, index) => {
              const isSelected = selectedImage === img;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`overflow-hidden w-[100px] h-[100px] rounded-[20px]  transition-all `}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyHeader;
