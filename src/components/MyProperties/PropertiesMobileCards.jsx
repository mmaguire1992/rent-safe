import { FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function PropertiesMobileCards({ properties, startIndex, getStatusBadgeClass }) {
  const navigate = useNavigate();

  return (
    <div className="md:hidden divide-y divide-lightGray">
      {properties.map((property, index) => (
        <div
          key={property.id}
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => navigate(`/dashboard/properties/${property.id}`)}
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="text-darkGray text-sm">
              {index + 1 + startIndex}.
            </span>
            <img
              src={property.image}
              alt={property.description}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-secondary mb-1">
                {property.description}
              </p>
              <p className="text-xs text-darkGray mb-1">
                ID: {property.id}
              </p>
              <p className="text-xs text-secondary">
                {property.location}
              </p>
            </div>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <FiMoreVertical className="text-secondary" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 ml-8">
            <div>
              <p className="text-xs text-darkGray mb-1">Type</p>
              <p className="text-sm text-secondary">{property.type}</p>
            </div>
            <div>
              <p className="text-xs text-darkGray mb-1">Rent</p>
              <p className="text-sm font-semibold text-secondary">
                {property.rent}
              </p>
            </div>
            <div>
              <p className="text-xs text-darkGray mb-1">Leads</p>
              <p className="text-sm text-secondary">{property.leads}</p>
            </div>
            <div>
              <p className="text-xs text-darkGray mb-1">Views</p>
              <p className="text-sm text-secondary">{property.views}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-darkGray mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                  property.status
                )}`}
              >
                {property.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PropertiesMobileCards;





