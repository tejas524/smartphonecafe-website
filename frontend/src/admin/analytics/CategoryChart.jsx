import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { inr, inrShort, TYPE_LABEL } from "./format.js";

const GRID = "#e4e8ee";
const AXIS = "#7b8698";
/* One colour per sale type, all from the site palette. */
const TYPE_COLOR = {
  smartphone: "#0b53e8", // accent-600
  accessory: "#5b8cff", // accent-400
  repair: "#1da851", // wa-600
  other: "#7b8698", // ink-400
};

function CategoryTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-white px-3 py-2 shadow-[var(--shadow-lift)]">
      <p className="mb-1 text-[0.75rem] font-semibold text-ink-700">{row.label}</p>
      <p className="text-[0.8125rem] text-ink-600">Revenue <span className="font-semibold text-ink-900">{inr(row.revenue)}</span></p>
      <p className="text-[0.8125rem] text-ink-600">Profit <span className="font-semibold text-ink-900">{inr(row.profit)}</span></p>
      <p className="text-[0.8125rem] text-ink-500">{row.count} sale{row.count === 1 ? "" : "s"}</p>
    </div>
  );
}

/**
 * Revenue by sale category. Only categories with real sales are passed in, so an
 * empty category never shows a phantom bar.
 */
export default function CategoryChart({ categories }) {
  const data = (categories || []).map((c) => ({
    ...c,
    label: TYPE_LABEL[c.type] || c.type,
  }));

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: AXIS }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            tickMargin={8}
          />
          <YAxis
            tickFormatter={inrShort}
            tick={{ fontSize: 11, fill: AXIS }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip content={<CategoryTooltip />} cursor={{ fill: "rgba(11,83,232,0.05)" }} />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={72}>
            {data.map((d) => (
              <Cell key={d.type} fill={TYPE_COLOR[d.type] || "#7b8698"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
