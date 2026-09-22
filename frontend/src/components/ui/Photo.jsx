/**
 * Responsive shop photograph.
 *
 * Serves the generated WebP srcset with a JPEG fallback, and reserves the
 * exact aspect ratio up front so the image cannot cause layout shift (CLS).
 *
 * `priority` marks above-the-fold images: they load eagerly and are given high
 * fetch priority, while everything else stays lazy.
 */
export default function Photo({
  photo,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className = "",
  imgClassName = "",
  priority = false,
  aspect,
  rounded = "rounded-[var(--radius-lg)]",
  overlay = false,
  children,
}) {
  if (!photo) return null;

  return (
    <figure
      className={`relative isolate overflow-hidden bg-ink-850 ${rounded} ${className}`}
      style={{ aspectRatio: aspect || photo.aspect }}
    >
      <img
        src={photo.src}
        srcSet={photo.srcset}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        // Lowercase on purpose: React 18 does not recognise the camelCase
        // `fetchPriority` and logs a "React does not recognize the prop"
        // warning. A lowercase attribute is passed through to the DOM
        // verbatim, which is what the HTML spec actually defines.
        {...(priority ? { fetchpriority: "high" } : {})}
        className={`h-full w-full object-cover ${imgClassName}`}
      />

      {overlay && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgb(8 9 12 / 0.82) 0%, rgb(8 9 12 / 0.35) 42%, rgb(8 9 12 / 0.15) 100%)",
          }}
        />
      )}

      {children}
    </figure>
  );
}