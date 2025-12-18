function Button({ children, variant = "primary", onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`bg-blueGradient py-2 px-8 w-full md:w-auto  text-white text-base font-bold rounded-[10px]  shadow-md hover:shadow-lg font-nunito`}
    >
      {children}
    </button>
  );
}

export default Button;
