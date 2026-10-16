import { Link } from "react-router-dom";
import Icon from "../Icon.jsx";

/**
 * Polymorphic action element.
 * Renders <a> when `href` is given, <Link> when `to` is given, <button> otherwise.
 *
 * Variants are deliberately few and each has one job:
 *   primary   — the single most important action in a view
 *   wa        — WhatsApp only (its green is never used decoratively)
 *   outline   — secondary action on light surfaces
 *   onDark    — secondary action on ink surfaces
 *   ghost     — tertiary / inline
 */

const VARIANTS = {
  primary:
    "bg-ink-950 text-white hover:bg-ink-800 active:bg-ink-950 shadow-[0_1px_2px_rgb(8_9_12/0.16),0_10px_24px_-12px_rgb(8_9_12/0.5)]",
  accent:
    "bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-700 shadow-[0_1px_2px_rgb(8_39_107/0.2),0_10px_24px_-12px_rgb(8_66_187/0.6)]",
  wa: "bg-wa-600 text-white hover:bg-wa-700 active:bg-wa-700 shadow-[0_1px_2px_rgb(18_140_63/0.2),0_10px_24px_-12px_rgb(18_140_63/0.6)]",
  outline:
    "bg-white text-ink-900 border border-line-strong hover:border-ink-400 hover:bg-paper-mute active:bg-paper-mute",
  onDark:
    "bg-white/8 text-white border border-white/18 hover:bg-white/14 hover:border-white/30 backdrop-blur-sm",
  ghost: "text-ink-700 hover:text-ink-950 hover:bg-paper-mute",
};

/**
 * Sizes use `min-h` + vertical padding rather than a fixed height, so a label
 * that wraps on a very narrow screen grows the button instead of clipping.
 * Labels can wrap within their available width, including in narrow catalog
 * cards and at browser zoom. Long actions never force the page wider.
 *
 * The compact `sm` size keeps a comfortable ~44px touch target on phones
 * (min-h-11) and only tightens to its 36px desktop footprint from the `sm`
 * breakpoint up, so mobile taps stay accessible without altering the desktop
 * layout. `lg` follows the same idea in reverse: a restrained 44px pill on
 * phones (min-h-11, tighter padding + radius) that grows to its full 52px
 * presence from `sm` up, so hero and section CTAs don't feel oversized on a
 * small screen while staying an accessible tap target.
 */
const SIZES = {
  sm: "min-h-11 sm:min-h-9 px-3.5 py-1.5 text-[0.875rem] sm:text-[0.8125rem] gap-1.5 rounded-[10px]",
  md: "min-h-11 px-4 py-2 text-[0.9375rem] sm:px-5 sm:text-[0.875rem] gap-2 rounded-[12px]",
  lg: "min-h-11 px-4.5 py-2.5 text-[0.9375rem] gap-2 rounded-[12px] sm:min-h-[3.25rem] sm:px-6 sm:rounded-[14px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  href,
  icon,
  iconRight,
  external = false,
  className = "",
  full = false,
  ...rest
}) {
  const cls = [
    "group/btn inline-flex items-center justify-center text-center font-display font-semibold tracking-[-0.01em]",
    "transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out",
    "active:translate-y-px select-none min-w-0 max-w-full whitespace-normal",
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    full ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} className="shrink-0" />}
      <span className="min-w-0 break-words">{children}</span>
      {iconRight && (
        <Icon
          name={iconRight}
          size={size === "sm" ? 15 : 17}
          className="shrink-0 transition-transform duration-200 ease-out group-hover/btn:translate-x-0.5"
        />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
}
