import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, MapPin, Wallet, Calendar, Compass, Loader2, ChevronDown, DollarSign, ArrowLeft, Plus, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai-planner")({
  head: () => ({
    meta: [
      { title: "AI Trip Planner — Traveloop" },
      { name: "description", content: "Let AI craft your perfect itinerary in seconds." },
    ],
  }),
  component: AIPlannerPage,
});

const styles = ["Relaxed", "Adventurous", "Cultural", "Foodie", "Luxury", "Budget"];
const interests = ["Beaches", "Hiking", "Museums", "Nightlife", "Photography", "Local food", "Wellness", "Shopping"];

const mockItinerary = [
  {
    day: 1,
    city: "Santorini",
    title: "Arrival & Oia Sunset",
    activities: [
      { time: "14:00", title: "Check-in at Cliffside Villa", cost: 0, type: "Stay" },
      { time: "16:00", title: "Explore Oia Village", cost: 0, type: "Sight" },
      { time: "19:00", title: "Dinner with Caldera View", cost: 85, type: "Food" },
    ]
  },
  {
    day: 2,
    city: "Santorini",
    title: "Volcano & Hot Springs",
    activities: [
      { time: "10:00", title: "Boat Tour to Nea Kameni", cost: 50, type: "Adventure" },
      { time: "13:00", title: "Swim in Palea Kameni Hot Springs", cost: 0, type: "Wellness" },
      { time: "18:00", title: "Wine Tasting in Pyrgos", cost: 65, type: "Cultural" },
    ]
  }
];

function AIPlannerPage() {
  const [destination, setDestination] = useState("Santorini, Greece");
  const [budget, setBudget] = useState(3000);
  const [days, setDays] = useState(5);
  const [style, setStyle] = useState("Cultural");
  const [pickedInterests, setPickedInterests] = useState<string[]>(["Photography", "Local food"]);
  const [generating, setGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<any[] | null>(null);
  const [showSettings, setShowSettings] = useState(true);

  const handleGenerate = () => {
    setGenerating(true);
    setItinerary(null);
    setTimeout(() => {
      setGenerating(false);
      setItinerary(mockItinerary);
    }, 2500);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto pb-12">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground">AI Trip Planner</h1>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base">Our smart algorithms craft a day-by-day itinerary tuned to your style, budget, and interests.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Settings Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mobile toggle for settings */}
            <button
              className="lg:hidden w-full flex items-center justify-between rounded-2xl bg-card border border-border/60 shadow-card px-5 py-4"
              onClick={() => setShowSettings(s => !s)}
            >
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Trip Settings
              </span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showSettings && "rotate-180")} />
            </button>
            <div className={cn(showSettings ? "block" : "hidden", "lg:block")}>
            <div className="rounded-2xl bg-card border border-border/60 shadow-card p-6 space-y-6">
              <Field label="Destination" icon={MapPin}>
                <input 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-surface pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label={`Budget: $${budget}`} icon={Wallet}>
                  <input 
                    type="range" min={500} max={10000} step={100} 
                    value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none bg-muted cursor-pointer accent-primary"
                  />
                </Field>
                <Field label={`${days} Days`} icon={Calendar}>
                  <input 
                    type="range" min={1} max={14} 
                    value={days} onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none bg-muted cursor-pointer accent-primary"
                  />
                </Field>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 block">Travel Style</label>
                <div className="flex flex-wrap gap-2">
                  {styles.map(s => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                        style === s ? "bg-primary text-primary-foreground shadow-card" : "bg-muted text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 block">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => {
                    const active = pickedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => setPickedInterests(prev => active ? prev.filter(i => i !== interest) : [...prev, interest])}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                          active ? "bg-accent text-accent-foreground shadow-card" : "bg-muted text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={generating}
                className="w-full h-12 rounded-xl bg-gradient-hero text-primary-foreground font-bold shadow-elevated"
              >
                {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating Magic...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Itinerary</>}
              </Button>
            </div>
            </div> {/* close showSettings wrapper */}
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-border/60 bg-card p-12 text-center space-y-6 shadow-card"
                >
                  <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">Crafting your dream trip...</h3>
                  <div className="max-w-xs mx-auto space-y-3 text-left">
                    {["Analyzing destinations", "Matching style & budget", "Optimizing route", "Finalizing details"].map((step, i) => (
                      <motion.div 
                        key={step} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: i * 0.4 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" /> {step}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : itinerary ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-elevated flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest opacity-80">AI Generated Plan</p>
                      <h3 className="text-xl font-bold">{days} Days in {destination}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-80 uppercase tracking-widest">Est. Cost</p>
                      <p className="text-xl font-bold">${budget}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {itinerary.map((day, i) => (
                      <DayCard key={day.day} day={day} index={i} />
                    ))}
                  </div>
                  
                  <div className="flex justify-center pt-4">
                     <Button variant="outline" className="rounded-xl border-dashed border-2 hover:bg-primary/5 hover:text-primary transition-all">
                       <Plus className="h-4 w-4 mr-2" /> Add more days
                     </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full rounded-2xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                  <Compass className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-bold text-foreground">Ready when you are</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    Adjust the settings on the left and hit generate to see your personalized itinerary.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </label>
      {children}
    </div>
  );
}

function DayCard({ day, index }: { day: any; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-elevated">
          D{day.day}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{day.city}</p>
          <p className="font-bold text-foreground truncate">{day.title}</p>
        </div>
        <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-5 space-y-4">
              {day.activities.map((act: any, i: number) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="text-xs font-bold text-primary min-w-[45px] pt-0.5">{act.time}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{act.title}</p>
                      <span className="text-xs font-bold text-foreground">{act.cost > 0 ? `$${act.cost}` : "Free"}</span>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border/50">
                      {act.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
