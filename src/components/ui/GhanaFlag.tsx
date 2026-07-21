export function GhanaFlag({ className = "w-6 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 200"
      className={`inline-block overflow-hidden rounded-[2px] shadow-xs ${className}`}
      aria-label="Ghana Flag"
    >
      {/* Red Stripe */}
      <rect width="300" height="66.67" y="0" fill="#CE1126" />
      {/* Yellow Stripe */}
      <rect width="300" height="66.67" y="66.67" fill="#FCD116" />
      {/* Green Stripe */}
      <rect width="300" height="66.67" y="133.33" fill="#006B3F" />
      {/* Black 5-pointed star in center */}
      <polygon
        points="150,73 157,94 179,94 161,106 168,127 150,114 132,127 139,106 121,94 143,94"
        fill="#000000"
      />
    </svg>
  );
}
