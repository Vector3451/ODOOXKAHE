import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Calendar, MapPin, DollarSign, Plane, CheckCircle2, Bookmark } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import santorini from "@/assets/trip-santorini.jpg";
import { tripAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "My Trips — Traveloop" },
      { name: "description", content: "All your ongoing, upcoming, and completed trips." },
    ],
  }),
  component: TripsListPage,
});

type TabKey = "all" | "ongoing" | "upcoming" | "completed";

const statusCfg: Record<string, { label: string; badge: string; dot: string }> = {
  active:    { label: "Ongoing",   badge: "bg-blue-100 text-blue-700",   dot: "bg-blue-500"   },
  ongoing:   { label: "Ongoing",   badge: "bg-blue-100 text-blue-700",   dot: "bg-blue-500"   },
  planning:  { label: "Up-coming", badge: "bg-orange-100 text-orange-600", dot: "bg-orange-400" },
  upcoming:  { label: "Up-coming", badge: "bg-orange-100 text-orange-600", dot: "bg-orange-400" },
  completed: { label: "Completed", badge: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  cancelled: { label: "Cancelled", badge: "bg-slate-100 text-slate-500",  dot: "bg-slate-400"  },
};

function TripCard({ trip }: { trip: any }) {
  const cfg = statusCfg[trip.status] ?? statusCfg.upcoming;
  return (
    <Link to="/itinerary-builder/$tripId" params={{ tripId: String(trip.id) }}
      className="group rounded-2xl bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-200 block">
      {/* Cover image — top half */}
      <div className="aspect-video overflow-hidden relative">
        <img src={trip.coverImage || santorini} alt={trip.title} loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>
      {/* Structured data — bottom half */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">{trip.title || trip.trip_name}</h3>
        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{trip.startDate || trip.start_date || "—"} → {trip.endDate || trip.end_date || "—"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{trip.destinations || "1 city"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span className="tabular-nums font-semibold text-slate-700">${(trip.budget ?? trip.totalBudget ?? 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TripsListPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const { data: allTrips, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const res = await tripAPI.getAll();
      return res.trips ?? [];
    },
  });

  const trips        = allTrips || [];
  const ongoing   = trips.filter((t: any) => t.status === "active"  || t.status === "ongoing");
  const upcoming  = trips.filter((t: any) => t.status === "planning" || t.status === "upcoming");
  const completed = trips.filter((t: any) => t.status === "completed");

  const filtered =
    activeTab === "all"       ? trips
    : activeTab === "ongoing"  ? ongoing
    : activeTab === "upcoming" ? upcoming
    :                            completed;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all",       label: "All Trips",  count: trips.length },
    { key: "ongoing",   label: "Ongoing",    count: ongoing.length },
    { key: "upcoming",  label: "Up-coming",  count: upcoming.length },
    { key: "completed", label: "Completed",  count: completed.length },
  ];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
          <p className="mt-1 text-slate-400 text-sm">{trips.length} total trips</p>
        </div>
        <Link to="/create-trip">
          <Button className="h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" /> New Trip
          </Button>
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {[
          { icon: Plane,        label: "Ongoing",   count: ongoing.length,   color: "text-blue-600 bg-blue-50"   },
          { icon: Bookmark,     label: "Up-coming", count: upcoming.length,  color: "text-orange-500 bg-orange-50"},
          { icon: CheckCircle2, label: "Completed", count: completed.length, color: "text-green-600 bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-slate-200 shadow-card p-4 text-center">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${s.color} mb-2`}>
              <s.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{s.count}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* LeetCode-style underline tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-0">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}>
            {t.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === t.key ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Trip grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="rounded-2xl bg-slate-100 animate-pulse aspect-[4/3]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
          <Plane className="h-8 w-8 mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-400 font-medium">No trips here yet.</p>
          <Link to="/create-trip" className="mt-4 inline-block">
            <Button className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold mt-3">Plan a Trip</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t: any) => <TripCard key={t.id} trip={t} />)}
        </div>
      )}
    </AppShell>
  );
}
