import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "./ui";
import { compact, money, STATUS_COLOR } from "../utils";

export function BudgetBarChart({ data }) {
  if (!data?.length) return <EmptyState title="No budget data" />;
  return (
    <div className="h-72">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 0, right: 8 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(var(--gray-200))"
            vertical={false}
          />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 12, fill: "rgb(var(--gray-600))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={compact}
            tick={{ fontSize: 12, fill: "rgb(var(--gray-600))" }}
            width={60}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => money(v)}
            cursor={{ fill: "rgb(var(--green-50))" }}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid rgb(var(--gray-200))",
            }}
          />
          <Legend />
          <Bar
            dataKey="allocated"
            name="Allocated"
            fill="rgb(var(--gov-forest))"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="disbursed"
            name="Disbursed"
            fill="rgb(var(--green-500))"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const DONUT = [
  "rgb(var(--gov-forest))",
  "rgb(var(--green-500))",
  "rgb(var(--green-300))",
  "rgb(var(--gray-400))",
  "rgb(var(--green-700))",
  "rgb(var(--green-200))",
];

export function DonutChart({
  data,
  nameKey,
  valueKey,
  statusColors,
  formatter,
}) {
  const filtered = (data || []).filter((item) => item[valueKey] > 0);
  if (!filtered.length) return <EmptyState title="No data to chart" />;
  return (
    <div className="h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={filtered}
            dataKey={valueKey}
            nameKey={nameKey}
            innerRadius={62}
            outerRadius={96}
            paddingAngle={3}
            stroke="rgb(var(--color-white))"
            strokeWidth={2}
          >
            {filtered.map((item, index) => (
              <Cell
                key={index}
                fill={
                  statusColors
                    ? STATUS_COLOR[item[nameKey]]
                    : DONUT[index % DONUT.length]
                }
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => (formatter ? formatter(value) : value)}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid rgb(var(--gray-200))",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
