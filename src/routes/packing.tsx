import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  CheckSquare, Square, ChevronDown, ChevronUp,
  FileText, Shirt, Laptop, Plus, Trash2, Package,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/packing")({
  head: () => ({
    meta: [
      { title: "Packing Checklist — Traveloop" },
      { name: "description", content: "Organize your packing list for your upcoming trip." },
    ],
  }),
  component: PackingPage,
});

type Item = { id: string; label: string; checked: boolean };
type Category = { id: string; name: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; items: Item[] };

const init: Category[] = [
  {
    id: "docs", name: "Documents", icon: FileText,
    color: "text-blue-600", bg: "bg-blue-50",
    items: [
      { id: "d1", label: "Passport",                         checked: true  },
      { id: "d2", label: "Travel insurance",                 checked: true  },
      { id: "d3", label: "Flight tickets (printed/digital)", checked: false },
      { id: "d4", label: "Hotel reservations",               checked: false },
      { id: "d5", label: "Visa documents",                   checked: false },
      { id: "d6", label: "Emergency contacts",               checked: true  },
    ],
  },
  {
    id: "clothing", name: "Clothing", icon: Shirt,
    color: "text-orange-500", bg: "bg-orange-50",
    items: [
      { id: "c1", label: "T-shirts (5×)",             checked: false },
      { id: "c2", label: "Jeans / Trousers",          checked: false },
      { id: "c3", label: "Underwear & socks",          checked: false },
      { id: "c4", label: "Jacket / Raincoat",          checked: true  },
      { id: "c5", label: "Swimwear",                   checked: false },
      { id: "c6", label: "Comfortable walking shoes",  checked: true  },
      { id: "c7", label: "Sandals",                    checked: false },
    ],
  },
  {
    id: "electronics", name: "Electronics", icon: Laptop,
    color: "text-purple-600", bg: "bg-purple-50",
    items: [
      { id: "e1", label: "Phone + charger",            checked: true  },
      { id: "e2", label: "Laptop + charger",           checked: false },
      { id: "e3", label: "Universal power adapter",    checked: false },
      { id: "e4", label: "Portable power bank",        checked: true  },
      { id: "e5", label: "Camera + memory cards",      checked: false },
      { id: "e6", label: "Earphones / AirPods",        checked: false },
    ],
  },
  {
    id: "misc", name: "Essentials", icon: Package,
    color: "text-green-600", bg: "bg-green-50",
    items: [
      { id: "m1", label: "Sunscreen SPF 50+",          checked: false },
      { id: "m2", label: "Medications / first aid kit",checked: false },
      { id: "m3", label: "Reusable water bottle",      checked: true  },
      { id: "m4", label: "Travel pillow",              checked: false },
    ],
  },
];

function PackingPage() {
  const [cats, setCats]           = useState<Category[]>(init);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const newItemRefs               = useRef<Record<string, HTMLInputElement | null>>({});

  const total   = cats.reduce((s, c) => s + c.items.length, 0);
  const packed  = cats.reduce((s, c) => s + c.items.filter((i) => i.checked).length, 0);
  const pct     = total === 0 ? 0 : Math.round((packed / total) * 100);

  const toggle = (catId: string, itemId: string) => {
    setCats((prev) => prev.map((c) =>
      c.id !== catId ? c : { ...c, items: c.items.map((i) => i.id !== itemId ? i : { ...i, checked: !i.checked }) }
    ));
  };

  const remove = (catId: string, itemId: string) => {
    setCats((prev) => prev.map((c) =>
      c.id !== catId ? c : { ...c, items: c.items.filter((i) => i.id !== itemId) }
    ));
  };

  const addItem = (catId: string) => {
    const input = newItemRefs.current[catId];
    if (!input || !input.value.trim()) return;
    const label = input.value.trim();
    setCats((prev) => prev.map((c) =>
      c.id !== catId ? c : { ...c, items: [...c.items, { id: `${catId}-${Date.now()}`, label, checked: false }] }
    ));
    input.value = "";
  };

  const resetAll = () => setCats((prev) => prev.map((c) => ({ ...c, items: c.items.map((i) => ({ ...i, checked: false })) })));

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Packing Checklist</h1>
          <p className="mt-1 text-slate-400 text-sm">Santorini Escape · Jun 12 – Jun 19, 2026</p>
        </div>
        <Button onClick={resetAll} variant="outline" className="h-9 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold">
          Reset All
        </Button>
      </div>

      {/* Sticky progress bar */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-card px-5 py-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">Packing Progress</span>
            <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${pct === 100 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
              {pct === 100 ? "All Packed! 🎉" : `${packed} / ${total} items`}
            </span>
          </div>
          <span className={`text-lg font-bold tabular-nums ${pct === 100 ? "text-green-600" : pct > 60 ? "text-orange-500" : "text-blue-600"}`}>
            {pct}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? "#22c55e" : pct > 75 ? "#f97316" : "#2563eb",
            }}
          />
        </div>
      </div>

      {/* Accordion categories */}
      <div className="space-y-3">
        {cats.map((cat) => {
          const Icon     = cat.icon;
          const isOpen   = !collapsed[cat.id];
          const catPacked = cat.items.filter((i) => i.checked).length;
          return (
            <div key={cat.id} className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))}
                className="flex w-full items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", cat.bg, cat.color)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{cat.name}</p>
                    <p className="text-xs text-slate-400">
                      <span className="tabular-nums">{catPacked}</span> / <span className="tabular-nums">{cat.items.length}</span> packed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* mini progress */}
                  <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden hidden sm:block">
                    <div className="h-full rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${cat.items.length ? (catPacked / cat.items.length) * 100 : 0}%` }} />
                  </div>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-2 space-y-1.5">
                  {cat.items.map((item) => (
                    <div key={item.id}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                        item.checked ? "bg-slate-50 scale-[0.99]" : "bg-white hover:bg-slate-50"
                      )}>
                      {/* Checkbox */}
                      <button onClick={() => toggle(cat.id, item.id)} className="shrink-0">
                        {item.checked
                          ? <CheckSquare className="h-5 w-5 text-blue-600" />
                          : <Square className="h-5 w-5 text-slate-300 hover:text-blue-400 transition-colors" />}
                      </button>
                      {/* Label */}
                      <span className={cn(
                        "flex-1 text-sm transition-all duration-200",
                        item.checked ? "line-through text-slate-400" : "text-slate-800 font-medium"
                      )}>
                        {item.label}
                      </span>
                      {/* Delete */}
                      <button onClick={() => remove(cat.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add item row */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <input
                      ref={(el) => { newItemRefs.current[cat.id] = el; }}
                      type="text"
                      placeholder="Add item..."
                      onKeyDown={(e) => e.key === "Enter" && addItem(cat.id)}
                      className="flex-1 h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <button onClick={() => addItem(cat.id)}
                      className="h-8 w-8 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition-colors shrink-0">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
