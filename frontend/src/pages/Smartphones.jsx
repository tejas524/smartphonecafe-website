import { useMemo, useState } from "react";
import PageHero from "../components/sections/PageHero.jsx";
import LocationSection from "../components/sections/LocationSection.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import SmartphoneProductCard from "../components/smartphones/SmartphoneProductCard.jsx";
import { useSiteData } from "../context/SiteData.jsx";
import { waLink, waMessages } from "../utils/whatsapp.js";
import usePageMeta from "../utils/usePageMeta.js";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name-asc", label: "Name: A–Z" },
];

const STOCK_LABELS = {
  in_stock: "Available",
  out_of_stock: "Out of stock",
  unknown: "Ask availability",
};

const priceOf = (s) => {
  const n = Number(s.price_amount);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const isActive = (s) => s.is_active !== 0 && s.is_active !== false;

/* ------------------------------------------------------------------ states */

function LoadingSkeleton() {
  return (
    <ul
      className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <li
          key={i}
          className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white"
        >
          <div className="aspect-square animate-pulse bg-paper-mute" />
          <div className="space-y-2 p-4">
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-paper-mute" />
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-paper-mute" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-paper-mute" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-white px-6 py-14 text-center shadow-[var(--shadow-card)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-mute text-accent-600">
        <Icon name="search" size={22} />
      </span>
      <p className="mt-4 font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
        No smartphones match your filters
      </p>
      <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
        Try a different search or brand, or clear the filters to see everything
        currently in the catalog.
      </p>
      <Button onClick={onClear} variant="outline" size="md" className="mt-6">
        Clear filters
      </Button>
    </div>
  );
}

function CatalogEmpty() {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-white px-6 py-14 text-center shadow-[var(--shadow-card)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-mute text-accent-600">
        <Icon name="smartphone" size={22} />
      </span>
      <p className="mt-4 font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
        Smartphones will appear here once products are added.
      </p>
      <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
        Tell us the model or budget you have in mind and we'll confirm what's
        available in store today.
      </p>
      <Button
        href={waLink(waMessages.smartphones())}
        external
        variant="wa"
        size="md"
        icon="whatsapp"
        className="mt-6"
      >
        Ask on WhatsApp
      </Button>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-white px-6 py-14 text-center shadow-[var(--shadow-card)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-mute text-accent-600">
        <Icon name="alert" size={22} />
      </span>
      <p className="mt-4 font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
        We couldn't load the catalog
      </p>
      <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
        Please check your connection and try again.
      </p>
      <Button onClick={onRetry} variant="outline" size="md" icon="refresh" className="mt-6">
        Retry
      </Button>
    </div>
  );
}

/* --------------------------------------------------------------- controls */

const fieldClass =
  "h-11 min-w-0 w-full rounded-[var(--radius-md)] border border-line bg-white px-3.5 text-[0.9375rem] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-accent-400 focus:ring-2 focus:ring-accent-100";

function Toolbar({
  search,
  setSearch,
  brand,
  setBrand,
  brandOptions,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  showPrice,
  availability,
  setAvailability,
  availabilityOptions,
  sort,
  setSort,
  onClear,
  anyFilter,
  count,
  total,
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      {/* Row 1: search + sort + mobile filter toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            <Icon name="search" size={18} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search smartphones"
            aria-label="Search smartphones"
            className={`${fieldClass} pl-10`}
          />
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <label className="flex min-w-0 flex-1 items-center gap-2 text-[0.8125rem] font-semibold text-ink-500">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort smartphones"
              className={`${fieldClass} h-11 pr-8 sm:w-auto`}
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="catalog-filters"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[var(--radius-md)] border border-line px-3.5 text-[0.875rem] font-semibold text-ink-800 transition-colors hover:border-line-strong lg:hidden"
          >
            <Icon name="sliders" size={17} />
            Filters{anyFilter && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent-600" />}
          </button>
        </div>
      </div>

      {/* Row 2: filters (drawer on mobile, inline on desktop) */}
      <div
        id="catalog-filters"
        className={`${open ? "grid" : "hidden"} mt-4 gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end lg:border-t-0 lg:pt-0 ${
          open ? "" : "lg:flex"
        }`}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-500">
            Brand
          </span>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            aria-label="Filter by brand"
            className={`${fieldClass} lg:w-44`}
          >
            <option value="">All brands</option>
            {brandOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        {showPrice ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-500">
              Price (₹)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                aria-label="Minimum price"
                className={`${fieldClass} lg:w-28`}
              />
              <span className="text-ink-400">–</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                aria-label="Maximum price"
                className={`${fieldClass} lg:w-28`}
              />
            </div>
          </div>
        ) : null}

        {availabilityOptions.length > 0 ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-500">
              Availability
            </span>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              aria-label="Filter by availability"
              className={`${fieldClass} lg:w-44`}
            >
              <option value="">Any availability</option>
              {availabilityOptions.map((v) => (
                <option key={v} value={v}>
                  {STOCK_LABELS[v] || v}
                </option>
              ))}
            </select>
          </label>
        ) : null}

      </div>
      <div className="mt-3 flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-2">
          <p className="text-[0.8125rem] text-ink-500" aria-live="polite">
            {count === total ? (
              <>
                <span className="font-semibold text-ink-800">{total}</span>{" "}
                {total === 1 ? "phone" : "phones"}
              </>
            ) : (
              <>
                Showing <span className="font-semibold text-ink-800">{count}</span> of{" "}
                {total}
              </>
            )}
          </p>
          {anyFilter ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex min-h-11 items-center gap-1.5 text-[0.8125rem] font-semibold text-accent-600 transition-colors hover:text-accent-700"
            >
              <Icon name="x" size={15} />
              Clear filters
            </button>
          ) : null}
        </div>
    </div>
  );
}

/* -------------------------------------------------------------------- page */

export default function Smartphones() {
  const { smartphones, brands, business, status, reload } = useSiteData();

  usePageMeta({
    title: "Smartphones in Talegaon Dabhade",
    description:
      "Browse smartphones currently available at SmartphoneCafe, Talegaon Dabhade — Apple, Samsung, Motorola, Redmi, Realme, Vivo, OPPO, POCO, Tecno and Lava. Check stock on WhatsApp or visit the store.",
    path: "/smartphones",
  });

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("featured");

  const activeProducts = useMemo(
    () => (smartphones || []).filter(isActive),
    [smartphones]
  );

  // Filter options are derived from real CMS data only.
  const brandOptions = useMemo(
    () =>
      (brands || [])
        .filter((b) => activeProducts.some((s) => s.brand_id === b.id))
        .map((b) => b.name),
    [brands, activeProducts]
  );
  const showPrice = useMemo(
    () => activeProducts.some((s) => priceOf(s) != null),
    [activeProducts]
  );
  const availabilityOptions = useMemo(
    () => [...new Set(activeProducts.map((s) => s.stock_status).filter(Boolean))],
    [activeProducts]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    let list = activeProducts.filter((s) => {
      if (q) {
        const hay = [s.brand, s.model, s.model_name, s.description, s.summary]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (brand && s.brand !== brand) return false;
      if (availability && s.stock_status !== availability) return false;
      if (min != null || max != null) {
        const p = priceOf(s);
        if (p == null) return false;
        if (min != null && p < min) return false;
        if (max != null && p > max) return false;
      }
      return true;
    });

    const byOrder = (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0);
    list = [...list];
    switch (sort) {
      case "newest":
        list.sort(
          (a, b) =>
            String(b.created_at || "").localeCompare(String(a.created_at || "")) ||
            (b.id ?? 0) - (a.id ?? 0)
        );
        break;
      case "price-asc":
      case "price-desc": {
        const dir = sort === "price-asc" ? 1 : -1;
        list.sort((a, b) => {
          const pa = priceOf(a);
          const pb = priceOf(b);
          if (pa == null && pb == null) return byOrder(a, b);
          if (pa == null) return 1; // no-price items always last
          if (pb == null) return -1;
          return (pa - pb) * dir;
        });
        break;
      }
      case "name-asc":
        list.sort((a, b) =>
          String(a.model || a.model_name || "").localeCompare(
            String(b.model || b.model_name || "")
          )
        );
        break;
      default: // featured
        list.sort(
          (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || byOrder(a, b)
        );
    }
    return list;
  }, [activeProducts, search, brand, availability, minPrice, maxPrice, sort]);

  const anyFilter =
    search !== "" ||
    brand !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    availability !== "" ||
    sort !== "featured";

  const clearFilters = () => {
    setSearch("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setAvailability("");
    setSort("featured");
  };

  const loading = status === "loading";
  const errored = status === "error";
  const hasCatalog = activeProducts.length > 0;

  return (
    <>
      <PageHero
        compact
        eyebrow="Smartphones"
        title="Find your next smartphone"
        lead="Find a phone that fits your day and your budget. Ask us for today’s price and availability."
      >
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <Button
            href={waLink(waMessages.smartphones())}
            external
            variant="wa"
            size="lg"
            icon="whatsapp"
          >
            Check stock
          </Button>
          {business.phoneTel ? (
            <Button href={business.phoneTel} variant="outline" size="lg" icon="phone">
              Call the store
            </Button>
          ) : null}
        </div>
      </PageHero>

      <section className="bg-white" aria-labelledby="catalog-heading">
        <h2 id="catalog-heading" className="sr-only">
          Smartphone catalog
        </h2>
        <div className="shell py-6 sm:py-8 lg:py-12">
          {loading ? (
            <LoadingSkeleton />
          ) : errored && !hasCatalog ? (
            <ErrorState onRetry={reload} />
          ) : !hasCatalog ? (
            <CatalogEmpty />
          ) : (
            <>
              <Toolbar
                search={search}
                setSearch={setSearch}
                brand={brand}
                setBrand={setBrand}
                brandOptions={brandOptions}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                showPrice={showPrice}
                availability={availability}
                setAvailability={setAvailability}
                availabilityOptions={availabilityOptions}
                sort={sort}
                setSort={setSort}
                onClear={clearFilters}
                anyFilter={anyFilter}
                count={filtered.length}
                total={activeProducts.length}
              />

              <div className="mt-6">
                {filtered.length === 0 ? (
                  <EmptyState onClear={clearFilters} />
                ) : (
                  <ul className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((model, i) => (
                      <li key={model.id ?? model.slug}>
                        <Reveal delay={Math.min(i, 7) * 50} className="h-full">
                          <SmartphoneProductCard model={model} />
                        </Reveal>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <LocationSection />

      <CtaBand
        eyebrow="Found something you like?"
        title="Send us the model name and we will confirm it."
        body="Tell us the phone you are considering. We will check what is in store, what it costs today, and whether your current handset can be exchanged against it."
        message={waMessages.availability()}
      />
    </>
  );
}
