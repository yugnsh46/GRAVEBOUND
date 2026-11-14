/** Gold coin used for the shop balance and prices. */
export function CoinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="12" cy="12" r="11" fill="#f2b230" stroke="#a8670f" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="7.6" fill="#ffd45e" stroke="#c98a1a" strokeWidth="1.2" />
      <path d="M12.8 6.6h-2.1c-1.5 0-2.4.9-2.4 2.1 0 1.4 1 1.9 2.6 2.2 1.6.3 2.6.7 2.6 2 0 1.1-.9 1.9-2.3 1.9h-2.3M11.7 5.4v13.2" fill="none" stroke="#a8670f" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
