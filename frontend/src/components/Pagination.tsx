type PaginationProps = {
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  loading?: boolean
  onPageChange: (page: number) => void
}

function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  loading = false,
  onPageChange,
}: PaginationProps) {
  if (totalElements === 0) return null

  const firstItem = currentPage * pageSize + 1
  const lastItem = Math.min((currentPage + 1) * pageSize, totalElements)

  return (
    <nav className="pagination" aria-label="Applications pagination">
      <span className="pagination-summary">
        Showing {firstItem}–{lastItem} of {totalElements} applications
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="secondary-button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={loading || currentPage <= 0}
        >
          Previous
        </button>
        <span className="pagination-page">
          Page {currentPage + 1} of {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={loading || currentPage >= totalPages - 1}
        >
          Next
        </button>
      </div>
    </nav>
  )
}

export default Pagination
