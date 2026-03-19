import { FiShare2, FiEdit, FiTrash2 } from "react-icons/fi";
import BlueLocationIcon from "@/svg/blueLocationIcon";
import GrayBedIcon from "@/svg/grayBedIcon";
import GrayBathIcon from "@/svg/grayBathIcon";
import { useNavigate } from "@/lib/react-router-compat";

import BlueEditIcon from "@/svg/blueEditIcon";

function PropertyHeader({
  propertyData,
  onEdit,
  onShare,
  onDelete,
  selectedImage,
  setSelectedImage,
  showRenterDetails = false,
}){
  const navigate = useNavigate();
  const propertyId = propertyData?.id || propertyData?._id;
  return (
    <div className="bg-white rounded-[20px] border border-lightGray md:p-6 p-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="md:text-2xl text-base font-bold text-secondary mb-2">
            {propertyData.title}
          </h1>
          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-4 md:gap-8 mb-4">
            <div className="flex items-center gap-2 text-darkGray relative md:after:content-[''] after:absolute after:bottom-[3px] md:after:right-[-17px] md:after:w-[2px] md:after:h-[18px] md:after:bg-midGray">
              <BlueLocationIcon />
              <span className="text-base font-normal font-nunito text-secondary">
                {propertyData.address}
              </span>
            </div>
            <span className="text-base font-normal font-nunito text-darkGray relative md:after:content-[''] md:after:absolute md:after:bottom-[3px] md:after:right-[-17px] md:after:w-[2px] md:after:h-[18px] md:after:bg-midGray">
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
        <div className="flex flex-wrap gap-3 mb-4 md:mb-0">
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 md:px-6 py-1.5 border border-lightGray rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiShare2 className="text-secondary" />
            <span className="text-sm font-semibold text-secondary">Share</span>
          </button>
          {propertyData.status?.toLowerCase() === 'pending_approval' && (
            <div className="">
              <button
                onClick={() => navigate(`/dashboard/properties/edit/${propertyId}`)}
                className="w-full md:w-auto px-6 py-2 border border-[#6B4EFF] text-[#6B4EFF] rounded-lg font-semibold font-nunito hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
              >
                Edit
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.6783 4.985L13.8465 3.81687C14.4916 3.17172 15.5376 3.17172 16.1827 3.81686C16.8279 4.46201 16.8279 5.50799 16.1827 6.15313L15.0146 7.32127M12.6783 4.985L5.81677 11.8466C4.94569 12.7176 4.51014 13.1532 4.21356 13.6839C3.91698 14.2147 3.61859 15.4679 3.33325 16.6663C4.53166 16.381 5.78491 16.0826 6.31566 15.786C6.84641 15.4895 7.28195 15.0539 8.15304 14.1828L15.0146 7.32127M12.6783 4.985L15.0146 7.32127" stroke="#4A2FCC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M9.16675 16.6665H14.1667" stroke="#4A2FCC" stroke-width="1.5" stroke-linecap="round" />
                </svg>
               
              </button>
            </div>
          )}
          {!showRenterDetails && (
            <>
              {/* <button
                onClick={onEdit}
                className="flex items-center gap-2 md:px-6 px-4 py-1.5 border border-[#4A2FCC] text-white rounded-[10px]   transition-colors"
              >
                <span className="text-base font-bold font-nunito text-[#4A2FCC]">
                  Edit
                </span>
                <BlueEditIcon className="text-[#4A2FCC]" />
              </button> */}
              <button
                onClick={onDelete}
                className="flex items-center gap-2 md:px-6 px-4 py-1.5 border border-[#D24343] text-white rounded-[10px]  transition-colors"
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
            className="w-full h-[250px] md:h-[500px] object-cover rounded-lg"
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
                  className={`overflow-hidden w-[70px] h-[70px] md:w-[100px] md:h-[100px] rounded-[20px]  transition-all `}
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
