function FilterButton({ label, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1 rounded-full text-base font-normal font-nunito transition-colors ${
        isSelected
          ? "bg-[#EAE6FF] border border-[#6649F7] text-[#6649F7]"
          : "text-[#5A5E67] border border-[#DFDFDF] hover:bg-[#EAE6FF] hover:text-[#6649F7] hover:border-[#6649F7]"
      }`}
    >
      {label}
    </button>
  );
}

export default FilterButton;
