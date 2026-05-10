import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Wallet, TrendingUp, Calendar, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import santorini from "@/assets/trip-santorini.jpg";
import iceland from "@/assets/trip-iceland.jpg";
import bali from "@/assets/dest-bali.jpg";
import paris from "@/assets/dest-paris.jpg";
import tokyo from "@/assets/dest-tokyo.jpg";
import newyork from "@/assets/dest-newyork.jpg";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Traveloop" },
      { name: "description", content: "Your trips, budgets, and recommended destinations." },
    ],
  }),
  component: Dashboard,
});

const recentTrips = [
  { name: "Santorini Escape", dates: "Jun 12 – Jun 19", img: santorini, status: "Upcoming", statusColor: "bg-blue-100 text-blue-700" },
  { name: "Iceland Aurora Hunt", dates: "Sep 03 – Sep 11", img: iceland, status: "Planning", statusColor: "bg-slate-100 text-slate-600" },
  { name: "Bali Retreat", dates: "Mar 02 – Mar 14", img: bali, status: "Completed", statusColor: "bg-green-100 text-green-700" },
];

const destinations = [
  { name: "Paris", country: "France", img: paris },
  { name: "Tokyo", country: "Japan", img: tokyo },
  { name: "New York", country: "USA", img: newyork },
  { name: "Bali", country: "Indonesia", img: bali },
];

const spendData = [
  { month: "Jan", value: 1200 },
  { month: "Feb", value: 1800 },
  { month: "Mar", value: 2400 },
  { month: "Apr", value: 2100 },
  { month: "May", value: 3200 },
  { month: "Jun", value: 2800 },
];

function Dashboard() {
  return (
    <AppShell>
      {/* ── Hero: soft blue gradient ─────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-slate-50 border border-slate-200 p-7 sm:p-10 mb-8">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Ready for your next adventure
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              Welcome back, Alex 👋
            </h1>
            <p className="mt-2 text-slate-500 max-w-lg text-sm sm:text-base">
              You have <span className="font-semibold text-blue-600">1 upcoming trip</span> in 23 days. Let's make it unforgettable.
            </p>
          </div>
          <Link to="/create-trip" className="shrink-0">
            <Button className="h-12 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md transition-all hover:scale-[1.02] hover:shadow-lg">
              <Plus className="h-5 w-5 mr-1.5" /> Plan New Trip
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Budget widgets ────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard icon={Wallet}    label="Total Spent This Year" value="$4,820" sub="across 3 trips"      color="blue" />
        <StatCard icon={TrendingUp} label="Upcoming Trip Budget"  value="$2,400" sub="Santorini Escape"    color="orange" />
        <StatCard icon={Calendar}  label="Days Until Next Trip"  value="23"     sub="Jun 12, 2026"         color="slate" />
      </section>

      {/* ── Spending Trend ───────────────────────────────────────── */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-card p-6 mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Monthly Spend Trend</h2>
            <p className="text-sm text-slate-500 mt-0.5">Budget utilization across all trips</p>
          </div>
          <Link to="/invoice" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
            View Breakdown <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendData}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                itemStyle={{ fontSize: "12px", fontWeight: "600", color: "#2563eb" }} />
              <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5}
                fill="url(#blueGrad)"
                dot={{ r: 3.5, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Recent Trips ─────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Recent Trips</h2>
          <Link to="/my-trips" className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentTrips.map((t) => (
            <article key={t.name}
              className="group rounded-2xl bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="aspect-video overflow-hidden">
                <img src={t.img} alt={t.name} loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">{t.name}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${t.statusColor}`}>{t.status}</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500 inline-flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> {t.dates}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Recommended destinations ─────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recommended for You</h2>
            <p className="text-sm text-slate-500 mt-0.5">Inspiring destinations to spark your next plan</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {destinations.map((d) => (
            <article key={d.name}
              className="group relative rounded-2xl overflow-hidden shadow-card hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={d.img} alt={d.name} loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80 inline-flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" /> {d.country}
                </p>
                <h3 className="text-base font-bold mt-0.5">{d.name}</h3>
                <button className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold rounded-full bg-white/20 backdrop-blur text-white px-2.5 py-1 hover:bg-orange-500 transition-colors">
                  Explore <ArrowRight className="h-2.5 w-2.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub: string;
  color: "blue" | "orange" | "slate";
}) {
  const cfg = {
    blue:   { icon: "bg-blue-50 text-blue-600",   val: "text-blue-600" },
    orange: { icon: "bg-orange-50 text-orange-500", val: "text-orange-500" },
    slate:  { icon: "bg-slate-100 text-slate-600",  val: "text-slate-900" },
  } as const;
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-card hover:shadow-md transition-shadow">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${cfg[color].icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${cfg[color].val}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}
