import { business } from "../data/site.js";

/**
 * Opening-hours logic.
 *
 * The Google listing confirms the shop keeps identical hours every day of the
 * week: 10:00–21:30. The status is computed against Asia/Kolkata regardless of
 * where the visitor is browsing from, so "Open now" is never wrong for the
 * people who actually need it.
 */
const OPEN_MIN = 10 * 60; // 10:00
const CLOSE_MIN = 21 * 60 + 30; // 21:30

const istFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  weekday: "short",
});

export function getStoreStatus(now = new Date()) {
  let parts;
  try {
    parts = istFormatter.formatToParts(now);
  } catch {
    // Extremely old browsers without timeZone support: fail open, no false claim.
    return { known: false };
  }

  const get = (type) => parts.find((p) => p.type === type)?.value;
  const h = Number(get("hour"));
  const m = Number(get("minute"));

  if (!Number.isFinite(h) || !Number.isFinite(m)) return { known: false };

  const mins = h * 60 + m;
  const isOpen = mins >= OPEN_MIN && mins < CLOSE_MIN;

  return {
    known: true,
    isOpen,
    label: isOpen ? "Open now" : "Closed now",
    detail: isOpen
      ? `Closes ${business.hours.closes === "21:30" ? "9:30 pm" : business.hours.closes}`
      : "Opens 10:00 am",
  };
}