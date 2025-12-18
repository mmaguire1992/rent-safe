import ShielIcon from "./shielIcon";
import GreenCheckedIcon from "@/svg/greenCheckedIcon";
import BlueChatIcon from "@/svg/blueChatIcon";
import { FiStar } from "react-icons/fi";
import { BsFillWalletFill } from "react-icons/bs";

// FeatureIcon - Star icon for features badge
export function FeatureIcon() {
  return <FiStar className="text-white" />;
}

// SecureIcon - Shield icon for security/verification
export function SecureIcon({ color = "white" }) {
  return (
    <ShielIcon
      className={color === "white" ? "text-white" : "text-[#6B4EFF]"}
    />
  );
}

// CheckedIcon - Check mark icon
export function CheckedIcon() {
  return <GreenCheckedIcon />;
}

// ChatIcon - Chat/message icon
export function ChatIcon() {
  return <BlueChatIcon />;
}

// WalletIcon - Wallet icon for payment/cost related features
export function WalletIcon() {
  return <BsFillWalletFill className="text-white text-2xl" />;
}
