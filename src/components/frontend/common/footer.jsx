import React from "react";

import { FiPhone, FiMapPin } from "react-icons/fi";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaPinterestP,
} from "react-icons/fa";

import { linkColumns } from "@/websitedata/commonConst";

const normalizeSocialUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }
  return `https://${trimmedUrl}`;
};

const socialLinks = [
  {
    Icon: FaFacebookF,
    url: normalizeSocialUrl(
      process.env.NEXT_PUBLIC_FACEBOOK_URL || process.env.NEXT_PUBLIC_FACEBOOK_LINK
    ),
    label: "Facebook",
  },
  {
    Icon: FaLinkedinIn,
    url: normalizeSocialUrl(
      process.env.NEXT_PUBLIC_LINKEDIN_URL || process.env.NEXT_PUBLIC_LINKEDIN_LINK
    ),
    label: "LinkedIn",
  },
  {
    Icon: FaInstagram,
    url: normalizeSocialUrl(
      process.env.NEXT_PUBLIC_INSTAGRAM_URL || process.env.NEXT_PUBLIC_INSTAGRAM_LINK
    ),
    label: "Instagram",
  },
  {
    Icon: FaPinterestP,
    url: normalizeSocialUrl(
      process.env.NEXT_PUBLIC_PINTEREST_URL || process.env.NEXT_PUBLIC_PINTEREST_LINK
    ),
    label: "Pinterest",
  },
];

const Footer = () => {
  return (
    <footer className="bg-[#2B2F38] text-[#E6E8EC]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 md:pt-20 py-6 mt-4 md:mt-0">
        {/* Top grid */}
        <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-6">
          {/* Brand / About */}
          <div className="md:col-span-4 col-span-2 lg:col-span-2 space-y-4">
            {/* Mobile and Tablet Logo */}
            <img
              src="/images/dashboard/Container.png"
              alt="Rent Safe"
              className="h-auto w-[200px] object-contain block lg:hidden"
            />
            {/* Desktop/Web Logo */}
            <img
              src="/images/website/footerLogo.png"
              alt="Rent Safe"
              className="h-auto w-[200px] object-contain hidden lg:block"
            />
            <p className="text-base font-nunito font-normal text-[#E6E8EC] leading-5 w-full lg:max-w-[320px]">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry&apos;s standard dummy
              text ever since when an unknown printer took a galley of type
              scrambled.
            </p>
          </div>

          {/* Links / Support / Legal columns */}
          {linkColumns.map((col) => (
            <FooterColumn key={col.title} title={col.title}>
              {col.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </FooterColumn>
          ))}

          {/* Contact column */}
          <div>
            <FooterColumn title="Contact">
              <li className="flex items-center gap-2">
                <FiPhone />
                <span>(205) 555-0100</span>
              </li>
              <li className="flex items-start gap-2">
                <FiMapPin className="mt-0.5 shrink-0" />
                <span>3517 W. Gray St. Utica, Pennsylvania 57867</span>
              </li>
            </FooterColumn>
            <div className="w-full hidden justify-start mt-8  md:flex ">
              <div className="space-y-2">
                <p className="font-semibold text-[#9FA3AA] text-lg sm:text-xl text-left">
                  Join Us By
                </p>
                <div className="flex items-center gap-1 md:gap-2 justify-start">
                  {socialLinks.map(({ Icon, url, label }, i) => (
                    <SocialIcon key={i} href={url} label={label}>
                      <Icon className="text-white text-base sm:text-lg" />
                    </SocialIcon>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Us By – bottom row */}
        <div className="w-full flex justify-center mt-8  md:hidden ">
          <div className="space-y-2">
            <p className="font-semibold text-[#9FA3AA] text-lg sm:text-xl text-center">
              Join Us By
            </p>
            <div className="flex items-center gap-1 md:gap-2 justify-start">
              {socialLinks.map(({ Icon, url, label }, i) => (
                <SocialIcon key={i} href={url} label={label}>
                  <Icon className="text-white text-base sm:text-lg" />
                </SocialIcon>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Divider + copyright */}
      <div className="border-t border-[#5A5E67] py-4 text-center text-sm">
        <span className="font-nunito text-sm font-normal text-[#E6E8EC]">
          All rights are reserved. | Copyrights 2024
        </span>
      </div>
    </footer>
  );
};

/* Reusable column component */
const FooterColumn = ({ title, children }) => {
  const hoverUnderlineClass =
    "relative cursor-pointer pb-1 w-fit after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#4A2FCC] after:to-[#6B4EFF] after:transition-all after:duration-300 hover:after:w-full";

  return (
    <div className="lg:space-y-5 space-y-3 lg:mt-2 text-base">
      <h4 className="font-semibold font-nunito leading-6 text-[#9FA3AA] text-lg lg:text-xl">
        {title}
      </h4>

      <ul className="lg:space-y-4 space-y-1 text-sm lg:text-base font-nunito font-normal text-[#E6E8EC] leading-5">
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) {
            return (
              <li key={index} className={hoverUnderlineClass}>
                {child}
              </li>
            );
          }

          if (child.type === "li") {
            const existingClass = child.props.className || "";
            return React.cloneElement(child, {
              key: child.key ?? index,
              className: `${existingClass} ${hoverUnderlineClass}`,
            });
          }

          return (
            <li key={index} className={hoverUnderlineClass}>
              {child}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/* Reusable social icon circle */
const SocialIcon = ({ children, href, label }) => {
  if (!href) {
    return (
      <div
        aria-label={label}
        className="flex items-center justify-center w-10 h-10 transition-all duration-500 rounded-full bg-[#3C3F48] opacity-70"
      >
        {children}
      </div>
    );
  }

  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-10 h-10 cursor-pointer hover:scale-110 transition-all duration-500 rounded-full bg-[#3C3F48]"
    >
      {children}
    </a>
  );
};

export default Footer;
