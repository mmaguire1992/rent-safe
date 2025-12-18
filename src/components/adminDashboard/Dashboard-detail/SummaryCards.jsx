import { FiArrowUpRight } from "react-icons/fi";
import Boxbg from "@/assests/images/boxgraybg.png";
import GreenGrowthIcon from "@/svg/greenGrowthIcon";

function SummaryCards({ summaryCards }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="rounded-lg p-5 md:p-6  bg-cover bg-center bg-no-repeat min-h-[170px] card_summary_box"
            style={{
              backgroundImage: `url(${Boxbg})`,
              backgroundSize: "100% 170px",
              backgroundPosition: "left",
            }}
          >
            <div className="flex items-center justify-start gap-4 mb-3 md:mb-4">
              <div
                className={`${card.color} p-2 md:p-3 rounded-[10px] ${card.iconColor}`}
              >
                <Icon className="text-xl md:text-2xl" />
              </div>
              <h3 className="text-secondary font-normal text-base font-nunito mb-1">
                {card.title}
              </h3>
            </div>
            <div className="flex items-center gap-3 md:block">
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#4A2FCC] mb-2">
                {card.value}
              </p>
              <div className="flex items-center gap-1">
                {card.trend === "up" && <GreenGrowthIcon />}
                {card.change && card.change.includes("/") ? (
                  <>
                    <span className="text-[#D24343] text-sm md:text-base font-normal font-nunito">
                      {card.change.split("/")[0]}
                    </span>
                    <span className="text-midGray text-sm md:text-base font-normal font-nunito">
                      /{card.change.split("/")[1]} Used
                    </span>
                  </>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SummaryCards;
