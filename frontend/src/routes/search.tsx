import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, SlidersHorizontal, MapPin, Plus, Star,
  Clock, DollarSign, Camera, Utensils, Bus, Hotel, X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import bali from "@/assets/dest-bali.jpg";
import paris from "@/assets/dest-paris.jpg";
import tokyo from "@/assets/dest-tokyo.jpg";
import newyork from "@/assets/dest-newyork.jpg";
import santorini from "@/assets/trip-santorini.jpg";
import iceland from "@/assets/trip-iceland.jpg";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search Activities — Traveloop" },
      { name: "description", content: "Discover and add activities and cities to your Traveloop trip." },
    ],
  }),
  component: SearchPage,
});

type Category = "food" | "transport" | "sight" | "stay";

const categoryMeta: Record<Category, { icon: typeof Camera; color: string; label: string }> = {
  food: { icon: Utensils, color: "text-accent bg-accent/10", label: "Food & Dining" },
  transport: { icon: Bus, color: "text-primary bg-primary/10", label: "Transport" },
  sight: { icon: Camera, color: "text-emerald-600 bg-emerald-100", label: "Sightseeing" },
  stay: { icon: Hotel, color: "text-violet-600 bg-violet-100", label: "Accommodation" },
};

const allActivities = [
  { id: "a1", title: "Eiffel Tower Skip-the-Line", city: "Paris", country: "France", cost: 65, rating: 4.9, category: "sight" as Category, image: paris, duration: "3 hrs" },
  { id: "a2", title: "Sushi Omakase Dinner", city: "Tokyo", country: "Japan", cost: 120, rating: 4.8, category: "food" as Category, image: tokyo, duration: "2 hrs" },
  { id: "a3", title: "Sunset Catamaran Cruise", city: "Santorini", country: "Greece", cost: 95, rating: 4.9, category: "sight" as Category, image: santorini, duration: "4 hrs" },
  { id: "a4", title: "Ubud Rice Terrace Tour", city: "Bali", country: "Indonesia", cost: 40, rating: 4.7, category: "sight" as Category, image: bali, duration: "5 hrs" },
  { id: "a5", title: "Broadway Show: Hamilton", city: "New York", country: "USA", cost: 180, rating: 4.9, category: "sight" as Category, image: newyork, duration: "3 hrs" },
  { id: "a6", title: "Northern Lights Tour", city: "Reykjavik", country: "Iceland", cost: 85, rating: 4.8, category: "sight" as Category, image: iceland, duration: "4 hrs" },
  { id: "a7", title: "Le Comptoir du Relais", city: "Paris", country: "France", cost: 55, rating: 4.6, category: "food" as Category, image: paris, duration: "1.5 hrs" },
  { id: "a8", title: "Tokyo Subway Day Pass", city: "Tokyo", country: "Japan", cost: 12, rating: 4.5, category: "transport" as Category, image: tokyo, duration: "All day" },
];

const cities = ["All Cities", "Paris", "Tokyo", "Santorini", "Bali", "New York", "Reykjavik"];
const categories = ["All Types", "Sightseeing", "Food & Dining", "Transport", "Accommodation"];
const sortOptions = ["Relevance", "Price: Low to High", "Price: High to Low", "Rating"];

import { cityAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [categoryFilter, setCategoryFilter] = useState("All Types");
  const [sortBy, setSortBy] = useState("Relevance");
  const [added, setAdded] = useState<Set<string>>(new Set());

  const { data: cityData, isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: () => cityAPI.getAll(),
  });

  const allDestinations = (cityData?.cities || []).map((c: any) => ({
    id: c.id.toString(),
    title: c.name,
    city: c.name,
    country: c.country,
    cost: 1500, // Mock cost
    rating: 4.8,
    category: "sight" as Category,
    image: c.image || santorini,
    duration: "All day",
    region: c.region
  }));

  const toggleAdd = (id: string) => {
    setAdded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = allDestinations.filter((a: any) => {
    if (query && !a.title.toLowerCase().includes(query.toLowerCase()) && !a.city.toLowerCase().includes(query.toLowerCase())) return false;
    if (cityFilter !== "All Cities" && a.city !== cityFilter) return false;
    const catMap: Record<string, Category | ""> = {
      "Sightseeing": "sight", "Food & Dining": "food", "Transport": "transport", "Accommodation": "stay",
    };
    if (categoryFilter !== "All Types" && a.category !== catMap[categoryFilter]) return false;
    return true;
  }).sort((a: any, b: any) => {
    if (sortBy === "Price: Low to High") return a.cost - b.cost;
    if (sortBy === "Price: High to Low") return b.cost - a.cost;
    if (sortBy === "Rating") return b.rating - a.rating;
    return 0;
  });

  const availableCities = ["All Cities", ...Array.from(new Set(allDestinations.map((d: any) => d.city)))];

  return (
    <AppShell>
      {/* Sticky search bar */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur border-b border-border/60 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-3">Search Activities & Cities</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search activities, cities, experiences..."
                className="w-full h-11 rounded-xl border border-input bg-surface pl-9 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="h-11 w-36 rounded-xl border-input bg-surface text-sm">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((c: any) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11 w-36 rounded-xl border-input bg-surface text-sm">
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{filtered.length}</span> results found</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 w-40 rounded-lg text-xs border-input bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-20 text-center">
          <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold text-foreground">No results found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((a: any) => {
            const meta = categoryMeta[a.category as Category] || categoryMeta.sight;
            const Icon = meta.icon;
            const isAdded = added.has(a.id);
            return (
              <article key={a.id} className="group rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-elevated transition-all overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <img src={a.image} alt={a.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold ${meta.color} bg-surface/95`}>
                      <Icon className="h-3 w-3" /> {meta.label}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-surface/90 backdrop-blur px-2 py-0.5 text-xs font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {a.rating}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-sm leading-snug">{a.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {a.city}, {a.country}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {a.duration}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center font-bold text-foreground">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />{a.cost}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => toggleAdd(a.id)}
                      className={`h-8 rounded-lg px-3 text-xs font-semibold transition-all ${
                        isAdded
                          ? "bg-emerald-500 hover:bg-red-500 text-white"
                          : "bg-primary hover:bg-primary-hover text-primary-foreground"
                      }`}
                    >
                      {isAdded ? (
                        <><X className="h-3.5 w-3.5 mr-1" /> Added</>
                      ) : (
                        <><Plus className="h-3.5 w-3.5 mr-1" /> Add to Trip</>
                      )}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
