function AuthLayout({ children, headerText = "" }) {
  return (
    <div className="min-h-screen bg-mainBgGradient">
      {/* Dark grey header */}
      {headerText && (
        <div className="bg-gray-800 h-10 md:h-12 flex items-center px-4 md:px-6">
          <span className="text-white text-xs md:text-sm">{headerText}</span>
        </div>
      )}

      {/* Main content */}
      <div
        className={`flex items-center justify-center ${
          headerText
            ? "min-h-[calc(100vh-2.5rem)] md:min-h-[calc(100vh-3rem)]"
            : "min-h-screen"
        } py-6 md:py-8 px-4 sm:px-6`}
      >
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
