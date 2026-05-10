import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, SlidersHorizontal, Plus, MapPin,
  Calendar as CalendarIcon, ChevronDown, ChevronUp,
  Clock, Utensils, Bus, Camera, Hotel, Trash2,
  GripVertical, List, CalendarDays, DollarSign,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import destParis    from "@/assets/dest-paris.jpg";
import destTokyo   from "@/assets/dest-tokyo.jpg";
import destBali    from "@/assets/dest-bali.jpg";
import destNY      from "@/assets/dest-newyork.jpg";
import tripSantorini from "@/assets/trip-santorini.jpg";

export const Route = createFileRoute("/itinerary")({
  head: () => ({
    meta: [
      { title: "Itinerary Builder — Traveloop" },
      { name: "description", content: "Build your perfect multi-city itinerary." },
    ],
  }),
  component: ItineraryPage,
});

type Category = "food" | "transport" | "sight" | "stay";

const catMeta: Record<Category, { icon: typeof Utensils; color: string; pill: string; border: string; label: string }> = {
  food:      { icon: Utensils, color: "text-orange-500 bg-orange-50",  pill: "bg-orange-100 text-orange-700", border: "border-l-food",      label: "Food" },
  transport: { icon: Bus,      color: "text-slate-500 bg-slate-100",   pill: "bg-slate-100 text-slate-600",   border: "border-l-transport", label: "Transport" },
  sight:     { icon: Camera,   color: "text-blue-600 bg-blue-50",      pill: "bg-blue-100 text-blue-700",     border: "border-l-sight",     label: "Sightseeing" },
  stay:      { icon: Hotel,    color: "text-purple-600 bg-purple-50",  pill: "bg-purple-100 text-purple-700", border: "border-l-stay",      label: "Stay" },
};

const catalog = [
  { id: "a1", title: "Eiffel Tower Skip-the-Line", city: "Paris",     cost: 65,  category: "sight"     as Category, image: destParis },
  { id: "a2", title: "Sushi Omakase Dinner",       city: "Tokyo",     cost: 120, category: "food"      as Category, image: destTokyo },
  { id: "a3", title: "Sunset Catamaran Cruise",    city: "Santorini", cost: 95,  category: "sight"     as Category, image: tripSantorini },
  { id: "a4", title: "Ubud Rice Terrace Tour",     city: "Bali",      cost: 40,  category: "sight"     as Category, image: destBali },
  { id: "a5", title: "Broadway Show: Hamilton",    city: "New York",  cost: 180, category: "sight"     as Category, image: destNY },
  { id: "a6", title: "Airport Transfer",           city: "Paris",     cost: 35,  category: "transport" as Category, image: destParis },
];

type Act = { id: string; time: string; title: string; cost: number; category: Category };
type Day = { day: number; date: string; activities: Act[] };
type Stop = { id: string; city: string; country: string; dateRange: string; days: Day[] };

const initStops: Stop[] = [
  {
    id: "s1", city: "Paris", country: "France", dateRange: "Jun 12 — Jun 14",
    days: [
      { day: 1, date: "Jun 12", activities: [
        { id: "i1", time: "10:00", title: "Louvre Museum Visit",   cost: 22, category: "sight" },
        { id: "i2", time: "13:30", title: "Lunch at Le Marais",    cost: 45, category: "food" },
        { id: "i3", time: "19:00", title: "Seine River Cruise",    cost: 35, category: "sight" },
      ]},
      { day: 2, date: "Jun 13", activities: [
        { id: "i4", time: "09:00", title: "Train to Versailles",   cost: 18, category: "transport" },
        { id: "i5", time: "11:00", title: "Palace of Versailles",  cost: 28, category: "sight" },
      ]},
    ],
  },
  {
    id: "s2", city: "Santorini", country: "Greece", dateRange: "Jun 15 — Jun 18",
    days: [{ day: 1, date: "Jun 15", activities: [
      { id: "i6", time: "14:00", title: "Hotel Check-in, Oia",    cost: 220, category: "stay" },
      { id: "i7", time: "20:00", title: "Sunset Dinner at Ammoudi",cost: 80, category: "food" },
    ]}],
  },
];

