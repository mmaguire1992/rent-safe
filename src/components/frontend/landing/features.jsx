import React from "react";
import { SecureIcon } from "@/svg/websiteSvg/icons";

import StarIcon from "@/svg/websiteSvg/starIcon";
import WhiteCheckedIcon from "../../../svg/websiteSvg/whiteCheckedIcon";
import WhiteSecureIcon from "../../../svg/websiteSvg/whiteSecureIcon";
import WhiteCostsIcon from "../../../svg/websiteSvg/whiteCostsIcon";
const Features = () => {
  const columsdata = [
    {
      icon: <SecureIcon color="white" />,
      heading: "Verified Users Only",
      desc: "Both renters and landlords verify identities before connecting.",
    },
    {
      icon: <WhiteCheckedIcon />,
      heading: "Genuine Property Listings",
      desc: "No fake ads — all listings are reviewed for authenticity.",
    },
    {
      icon: <WhiteSecureIcon />,
      heading: "Secure In-App Communication",
      desc: "Message safely without sharing personal contact information.",
    },
    {
      icon: <WhiteCostsIcon />,
      heading: "Zero Upfront Costs",
      desc: "No credit card, no reservation fees, no deposit required to start.",
    },
  ];
  return (
    <section
      id="features"
      className="w-full py-4 bg-blueGradient2 text-white md:pt-14 lg:pt-16  scroll-mt-[88px]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse gap-10 lg:flex-row items-center ">
          <div className="left lg:w-1/2  w-full ">
            {/* BADGE */}

            <div className="w-full text-center md:text-left">
              <span className="bg-[#FFFFFF33] border border-[#6B4EFF33] rounded-2xl py-3 px-4 inline-flex items-center justify-center gap-2 text-white uppercase text-sm font-semibold font-nunito max-w-[290px]">
                <StarIcon /> FEATURES
              </span>
            </div>

            <div className="heading mt-6 ">
              <h1 className="md:text-4xl  md:px-6  font-nunito lg:px-0 text-2xl text-center md:text-left font-bold text-white">
                Designed to Make Renting Safer & Simpler
              </h1>
            </div>

            <div className="columns flex flex-col gap-4 md:gap-10 py-4 md:mt-6 lg:mt-0">
              {columsdata.map((item, i) => {
                return (
                  <div
                    key={i}
                    className="flex flex-col  lg:flex-row items-center   gap-3  lg:gap-3"
                  >
                    <div className="w-11 h-11 flex justify-center items-center bg-white/20 rounded-2xl">
                      {item.icon}
                    </div>

                    <div>
                      <h3 className="md:text-xl text-lg font-semibold font-nunito text-center md:text-left lg:text-left">
                        {item.heading}
                      </h3>
                      <p className="md:text-base text-sm font-normal text-center md:text-left font-nunito text-[#F9F9FC]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* <div className=" w-full  flex justify-center">
                <button className="py-3 px-4 w-full md:w-1/2 mt-2 bg-white text-[#4A2FCC] font-bold text-sm lg:hidden  rounded-xl ">
                  Explore Services
                </button>
              </div> */}
            </div>
          </div>
          <div className="right relative lg:w-1/2 ml-4 w-full px-2 flex justify-center">
            <div className="w-full bg-white   md:rounded-[20px] rounded-xl ">
              <div className="w-full lg:-ml-5 rounded-xl overflow-hidden  lg:-mb-5 lg:mt-5 mt-3 -ml-3 -mb-3">
                <img
                  src="/images/website/streetwithhouse.png"
                  alt="streetwithhouse"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
