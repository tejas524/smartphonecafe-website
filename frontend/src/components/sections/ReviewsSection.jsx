import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import CardCarousel from "../ui/CardCarousel.jsx";
import Icon from "../Icon.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import useCountUp from "../../utils/useCountUp.js";

/**
 * Google Reviews — a prominent, data-driven trust section.
 *
 * Reads `reviewsSummary` (rating + reviewCount + googleUrl) and `reviews` only,
 * so the same UI works when the data is later served from an API. The review
 * count animates 0 -> reviewsSummary.reviewCount when the summary scrolls into
 * view (once per visit; reduced motion shows the final value immediately).
 *
 * Cards sit on a soft field so their white surface, border and shadow read as
 * elevated. Each card carries stars, the review, a Google attribution and — at
 * the foot — a customer identity row whose circular avatar shows the first
 * letter of the reviewer's name, generated from the data (never a fabricated
 * profile photo). No review, name, rating, count or date is invented.
 */
const STAR_GOLD = "#fbbc04";

function Stars({ count = 5, size = "1rem", label }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 leading-none"
      style={{ color: STAR_GOLD, fontSize: size }}
      role="img"
      aria-label={label || `${count} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true" style={{ opacity: i < count ? 1 : 0.25 }}>
          ★
        </span>
      ))}
    </span>
  );
}

/** First alphabetic character of a name, generated from the data. */
function initialOf(name) {
  const s = String(name || "").trim();
  const alpha = s.match(/[A-Za-z\u00C0-\u024F]/);
  return (alpha ? alpha[0] : s[0] || "?").toUpperCase();
}

function ReviewCard(review) {
  return (
    <article className="flex h-full w-full flex-col rounded-[var(--radius-lg)] border border-line-strong bg-white p-6 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]">
      {/* Rating + date */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Stars count={review.rating} size="1.0625rem" />
          <span className="text-[0.75rem] text-ink-400">{review.date}</span>
        </div>
        {review.isNew && (
          <span className="shrink-0 rounded-full border border-accent-400/40 bg-accent-50 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-accent-700">
            New
          </span>
        )}
      </div>

      {/* Review text */}
      <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink-700 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:6] overflow-hidden">
        {review.text}
      </p>

      {/* Identity row */}
      <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-50 font-display text-[1rem] font-bold text-accent-700 ring-1 ring-inset ring-accent-400/30"
        >
          {initialOf(review.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[0.9375rem] font-bold tracking-[-0.015em] text-ink-950">
            {review.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] text-ink-400">
            <Icon name="google" size={13} className="shrink-0" />
            <span>Posted on Google</span>
            {review.photos ? (
              <span className="text-ink-300">
                · {review.photos} photo{review.photos > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ReviewsSection() {
  const { reviews, reviewsSummary } = useSiteData();
  const { ref, value } = useCountUp(reviewsSummary.reviewCount, { duration: 1300 });

  return (
    <section className="border-y border-line bg-paper-soft" aria-labelledby="reviews-heading">
      <div className="shell py-12 lg:py-24">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Google reviews"
            id="reviews-heading"
            title="What customers say about SmartphoneCafe"
            lead="Real reviews from the store's Google Business Profile, shown as a saved snapshot. The live rating and total on Google may differ — tap through to see the latest."
          />

          {/* Rating summary — the count animates from 0 on scroll-in */}
          <Reveal delay={120} className="shrink-0">
            <div
              ref={ref}
              className="flex items-center gap-5 rounded-[var(--radius-lg)] border border-line-strong bg-white px-6 py-5 shadow-[var(--shadow-card)]"
            >
              <div className="text-center">
                <div className="font-display text-[2.75rem] font-extrabold leading-none tracking-[-0.03em] text-ink-950">
                  {reviewsSummary.rating.toFixed(1)}
                </div>
                <div className="mt-2">
                  <Stars
                    count={5}
                    size="1.0625rem"
                    label={`${reviewsSummary.rating} out of 5 stars`}
                  />
                </div>
              </div>
              <div className="h-14 w-px bg-line" aria-hidden="true" />
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-[1.875rem] font-extrabold leading-none tracking-[-0.02em] text-ink-950 tabular-nums">
                    {value}
                  </span>
                  <span className="text-[0.9375rem] font-semibold text-ink-500">
                    reviews
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-ink-500">
                  <Icon name="google" size={15} />
                  on Google
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-10">
          <CardCarousel
            items={reviews}
            ariaLabel="review"
            renderItem={(review) => <ReviewCard key={review.id} {...review} />}
          />
        </Reveal>

        <Reveal delay={140} className="mt-8">
          <a
            href={reviewsSummary.googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link inline-flex items-center gap-2 font-display text-[0.9375rem] font-semibold text-accent-600 transition-colors hover:text-accent-700"
          >
            See all reviews on Google
            <Icon
              name="arrowRight"
              size={16}
              className="transition-transform duration-200 group-hover/link:translate-x-0.5"
            />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
