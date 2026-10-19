/**
 * SmartphoneCafe identity.
 *
 * A temporary brand mark created for this site — it is NOT the shop's original
 * official logo (none was available). The symbol is a precision-drawn squircle
 * device containing a geometric "S", with a single accent indicator dot. It is
 * engineered on a 44-unit grid so it stays legible from a 16px favicon up to
 * print scale.
 */

export function LogoMark({ className = "", size = 40, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <defs>
        <linearGradient id="spc-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#171c24" />
          <stop offset="100%" stopColor="#08090c" />
        </linearGradient>
      </defs>

      {/* Device body */}
      <rect x="2" y="2" width="40" height="40" rx="13" fill="url(#spc-mark)" />
      <rect
        x="2.75"
        y="2.75"
        width="38.5"
        height="38.5"
        rx="12.35"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="1.5"
      />

      {/* Geometric S */}
      <path
        d="M28.6 14.6H19.7a4.05 4.05 0 0 0 0 8.1h4.6a4.05 4.05 0 0 1 0 8.1h-8.9"
        stroke="#ffffff"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Accent indicator */}
      <circle cx="30.6" cy="30.4" r="2.3" fill="#5b8cff" />
    </svg>
  );
}

/**
 * Full lockup: mark + wordmark.
 * `tone="light"` renders the wordmark in white for dark surfaces.
 */
export function Logo({
  size = 38,
  tone = "dark",
  showWordmark = true,
  className = "",
  textClassName = "",
}) {
  const word =
    tone === "light"
      ? "text-white"
      : "text-ink-950";
  const accent = tone === "light" ? "text-accent-400" : "text-accent-600";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span
          className={`font-display text-[1.0625rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[1.15rem] ${word} ${textClassName}`}
        >
          Smartphone
          <span className={accent}>Cafe</span>
        </span>
      )}
    </span>
  );
}