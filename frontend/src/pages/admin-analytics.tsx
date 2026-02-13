import { useQuery } from "@tanstack/react-query";
import { http } from "../api/http";
import type { ApiResponse } from "../types/domain";
import type { AnalyticsPayload } from "../types/form-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export const AdminAnalyticsPage = () => {
  const analytics = useQuery({
    queryKey: ["analytics", "admin"],
    queryFn: async () => {
      const res =
        await http.get<ApiResponse<AnalyticsPayload>>("/analytics/admin");
      return res.data.data;
    },
  });

  const graphData = Array.from({ length: 24 }, (_, i) => {
    const found = analytics.data?.peakHours.find((p) => p.hour === i);
    return {
      hour: `${i}:00`,
      count: found?.count ?? 0,
      hourNum: i,
    };
  });

  const maxCount = Math.max(...graphData.map((d) => d.count), 1);

  const busiestHour = [...graphData].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Live Occupancy</p>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="mt-2 text-4xl font-black text-slate-900">
            {analytics.data?.occupancyRate ?? 0}%
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all duration-1000"
              style={{ width: `${analytics.data?.occupancyRate ?? 0}%` }}
            ></div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <p className="text-sm font-medium text-slate-500">Total Revenue</p>
          <p className="mt-2 text-4xl font-black text-slate-900">
            INR {(analytics.data?.revenue ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            Accumulated from completed bookings
          </p>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <p className="text-sm font-medium text-slate-500">Busy Hour Today</p>
          <p className="mt-2 text-4xl font-black text-indigo-600 uppercase">
            {busiestHour && busiestHour.count > 0 ? busiestHour.hour : "N/A"}
          </p>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            Based on highest check-in volume
          </p>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-100 bg-white p-8 shadow-md ring-1 ring-slate-900/5">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900">
            Peak Hours Analysis
          </h2>
          <p className="text-sm text-slate-500">
            Hourly check-in volume distribution for the current day
          </p>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={graphData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                interval={1}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "12px",
                }}
              />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                fill="url(#barGradient)"
              >
                {graphData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fillOpacity={0.4 + (entry.count / maxCount) * 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  );
};
