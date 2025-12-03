/**
 * Empty state component for marketplace
 */

import { EmptyState } from '../ui/EmptyState';
import { EmptyDiscIcon } from '../ui/EmptyDiscIcon';

interface MarketplaceEmptyProps {
  hasSearch: boolean;
}

/**
 * Displays empty state message for marketplace
 */
export function MarketplaceEmpty({ hasSearch }: MarketplaceEmptyProps) {
  if (hasSearch) {
    return (
      <EmptyState
        icon={<EmptyDiscIcon />}
        title="No Results Found"
        message="No public CDs match your search. Try different keywords or clear your search."
      />
    );
  }

  return (
    <EmptyState
      icon={<EmptyDiscIcon />}
      title="No Public CDs Yet"
      message="Be the first to share a CD with the community! Make one of your CDs public to get started."
    />
  );
}
