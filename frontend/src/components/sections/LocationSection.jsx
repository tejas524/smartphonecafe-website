import { useEffect, useState } from "react";
import Button from "../ui/Button.jsx";
import Icon from "../Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import { usePrivacy } from "../../context/Privacy.jsx";
import { waLink, waMessages } from "../../utils/whatsapp.js";
import { getStoreStatus } from "../../utils/hours.js";

/**
 * Store location, hours and an embedded map.
 *
 * The map uses Google's keyless embed with the verified Place ID — no
 * fabricated coordinates and no API key.
 */
export default function LocationSection({ tone = "light" }) {
  const { business, directionsUrl, mapEmbedUrl } = useSiteData();
  const [status, setStatus] = useState({ known: false });
  const { mapsAllowed: mapLoaded, preferences, savePreferences } = usePrivacy();

  // Computed after mount so the server-rendered HTML never carries a stale
  // open/closed claim, and refreshed periodically while the page is open.
  useEffect(() => {
    const update = () => setStatus(getStoreStatus());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const isDark = tone === "dark";

  const rows = [
    {
      icon: "mapPin",
      label: "Address",
      value: (
        <address className="not-italic">
          {business.address.line1},
          <br />
          {business.address.line2},
          <br />
          {business.address.line3},
          <br />
          {business.address.region} {business.address.postalCode}
        </address>
      ),
    },
    {
      icon: "clock",
      label: "Opening hours",
      value: (
        <>
          <span className="font-semibold text-ink-900">{business.hours.label}</span>
          <br />
          <span className="text-ink-500">{business.hours.days}</span>
        </>
      ),
    },
    {
      icon: "phone",
      label: "Phone",
      value: (
        <a
          href={business.phoneTel}
          className="tabular-nums font-semibold text-ink-900 underline decoration-line-strong decoration-2 underline-offset-4 transition-colors hover:text-accent-600 hover:decoration-accent-400"
        >
          {business.phoneDisplay}
        </a>
      ),
    },
    {
      icon: "tag",
      label: "Plus code",
      value: <span className="text-ink-600">{business.google.plusCode}</span>,
    },
  ];

  return (
    <section
      className={isDark ? "bg-ink-950" : "bg-white"}
      aria-labelledby="location-heading"
    >
      <div className="shell py-12 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Details */}
          <div className="lg:col-span-5">
            <Reveal as="p" className="eyebrow text-accent-600">
              Our store
            </Reveal>

            <Reveal
              as="h2"
              id="location-heading"
              delay={60}
              className="mt-4 text-[1.75rem] sm:text-[2.125rem] lg:text-[2.5rem]"
            >
              Visit our store
            </Reveal>

            <Reveal
              as="p"
              delay={120}
              className="mt-4 text-[1.0625rem] leading-relaxed text-ink-600"
            >
              We are on the main Station Road stretch near Umang Medical — a
              short walk from Talegaon station and easy to pull up to on a
              two-wheeler.
            </Reveal>

            {status.known && (
              <Reveal delay={160} className="mt-6">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-display text-[0.8125rem] font-semibold ${
                    status.isOpen
                      ? "border-wa-600/25 bg-wa-500/10 text-wa-700"
                      : "border-line-strong bg-paper-mute text-ink-600"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${
                      status.isOpen ? "bg-wa-500" : "bg-ink-400"
                    }`}
                  />
                  {status.label}
                  <span className="font-normal text-ink-500">
                    · {status.detail}
                  </span>
                </span>
              </Reveal>
            )}

            <dl className="mt-8 divide-y divide-line border-y border-line">
              {rows.map((row, i) => (
                <Reveal key={row.label} delay={i * 50} className="flex flex-col gap-1.5 py-4 sm:flex-row sm:gap-4">
                    <dt className="flex shrink-0 items-center gap-2.5 text-[0.8125rem] font-semibold text-ink-500 sm:w-[8.5rem] sm:items-start">
                      <Icon
                        name={row.icon}
                        size={15}
                        className="mt-0.5 shrink-0 text-ink-400"
                      />
                      {row.label}
                    </dt>
                    {/* min-w-0 + anywhere: the plus code is a long unbreakable
                        token, so this cell must be allowed to shrink and wrap. */}
                    <dd className="min-w-0 text-[0.9375rem] leading-relaxed text-ink-700 [overflow-wrap:anywhere]">
                      {row.value}
                    </dd>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={220} className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button
                href={directionsUrl}
                external
                variant="primary"
                size="lg"
                icon="navigation"
                className="w-full sm:w-auto"
              >
                Get Directions
              </Button>
              <Button
                href={waLink(waMessages.directions())}
                external
                variant="wa"
                size="lg"
                icon="whatsapp"
                className="w-full sm:w-auto"
              >
                WhatsApp
              </Button>
            </Reveal>

            <Reveal delay={260} className="mt-5">
              <a
                href={business.google.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-display text-[0.875rem] font-semibold text-accent-600 transition-colors hover:text-accent-700"
              >
                <Icon name="google" size={16} />
                See SmartphoneCafe on Google
                <Icon name="external" size={14} />
              </a>
            </Reveal>
          </div>

          {/* Map */}
          <Reveal delay={140} className="lg:col-span-7">
            <div
              className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper-mute"
            >
              {mapLoaded ? (
                <iframe
                  title={`Map showing the location of ${business.name} in Talegaon Dabhade`}
                  src={mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block h-[22rem] w-full border-0 sm:h-[26rem] lg:h-[34rem]"
                />
              ) : (
                <div className="relative flex h-[22rem] w-full flex-col items-center justify-center gap-4 px-6 text-center sm:h-[26rem] lg:h-[34rem]">
                  {/* No request reaches Google until the visitor allows maps. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.6]"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgb(8 9 12 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(8 9 12 / 0.04) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  />
                  <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-accent-600 shadow-[var(--shadow-card)]">
                    <Icon name="mapPin" size={22} />
                  </span>
                  <div className="relative max-w-xs">
                    <p className="font-display text-[1rem] font-bold text-ink-950">
                      {business.name}
                    </p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-500">
                      {business.address.line1}, {business.address.line2}
                    </p>
                  </div>
                  <p className="relative max-w-sm text-sm text-ink-600">Loading the map connects to Google, which may set cookies. You can use Get Directions instead.</p>
                  <Button className="relative" size="md" onClick={() => savePreferences({ maps: true, analytics: preferences?.analytics || false })}>Load Google Map</Button>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
