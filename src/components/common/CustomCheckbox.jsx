function CustomCheckbox({
  id,
  checked = false,
  onChange,
  label,
  className = "",
  labelClassName = "",
}) {
  return (
    <label
      className={`flex items-center cursor-pointer ${className}`}
      htmlFor={id}
    >
      {/* Custom Checkbox */}
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${
            checked ? "bg-[#6B4EFF] border-[#6B4EFF]" : "bg-white border-lightGray"
          }`}
        >
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </div>
      </div>
      {/* Label */}
      {label && (
        <span
          className={`ml-2 text-sm text-secondary font-medium select-none ${labelClassName}`}
        >
          {label}
        </span>
      )}
    </label>
  );
}

export default CustomCheckbox;
