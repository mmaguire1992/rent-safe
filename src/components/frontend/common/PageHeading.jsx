function PageHeading({ children, className = "" }) {
  return (
    <h1 className={`text-xl md:text-2xl font-bold text-text-primary ${className}`}>
      {children}
    </h1>
  );
}

export default PageHeading;

