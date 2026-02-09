function ImageBadge({ icon, text, position = "top-left" }) {
  const positionClasses = {
    "top-left": "top-[-20px] md:top-[-20px] left-3 sm:left-4",
    "bottom-right": "bottom-3 md:bottom-[10rem] right-3 lg:right-[-50px]",
  };

  // Split text into main and subtitle
  const parts = text.split(" ");
  const mainText = parts[0]; // "100%" or "10,000+"
  const subtitle = parts.slice(1).join(" "); // "Free for Renters" or "Active Users"

  return (
    <div
      className={`lg:block hidden absolute ${positionClasses[position]} bg-white rounded-xl px-4 py-4 shadow-lg flex items-center gap-3`}
    >
      {/* Purple square with icon */}
      <div className="bg-blueGradient1 rounded-2xl p-2.5 flex-shrink-0 w-10 h-10 flex items-center justify-center">
        <span className="text-white">{icon}</span>
      </div>

      {/* Text content */}
      <div className="flex flex-col">
        <span className="text-secondary font-bold text-base sm:text-2xl font-nunito leading-tight">
          {mainText}
        </span>
        <span className="text-[#5A5E67] text-sm font-normal font-nunito leading-tight">
          {subtitle}
        </span>
      </div>
    </div>
  );
}

export default ImageBadge;
