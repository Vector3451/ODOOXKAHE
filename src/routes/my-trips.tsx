import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, MapPin, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import santorini from "@/assets/trip-santorini.jpg";
import iceland from "@/assets/trip-iceland.jpg";
import bali from "@/assets/dest-bali.jpg";

export const Route = createFileRoute("/my-trips")({
  head: () => ({
    meta: [
      { title: "My Trips — Traveloop" },
      { name: "description", content: "All your planned and past trips." },
    ],
  }),
  component: MyTrips,
});

const trips = [
  { name: "Santorini Escape", dates: "Jun 12 – Jun 19, 2026", img: santorini, status: "Upcoming", cities: 3 },
  { name: "Iceland Aurora Hunt", dates: "Sep 03 – Sep 11, 2026", img: iceland, status: "Planning", cities: 2 },
  { name: "Bali Retreat", dates: "Mar 02 – Mar 14, 2025", img: bali, status: "Completed", cities: 4 },
];

function MyTrips() {
  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Trips</h1>
          <p className="mt-1.5 text-muted-foreground">{trips.length} trips planned</p>
        </div>
        <Link to="/create-trip">
          <Button className="h-11 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-elevated">
            <Plus className="h-4 w-4 mr-1.5" /> New Trip
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {trips.map((t) => (
          <Link to="/itinerary-builder" key={t.name} className="group rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden hover:shadow-elevated transition-all">
            <div className="relative h-44 overflow-hidden">
              <img src={t.img} alt={t.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-3 left-3 rounded-full bg-surface/95 px-2.5 py-1 text-[11px] font-semibold text-foreground">{t.status}</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground">{t.name}</h3>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {t.dates}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {t.cities}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
