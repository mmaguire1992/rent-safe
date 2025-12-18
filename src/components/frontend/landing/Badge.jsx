function Badge({ children, icon, variant = "default" }) {
  const baseClasses = "inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-xs sm:text-sm font-medium border w-fit";
  
  const variants = {
    default: "border-primary text-primary bg-white",
    purple: "border-primary text-primary bg-badge-gradient",
    white: "border-transparent border-0 text-white bg-badge-gradient"
  };

  const iconColor = variant === "white" ? "text-white" : "text-primary";
  
  return (
    <div className={`${baseClasses} ${variants[variant]}`}>
      {icon && <span className={`${iconColor} shrink-0`}>{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </div>
  );
}

export default Badge;

