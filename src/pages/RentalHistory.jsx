import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FiCheckCircle, FiPhone, FiMapPin, FiUser } from "react-icons/fi";

function RentalHistory() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Sample data - 12 reviews as shown in the design
  const reviewsData = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    address: "34 King Street, Manchester M2 6AZ",
    tenancyDates: "Sep 2018 - Dec 2020",
    location: "Manchester",
    monthlyRent: "€1,450",
    phone: "+44 7445 987654",
    reasonForLeaving: "Seeking larger space",
    review: {
      text: "David is an excellent tenant. They are always respectful, pays on time, and keeps the apartment in great condition. I would gladly rent to them again. I've never had any issues with Jamie and I hope they continue to rent from me in the future.",
      reviewer: "Jane Cooper",
      role: "Owner",
      verified: true,
    },
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-darkGray">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-secondary"
          >
            Dashboard
          </button>
          <span>/</span>
          <button
            onClick={() => navigate(`/dashboard/tenant/${id}`)}
            className="hover:text-secondary"
          >
            David Vianner's Profile
          </button>
          <span>/</span>
          <span className="text-secondary font-semibold">12 Reviews</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            Reviews
          </h1>
        </div>

        {/* Reviews Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewsData.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg border border-lightGray p-6 flex flex-col"
            >
              {/* Property Information - Left Side */}
              <div className="mb-4">
                {/* Purple House Icon */}
                <div className="bg-purple-100 p-2 rounded-lg w-fit mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B4EFF"
                    strokeWidth="2"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>

                {/* Address */}
                <p className="font-semibold text-secondary mb-1">
                  {review.address}
                </p>
                <p className="text-sm text-darkGray mb-4">
                  {review.tenancyDates}
                </p>

                {/* Details with Icons */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-gray-400 text-sm" />
                    <div>
                      <span className="text-xs text-darkGray">Location: </span>
                      <span className="text-sm font-semibold text-secondary">
                        {review.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <div>
                      <span className="text-xs text-darkGray">Monthly Rent: </span>
                      <span className="text-sm font-semibold text-secondary">
                        {review.monthlyRent}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-gray-400 text-sm" />
                    <div>
                      <span className="text-xs text-darkGray">Phone: </span>
                      <span className="text-sm font-semibold text-secondary">
                        {review.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUser className="text-gray-400 text-sm" />
                    <div>
                      <span className="text-xs text-darkGray">
                        Reason for Leaving:{" "}
                      </span>
                      <span className="text-sm font-semibold text-secondary">
                        {review.reasonForLeaving}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Text and Reviewer - Right Side */}
              <div className="border-t border-lightGray pt-4 mt-auto">
                <p className="text-sm text-darkGray mb-3 leading-relaxed">
                  {review.review.text}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-secondary">
                    {review.review.reviewer}
                  </span>
                  <span className="text-sm text-darkGray">
                    {review.review.role}
                  </span>
                  {review.review.verified && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      <FiCheckCircle className="text-xs" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RentalHistory;
