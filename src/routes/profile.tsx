import { createFileRoute, Link } from "@tanstack/react-router";
import {
  User, Mail, Phone, MapPin, Globe, Calendar, Edit2, Plane,
  Clock, CheckCircle2, Bookmark,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import santorini from "@/assets/trip-santorini.jpg";
import iceland from "@/assets/trip-iceland.jpg";
import bali from "@/assets/dest-bali.jpg";
import paris from "@/assets/dest-paris.jpg";
import tokyo from "@/assets/dest-tokyo.jpg";

import { authAPI, tripAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Traveloop" },
      { name: "description", content: "Your Traveloop profile and trip history." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await authAPI.getProfile();
      return res.user ?? res;
    },
  });

  const { data: allTrips } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await tripAPI.getAll();
      return res.trips ?? [];
    },
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  const profile = profileData;
  const user = {
    name:         profile?.name || 'User',
    email:        profile?.email || '',
    phone:        'Not provided',
    city:         'Unknown',
    country:      'Earth',
    joinDate:     profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
    tripsCount:   allTrips?.length || 0,
    countriesCount: 0,
    totalSpent:   `$${(allTrips ?? []).reduce((sum: number, t: any) => sum + (t.budget || 0), 0).toLocaleString()}`,
  };

  const preplannedTrips = (allTrips ?? []).filter((t: any) => t.status === 'planning' || t.status === 'upcoming');
  const previousTrips   = (allTrips ?? []).filter((t: any) => t.status === 'completed');

  const statusMeta: Record<string, { color: string; icon: typeof Clock }> = {
    active:    { color: "bg-primary/10 text-primary",      icon: Plane },
    planning:  { color: "bg-accent/15 text-accent",         icon: Bookmark },
    completed: { color: "bg-emerald-100 text-emerald-700",  icon: CheckCircle2 },
    cancelled: { color: "bg-muted text-muted-foreground",   icon: CheckCircle2 },
    // legacy aliases
    Upcoming:  { color: "bg-primary/10 text-primary",      icon: Plane },
    Planning:  { color: "bg-accent/15 text-accent",         icon: Bookmark },
    Completed: { color: "bg-emerald-100 text-emerald-700",  icon: CheckCircle2 },
    upcoming:  { color: "bg-primary/10 text-primary",      icon: Plane },
  };

  function TripCard({ trip }: { trip: any }) {
    const meta = statusMeta[trip.status] ?? statusMeta.Planning;
    const StatusIcon = meta.icon;
    return (
      <Link to="/itinerary-builder/$tripId" params={{ tripId: String(trip.id) }} className="group rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden hover:shadow-elevated transition-all block">
        <div className="relative h-40 overflow-hidden">
          <img src={trip.coverImage || santorini} alt={trip.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold inline-flex items-center gap-1 ${meta.color} bg-surface/95`}>
            <StatusIcon className="h-3 w-3" /> {trip.status}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground text-sm">{trip.title}</h3>
          <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {trip.dates}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {trip.cities || 1} cities</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <AppShell>
      {/* Profile header card */}
      <div className="rounded-3xl bg-gradient-hero p-6 sm:p-8 shadow-elevated text-primary-foreground mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar className="h-20 w-20 ring-4 ring-primary-foreground/25 shrink-0">
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-2xl font-bold">
              {user.name.split(" ").map((n: string) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
            <p className="mt-1 text-primary-foreground/80 text-sm inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {user.city}, {user.country}
            </p>
            <p className="text-primary-foreground/60 text-xs mt-0.5">Member since {user.joinDate}</p>
          </div>
          <Button variant="outline" className="shrink-0 bg-primary-foreground/15 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/25 rounded-xl">
            <Edit2 className="h-4 w-4 mr-1.5" /> Edit Profile
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl bg-primary-foreground/10 p-4">
          {[
            { label: "Trips", value: user.tripsCount },
            { label: "Countries", value: user.countriesCount },
            { label: "Spent", value: user.totalSpent },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl sm:text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-primary-foreground/70 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal details */}
      <div className="rounded-2xl bg-card border border-border/60 shadow-card p-6 mb-8">
        <h2 className="text-base font-bold text-foreground mb-4">Personal Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Mail, label: "Email", value: user.email },
            { icon: Phone, label: "Phone", value: user.phone },
            { icon: Globe, label: "Country", value: user.country },
            { icon: MapPin, label: "City", value: user.city },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{f.label}</p>
                <p className="text-sm font-medium text-foreground">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column trip grids */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Preplanned trips */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Preplanned Trips</h2>
            <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">{preplannedTrips.length}</span>
          </div>
          <div className="space-y-4">
            {preplannedTrips.map((t: any) => <TripCard key={t.id} trip={t} />)}
          </div>
        </section>

        {/* Previous trips */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Previous Trips</h2>
            <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">{previousTrips.length}</span>
          </div>
          <div className="space-y-4">
            {previousTrips.map((t: any) => <TripCard key={t.id} trip={t} />)}
            {previousTrips.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-12 text-center">
                <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No completed trips yet</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

