import Button from "./ui/Button.jsx";
import Icon from "./Icon.jsx";
import usePageMeta from "../utils/usePageMeta.js";

/**
 * Graceful, user-facing fallback shown when a route's code fails to load or
 * throws while rendering. It renders INSIDE the normal app shell (header/footer
 * stay in place), so a single failed route never becomes a blank page.
 *
 * Deliberately reveals no technical detail (no stack, path, or internal state) —
 * technical diagnostics are logged to the console in development only.
 */
export default function RouteError({ onRetry, homeTo = "/" }) {
  usePageMeta({
    title: "Page unavailable",
    description: "This page could not be loaded. Please try again.",
    path: "/error",
  });

  return (
    <section className="shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-400/30">
        <Icon name="alert" size={24} />
      </span>
      <h1 className="mt-5 text-[1.75rem] font-extrabold tracking-[-0.02em] text-ink-950 sm:text-[2.25rem]">
        This page couldn&rsquo;t be loaded.
      </h1>
      <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ink-600">
        Part of this page failed to load &mdash; this can happen if a browser
        privacy filter or extension blocks a file, or the connection dropped.
        Nothing was lost. Try again, or head back to the homepage.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {onRetry && (
          <Button variant="primary" size="lg" icon="refresh" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button to={homeTo} variant="outline" size="lg">
          Go to homepage
        </Button>
      </div>
    </section>
  );
}
