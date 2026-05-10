import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus, Trash2, CalendarIcon, DollarSign, MapPin,
  GripVertical, ArrowRight, ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/build-itinerary")({
  head: () => ({
    meta: [
      { title: "Build Itinerary — Traveloop" },
      { name: "description", content: "Build your trip itinerary with sections, date ranges, and budgets." },
    ],
  }),
  component: BuildItineraryPage,
});

type Section = {
  id: string;
  city: string;
  country: string;
  startDate?: Date;
  endDate?: Date;
  budget: string;
};

const initSections: Section[] = [
  { id: "s1", city: "Paris", country: "France", budget: "1200" },
  { id: "s2", city: "Santorini", country: "Greece", budget: "2400" },
];

function DatePick({ date, onSelect, placeholder }: { date?: Date; onSelect: (d?: Date) => void; placeholder: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-10 rounded-xl justify-start text-left font-normal border-input bg-surface hover:bg-muted text-sm",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="h-4 w-4 mr-2 shrink-0" />
          {date ? format(date, "MMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onSelect} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );
}

function SectionBlock({
  section, index, onUpdate, onRemove,
}: {
  section: Section;
  index: number;
  onUpdate: (id: string, field: string, value: string | Date | undefined) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
          {index + 1}
        </span>
        <h3 className="flex-1 font-semibold text-foreground">
          Section {index + 1}: {section.city || "New Destination"}
        </h3>
        <button
          onClick={() => onRemove(section.id)}
          className="text-muted-foreground hover:text-destructive transition-colors rounded-lg p-1"
          aria-label="Remove section"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Section body */}
      <div className="p-5 space-y-4">
        {/* City / Country */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> City
            </label>
            <input
              value={section.city}
              onChange={(e) => onUpdate(section.id, "city", e.target.value)}
              placeholder="e.g. Paris"
              className="w-full h-10 rounded-xl border border-input bg-surface px-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Country</label>
            <input
              value={section.country}
              onChange={(e) => onUpdate(section.id, "country", e.target.value)}
              placeholder="e.g. France"
              className="w-full h-10 rounded-xl border border-input bg-surface px-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" /> Date Range
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <DatePick
              date={section.startDate}
              onSelect={(d) => onUpdate(section.id, "startDate", d)}
              placeholder="Start date"
            />
            <DatePick
              date={section.endDate}
              onSelect={(d) => onUpdate(section.id, "endDate", d)}
              placeholder="End date"
            />
          </div>
          {section.startDate && section.endDate && section.endDate > section.startDate && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {Math.ceil((section.endDate.getTime() - section.startDate.getTime()) / (1000 * 60 * 60 * 24))} nights
            </p>
          )}
        </div>

        {/* Budget */}
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-primary" /> Budget (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
            <input
              type="number"
              value={section.budget}
              onChange={(e) => onUpdate(section.id, "budget", e.target.value)}
              placeholder="0"
              min="0"
              className="w-full h-10 rounded-xl border border-input bg-surface pl-7 pr-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildItineraryPage() {
  const nav = useNavigate();
  const [sections, setSections] = useState<Section[]>(initSections);
  const [tripName, setTripName] = useState("My Mediterranean Journey");

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { id: `s${Date.now()}`, city: "", country: "", budget: "" },
    ]);
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, field: string, value: string | Date | undefined) => {
    setSections((prev) =>
      prev.map((s) => (s.id !== id ? s : { ...s, [field]: value })),
    );
  };

  const totalBudget = sections.reduce((sum, s) => sum + (parseFloat(s.budget) || 0), 0);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto pb-24 lg:pb-0">
        {/* Back / breadcrumb */}
        <Link to="/create-trip" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to trip details
        </Link>

        <div className="mb-6">
          <p className="text-sm font-medium text-primary uppercase tracking-wider inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Step 2 of 3
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground">Build Your Itinerary</h1>
          <p className="mt-2 text-muted-foreground">Add destination sections with date ranges and budgets.</p>
        </div>

        {/* Trip name */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card p-5 mb-6">
          <label className="text-sm font-semibold text-foreground block mb-2">Trip Name</label>
          <input
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            className="w-full h-11 rounded-xl border border-input bg-surface px-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        {/* Budget summary */}
        <div className="rounded-2xl bg-gradient-hero p-5 text-primary-foreground shadow-elevated mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-80">Total Trip Budget</p>
              <p className="text-3xl font-bold mt-1">${totalBudget.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Sections</p>
              <p className="text-2xl font-bold">{sections.length}</p>
            </div>
          </div>
          {sections.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {sections.map((s, i) => (
                <div key={s.id} className="shrink-0 rounded-xl bg-primary-foreground/15 backdrop-blur px-3 py-1.5 text-xs font-medium">
                  {i + 1}. {s.city || "?"} — ${parseFloat(s.budget) || 0}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((s, i) => (
            <SectionBlock
              key={s.id}
              section={s}
              index={i}
              onUpdate={updateSection}
              onRemove={removeSection}
            />
          ))}
        </div>

        {/* Add section */}
        <Button
          onClick={addSection}
          variant="outline"
          className="mt-5 w-full h-12 rounded-xl border-dashed border-2 border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Another Destination
        </Button>

        {/* CTA */}
        <div className="hidden lg:flex justify-end mt-6">
          <Button
            onClick={() => nav({ to: "/itinerary" })}
            className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-elevated"
          >
            Save & Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Mobile fixed CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-border p-4">
        <Button
          onClick={() => nav({ to: "/itinerary" })}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-elevated"
        >
          Save & Continue <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </AppShell>
  );
}
