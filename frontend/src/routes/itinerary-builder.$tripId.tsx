import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, MapPin, GripVertical, Clock, Trash2, Calendar } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { tripAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/itinerary-builder/$tripId")({
  head: () => ({
    meta: [
      { title: "Itinerary Builder — Traveloop" },
      { name: "description", content: "Build your multi-city trip itinerary." },
    ],
  }),
  component: Builder,
});

function Builder() {
  const { tripId } = useParams({ from: "/itinerary-builder/$tripId" });
  const { data: tripData, isLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => tripAPI.getById(tripId),
    enabled: !!tripId,
  });

  const [stops, setStops] = useState<any[]>([]);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (tripData?.trip) {
      const dests = tripData.trip.destinations ? tripData.trip.destinations.split(',') : ["New Destination"];
      setStops(dests.map((d: string, i: number) => ({
        id: i + 1,
        city: d.trim(),
        country: "",
        days: 3
      })));
      setActive(1);
    }
  }, [tripData]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  const trip = tripData?.trip || {};
  const current = stops.find((s) => s.id === active) ?? stops[0] ?? { city: "Destination", country: "", days: 0 };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{trip.title || "Untitled Trip"}</h1>
        <p className="mt-1.5 text-muted-foreground inline-flex items-center gap-2">
          <Calendar className="h-4 w-4" /> {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "TBD"} — {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "TBD"} · {stops.length} cities
        </p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar (cities) */}
        <aside className="rounded-2xl bg-card border border-border/60 shadow-card p-4 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Stops</h2>
            <span className="text-xs font-medium text-muted-foreground">{stops.length}</span>
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {stops.map((s, i) => {
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`group min-w-[180px] lg:min-w-0 flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-card"
                      : "border-border bg-surface hover:border-primary/40 hover:bg-muted"
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground hidden lg:block" />
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground truncate">{s.city}</p>
                    <p className="text-xs text-muted-foreground">{s.days} days</p>
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            onClick={() => setStops([...stops, { id: Date.now(), city: "New City", country: "", days: 1 }])}
            variant="outline"
            className="mt-3 w-full h-11 rounded-xl border-dashed border-2 border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Stop
          </Button>
        </aside>

        {/* Main: days + activities */}
        <section className="space-y-5">
          <div className="rounded-2xl bg-gradient-hero p-6 shadow-elevated text-primary-foreground">
            <p className="text-xs font-medium uppercase tracking-wider opacity-80 inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Currently editing
            </p>
            <h2 className="mt-1 text-2xl font-bold">{current.city}{current.country && `, ${current.country}`}</h2>
            <p className="mt-1 text-primary-foreground/85 text-sm">{current.days} days planned</p>
          </div>

          {Array.from({ length: current.days }).map((_, dayIdx) => (
            <DayBlock key={dayIdx} day={dayIdx + 1} />
          ))}

          <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all">
            <Plus className="h-4 w-4 mr-1.5" /> Add another day
          </Button>
        </section>
      </div>
    </AppShell>
  );
}

const sampleActivities: Record<number, { time: string; title: string; cost: string }[]> = {
  1: [
    { time: "09:00", title: "Arrive at Santorini Airport", cost: "$0" },
    { time: "13:00", title: "Lunch at Ammoudi Bay", cost: "$45" },
    { time: "18:00", title: "Sunset in Oia", cost: "Free" },
  ],
  2: [
    { time: "10:00", title: "Catamaran cruise", cost: "$120" },
  ],
};

function DayBlock({ day }: { day: number }) {
  const items = sampleActivities[day] ?? [];
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
            {day}
          </span>
          <div>
            <p className="font-semibold text-foreground">Day {day}</p>
            <p className="text-xs text-muted-foreground">{items.length} activities</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="text-primary hover:text-primary-hover hover:bg-primary/10 rounded-lg">
          <Plus className="h-4 w-4 mr-1" /> Activity
        </Button>
      </div>
      <div className="p-4 space-y-2">
        {items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 py-8 text-center">
            <p className="text-sm text-muted-foreground">Drag or add activities for this day</p>
          </div>
        ) : (
          items.map((a, i) => (
            <div key={i} className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:border-primary/40 hover:shadow-card transition-all">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary min-w-[60px]">
                <Clock className="h-3.5 w-3.5" /> {a.time}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{a.title}</p>
              </div>
              <span className="text-sm font-semibold text-foreground">{a.cost}</span>
              <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
