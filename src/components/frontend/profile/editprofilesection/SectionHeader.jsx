function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="bg-[#E8E2FF] w-[36px] h-[36px] flex items-center justify-center rounded-[10px] p-2">
        {Icon && <Icon />}
      </div>
      <h2 className="text-lg md:text-xl font-bold font-nunito text-secondary mb-0">
        {title}
      </h2>
    </div>
  );
}

export default SectionHeader;
