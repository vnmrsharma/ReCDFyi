/**
 * Filter and search controls for marketplace
 */

interface MarketplaceFiltersProps {
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'mostViewed';
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: 'newest' | 'oldest' | 'mostViewed') => void;
}

/**
 * Provides search and sort controls for the marketplace
 */
export function MarketplaceFilters({
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange,
}: MarketplaceFiltersProps) {
  return (
    <div className="marketplace-filters">
      <div className="filter-group">
        <label htmlFor="marketplace-search" className="filter-label">
          Search
        </label>
        <input
          id="marketplace-search"
          type="text"
          className="search-input"
          placeholder="Search by CD name or creator..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search public CDs"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="marketplace-sort" className="filter-label">
          Sort by
        </label>
        <select
          id="marketplace-sort"
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest' | 'mostViewed')}
          aria-label="Sort public CDs"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="mostViewed">Most Viewed</option>
        </select>
      </div>
    </div>
  );
}
