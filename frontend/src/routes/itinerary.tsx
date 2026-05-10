import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MapPin,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  Utensils,
  Bus,
  Camera,
  Hotel,
  Trash2,
  GripVertical,
  List,
  CalendarDays,
  DollarSign,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import destParis from "@/assets/dest-paris.jpg";
import destTokyo from "@/assets/dest-tokyo.jpg";
import destBali from "@/assets/dest-bali.jpg";
import destNY from "@/assets/dest-newyork.jpg";
import tripSantorini from "@/assets/trip-santorini.jpg";

export const Route = createFileRoute("/itinerary")({
  head: () => ({
    meta: [
      { title: "Itinerary — Traveloop" },
      { name: "description", content: "Plan and view your trip itinerary in a dual-pane builder." },
    ],
  }),
  component: ItineraryPage,
});

type Category = "food" | "transport" | "sight" | "stay";

const categoryMeta: Record<Category, { icon: typeof Utensils; color: string; label: string }> = {
  food: { icon: Utensils, color: "text-accent bg-accent/10", label: "Food" },
  transport: { icon: Bus, color: "text-primary bg-primary/10", label: "Transport" },
  sight: { icon: Camera, color: "text-emerald-600 bg-emerald-100", label: "Sight" },
  stay: { icon: Hotel, color: "text-violet-600 bg-violet-100", label: "Stay" },
};

const discoveredActivities = [
  { id: "a1", title: "Eiffel Tower Skip-the-Line", city: "Paris", cost: 65, category: "sight" as Category, image: destParis },
  { id: "a2", title: "Sushi Omakase Dinner", city: "Tokyo", cost: 120, category: "food" as Category, image: destTokyo },
  { id: "a3", title: "Sunset Catamaran Cruise", city: "Santorini", cost: 95, category: "sight" as Category, image: tripSantorini },
  { id: "a4", title: "Ubud Rice Terrace Tour", city: "Bali", cost: 40, category: "sight" as Category, image: destBali },
  { id: "a5", title: "Broadway Show: Hamilton", city: "New York", cost: 180, category: "sight" as Category, image: destNY },
  { id: "a6", title: "Airport Transfer", city: "Paris", cost: 35, category: "transport" as Category, image: destParis },
];

type ActivityItem = {
  id: string;
  time: string;
  title: string;
  cost: number;
  category: Category;
};

type DayBlock = {
  day: number;
  date: string;
  activities: ActivityItem[];
};

type Stop = {
  id: string;
  city: string;
  country: string;
  dateRange: string;
  days: DayBlock[];
};

const initialStops: Stop[] = [
  {
    id: "s1",
    city: "Paris",
    country: "France",
    dateRange: "Jun 12 — Jun 14",
    days: [
      {
        day: 1,
        date: "Jun 12",
        activities: [
          { id: "i1", time: "10:00", title: "Louvre Museum Visit", cost: 22, category: "sight" },
          { id: "i2", time: "13:30", title: "Lunch at Le Marais", cost: 45, category: "food" },
          { id: "i3", time: "19:00", title: "Seine River Cruise", cost: 35, category: "sight" },
        ],
      },
      {
        day: 2,
        date: "Jun 13",
        activities: [
          { id: "i4", time: "09:00", title: "Train to Versailles", cost: 18, category: "transport" },
          { id: "i5", time: "11:00", title: "Palace of Versailles Tour", cost: 28, category: "sight" },
        ],
      },
    ],
  },
  {
    id: "s2",
    city: "Santorini",
    country: "Greece",
    dateRange: "Jun 15 — Jun 18",
    days: [
      {
        day: 1,
        date: "Jun 15",
        activities: [
          { id: "i6", time: "14:00", title: "Hotel Check-in, Oia", cost: 220, category: "stay" },
          { id: "i7", time: "20:00", title: "Sunset Dinner at Ammoudi", cost: 80, category: "food" },
        ],
      },
    ],
  },
];

