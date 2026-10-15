import { useEffect, useState } from "react";
import RouteError from "./RouteError.jsx";
import RouteErrorBoundary from "./RouteErrorBoundary.jsx";

/**
 * Delayed loading indicator: stays invisible for a moment so near-instant
 * (already-cached) chunk loads don't flash a spinner, but reassures the user on
 * a genuinely slow fetch. Sized to roughly match page content to limit layout
 * shift.
 */
function RouteLoading() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 160);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      {show && (
        <span
          role="status"
          aria-label="Loading"
          className="h-7 w-7 animate-spin rounded-full border-2 border-line-strong border-t-accent-600"
        />
      )}
    </div>
  );
}

/**
 * Loads a route component through a dynamic import() so every page is
 * code-split. Crucially, if that import is BLOCKED (a browser privacy filter or
 * extension) or fails for any other reason, this renders a graceful, retryable
 * error state inside the app shell rather than letting the failure blank the
 * whole application.
 *
 * A successfully-loaded page is additionally wrapped in a RouteErrorBoundary so
 * a render-time exception in that page is handled the same way.
 *
 * `loader` MUST be a stable reference (define it at module scope). Retry is
 * manual only (a button) — there is no automatic retry loop.
 */
export default function LazyRoute({ loader, name = "page", homeTo = "/" }) {
  const [state, setState] = useState({ status: "loading", Comp: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", Comp: null });
    Promise.resolve()
      .then(loader)
      .then((mod) => {
        if (cancelled) return;
        const Comp = mod?.default ?? mod;
        if (!Comp) throw new Error(`Module "${name}" has no default export`);
        setState({ status: "ready", Comp });
      })
      .catch((err) => {
        if (cancelled) return;
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error(`[LazyRoute] failed to load "${name}":`, err);
        }
        setState({ status: "error", Comp: null });
      });
    return () => {
      cancelled = true;
    };
  }, [loader, name, attempt]);

  const retry = () => setAttempt((n) => n + 1);

  if (state.status === "loading") return <RouteLoading />;
  if (state.status === "error") {
    // A dynamic import() that fails is cached as a *failed module* by the
    // browser's ES-module registry, so simply calling import() again returns
    // the same rejection without re-fetching. A full reload is therefore the
    // correct, honest way to genuinely re-attempt the request (e.g. after the
    // user turns a blocker off or the network recovers). It is not a
    // cache-busting hack: it clears the failed-module state and refetches. If a
    // privacy filter is still blocking the chunk, the reload simply shows this
    // same graceful fallback again — never a blank page, and never a loop.
    return <RouteError onRetry={() => window.location.reload()} homeTo={homeTo} />;
  }

  const Comp = state.Comp;
  return (
    // Render-time errors in a page that DID load are recoverable in place, so
    // the boundary's retry re-renders without a full reload.
    <RouteErrorBoundary onRetry={retry} homeTo={homeTo}>
      <Comp />
    </RouteErrorBoundary>
  );
}
