/**
 * Empty disc icon for empty states
 */

export function EmptyDiscIcon() {
  return (
    <svg viewBox="0 0 100 100" className="empty-disc">
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#808080"
        strokeWidth="2"
        strokeDasharray="5 5"
      />
      <circle cx="50" cy="50" r="10" fill="none" stroke="#808080" strokeWidth="2" />
    </svg>
  );
}
