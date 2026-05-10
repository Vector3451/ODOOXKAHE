import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Camera, MapPin, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { tripAPI } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/create-trip")({
  head: () => ({
    meta: [
      { title: "Plan New Trip — Traveloop" },
      { name: "description", content: "Create a new multi-city trip itinerary." },
    ],
  }),
  component: CreateTrip,
});

function CreateTrip() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !start || !end) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await tripAPI.create({
        title: name,
        description: desc,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        destinations: "", // To be filled in later
      });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      nav({ to: "/itinerary-builder/$tripId", params: { tripId: res.trip.id } });
    } catch (error: any) {
      alert(error.message || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto pb-24 lg:pb-0">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary uppercase tracking-wider inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Step 1 of 3
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground">Plan a new trip</h1>
          <p className="mt-2 text-muted-foreground">Start with the basics — you can add cities and activities next.</p>
        </div>

        <form className="rounded-2xl bg-card border border-border/60 shadow-card p-6 sm:p-8 space-y-6"
          onSubmit={handleSubmit}>
          <Field label="Trip name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer in the Mediterranean"
              className="w-full h-11 rounded-xl border border-input bg-surface px-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Start date">
              <DatePick date={start} onSelect={setStart} />
            </Field>
            <Field label="End date">
              <DatePick date={end} onSelect={setEnd} />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              placeholder="What's the vibe? Adventure, relaxation, food tour..."
              className="w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15 resize-none"
            />
          </Field>

          <Field label="Cover photo" optional>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-10 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Camera className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-foreground">Click to upload</span>
              <span className="text-xs text-muted-foreground">PNG or JPG, up to 5MB</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </Field>

          <div className="hidden lg:flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-elevated">
              {loading ? "Saving..." : "Save & Continue"} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>

        {/* Mobile fixed bottom CTA */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-border p-4">
          <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-elevated">
            {loading ? "Saving..." : "Save & Continue"} <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

function DatePick({ date, onSelect }: { date?: Date; onSelect: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-11 rounded-xl justify-start text-left font-normal border-input bg-surface hover:bg-muted",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          {date ? format(date, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onSelect} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );
}
