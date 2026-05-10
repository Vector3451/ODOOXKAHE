import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CheckSquare, Square, ChevronDown, ChevronUp,
  FileText, Shirt, Laptop, Plus, Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/packing")({
  head: () => ({
    meta: [
      { title: "Packing Checklist — Traveloop" },
      { name: "description", content: "Organize your packing list for your upcoming trip." },
    ],
  }),
  component: PackingPage,
});

type CheckItem = { id: string; label: string; checked: boolean };
type Category = { id: string; name: string; icon: React.ComponentType<{ className?: string }>; color: string; items: CheckItem[] };

const initialCategories: Category[] = [
  {
    id: "docs", name: "Documents", icon: FileText, color: "text-primary bg-primary/10",
    items: [
      { id: "d1", label: "Passport", checked: true },
      { id: "d2", label: "Travel insurance", checked: true },
      { id: "d3", label: "Flight tickets (printed/digital)", checked: false },
      { id: "d4", label: "Hotel reservations", checked: false },
      { id: "d5", label: "Visa documents", checked: false },
      { id: "d6", label: "Emergency contacts", checked: true },
    ],
  },
  {
    id: "clothing", name: "Clothing", icon: Shirt, color: "text-accent bg-accent/10",
    items: [
      { id: "c1", label: "T-shirts (5×)", checked: false },
      { id: "c2", label: "Jeans / Trousers", checked: false },
      { id: "c3", label: "Underwear & socks", checked: false },
      { id: "c4", label: "Jacket / Raincoat", checked: true },
      { id: "c5", label: "Swimwear", checked: false },
      { id: "c6", label: "Comfortable walking shoes", checked: true },
      { id: "c7", label: "Sandals", checked: false },
    ],
  },
  {
    id: "electronics", name: "Electronics", icon: Laptop, color: "text-violet-600 bg-violet-100",
    items: [
      { id: "e1", label: "Phone + charger", checked: true },
      { id: "e2", label: "Laptop + adapter", checked: false },
      { id: "e3", label: "Universal power adapter", checked: true },
      { id: "e4", label: "Portable power bank", checked: false },
      { id: "e5", label: "Camera + memory cards", checked: false },
      { id: "e6", label: "Headphones", checked: true },
    ],
  },
];

function CategorySection({ cat, onToggle, onAdd, onRemove }: {
  cat: Category;
  onToggle: (catId: string, itemId: string) => void;
  onAdd: (catId: string, label: string) => void;
  onRemove: (catId: string, itemId: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const Icon = cat.icon;
  const checked = cat.items.filter((i) => i.checked).length;
  const total = cat.items.length;
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);

  const handleAdd = () => {
    if (newLabel.trim()) { onAdd(cat.id, newLabel.trim()); setNewLabel(""); }
  };

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${cat.color}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{cat.name}</span>
            <span className="text-xs font-medium text-muted-foreground">{checked}/{total}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-bold ml-2 text-muted-foreground">{pct}%</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="p-4 space-y-1">
          {cat.items.map((item) => (
            <div key={item.id} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/40 transition-colors">
              <button
                onClick={() => onToggle(cat.id, item.id)}
                className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                aria-label={item.checked ? "Uncheck" : "Check"}
              >
                {item.checked
                  ? <CheckSquare className="h-5 w-5 text-primary fill-primary/15" />
                  : <Square className="h-5 w-5" />}
              </button>
              <span className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {item.label}
              </span>
              <button
                onClick={() => onRemove(cat.id, item.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                aria-label="Remove item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {/* Quick add */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add item..."
              className="flex-1 h-9 rounded-xl border border-input bg-surface px-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            <Button size="sm" onClick={handleAdd} className="h-9 px-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { tripAPI } from "@/lib/api";

function PackingPage() {
  const { data: tripData } = useQuery({ queryKey: ["trips"], queryFn: () => tripAPI.getAll() });
  
  // Find the first upcoming trip, or fallback to the most recent one
  const trip = tripData?.trips?.find((t: any) => t.status === "upcoming") || tripData?.trips?.[0];
  
  const tripName = trip?.title || "Upcoming Trip";
  const tripDates = trip?.startDate && trip?.endDate 
    ? `${trip.startDate.split('T')[0]} – ${trip.endDate.split('T')[0]}`
    : "Dates TBD";

  // Use trip ID for localStorage key to persist packing list per trip
  const storageKey = `packing_${trip?.id || 'default'}`;
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    }
    return initialCategories.map(c => ({...c, items: c.items.map(i => ({...i, checked: false}))}));
  });

  // Save to localStorage whenever categories change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(categories));
    }
  }, [categories, storageKey]);

  const toggleItem = (catId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== catId ? c : {
          ...c,
          items: c.items.map((i) => i.id !== itemId ? i : { ...i, checked: !i.checked }),
        },
      ),
    );
  };

  const addItem = (catId: string, label: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== catId ? c : {
          ...c,
          items: [...c.items, { id: Date.now().toString(), label, checked: false }],
        },
      ),
    );
  };

  const removeItem = (catId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== catId ? c : { ...c, items: c.items.filter((i) => i.id !== itemId) },
      ),
    );
  };

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const checkedItems = categories.reduce((s, c) => s + c.items.filter((i) => i.checked).length, 0);
  const overallPct = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Packing Checklist</h1>
        <p className="mt-1.5 text-muted-foreground text-sm">{tripName} · {tripDates}</p>
      </div>

      {/* Overall progress */}
      <div className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-elevated mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">Overall Progress</p>
            <p className="text-4xl font-bold mt-1">{overallPct}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Items packed</p>
            <p className="text-3xl font-bold">{checkedItems}<span className="text-lg opacity-70">/{totalItems}</span></p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-primary-foreground/20 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${overallPct === 100 ? "bg-emerald-400" : "bg-primary-foreground"}`}
            style={{ width: `${overallPct}%` }}
          />
        </div>
        {overallPct === 100 && (
          <p className="mt-2 text-sm font-semibold text-primary-foreground/90">🎉 You're all packed! Have a great trip!</p>
        )}
      </div>

      {/* Category summary pills */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {categories.map((c) => {
          const checked = c.items.filter((i) => i.checked).length;
          const Icon = c.icon;
          return (
            <div key={c.id} className="rounded-2xl bg-card border border-border/60 shadow-card p-4 text-center">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${c.color} mb-2`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{checked}/{c.items.length}</p>
            </div>
          );
        })}
      </div>

      {/* Category lists */}
      <div className="space-y-5">
        {categories.map((c) => (
          <CategorySection
            key={c.id}
            cat={c}
            onToggle={toggleItem}
            onAdd={addItem}
            onRemove={removeItem}
          />
        ))}
      </div>
    </AppShell>
  );
}
