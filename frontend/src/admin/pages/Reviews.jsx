import { useCallback, useEffect, useState } from "react";
import Icon from "../../components/Icon.jsx";
import ResourcePage from "./ResourcePage.jsx";
import { Spinner, ErrorState } from "../ui/states.jsx";
import { useToast } from "../ui/Toast.jsx";
import { useAdminAuth } from "../AdminAuth.jsx";
import {
  fetchBusinessInfoRows,
  indexByKey,
  saveBusinessInfoValues,
} from "../lib/businessInfo.js";

const inputClass =
  "h-11 w-full rounded-[var(--radius-md)] border border-line bg-white px-3.5 text-[0.9375rem] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-accent-400 focus:ring-2 focus:ring-accent-100";

/**
 * Review Summary — the headline figures shown on the homepage reviews section.
 *
 * These are the two `business_info` rows `review_count` and `review_rating`.
 * They are deliberately NOT computed from the reviews table: the CMS may hold a
 * handful of curated reviews while the homepage shows the real Google totals.
 * Editing them here writes straight through the existing
 * Admin → API → MySQL → public bootstrap pipeline.
 */
function ReviewSummary() {
  const toast = useToast();
  const { expire } = useAdminAuth();
  const [byKey, setByKey] = useState({});
  const [count, setCount] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const map = indexByKey(await fetchBusinessInfoRows());
      setByKey(map);
      setCount(map.review_count?.info_value ?? "");
      setRating(map.review_rating?.info_value ?? "");
      setStatus("ready");
    } catch (err) {
      if (err?.status === 401) {
        expire();
        return;
      }
      setStatus("error");
    }
  }, [expire]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const countNum = Number(count);
    if (!Number.isFinite(countNum) || countNum < 0 || !Number.isInteger(countNum)) {
      toast.error("Total reviews must be a whole number (0 or more).");
      return;
    }
    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      toast.error("Overall rating must be between 0 and 5.");
      return;
    }

    setSaving(true);
    try {
      const written = await saveBusinessInfoValues(byKey, [
        { info_key: "review_count", value: String(countNum) },
        { info_key: "review_rating", value: String(ratingNum) },
      ]);
      toast[written === 0 ? "info" : "success"](
        written === 0 ? "No changes to save." : "Review summary saved."
      );
      await load();
    } catch (err) {
      if (err?.status === 401) {
        toast.error("Your session expired. Please sign in again.");
        expire();
        return;
      }
      toast.error(err?.message || "Could not save the review summary.");
    } finally {
      setSaving(false);
    }
  };

  const missing = status === "ready" && (!byKey.review_count || !byKey.review_rating);

  return (
    <section className="mb-8 rounded-[var(--radius-lg)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent-50 text-accent-600">
          <Icon name="star" size={17} />
        </span>
        <div>
          <h2 className="font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
            Review Summary
          </h2>
          <p className="text-[0.8125rem] text-ink-500">
            The total count and overall rating shown on the homepage. Not calculated
            from the reviews below.
          </p>
        </div>
      </div>

      {status === "loading" ? (
        <div className="flex items-center gap-2 py-6 text-ink-500">
          <Spinner size={18} /> Loading summary…
        </div>
      ) : status === "error" ? (
        <div className="pt-4">
          <ErrorState body="Could not load the review summary." onRetry={load} />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="rs-count" className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-700">
                Total Reviews
              </label>
              <input
                id="rs-count"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                disabled={!byKey.review_count}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="rs-rating" className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-700">
                Overall Rating
              </label>
              <input
                id="rs-rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                inputMode="decimal"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                disabled={!byKey.review_rating}
                className={inputClass}
              />
            </div>
          </div>

          {missing ? (
            <p className="mt-3 text-[0.75rem] text-ink-400">
              A summary row is missing in the database, so it cannot be edited here.
            </p>
          ) : null}

          <div className="mt-4">
            <button
              type="submit"
              disabled={saving || missing}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-accent-600 px-5 py-2.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Summary"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

/**
 * Reviews management — the editable Review Summary on top, then the existing
 * generic review CRUD (add / edit / delete / show-hide / reorder) untouched.
 * Reviewer avatars stay auto-generated from the first letter of the name; no
 * photo is ever uploaded or fetched.
 */
export default function ReviewsAdmin() {
  return (
    <div>
      <ReviewSummary />
      <ResourcePage resource="reviews" title="Reviews" />
    </div>
  );
}
