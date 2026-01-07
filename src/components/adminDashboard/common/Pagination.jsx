function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 5,
  onPageChange,
  itemName = "items",
  showInfo = true,
  maxVisiblePages = 5,
}) {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (
      page >= 1 &&
      page <= totalPages &&
      page !== currentPage &&
      onPageChange
    ) {
      onPageChange(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1 && !showInfo) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 ">
      {showInfo && (
        <p className="text-darkGray text-sm md:text-base font-nunito font-normal text-center sm:text-left">
          Showing {startIndex}-{endIndex} of {totalItems} {itemName}
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-lightGray rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            Prev
          </button>

          {getVisiblePages().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg font-semibold text-sm transition-colors ${
                currentPage === page
                  ? "bg-[#6B4EFF] text-white"
                  : "bg-white border border-lightGray text-secondary hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-lightGray rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Pagination;
