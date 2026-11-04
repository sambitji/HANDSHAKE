export function Logo({ size = 40, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="hsRingA" x1="4" y1="6" x2="30" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5eead4" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="hsRingB" x1="18" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="14" fill="#0b1220" stroke="rgba(255,255,255,.14)" />
      <rect x="1" y="1" width="46" height="46" rx="14" fill="url(#hsRingA)" opacity=".07" />
      <circle cx="19.5" cy="24" r="8.6" stroke="url(#hsRingA)" strokeWidth="3.4" />
      <circle cx="28.5" cy="24" r="8.6" stroke="url(#hsRingB)" strokeWidth="3.4" />
      <path
        d="m21.6 24.2 2 2.1 4-4.6"
        stroke="#eafffb"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Wordmark({ className = '' }) {
  return (
    <span className={`display text-[1.06rem] font-bold tracking-[0.16em] ${className}`}>
      HAND<span className="text-mint">SHAKE</span>
    </span>
  )
}
