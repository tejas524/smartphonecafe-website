import Icon from "../../components/Icon.jsx";
import { inr } from "./format.js";

/**
 * The five headline KPIs. Values are computed server-side; this only presents
 * them. Net / gross profit turn red when negative so a loss is never hidden by
 * a neutral colour. A zero month still renders every card (showing ₹0), which is
 * the honest empty state — no fabricated numbers.
 */
const CARDS = [
  { key: "revenue", label: "Total Revenue", icon: "banknote", tone: "accent", hint: "Selling price × quantity" },
  { key: "cost", label: "Total Cost", icon: "wallet", tone: "neutral", hint: "Cost price × quantity" },
  { key: "grossProfit", label: "Gross Profit", icon: "trendingUp", tone: "profit", hint: "Revenue − Cost" },
  { key: "expenses", label: "Expenses", icon: "receipt", tone: "neutral", hint: "Business expenses" },
  { key: "netProfit", label: "Net Profit", icon: "chart", tone: "profit", hint: "Gross Profit − Expenses" },
];

function iconClasses(tone, value) {
  if (tone === "accent") return "bg-accent-50 text-accent-600";
  if (tone === "profit") return value < 0 ? "bg-red-50 text-red-600" : "bg-wa-500/10 text-wa-700";
  return "bg-paper-mute text-ink-500";
}

function valueClasses(tone, value) {
  if (tone === "profit" && value < 0) return "text-red-600";
  if (tone === "profit") return "text-wa-700";
  return "text-ink-950";
}

export default function KpiCards({ summary }) {
  const s = summary || {};
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((c) => {
        const value = Number(s[c.key] || 0);
        return (
          <div
            key={c.key}
            className="rounded-[var(--radius-lg)] border border-line bg-white p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${iconClasses(c.tone, value)}`}>
                <Icon name={c.icon} size={18} />
              </span>
            </div>
            <p className="mt-3 text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-ink-500">
              {c.label}
            </p>
            <p className={`mt-0.5 font-display text-[1.375rem] font-extrabold tracking-[-0.02em] sm:text-[1.5rem] ${valueClasses(c.tone, value)}`}>
              {inr(value)}
            </p>
            <p className="mt-0.5 text-[0.6875rem] text-ink-400">{c.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
