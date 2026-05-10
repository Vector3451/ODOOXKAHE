import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Users, TrendingUp, Plane, DollarSign, Globe,
  BarChart2, PieChart, Activity, Settings, Shield,
  Search, Bell, ChevronRight, Loader2
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Traveloop" },
      { name: "description", content: "Traveloop administration and analytics dashboard." },
    ],
  }),
  component: AdminPage,
});

const PIE_COLORS = ["#4f8ef7", "#f97316", "#10b981", "#8b5cf6"];

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; sub: string; color: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-card p-5 hover:shadow-elevated transition-shadow">
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </span>
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Basic Role Check from localStorage
    const userStr = typeof window !== "undefined" ? localStorage.getItem('user') : null;
    if (!userStr) {
      navigate({ to: '/login' });
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        toast.error("Access Denied. Admin privileges required.");
        navigate({ to: '/dashboard' });
        return;
      }
    } catch (e) {
      navigate({ to: '/login' });
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const res = await adminAPI.getAnalytics();
        setData(res);
      } catch (error) {
        toast.error("Failed to load admin analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  if (loading || !data) {
    return (
      <AppShell>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying secure connection...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Admin header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Shield className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-destructive">Admin Panel</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="mt-1 text-muted-foreground text-sm">Platform-wide insights and management</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <button className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={data.stats.totalUsers} sub="Platform members" color="bg-primary/10 text-primary" />
        <StatCard icon={Plane} label="Active Trips" value={data.stats.activeTrips} sub="Trips in upcoming status" color="bg-accent/10 text-accent" />
        <StatCard icon={DollarSign} label="Managed Budgets" value={`$${data.stats.revenue.toLocaleString()}`} sub="Total trip budgets" color="bg-emerald-100 text-emerald-700" />
        <StatCard icon={Globe} label="Countries" value={data.stats.countries} sub="Destination coverage" color="bg-violet-100 text-violet-700" />
      </div>

      {/* Charts row 1: Pie + Line */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Pie chart */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <PieChart className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Trip Status Distribution</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Share of trips by status</p>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsPie>
              <Pie
                data={data.pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.pieData.map((_: any, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {data.pieData.map((d: any, i: number) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Line chart */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Growth Trends</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Monthly users and trips created</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.lineData} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#4f8ef7" strokeWidth={2} dot={false} name="Users" />
              <Line type="monotone" dataKey="trips" stroke="#f97316" strokeWidth={2} dot={false} name="Trips" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl bg-card border border-border/60 shadow-card p-6 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-foreground">Regional Breakdown</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Trips and estimated revenue by region</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.barData} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="region" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="trips" fill="#4f8ef7" radius={[4, 4, 0, 0]} name="Trips" />
            <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent users table */}
      <div className="rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Users</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search users..."
              className="h-9 w-48 rounded-xl border border-input bg-surface pl-8 pr-3 text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
            />
          </div>
        </div>
        <div className="divide-y divide-border">
          {data.recentUsers.map((u: any) => (
            <div key={u.email} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {u.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">{u.trips} trips</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  u.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"
                }`}>
                  {u.status}
                </span>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
