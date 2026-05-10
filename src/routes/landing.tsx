import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, SlidersHorizontal, MapPin, Star, ArrowRight,
  Calendar, Clock, TrendingUp, Compass, Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import bali from "@/assets/dest-bali.jpg";
import paris from "@/assets/dest-paris.jpg";
import tokyo from "@/assets/dest-tokyo.jpg";
import newyork from "@/assets/dest-newyork.jpg";
import santorini from "@/assets/trip-santorini.jpg";
import iceland from "@/assets/trip-iceland.jpg";

import { tripAPI, communityAPI, cityAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Explore — Traveloop" },
      { name: "description", content: "Discover top destinations and plan your next unforgettable journey." },
    ],
  }),
  component: LandingPage,
});

const topRegional = [
  { name: "Bali", country: "Indonesia", img: bali, rating: 4.9, category: "Beach & Culture" },
  { name: "Paris", country: "France", img: paris, rating: 4.8, category: "City & Art" },
  { name: "Tokyo", country: "Japan", img: tokyo, rating: 4.9, category: "Urban & Food" },
  { name: "New York", country: "USA", img: newyork, rating: 4.7, category: "Iconic City" },
  { name: "Santorini", country: "Greece", img: santorini, rating: 4.9, category: "Island Escape" },
];

const categories = ["All", "Beach", "City", "Adventure", "Cultural", "Food", "Nature"];
const budgets = ["Any Budget", "Under $500", "$500–$1500", "$1500+"];

function LandingPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeBudget, setActiveBudget] = useState("Any Budget");

  const { data: allTrips, isLoading: loadingTrips } = useQuery({
    queryKey: ["trips"],
    queryFn: tripAPI.getAll,
  });

  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ["community-posts"],
    queryFn: communityAPI.getPosts,
  });

  const { data: cities, isLoading: loadingCities } = useQuery({
    queryKey: ["trending-cities"],
    queryFn: () => cityAPI.getAll({ limit: 5 }),
  });

  const recentTrips = (allTrips?.trips || []).slice(0, 3);

  return (
    <AppShell>
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero min-h-[340px] sm:min-h-[420px] flex items-end p-6 sm:p-10 shadow-elevated mb-8">
        <div className="absolute inset-0">
          <img src={santorini} alt="Hero destination" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-primary/20" />
        </div>
        <div className="relative z-10 text-primary-foreground w-full">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur px-3 py-1 text-xs font-medium mb-3">
            <Compass className="h-3.5 w-3.5" /> Explore the world with Traveloop
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight max-w-2xl">
            Where do you want to go next?
          </h1>
          <p className="mt-2 text-primary-foreground/80 text-sm sm:text-base max-w-lg">
            Discover curated destinations, build detailed itineraries, and track every journey.
          </p>
          <div className="mt-6">
            <Link to="/create-trip">
              <Button className="h-12 px-6 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold shadow-elevated">
                <TrendingUp className="h-4 w-4 mr-2" /> Start Planning
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Search & Filter Bar ── */}
      <section className="rounded-2xl bg-card border border-border/60 shadow-card p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations, cities, activities..."
              className="w-full h-11 rounded-xl border border-input bg-surface pl-9 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>
          <Button variant="outline" className="h-11 px-4 rounded-xl border-border gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeCategory === c
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
          <div className="w-px h-6 bg-border self-center mx-1 shrink-0" />
          {budgets.map((b) => (
            <button
              key={b}
              onClick={() => setActiveBudget(b)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeBudget === b
                  ? "bg-accent text-accent-foreground shadow-card"
                  : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </section>

      {/* ── Top Regional Selections ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Top Regional Selections</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Handpicked destinations trending this season</p>
          </div>
          <button className="text-sm font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Horizontal scroll grid */}
        <div className="-mx-4 sm:mx-0">
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto px-4 sm:px-0 pb-2 snap-x">
            {topRegional.map((dest) => (
              <article
                key={dest.name}
                className="group min-w-[200px] sm:min-w-0 snap-start rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all cursor-pointer"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={dest.img} alt={dest.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-surface/90 backdrop-blur px-2 py-0.5 text-xs font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {dest.rating}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground">
                    <p className="text-[10px] font-medium uppercase tracking-wider opacity-75 inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {dest.country}
                    </p>
                    <h3 className="text-lg font-bold mt-0.5">{dest.name}</h3>
                    <p className="text-xs opacity-75 mt-0.5">{dest.category}</p>
                    <button className="mt-2 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-surface/20 backdrop-blur text-primary-foreground px-3 py-1 hover:bg-accent hover:text-accent-foreground transition-colors">
                      Explore <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

          {/* ── Community Feed ── */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Community Stories</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Real experiences from our global travelers</p>
          </div>
          <button className="text-sm font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1 transition-colors">
            Visit Community <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Posts column */}
          <div className="lg:col-span-2 space-y-6">
            {loadingPosts ? (
              [1, 2].map(i => <div key={i} className="h-96 rounded-2xl bg-muted animate-pulse" />)
            ) : posts?.posts?.length === 0 ? (
               <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
                 <p className="text-muted-foreground">No community stories yet. Be the first to share!</p>
               </div>
            ) : posts?.posts?.map((p: any) => (
              <article key={p.id} className="rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {p.author?.name?.[0] || "T"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.author?.name || "Traveler"}</p>
                    <p className="text-[11px] text-muted-foreground">{p.author?.city || "Explorer"}</p>
                  </div>
                </div>
                {p.image && (
                  <div className="relative h-72 sm:h-96 overflow-hidden">
                    <img src={p.image} alt="Trip story" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-sm text-foreground leading-relaxed">
                    {p.content}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                     <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
                       <Star className="h-3.5 w-3.5" /> 12
                     </button>
                     <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
                       <Clock className="h-3.5 w-3.5" /> 3 comments
                     </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Trending sidebar */}
          <aside className="space-y-6">
             <div className="rounded-2xl bg-card border border-border/60 shadow-card p-5">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Trending Now
                </h3>
                <div className="space-y-4">
                  {loadingCities ? (
                    [1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)
                  ) : cities?.cities?.slice(0, 4).map((c: any) => (
                    <div key={c.id} className="flex items-center gap-3 group cursor-pointer">
                      <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0">
                        <img src={c.image || santorini} alt={c.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.country}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-primary">★ 4.9</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-xs font-semibold text-primary hover:bg-primary/5">
                  Explore Destinations
                </Button>
             </div>

             <div className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-elevated overflow-hidden relative group">
                <div className="relative z-10">
                  <h3 className="font-bold text-lg leading-tight">Plan with AI</h3>
                  <p className="text-xs opacity-85 mt-2 mb-4 leading-relaxed">
                    Let our smart algorithms build your dream itinerary in seconds.
                  </p>
                  <Link to="/ai-planner">
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent-hover font-bold rounded-lg px-4">
                      Try Now
                    </Button>
                  </Link>
                </div>
                <Sparkles className="absolute -bottom-2 -right-2 h-20 w-20 opacity-10 group-hover:scale-110 transition-transform duration-700" />
             </div>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}

