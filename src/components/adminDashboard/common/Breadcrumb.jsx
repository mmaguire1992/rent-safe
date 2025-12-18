import { useNavigate, useLocation, useParams } from "react-router-dom";
import { MdKeyboardArrowRight } from "react-icons/md";
import { getTenantData, getPropertyData } from "@/constant";

const routeLabels = {
  dashboard: "Dashboard",
  properties: "My Properties",
  add: "Add New Property",
  messages: "Messages",
  tenant: "Tenant",
  "rental-history": "Reviews",
};

function Breadcrumb({ customLabels = {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const pathSegments = location.pathname.split("/").filter(Boolean);

  const breadcrumbs = [];

  if (pathSegments[0] === "dashboard") {
    // Handle properties routes - NO Dashboard in breadcrumb
    if (pathSegments[1] === "properties") {
      breadcrumbs.push({
        label: routeLabels.properties || "My Properties",
        path: "/dashboard/properties",
        isActive: pathSegments.length === 2 && !params.id,
      });

      // Handle add property
      if (pathSegments[2] === "add") {
        breadcrumbs.push({
          label: customLabels.add || routeLabels.add || "Add New Property",
          path: "/dashboard/properties/add",
          isActive: true,
        });
      }
      // Handle property detail
      else if (params.id && pathSegments[2] === params.id) {
        try {
          const propertyData = getPropertyData(params.id);
          breadcrumbs.push({
            label:
              customLabels.propertyTitle ||
              propertyData?.title ||
              `Property ${params.id}`,
            path: `/dashboard/properties/${params.id}`,
            isActive: true,
          });
        } catch (error) {
          breadcrumbs.push({
            label: customLabels.propertyTitle || `Property ${params.id}`,
            path: `/dashboard/properties/${params.id}`,
            isActive: true,
          });
        }
      }
    }
    // Handle tenant routes - Include Dashboard
    else if (pathSegments[1] === "tenant" && params.id) {
      breadcrumbs.push({
        label: routeLabels.dashboard || "Dashboard",
        path: "/dashboard",
        isActive: false,
      });

      try {
        const tenantData = getTenantData(params.id);
        breadcrumbs.push({
          label:
            customLabels.tenantName ||
            `${tenantData?.name}'s Profile` ||
            `Tenant ${params.id}`,
          path: `/dashboard/tenant/${params.id}`,
          isActive: pathSegments.length === 3,
        });

        // Handle rental history
        if (pathSegments[3] === "rental-history") {
          breadcrumbs.push({
            label:
              customLabels.rentalHistory ||
              routeLabels["rental-history"] ||
              "Reviews",
            path: `/dashboard/tenant/${params.id}/rental-history`,
            isActive: true,
          });
        }
      } catch (error) {
        breadcrumbs.push({
          label: customLabels.tenantName || `Tenant ${params.id}`,
          path: `/dashboard/tenant/${params.id}`,
          isActive: true,
        });
      }
    }
    // Handle messages - NO Dashboard in breadcrumb
    else if (pathSegments[1] === "messages") {
      breadcrumbs.push({
        label: routeLabels.messages || "Messages",
        path: "/dashboard/messages",
        isActive: true,
      });
    }
  }

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 text-sm text-darkGray mb-4">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <span>
              <MdKeyboardArrowRight className="text-base md:text-xl text-midGray" />
            </span>
          )}
          {crumb.isActive ? (
            <span className="text-[#6B4EFF] text-sm md:text-base font-normal">
              {crumb.label}
            </span>
          ) : (
            <button
              onClick={() => navigate(crumb.path)}
              className="hover:text-secondary text-sm md:text-base font-normal text-midGray"
            >
              {crumb.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Breadcrumb;
