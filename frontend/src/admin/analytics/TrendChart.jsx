import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { inr, inrShort, formatDate } from "./format.js";

/* Palette drawn from the site's design tokens so the chart matches the admin. */
const C_REVENUE = "#0b53e8"; // accent-600
const C_COST = "#7b8698"; // ink-400
const C_PROFIT = "#1da851"; // wa-600
const GRID = "#e4e8ee"; // line
const AXIS = "#7b8698"; // ink-400

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const date = payload[0]?.payload?.date;
  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-white px-3 py-2 shadow-[var(--shadow-lift)]">
      <p className="mb-1 text-[0.75rem] font-semibold text-ink-700">{formatDate(date)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-[0.8125rem] text-ink-600">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="flex-1">{p.name}</span>
          <span className="font-semibold text-ink-900">{inr(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Daily revenue / cost / gross-profit trend for the selected month. Revenue and
 * gross profit read as soft-filled areas; cost is a clean line so it never hides
 * the areas. Fully responsive via ResponsiveContainer.
 */
export default function TrendChart({ data }) {
  const days = data?.length || 0;
  // Avoid crowding the x-axis: show roughly a tick a week on a full month.
  const interval = days > 20 ? 3 : days > 10 ? 1 : 0;

  return (
    <div className="h-[260px] w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rc-revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C_REVENUE} stopOpacity={0.22} />
              <stop offset="100%" stopColor={C_REVENUE} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="rc-profit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C_PROFIT} stopOpacity={0.2} />
              <stop offset="100%" stopColor={C_PROFIT} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="day"
            interval={interval}
            tick={{ fontSize: 11, fill: AXIS }}
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "0.8125rem", paddingTop: 4 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={C_REVENUE}
            strokeWidth={2}
            fill="url(#rc-revenue)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="grossProfit"
            name="Gross Profit"
            stroke={C_PROFIT}
            strokeWidth={2}
            fill="url(#rc-profit)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="cost"
            name="Cost"
            stroke={C_COST}
            strokeWidth={1.75}
            strokeDasharray="4 3"
            dot={false}
            activeDot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
