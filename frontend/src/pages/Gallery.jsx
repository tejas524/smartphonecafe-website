import { useMemo, useState } from "react";
import PageHero from "../components/sections/PageHero.jsx";
import GalleryGrid from "../components/sections/GalleryGrid.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { galleryCategories, photoBrief } from "../data/gallery.js";
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
  const hasReal = galleryPhotos.length > 0;
  const briefCount = photoBrief.length;

  const brief = useMemo(
    () =>
      filter === "all"
        ? photoBrief
        : photoBrief.filter((p) => p.category === filter),
    [filter]
  );

  const real = useMemo(
    () =>
      filter === "all"
        ? galleryPhotos
        : galleryPhotos.filter((p) => p.category === filter),
    [filter, galleryPhotos]
  );

  // Only offer filters that actually have something behind them.
  const available = useMemo(() => {
    const source = [...galleryPhotos, ...photoBrief];
    const ids = new Set(source.map((p) => p.category));
    return galleryCategories.filter(
      (c) => c.id === "all" || ids.has(c.id)
    );
  }, [galleryPhotos]);

  // Count only real photographs — photo slots are not gallery items.
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

      {/* ====================================================== disclosure */}
      {briefCount > 0 && (
        <section className="border-b border-line bg-white">
          <div className="shell py-8">
            <Reveal className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-line bg-paper-soft p-5 sm:flex-row sm:items-start sm:p-6">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-white text-accent-600 shadow-[var(--shadow-card)]">
                <Icon name="camera" size={18} />
              </span>
              <div>
                <p className="font-display text-[0.9375rem] font-bold text-ink-950">
                  {galleryPhotos.length} real photographs, {briefCount} still to capture
                </p>
                <p className="mt-1.5 max-w-3xl text-[0.875rem] leading-relaxed text-ink-600">
                  Every photo on this page was supplied by the shop and taken in
                  the store. The panels at the end of the grid are the shots
                  still missing — chiefly a higher-resolution storefront, since
                  the exterior image supplied is only 732&times;660 pixels.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

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
                  className={`inline-flex h-9 items-center rounded-full border px-4 font-display text-[0.8125rem] font-semibold transition-colors duration-200 ${
                    active
                      ? "border-ink-950 bg-ink-950 text-white"
                      : "border-line-strong bg-white text-ink-600 hover:border-ink-400 hover:text-ink-950"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}

            <span className="ml-auto text-[0.8125rem] text-ink-400">
              {count} {count === 1 ? "photograph" : "photographs"}
            </span>
          </div>

          {count > 0 ? (
            <GalleryGrid photos={real} brief={brief} columns={3} />
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

      {/* ====================================================== shoot list */}
      <section className="border-t border-line bg-paper-soft" aria-labelledby="brief-heading">
        <div className="shell py-16 lg:py-20">
          <SectionHeading
            eyebrow="Still to capture"
            id="brief-heading"
            title="The few shots worth adding next"
            lead="The gallery is already full of real photographs. These are the gaps that would improve it most — shoot each in landscape, in daylight, with the shop tidy."
          />

          <ul className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {photoBrief.map((p, i) => (
              <li key={p.id}>
                <Reveal delay={i * 45} className="h-full">
                  <div className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-white p-5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent-50 font-display text-[0.75rem] font-bold text-accent-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3.5 font-display text-[0.9375rem] font-bold tracking-[-0.015em] text-ink-950">
                      {p.label}
                    </h3>
                    <p className="mt-1.5 flex-1 text-[0.8125rem] leading-relaxed text-ink-600">
                      {p.hint}
                    </p>
                    <p className="mt-3.5 border-t border-line pt-3 font-mono text-[0.6875rem] leading-relaxed text-ink-400">
                      {p.filename}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={220}>
            <p className="mt-7 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line bg-white p-4 text-[0.8125rem] leading-relaxed text-ink-600">
              <Icon name="info" size={15} className="mt-0.5 shrink-0 text-ink-400" />
              <span>
                Save each file into{" "}
                <code className="rounded bg-paper-mute px-1.5 py-0.5 font-mono text-[0.75rem] text-ink-800">
                  public/shop-images/
                </code>{" "}
                using the filename shown, then add it to{" "}
                <code className="rounded bg-paper-mute px-1.5 py-0.5 font-mono text-[0.75rem] text-ink-800">
                  src/data/gallery.js
                </code>
                . The gallery switches from slots to a real photo grid on its own.
              </span>
            </p>
          </Reveal>
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