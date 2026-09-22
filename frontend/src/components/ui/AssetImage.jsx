import { useState } from "react";

/**
 * An <img> that degrades gracefully.
 *
 * If the source is missing or fails to load, it renders the `fallback` node
 * instead of a broken-image icon. Used for owner-supplied / CMS-supplied
 * catalog imagery so a section never shows a broken tile before assets land.
 *
 * The aspect ratio is reserved up front to avoid layout shift.
 */
export default function AssetImage({
  src,
  alt = "",
  aspect = "1 / 1",
  fit = "cover",
  className = "",
  imgClassName = "",
  sizes,
  loading = "lazy",
  fallback = null,
}) {
  const [failed, setFailed] = useState(!src);

  return (
    <div
      className={`relative isolate overflow-hidden ${className}`}
      style={{ aspectRatio: aspect }}
    >
      {failed ? (
        fallback
      ) : (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${imgClassName}`}
        />
      )}
    </div>
  );
}
