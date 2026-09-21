import { useEffect, useRef, useState } from "react";
import Icon from "../Icon.jsx";

/**
 * A designed image placeholder.
 *
 * SmartphoneCafe's Google Maps photo library could not be extracted (see
 * docs/google-maps-findings.md), and the brief forbids substituting stock
 * photography or fabricating imagery. So rather than fill the gallery with
 * random pictures, every image position is a deliberate, on-brand slot that:
 *
 *   - names the exact subject a real photo should show,
 *   - documents the recommended file, aspect ratio and alt text,
 *   - renders as a finished design element, not an obvious "missing image" box.
 *
 * Dropping a file into /public/shop-images with the stated filename and adding
 * it to src/data/gallery.js replaces the slot with the real photograph.
 */
export default function PhotoSlot({
  label,
  hint,
  aspect = "4 / 3",
  filename,
  alt,
  tone = "light",
  className = "",
  priority = false,
}) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => setRevealed(true), priority ? 80 : 220);
    return () => clearTimeout(t);
  }, [priority]);

  const isDark = tone === "dark";

  return (
    <figure
      ref={ref}
      className={`group/slot relative isolate overflow-hidden rounded-[var(--radius-lg)] ${
        isDark
          ? "border border-white/10 bg-ink-900"
          : "border border-line bg-paper-mute"
      } ${className}`}
      style={{ aspectRatio: aspect }}
      aria-label={alt || label}
    >
      {/* Engineered backdrop */}
      <div
        className={`absolute inset-0 ${isDark ? "grid-veil opacity-70" : ""}`}
        style={
          isDark
            ? undefined
            : {
                backgroundImage:
                  "linear-gradient(to right, rgb(8 9 12 / 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgb(8 9 12 / 0.035) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }
        }
      />

      {/* Soft vignette so the slot reads as a composed panel */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(120% 90% at 20% 0%, rgb(91 140 255 / 0.16), transparent 60%)"
            : "radial-gradient(120% 90% at 20% 0%, rgb(47 107 255 / 0.07), transparent 60%)",
        }}
      />

      {/* Centre content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
              isDark
                ? "bg-white/10 text-white/80"
                : "bg-white text-ink-500 shadow-[var(--shadow-card)]"
            }`}
          >
            <Icon name="image" size={15} />
          </span>
          <span
            className={`eyebrow ${isDark ? "text-white/45" : "text-ink-400"}`}
          >
            Photo slot
          </span>
        </div>

        <div
          className={`transition-opacity duration-700 ease-out ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        >
          <figcaption
            className={`font-display text-[0.9375rem] font-bold leading-snug tracking-[-0.015em] sm:text-base ${
              isDark ? "text-white" : "text-ink-900"
            }`}
          >
            {label}
          </figcaption>
          {hint && (
            <p
              className={`mt-1.5 text-[0.8125rem] leading-relaxed ${
                isDark ? "text-ink-400" : "text-ink-500"
              }`}
            >
              {hint}
            </p>
          )}
          {filename && (
            <p
              className={`mt-2.5 font-mono text-[0.6875rem] tracking-tight ${
                isDark ? "text-white/35" : "text-ink-400"
              }`}
            >
              {filename}
            </p>
          )}
        </div>
      </div>

      {/* Corner ticks — subtle drafting detail */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t ${
          isDark ? "border-white/15" : "border-ink-300"
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r ${
          isDark ? "border-white/15" : "border-ink-300"
        }`}
      />
    </figure>
  );
}