function ItineraryPage() {
  const [stops, setStops] = useState<Stop[]>(initialStops);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [costFilter, setCostFilter] = useState("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = discoveredActivities.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.city.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && a.category !== typeFilter) return false;
    if (costFilter === "low" && a.cost > 50) return false;
    if (costFilter === "mid" && (a.cost <= 50 || a.cost > 120)) return false;
    if (costFilter === "high" && a.cost <= 120) return false;
    return true;
  });

  const addActivity = (a: typeof discoveredActivities[number]) => {
    setStops((prev) => {
      const next = [...prev];
      const target = next[0];
      if (!target || target.days.length === 0) return prev;
      target.days[0].activities.push({
        id: `${a.id}-${Date.now()}`,
        time: "12:00",
        title: a.title,
        cost: a.cost,
        category: a.category,
      });
      return next;
    });
  };

  const removeActivity = (stopId: string, dayIdx: number, itemId: string) => {
    setStops((prev) =>
      prev.map((s) =>
        s.id !== stopId
          ? s
          : {
              ...s,
              days: s.days.map((d, i) =>
                i !== dayIdx ? d : { ...d, activities: d.activities.filter((a) => a.id !== itemId) },
              ),
            },
      ),
    );
  };

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      {
        id: `s${Date.now()}`,
        city: "New Stop",
        country: "",
        dateRange: "Pick dates",
        days: [{ day: 1, date: "TBD", activities: [] }],
      },
    ]);
  };

  const toggleDay = (key: string) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  return (
    <AppShell>
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trip Itinerary</h1>
          <p className="mt-1 inline-flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" /> Jun 12 — Jun 22, 2026 · {stops.length} stops
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* LEFT PANE — Builder / Search */}
        <aside className="flex flex-col gap-4">
          <div className="sticky top-20 z-10 rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cities & activities..."
                className="h-11 rounded-xl border-border bg-surface pl-9 focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 flex-1 rounded-lg text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="sight">Sight</SelectItem>
                  <SelectItem value="stay">Stay</SelectItem>
                </SelectContent>
              </Select>
              <Select value={costFilter} onValueChange={setCostFilter}>
                <SelectTrigger className="h-9 flex-1 rounded-lg text-sm"><SelectValue placeholder="Cost" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Cost</SelectItem>
                  <SelectItem value="low">$ Under 50</SelectItem>
                  <SelectItem value="mid">$$ 50–120</SelectItem>
                  <SelectItem value="high">$$$ 120+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={addStop}
              className="mt-3 h-11 w-full rounded-xl bg-gradient-hero text-primary-foreground shadow-elevated transition-all hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add New Stop
            </Button>
          </div>

          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Discovered Activities</h2>
            <span className="text-xs font-medium text-muted-foreground">{filtered.length} results</span>
          </div>

          <div className="space-y-3">
            {filtered.map((a) => {
              const Icon = categoryMeta[a.category].icon;
              return (
                <article
                  key={a.id}
                  className="group flex gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-card transition-all hover:border-primary/40 hover:shadow-elevated"
                >
                  <img src={a.image} alt={a.title} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{a.title}</p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {a.city}
                        </p>
                      </div>
                      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", categoryMeta[a.category].color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="inline-flex items-center text-sm font-bold text-foreground">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />{a.cost}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => addActivity(a)}
                        className="h-8 rounded-lg bg-primary px-3 text-xs text-primary-foreground transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add to Trip
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
            {filtered.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 py-10 text-center text-sm text-muted-foreground">
                No activities match your filters.
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT PANE — Timeline */}
        <section className="flex flex-col gap-5">
          {/* View toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-2 shadow-card">
            <p className="pl-3 text-sm font-semibold text-foreground">Timeline</p>
            <div className="flex rounded-xl bg-muted p-1" role="tablist" aria-label="View mode">
              <button
                role="tab"
                aria-selected={view === "list"}
                onClick={() => setView("list")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-ring",
                  view === "list" ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="h-3.5 w-3.5" /> List
              </button>
              <button
                role="tab"
                aria-selected={view === "calendar"}
                onClick={() => setView("calendar")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-ring",
                  view === "calendar" ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" /> Calendar
              </button>
            </div>
          </div>

          {view === "list" ? (
            <div className="relative space-y-8">
              {/* vertical line */}
              <div className="pointer-events-none absolute bottom-0 left-[19px] top-2 hidden w-px bg-gradient-to-b from-primary/40 via-border to-transparent sm:block" />

              {stops.map((stop) => {
                const totalCost = stop.days.reduce(
                  (sum, d) => sum + d.activities.reduce((s, a) => s + a.cost, 0),
                  0,
                );
                return (
                  <div key={stop.id} className="relative sm:pl-14">
                    {/* dot */}
                    <span className="absolute left-0 top-1 hidden h-10 w-10 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground shadow-elevated ring-4 ring-background sm:inline-flex">
                      <MapPin className="h-4 w-4" />
                    </span>

                    {/* City header */}
                    <div className="rounded-2xl bg-gradient-hero p-5 text-primary-foreground shadow-elevated">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-2xl font-bold">
                            {stop.city}{stop.country && `, ${stop.country}`}
                          </h2>
                          <p className="mt-1 inline-flex items-center gap-2 text-sm text-primary-foreground/85">
                            <CalendarIcon className="h-3.5 w-3.5" /> {stop.dateRange}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white/15 px-3 py-2 backdrop-blur-sm">
                          <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">Est. total</p>
                          <p className="text-lg font-bold">${totalCost}</p>
                        </div>
                      </div>
                    </div>

                    {/* Days */}
                    <div className="mt-4 space-y-3">
                      {stop.days.map((d, dayIdx) => {
                        const key = `${stop.id}-${dayIdx}`;
                        const isCollapsed = collapsed[key];
                        const dayCost = d.activities.reduce((s, a) => s + a.cost, 0);
                        return (
                          <div key={key} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
                            <button
                              onClick={() => toggleDay(key)}
                              className="flex w-full items-center justify-between border-b border-border bg-muted/30 px-5 py-4 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                                  {d.day}
                                </span>
                                <div>
                                  <p className="font-semibold text-foreground">Day {d.day} · {d.date}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {d.activities.length} activities · ${dayCost}
                                  </p>
                                </div>
                              </div>
                              {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                            </button>

                            {!isCollapsed && (
                              <div className="space-y-2 p-4">
                                {d.activities.length === 0 ? (
                                  <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 py-8 text-center text-sm text-muted-foreground">
                                    Drop or add activities for this day
                                  </div>
                                ) : (
                                  d.activities.map((a) => {
                                    const Icon = categoryMeta[a.category].icon;
                                    return (
                                      <div
                                        key={a.id}
                                        draggable
                                        className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-all hover:border-primary/40 hover:shadow-card"
                                      >
                                        <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                        <div className="inline-flex min-w-[60px] items-center gap-1.5 text-xs font-semibold text-primary">
                                          <Clock className="h-3.5 w-3.5" /> {a.time}
                                        </div>
                                        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", categoryMeta[a.category].color)}>
                                          <Icon className="h-4 w-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                                          <p className="text-xs text-muted-foreground">{categoryMeta[a.category].label}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">${a.cost}</span>
                                        <button
                                          onClick={() => removeActivity(stop.id, dayIdx, a.id)}
                                          className="text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                                          aria-label="Remove activity"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    );
                                  })
                                )}
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
            <div className="rounded-2xl border border-border/60 bg-card p-10 text-center shadow-card">
              <CalendarDays className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-3 font-semibold text-foreground">Calendar view coming soon</p>
              <p className="mt-1 text-sm text-muted-foreground">Switch back to List view to keep planning.</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
