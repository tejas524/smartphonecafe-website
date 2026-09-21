import { useCallback, useEffect, useState } from "react";
import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import PhotoSlot from "../ui/PhotoSlot.jsx";

/**
 * Gallery renderer.
 *
 * Renders a responsive grid of real shop photographs with an accessible
 * lightbox. Any entry lacking a `src` is rendered as a designed photo slot
 * instead, so the gallery can mix supplied and still-missing shots.
 */
export default function GalleryGrid({
  photos = [],
  brief = [],
  limit,
  columns = 3,
}) {
  const [active, setActive] = useState(null);
  const [showBrief, setShowBrief] = useState(true);

  // Real photos plus (optionally) the remaining photo slots.
  const items = showBrief ? [...photos, ...brief] : photos;
  const shown = limit ? items.slice(0, limit) : items;

  const close = useCallback(() => setActive(null), []);

  const step = useCallback(
    (dir) => {
      setActive((i) => {
        if (i === null) return i;
        // Only step across real photos, never onto a placeholder slot.
        const realCount = shown.filter((s) => s.src).length;
        return (i + dir + realCount) % realCount;
      });
    },
    [shown]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active, close, step]);

  const realPhotos = shown.filter((s) => s.src);
  const activePhoto = active !== null ? realPhotos[active] : null;

  const colCls =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <ul className={`grid grid-cols-1 gap-4 ${colCls}`}>
        {shown.map((item, i) => {
          const isSlot = !item.src;
          // The first wide interior shot spans two columns when not limited.
          const isFeature = !limit && item.feature && i === 0;

          return (
            <li
              key={item.id || item.src}
              className={isFeature ? "sm:col-span-2" : ""}
            >
              <Reveal delay={i * 50}>
                {isSlot ? (
                  <PhotoSlot
                    label={item.label}
                    hint={item.hint}
                    filename={item.filename}
                    alt={item.alt}
                    aspect={isFeature ? "16 / 10" : item.aspect}
                    priority={false}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setActive(realPhotos.findIndex((r) => r.id === item.id))
                    }
                    aria-label={`Open larger view: ${item.alt}`}
                    className="group/ph relative block w-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper-mute"
                    style={{ aspectRatio: isFeature ? "16 / 9" : item.aspect }}
                  >
                    <img
                      src={item.src}
                      srcSet={item.srcset}
                      sizes={
                        isFeature
                          ? "(min-width: 1024px) 66vw, 100vw"
                          : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      }
                      width={item.width}
                      height={item.height}
                      alt={item.alt}
                      loading={i < 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/ph:scale-[1.04]"
                    />

                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover/ph:opacity-100 group-focus-visible/ph:opacity-100" />

                    <span className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 opacity-0 transition-all duration-300 group-hover/ph:opacity-100 group-focus-visible/ph:opacity-100">
                      <span className="text-left font-display text-[0.875rem] font-semibold text-white">
                        {item.caption || item.alt}
                      </span>
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-sm">
                        <Icon name="search" size={15} />
                      </span>
                    </span>
                  </button>
                )}
              </Reveal>
            </li>
          );
        })}
      </ul>

      {/* ------------------------------------------------------- lightbox */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.alt}
          className="fixed inset-0 z-[70] flex flex-col bg-ink-950/97 backdrop-blur-md"
          onClick={close}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <p className="min-w-0 truncate font-display text-[0.875rem] font-semibold text-white">
              {activePhoto.caption || activePhoto.alt}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close image viewer"
              autoFocus
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-white/18 text-white transition-colors hover:bg-white/10"
            >
              <Icon name="x" size={19} />
            </button>
          </div>

          <div
            className="flex flex-1 items-center justify-center px-4 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePhoto.srcset.split(",").pop().trim().split(" ")[0]}
              alt={activePhoto.alt}
              className="max-h-full max-w-full rounded-[var(--radius-lg)] object-contain"
            />
          </div>

          {realPhotos.length > 1 && (
            <div
              className="flex items-center justify-center gap-3 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 text-white transition-colors hover:bg-white/10"
              >
                <Icon name="chevronRight" size={19} className="rotate-180" />
              </button>
              <span className="tabular-nums font-display text-[0.8125rem] text-ink-400">
                {active + 1} / {realPhotos.length}
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 text-white transition-colors hover:bg-white/10"
              >
                <Icon name="chevronRight" size={19} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toggle for the remaining photo slots */}
      {brief.length > 0 && photos.length > 0 && !limit && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-md)] border border-line bg-paper-soft p-4">
          <p className="text-[0.8125rem] leading-relaxed text-ink-600">
            <span className="font-semibold text-ink-800">
              {brief.length} photo{brief.length === 1 ? "" : "s"} still to capture.
            </span>{" "}
            Each panel names the shot it is waiting for.
          </p>
          <button
            type="button"
            onClick={() => setShowBrief((v) => !v)}
            aria-pressed={showBrief}
            className="inline-flex h-9 shrink-0 items-center rounded-full border border-line-strong bg-white px-4 font-display text-[0.8125rem] font-semibold text-ink-700 transition-colors hover:border-ink-400 hover:text-ink-950"
          >
            {showBrief ? "Hide photo list" : "Show photo list"}
          </button>
        </div>
      )}
    </>
  );
}