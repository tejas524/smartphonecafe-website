import { useMemo, useState } from "react";
import PageHero from "../components/sections/PageHero.jsx";
import GalleryGrid from "../components/sections/GalleryGrid.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Button from "../components/ui/Button.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { galleryCategories } from "../data/gallery.js";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

export default function Gallery() {
  const { business, gallery } = useSiteData();
  const galleryPhotos = gallery;

  usePageMeta({
    title: "Gallery",
    description:
      "Photographs of SmartphoneCafe on Talegaon Station Road, Talegaon Dabhade — the store front, the counter, smartphone displays, accessories and the repair bench.",
    path: "/gallery",
  });

  const [filter, setFilter] = useState("all");

  const real = useMemo(
    () =>
      filter === "all"
        ? galleryPhotos
        : galleryPhotos.filter((p) => p.category === filter),
    [filter, galleryPhotos]
  );

  // Only offer filters that actually have photographs behind them.
  const available = useMemo(() => {
    const ids = new Set(galleryPhotos.map((p) => p.category));
    return galleryCategories.filter((c) => c.id === "all" || ids.has(c.id));
  }, [galleryPhotos]);

  // Count only real photographs.
  const count = real.length;

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="The store, photographed."
        lead="Real photographs of SmartphoneCafe — the shop front, the counter, the stock and the people behind it. Every image here was taken in the store."
      >
        <div className="flex flex-wrap gap-2.5">
          <Button
            href={business.google.shortUrl}
            external
            variant="primary"
            size="lg"
            icon="google"
          >
            See photos on Google
          </Button>
          <Button
            href={waLink(waMessages.general())}
            external
            variant="wa"
            size="lg"
            icon="whatsapp"
          >
            WhatsApp Us
          </Button>
        </div>
      </PageHero>

      {/* ========================================================== grid */}
      <section className="bg-white" aria-labelledby="grid-heading">
        <div className="shell py-14 lg:py-16">
          <h2 id="grid-heading" className="sr-only">
            Photo gallery
          </h2>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {available.map((c) => {
              const active = filter === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFilter(c.id)}
                  aria-pressed={active}
                  className={`inline-flex h-10 sm:h-9 items-center rounded-full border px-4 font-display text-[0.8125rem] font-semibold transition-colors duration-200 ${
                    active
                      ? "border-ink-950 bg-ink-950 text-white"
                      : "border-line-strong bg-white text-ink-600 hover:border-ink-400 hover:text-ink-950"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}

            <span className="ml-auto text-[0.8125rem] text-ink-500">
              {count} {count === 1 ? "photograph" : "photographs"}
            </span>
          </div>

          {count > 0 ? (
            <GalleryGrid photos={real} columns={3} />
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-line bg-paper-soft p-10 text-center">
              <p className="text-[0.9375rem] text-ink-600">
                Nothing in this category yet.
              </p>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-3 font-display text-[0.875rem] font-semibold text-accent-600 underline decoration-accent-200 underline-offset-2 hover:text-accent-700"
              >
                Show everything
              </button>
            </div>
          )}
        </div>
      </section>

      <CtaBand
        eyebrow="Prefer to see it in person?"
        title="The store is open every day until 9:30 pm."
        body="Photos only go so far. Walk in, handle the phone you are considering and talk it through at the counter."
      />
    </>
  );
}