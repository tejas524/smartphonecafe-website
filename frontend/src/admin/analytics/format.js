/**
 * Shared formatting + option lists for the Business Analytics screens.
 * All money is Indian Rupees; dates are the plain YYYY-MM-DD strings the API
 * returns (the backend keeps dates as strings to avoid timezone drift).
 */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** "₹32,500" / "₹2,450.50" — Indian digit grouping. */
export function inr(value) {
  const n = Number(value);
  return inrFormatter.format(Number.isFinite(n) ? n : 0);
}

/** Compact axis label: 1500 -> "₹1.5k", 250000 -> "₹2.5L". */
export function inrShort(value) {
  const n = Number(value) || 0;
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(a % 1e7 ? 1 : 0)}Cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(a % 1e5 ? 1 : 0)}L`;
  if (a >= 1e3) return `${sign}₹${(a / 1e3).toFixed(a % 1e3 ? 1 : 0)}k`;
  return `${sign}₹${a}`;
}

/** "2026-09-25" -> "25 Sep 2026". */
export function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return String(iso);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

/** "2026-09-25" -> "25 Sep" (compact, for chart axes/tooltips). */
export function formatDayShort(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "UTC" });
}

export const SALE_TYPES = [
  { value: "smartphone", label: "Smartphone" },
  { value: "accessory", label: "Accessory" },
  { value: "repair", label: "Repair" },
  { value: "other", label: "Other" },
];

export const TYPE_LABEL = Object.fromEntries(SALE_TYPES.map((t) => [t.value, t.label]));

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "emi", label: "EMI / Finance" },
  { value: "other", label: "Other" },
];

/** Revenue for a sale row = per-unit selling price × quantity. */
export function saleRevenue(row) {
  return (Number(row.selling_price) || 0) * (Number(row.quantity) || 0);
}
/** Cost for a sale row = per-unit cost price × quantity. */
export function saleCost(row) {
  return (Number(row.cost_price) || 0) * (Number(row.quantity) || 0);
}
/** Profit for a sale row = revenue − cost. */
export function saleProfit(row) {
  return saleRevenue(row) - saleCost(row);
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
