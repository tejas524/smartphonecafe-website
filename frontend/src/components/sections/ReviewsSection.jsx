import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import CardCarousel from "../ui/CardCarousel.jsx";
import Icon from "../Icon.jsx";
import { useSiteData } from "../../context/SiteData.jsx";
import useCountUp from "../../utils/useCountUp.js";

/**
 * Google Reviews — a data-driven social-proof section (data/reviews.js).
 *
 * Reads `reviewsSummary` (rating + reviewCount + googleUrl) and `reviews` only,
 * so the same UI works when the data is later served from an API. The review
 * count animates 0 → reviewsSummary.reviewCount when the summary scrolls into
 * view (once per visit; reduced motion shows the final value immediately). No
 * star-distribution chart is recreated and no data is invented.
 *
 * Stars use Google's review gold (#fbbc04) — a functional review colour applied
 * only to stars, the same principle by which WhatsApp green is reserved for
 * WhatsApp. The brand blue/charcoal palette is otherwise unchanged.
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

function ReviewCard(review) {
  return (
    <article className="flex h-full w-full flex-col rounded-[var(--radius-md)] border border-line bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[1rem] font-bold tracking-[-0.015em] text-ink-950">
            {review.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <Stars count={review.rating} size="0.9375rem" />
            <span className="text-[0.75rem] text-ink-400">{review.date}</span>
          </div>
        </div>
        {review.isNew && (
          <span className="shrink-0 rounded-full border border-accent-400/40 bg-accent-50 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-accent-700">
            New
          </span>
        )}
      </div>

      <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:6] overflow-hidden">
        {review.text}
      </p>

      <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[0.75rem] text-ink-400">
        <Icon name="google" size={14} className="shrink-0" />
        <span>Posted on Google</span>
        {review.photos ? (
          <span className="ml-auto">
            {review.photos} photo{review.photos > 1 ? "s" : ""}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export default function ReviewsSection() {
  const { reviews, reviewsSummary } = useSiteData();
  const { ref, value } = useCountUp(reviewsSummary.reviewCount, { duration: 1300 });

  return (
    <section className="bg-white" aria-labelledby="reviews-heading">
      <div className="shell py-16 lg:py-24">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Google reviews"
            id="reviews-heading"
            title="What customers say about SmartphoneCafe"
            lead="Real reviews from the store's Google Business Profile. Ratings and the total count are shown exactly as they appear on Google."
          />

          {/* Rating summary — the count animates from 0 on scroll-in */}
          <Reveal delay={120} className="shrink-0">
            <div
              ref={ref}
              className="flex items-center gap-5 rounded-[var(--radius-md)] border border-line bg-paper-soft px-6 py-5"
            >
              <div className="text-center">
                <div className="font-display text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] text-ink-950">
                  {reviewsSummary.rating.toFixed(1)}
                </div>
                <div className="mt-1.5">
                  <Stars
                    count={5}
                    size="1rem"
                    label={`${reviewsSummary.rating} out of 5 stars`}
                  />
                </div>
              </div>
              <div className="h-12 w-px bg-line" aria-hidden="true" />
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.02em] text-ink-950 tabular-nums">
                    {value}
                  </span>
                  <span className="text-[0.9375rem] font-semibold text-ink-500">
                    reviews
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] text-ink-500">
                  <Icon name="google" size={14} />
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
