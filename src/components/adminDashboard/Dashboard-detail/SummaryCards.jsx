'use client'

import { useState, useEffect } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import GreenGrowthIcon from "@/svg/greenGrowthIcon";
import ActivePropertiesIcon from "@/svg/greenPropertyIcon";
import RentedPropertiesIcon from "@/svg/blueRentedIcon";
import MonthlyLeadsIcon from "@/svg/orangeUserIcon";
import RemainingListingCountIcon from "@/svg/listingCounterIcon";
import { getOwnerDashboardStats } from "@/api/dashboard";

function SummaryCards({ summaryCards }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getOwnerDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set stats to empty object on error
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Use dynamic stats if available
  const cards = summaryCards.map((card, index) => {
    let dynamicValue = null;
    let dynamicChange = null;

    if (!loading && stats) {
      switch (index) {
        case 0: // Total Active Properties
          dynamicValue = stats.totalActiveProperties?.toString() || '0';
          dynamicChange = stats.activePropertiesChange !== undefined 
            ? (stats.activePropertiesChange >= 0 ? '+' : '') + stats.activePropertiesChange 
            : null;
          break;
        case 1: // Total Rented Properties
          dynamicValue = stats.totalRentedProperties?.toString() || '0';
          dynamicChange = stats.rentedPropertiesChange !== undefined 
            ? (stats.rentedPropertiesChange >= 0 ? '+' : '') + stats.rentedPropertiesChange 
            : null;
          break;
        case 2: // Monthly Leads
          dynamicValue = stats.monthlyLeads?.toString() || '0';
          dynamicChange = stats.monthlyLeadsChange !== undefined 
            ? (stats.monthlyLeadsChange >= 0 ? '+' : '') + stats.monthlyLeadsChange 
            : null;
          break;
        case 3: // Remaining Listing Count - keep static as requested
          dynamicValue = card.value;
          dynamicChange = card.change;
          break;
        default:
          dynamicValue = card.value;
          dynamicChange = card.change;
          break;
      }
    }

    return {
      ...card,
      value: dynamicValue,
      change: dynamicChange,
      isLoading: loading && index !== 3, // Don't show loader for Remaining Listing Count
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="rounded-lg p-5 md:p-6 bg-cover bg-center bg-no-repeat min-h-[170px] card_summary_box"
            style={{
              backgroundImage: 'url("/images/dashboard/boxgraybg.png")',
              backgroundSize: "100% 170px",
              backgroundPosition: "left",
            }}
          >
            <div className="flex items-center justify-start gap-4 mb-3 md:mb-4">
              <div
                className={`p-2 md:p-3 rounded-[10px] ${card.iconColor}`}
                style={{
                  backgroundColor: card.title === "Total Rented Properties" ? '#CFE4FF' : 
                                  card.title === "Monthly Leads" ? '#FFE4CC' : 
                                  card.title === "Total Active Properties" ? '#DFFFE6' :
                                  card.title === "Remaining Listing Count" ? '#FFDDEE' : undefined,
                }}
              >
                <Icon className="text-xl md:text-2xl" />
              </div>
              <h3 className="text-secondary font-normal text-base font-nunito mb-1">
                {card.title}
              </h3>
            </div>
            <div className="flex items-center gap-3 md:block">
              {card.isLoading ? (
                <>
                  <div className="h-8 md:h-10 lg:h-12 w-16 md:w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 md:h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#4A2FCC] mb-2">
                    {card.value || '0'}
                  </p>
                  <div className="flex items-center gap-1">
                    {card.trend === "up" && card.change && <GreenGrowthIcon />}
                    {card.change && card.change.includes("/") ? (
                      <>
                        <span className="text-[#D24343] text-sm md:text-base font-normal font-nunito">
                          {card.change.split("/")[0]}
                        </span>
                        <span className="text-midGray text-sm md:text-base font-normal font-nunito">
                          /{card.change.split("/")[1]} Used
                        </span>
                      </>
                    ) : card.change ? (
                      <>
                        <span
                          className={`text-sm md:text-base ${
                            card.trend === "up" ? "text-green-600" : "text-midGray"
                          } font-normal font-nunito`}
                        >
                          {card.change}
                        </span>
                        <span className="text-midGray font-normal text-sm md:text-base font-nunito">
                          {card.trend === "up" ? "this month" : ""}
                        </span>
                      </>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SummaryCards;
