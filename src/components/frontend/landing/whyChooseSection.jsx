import React from "react";
import { SecureIcon } from "@/svg/websiteSvg/icons";
import Badge from "./Badge";
import DebitCard from "@/svg/websiteSvg/debitCard";
import Euro from "@/svg/websiteSvg/euro";
import GuaranteeIcon from "@/svg/websiteSvg/guaranteeIcon";
import CreditCardIcon from "@/svg/websiteSvg/creditCardIcon";
import BlueTrustedIcon from "../../../svg/websiteSvg/blueTrustedIcon";

const Whychooseus = () => {
  const reasons = [
    {
      title: "No Credit Card",
      icon: <DebitCard />,
      desc: "Create your renter profile for free. No credit card required.",
      value: "100%",
      stat: "Free Signup",
    },
    {
      title: "No Reservation Fees",
      icon: <Euro />,
      desc: "Message owners without paying upfront.",
      value: "0%",
      stat: "Extra Costs",
    },
    {
      title: "Best Price Guarantee",
      icon: <GuaranteeIcon />,
      desc: "Verified listings with transparent pricing.",
      value: "100%",
      stat: "Transparent Pricing",
    },
    {
      title: "No Deposit Required",
      icon: <CreditCardIcon />,
      desc: "Secure a viewing without financial risk.",
      value: "0%",
      stat: "Financial Risk",
    },
  ];
  return (
    <section
      id="why-us"
      className="w-full py-10 md:py-14 lg:py-16 bg-bg-primary-gradient scroll-mt-[88px]"
    >
      <div className="container mx-auto px-6 md:px-4 lg:px-0">
        <div className="flex flex-col items-center text-center gap-6 mb-8 md:mb-10">
          <span className="border-[#6B4EFF33] border bg-badgeGradient rounded-2xl px-4 py-2 text-sm text-[#4A2FCC] font-semibold uppercase inline-flex items-center gap-2">
            <BlueTrustedIcon />
            Safe for Renters
          </span>
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl  font-bold text-secondary">
              Why Choose Us
            </h2>
            <p className="text-base md:text-lg font-normal  text-[#5A5E67] font-nunito max-w-xl">
              A safer, simpler renting experience in the UK
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:gap-4 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((item) => (
            <div
              key={item.title}
              className="rounded-[40px]   text-center bg-white shadow-sm border border-[#E5E7F5]
                         px-2 md:px-5 py-3 md:py-6 flex flex-col items-center justify-between"
            >
              {/* Icon placeholder (top circle) */}
              <div className="mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xl"
                  style={{
                    background:
                      "linear-gradient(198deg, rgba(107,78,255,1) 0%, rgba(155,126,255,1) 50%)",
                  }}
                >
                  {item.icon}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-secondary font-nunito">
                  {item.title}
                </h3>
                <p className="text-base font-normal font-nunito px-4 leading-tight text-[#5A5E67]">
                  {item.desc}
                </p>
              </div>

              <p className="mt-4 flex gap-1  justify-center text-[#5A5E67] w-full pt-4 border-t border-t-[#E6E8EC] text-base font-normal font-nunito">
                <span className="text-[#6B4EFF] font-bold font-nunito">
                  {item.value}
                </span>
                {item.stat}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Whychooseus;