export default function ItineraryPage() {
  const [stops, setStops]           = useState<Stop[]>(initStops);
  const [view, setView]             = useState<"list" | "calendar">("list");
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [costFilter, setCostFilter] = useState("all");
  const [collapsed, setCollapsed]   = useState<Record<string, boolean>>({});

  const filtered = catalog.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.city.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && a.category !== typeFilter) return false;
    if (costFilter === "low"  && a.cost > 50)            return false;
    if (costFilter === "mid"  && (a.cost <= 50 || a.cost > 120)) return false;
    if (costFilter === "high" && a.cost <= 120)          return false;
    return true;
  });

  const addActivity = (a: typeof catalog[number]) => {
    setStops((prev) => {
      const next = [...prev];
      const target = next[0];
      if (!target || target.days.length === 0) return prev;
      target.days[0].activities.push({ id: `${a.id}-${Date.now()}`, time: "12:00", title: a.title, cost: a.cost, category: a.category });
      return next;
    });
  };

  const removeActivity = (stopId: string, dayIdx: number, itemId: string) => {
    setStops((prev) => prev.map((s) =>
      s.id !== stopId ? s : {
        ...s,
        days: s.days.map((d, i) => i !== dayIdx ? d : { ...d, activities: d.activities.filter((a) => a.id !== itemId) }),
      }
    ));
  };

  const addStop = () => {
    setStops((prev) => [...prev, {
      id: `s${Date.now()}`, city: "New Stop", country: "", dateRange: "Pick dates",
      days: [{ day: 1, date: "TBD", activities: [] }],
    }]);
  };

  const toggleDay = (key: string) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  return (
    <AppShell noPad>
      {/* ── Two-column workspace ─────────────────────────────────── */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

        {/* LEFT PANE — Problem List / Catalog */}
        <aside className="w-[340px] shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-5 pb-3 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Activity Catalog</h2>
            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activities & cities..."
                className="h-9 pl-8 text-sm rounded-lg border-slate-200 bg-slate-50 focus-visible:ring-1 focus-visible:ring-blue-500" />
            </div>
            {/* Filters */}
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 flex-1 rounded-lg text-xs border-slate-200 bg-slate-50">
                  <SlidersHorizontal className="h-3 w-3 mr-1.5 text-slate-400" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="sight">Sightseeing</SelectItem>
                  <SelectItem value="stay">Stay</SelectItem>
                </SelectContent>
              </Select>
              <Select value={costFilter} onValueChange={setCostFilter}>
                <SelectTrigger className="h-8 flex-1 rounded-lg text-xs border-slate-200 bg-slate-50">
                  <DollarSign className="h-3 w-3 mr-1 text-slate-400" />
                  <SelectValue placeholder="Cost" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Cost</SelectItem>
                  <SelectItem value="low">Under $50</SelectItem>
                  <SelectItem value="mid">$50 – $120</SelectItem>
                  <SelectItem value="high">$120+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Activity list — independently scrollable */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {filtered.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                No activities match.
              </div>
            )}
            {filtered.map((a) => {
              const meta = catMeta[a.category];
              const Icon = meta.icon;
              return (
                <div key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 hover:border-blue-200 hover:shadow-sm transition-all group">
                  <img src={a.image} alt={a.title} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate leading-snug">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${meta.pill}`}>
                        <Icon className="h-2.5 w-2.5" /> {meta.label}
                      </span>
                      <span className="text-[11px] text-slate-400 inline-flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" /> {a.city}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">${a.cost}</span>
                    <button onClick={() => addActivity(a)}
                      className="h-6 px-2.5 rounded-full bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1">
                      <Plus className="h-2.5 w-2.5" /> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Stop footer */}
          <div className="px-3 pb-4 pt-2 border-t border-slate-200 bg-white">
            <Button onClick={addStop} className="w-full h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold">
              <Plus className="h-4 w-4 mr-1.5" /> Add New Stop
            </Button>
          </div>
        </aside>

        {/* RIGHT PANE — Editor / Timeline */}
        <section className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shrink-0">
            <div>
              <h1 className="text-base font-bold text-slate-900">Trip Itinerary</h1>
              <p className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3" /> Jun 12 — Jun 22, 2026 · {stops.length} stops
              </p>
            </div>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="tablist">
              {(["list", "calendar"] as const).map((v) => (
                <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                    view === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}>
                  {v === "list" ? <List className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
                  {v === "list" ? "List" : "Calendar"}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {view === "list" ? (
              <div className="relative space-y-8 pl-8">
                {/* vertical timeline rail */}
                <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-blue-400 via-blue-200 to-transparent" />

                {stops.map((stop) => {
                  const total = stop.days.reduce((s, d) => s + d.activities.reduce((a, x) => a + x.cost, 0), 0);
                  return (
                    <div key={stop.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-8 top-3 h-4 w-4 rounded-full bg-blue-600 ring-4 ring-blue-100 block" />

                      {/* City header */}
                      <div className="rounded-xl bg-blue-600 px-5 py-4 text-white shadow-md mb-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <h2 className="text-lg font-bold">{stop.city}{stop.country && `, ${stop.country}`}</h2>
                            <p className="text-xs text-blue-200 mt-0.5 inline-flex items-center gap-1.5">
                              <CalendarIcon className="h-3 w-3" /> {stop.dateRange}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/15 px-3 py-2">
                            <p className="text-[10px] font-medium uppercase tracking-wider opacity-75">Est. total</p>
                            <p className="text-lg font-bold tabular-nums">${total.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Days */}
                      <div className="space-y-3">
                        {stop.days.map((d, dayIdx) => {
                          const key = `${stop.id}-${dayIdx}`;
                          const open = !collapsed[key];
                          const dayCost = d.activities.reduce((s, a) => s + a.cost, 0);
                          return (
                            <div key={key} className="rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
                              {/* Day header — sticky */}
                              <button onClick={() => toggleDay(key)}
                                className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-sm px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">{d.day}</span>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">Day {d.day} · {d.date}</p>
                                    <p className="text-xs text-slate-400">{d.activities.length} activities · <span className="tabular-nums">${dayCost}</span></p>
                                  </div>
                                </div>
                                {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                              </button>

                              {open && (
                                <div className="p-3 space-y-2">
                                  {d.activities.length === 0 ? (
                                    <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                                      Add activities from the left panel
                                    </div>
                                  ) : d.activities.map((a) => {
                                    const meta = catMeta[a.category];
                                    const Icon = meta.icon;
                                    return (
                                      <div key={a.id} draggable
                                        className={cn(
                                          "group flex items-center gap-3 rounded-lg border border-slate-100 bg-white pl-0 pr-3 py-2.5 hover:border-slate-200 hover:shadow-sm transition-all",
                                          meta.border, "border-l-[3px]"
                                        )}>
                                        <GripVertical className="h-4 w-4 text-slate-300 ml-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity shrink-0" />
                                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 min-w-[52px]">
                                          <Clock className="h-3 w-3" /> {a.time}
                                        </div>
                                        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", meta.color)}>
                                          <Icon className="h-3.5 w-3.5" />
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-slate-900 truncate">{a.title}</p>
                                          <p className="text-xs text-slate-400">{meta.label}</p>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 tabular-nums shrink-0">${a.cost}</span>
                                        <button onClick={() => removeActivity(stop.id, dayIdx, a.id)}
                                          className="text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all ml-1 shrink-0"
                                          aria-label="Remove">
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center rounded-2xl border-2 border-dashed border-slate-200 p-16">
                  <CalendarDays className="mx-auto h-10 w-10 text-blue-400 mb-3" />
                  <p className="font-semibold text-slate-900">Calendar view coming soon</p>
                  <p className="text-sm text-slate-400 mt-1">Switch to List view to keep planning.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
