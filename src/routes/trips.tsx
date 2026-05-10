import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus, Calendar, MapPin, Clock, Wallet,
  CheckCircle2, Plane, Bookmark, ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import santorini from "@/assets/trip-santorini.jpg";
import iceland from "@/assets/trip-iceland.jpg";
import bali from "@/assets/dest-bali.jpg";
import paris from "@/assets/dest-paris.jpg";
import tokyo from "@/assets/dest-tokyo.jpg";

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

type TripStatus = "ongoing" | "upcoming" | "completed";

const statusMeta: Record<string, { label: string; icon: typeof Plane; color: string; dot: string }> = {
  // schema v4 statuses
  active:    { label: "Ongoing",   icon: Plane,        color: "text-primary bg-primary/10",        dot: "bg-primary" },
  planning:  { label: "Planning",  icon: Bookmark,     color: "text-accent bg-accent/10",           dot: "bg-accent" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-emerald-700 bg-emerald-100",    dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", icon: CheckCircle2, color: "text-muted-foreground bg-muted",     dot: "bg-muted-foreground" },
  // legacy aliases
  ongoing:   { label: "Ongoing",   icon: Plane,        color: "text-primary bg-primary/10",        dot: "bg-primary" },
  upcoming:  { label: "Up-coming", icon: Bookmark,     color: "text-accent bg-accent/10",           dot: "bg-accent" },
};

function TripRow({ trip }: { trip: any }) {
  const meta = statusMeta[trip.status as TripStatus] || statusMeta.upcoming;
  const Icon = meta.icon;
  return (
    <Link to="/itinerary-builder/$tripId" params={{ tripId: String(trip.id) }} className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-card hover:shadow-elevated hover:border-primary/30 transition-all">
      <div className="relative h-16 w-20 shrink-0 rounded-xl overflow-hidden">
        <img src={trip.coverImage || santorini} alt={trip.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground truncate">{trip.title}</h3>
          <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.color}`}>
            <Icon className="h-3 w-3" /> {meta.label}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {trip.dates}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {trip.cities || 1} cities</span>
          <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" /> ${trip.budget?.toLocaleString() || '0'}</span>
        </div>
        {trip.status === "ongoing" && trip.progress !== undefined && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-muted-foreground">Trip progress</span>
              <span className="font-semibold text-primary">{trip.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${trip.progress}%` }} />
            </div>
          </div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </Link>
  );
}

function TripSection({
  status, trips,
}: {
  status: TripStatus;
  trips: any[];
}) {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  const count = trips.length;
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${meta.color}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-base font-bold text-foreground">{meta.label}</h2>
        <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">{count}</span>
      </div>
      {count === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-10 text-center">
          <p className="text-sm text-muted-foreground">No {meta.label.toLowerCase()} trips</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((t) => <TripRow key={t.id} trip={t} />)}
        </div>
      )}
    </section>
  );
}

function TripsListPage() {
  const [activeTab, setActiveTab] = useState<TripStatus | "all">("all");

  const { data: allTrips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await tripAPI.getAll();
      return res.trips ?? [];
    },
  });

  const tabs: { key: TripStatus | "all"; label: string }[] = [
    { key: "all", label: "All Trips" },
    { key: "ongoing", label: "Ongoing" },
    { key: "upcoming", label: "Up-coming" },
    { key: "completed", label: "Completed" },
  ];

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  const trips = allTrips || [];
  // Backend statuses: planning, upcoming, active, completed
  const ongoingTrips   = trips.filter((t: any) => t.status === 'active' || t.status === 'ongoing');
  const upcomingTrips  = trips.filter((t: any) => t.status === 'planning' || t.status === 'upcoming');
  const completedTrips = trips.filter((t: any) => t.status === 'completed');

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Trips</h1>
          <p className="mt-1.5 text-muted-foreground text-sm inline-flex items-center gap-2">
            <Clock className="h-4 w-4" /> {trips.length} total trips
          </p>
        </div>
        <Link to="/create-trip">
          <Button className="h-11 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-elevated">
            <Plus className="h-4 w-4 mr-1.5" /> New Trip
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { title: "Ongoing", count: ongoingTrips.length, ...statusMeta.ongoing },
          { title: "Up-coming", count: upcomingTrips.length, ...statusMeta.upcoming },
          { title: "Completed", count: completedTrips.length, ...statusMeta.completed },
        ].map((s) => (
          <div key={s.title} className="rounded-2xl bg-card border border-border/60 shadow-card p-4 text-center">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.color} mb-2`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === t.key
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "all" ? (
        <div className="space-y-8">
          {ongoingTrips.length > 0 && <TripSection status="ongoing" trips={ongoingTrips} />}
          {upcomingTrips.length > 0 && <TripSection status="upcoming" trips={upcomingTrips} />}
          {completedTrips.length > 0 && <TripSection status="completed" trips={completedTrips} />}
          {trips.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-20 text-center">
              <Plane className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No trips yet.</p>
              <Link to="/create-trip" className="mt-4 inline-block">
                <Button variant="outline" className="rounded-xl">Start Planning</Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <TripSection
          status={activeTab as TripStatus}
          trips={trips.filter((t: any) => t.status === activeTab)}
        />
      )}
    </AppShell>
  );
}
