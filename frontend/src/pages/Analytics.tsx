import { Activity, BarChart3, CircleHelp, PieChart as PieChartIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { fetchAnalytics } from "../api/endpoints";
import type { AnalyticsData } from "../api/types";

const palette = ["#3f6f55", "#b45335", "#c58b28", "#2f6f73", "#8a6f3f"];

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-paper text-moss">{icon}</span>
        <h2 className="text-base font-bold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function Analytics() {
  const params = useParams();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchAnalytics(params.id ?? "1")
      .then((result) => {
        if (alive) setData(result);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [params.id]);

  if (loading) {
    return <div className="h-[680px] animate-pulse rounded-lg bg-white shadow-card" />;
  }
  if (!data) {
    return <div className="rounded-lg border border-clay/30 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">Could not load analytics.</div>;
  }

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.progress.percent / 100) * circumference;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-moss">Project analytics</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">SC6105 Group Project health</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-moss" />
            <h2 className="text-base font-bold text-ink">Overall progress</h2>
          </div>
          <div className="mt-6 flex items-center justify-center">
            <div className="relative h-48 w-48">
              <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
                <circle cx="90" cy="90" r={radius} fill="none" stroke="#e7e2d9" strokeWidth="16" />
                <circle cx="90" cy="90" r={radius} fill="none" stroke="#3f6f55" strokeWidth="16" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-ink">{data.progress.percent}%</span>
                <span className="mt-1 text-sm font-semibold text-stone-500">
                  {data.progress.completed} / {data.progress.total} done
                </span>
              </div>
            </div>
          </div>
        </section>

        <Panel title="Burndown" icon={<CircleHelp className="h-4 w-4" />}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.burndown} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#e7e2d9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="remaining" stroke="#b45335" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Completion by member" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.member_stats} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#e7e2d9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="completed" fill="#3f6f55" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total" fill="#c58b28" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Workload distribution" icon={<PieChartIcon className="h-4 w-4" />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={data.workload} dataKey="value" nameKey="name" outerRadius={105} innerRadius={58} paddingAngle={3}>
                  {data.workload.map((entry, index) => (
                    <Cell key={entry.user_id} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {data.workload.map((item, index) => (
              <div key={item.user_id} className="rounded-md bg-paper px-3 py-2 text-sm">
                <span className="block font-bold text-ink">{item.name}</span>
                <span className="text-xs font-semibold text-stone-500">{item.value} tasks</span>
                <span className="mt-1 block h-1 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
