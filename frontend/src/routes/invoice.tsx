import { createFileRoute } from "@tanstack/react-router";
import {
  Printer, Download, TrendingDown, TrendingUp,
  DollarSign, Plane, Hotel, Utensils, Bus, Camera,
  AlertCircle, CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/invoice")({
  head: () => ({
    meta: [
      { title: "Expense Invoice — Traveloop" },
      { name: "description", content: "Detailed expense breakdown and invoice for your trip." },
    ],
  }),
  component: InvoicePage,
});

type ExpenseRow = {
  id: string;
  date: string;
  description: string;
  category: string;
  city: string;
  unitCost: number;
  qty: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
};

const expenses: ExpenseRow[] = [
  { id: "e1", date: "Jun 12", description: "Flights: SFO → ATH (Round trip)", category: "Transport", city: "San Francisco", unitCost: 980, qty: 1, icon: Plane, iconColor: "text-primary bg-primary/10" },
  { id: "e2", date: "Jun 12", description: "Hotel Oia Palace — 4 nights", category: "Accommodation", city: "Santorini", unitCost: 280, qty: 4, icon: Hotel, iconColor: "text-violet-600 bg-violet-100" },
  { id: "e3", date: "Jun 13", description: "Sunset Catamaran Cruise", category: "Activity", city: "Santorini", unitCost: 95, qty: 2, icon: Camera, iconColor: "text-emerald-600 bg-emerald-100" },
  { id: "e4", date: "Jun 14", description: "Fine Dining at Ammoudi Bay", category: "Food", city: "Santorini", unitCost: 120, qty: 1, icon: Utensils, iconColor: "text-accent bg-accent/10" },
  { id: "e5", date: "Jun 14", description: "Winery Tour — Santo Wines", category: "Activity", city: "Santorini", unitCost: 65, qty: 2, icon: Camera, iconColor: "text-emerald-600 bg-emerald-100" },
  { id: "e6", date: "Jun 15", description: "Ferry: Santorini → Athens", category: "Transport", city: "Santorini", unitCost: 42, qty: 2, icon: Bus, iconColor: "text-primary bg-primary/10" },
  { id: "e7", date: "Jun 15", description: "Hotel Plaka, Athens — 3 nights", category: "Accommodation", city: "Athens", unitCost: 185, qty: 3, icon: Hotel, iconColor: "text-violet-600 bg-violet-100" },
  { id: "e8", date: "Jun 16", description: "Acropolis + Museum Tickets", category: "Activity", city: "Athens", unitCost: 38, qty: 2, icon: Camera, iconColor: "text-emerald-600 bg-emerald-100" },
  { id: "e9", date: "Jun 17", description: "Restaurant meals (est.)", category: "Food", city: "Athens", unitCost: 45, qty: 6, icon: Utensils, iconColor: "text-accent bg-accent/10" },
];

const BUDGET_TOTAL = 3200;
const TAX_RATE = 0.08;

function InvoicePage() {
  const subtotal = expenses.reduce((s, e) => s + e.unitCost * e.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;
  const budgetDiff = BUDGET_TOTAL - total;
  const overBudget = budgetDiff < 0;

  // Category breakdown for budget insights
  const byCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.unitCost * e.qty;
  });

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expense Invoice</h1>
          <p className="mt-1.5 text-muted-foreground text-sm">Santorini Escape · Jun 12 – Jun 19, 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 rounded-xl gap-2 border-border">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="h-10 rounded-xl gap-2 bg-primary hover:bg-primary-hover text-primary-foreground shadow-elevated">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Invoice header block */}
      <div className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-elevated mb-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">Invoice #</p>
            <p className="text-lg font-bold mt-0.5">TL-2026-0142</p>
            <p className="text-xs opacity-70 mt-1">Issued: May 10, 2026</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">Traveller</p>
            <p className="text-lg font-bold mt-0.5">Alex Johnson</p>
            <p className="text-xs opacity-70 mt-1">alex.johnson@email.com</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">Total Amount</p>
            <p className="text-3xl font-bold mt-0.5">${total.toLocaleString()}</p>
            <p className="text-xs opacity-70 mt-1">incl. taxes & fees</p>
          </div>
        </div>
      </div>

      {/* Main layout: table + side card */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Expense table */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Itemized Expenses</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{expenses.length} line items</p>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Description</span>
            <span>Category</span>
            <span>City</span>
            <span className="text-right">Unit Cost</span>
            <span className="text-right">Subtotal</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {expenses.map((e) => {
              const Icon = e.icon;
              const rowTotal = e.unitCost * e.qty;
              return (
                <div key={e.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                  <div className="sm:hidden">
                    {/* Mobile layout */}
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${e.iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.description}</p>
                        <p className="text-xs text-muted-foreground">{e.city} · {e.date}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground">${rowTotal}</p>
                    </div>
                  </div>
                  <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${e.iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.description}</p>
                        <p className="text-xs text-muted-foreground">{e.date} · Qty: {e.qty}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{e.category}</span>
                    <span className="text-xs text-muted-foreground">{e.city}</span>
                    <span className="text-right text-sm text-foreground">${e.unitCost}</span>
                    <span className="text-right text-sm font-semibold text-foreground">${rowTotal}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtotals */}
          <div className="border-t-2 border-border bg-muted/30">
            <div className="divide-y divide-border/60">
              <div className="flex justify-between px-5 py-3 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-5 py-3 text-sm">
                <span className="text-muted-foreground">Tax & Service Fees (8%)</span>
                <span className="font-semibold text-foreground">+${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-5 py-4 bg-primary/5">
                <span className="font-bold text-foreground text-base">Total</span>
                <span className="text-xl font-bold text-primary">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Insights sidebar */}
        <div className="space-y-5">
          {/* Budget status */}
          <div className={`rounded-2xl border shadow-card p-5 ${overBudget ? "border-destructive/30 bg-destructive/5" : "border-emerald-200 bg-emerald-50"}`}>
            <div className="flex items-center gap-2 mb-3">
              {overBudget
                ? <AlertCircle className="h-5 w-5 text-destructive" />
                : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              <h3 className="font-semibold text-foreground">Budget Status</h3>
            </div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-xs text-muted-foreground">Planned Budget</p>
                <p className="text-lg font-bold text-foreground">${BUDGET_TOTAL.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Actual Spent</p>
                <p className="text-lg font-bold text-foreground">${total.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-2">
              <div
                className={`h-full rounded-full ${overBudget ? "bg-destructive" : "bg-emerald-500"}`}
                style={{ width: `${Math.min((total / BUDGET_TOTAL) * 100, 100)}%` }}
              />
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${overBudget ? "text-destructive" : "text-emerald-700"}`}>
              {overBudget
                ? <><TrendingDown className="h-4 w-4" /> ${Math.abs(budgetDiff).toLocaleString()} over budget</>
                : <><TrendingUp className="h-4 w-4" /> ${budgetDiff.toLocaleString()} under budget</>}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="rounded-2xl bg-card border border-border/60 shadow-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Spending by Category</h3>
            <div className="space-y-3">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => {
                  const pct = Math.round((amount / subtotal) * 100);
                  const catColorMap: Record<string, string> = {
                    Transport: "bg-primary",
                    Accommodation: "bg-violet-500",
                    Activity: "bg-emerald-500",
                    Food: "bg-accent",
                  };
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-foreground">{cat}</span>
                        <span className="font-semibold text-foreground">${amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${catColorMap[cat] ?? "bg-primary"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-2xl bg-card border border-border/60 shadow-card p-5">
            <h3 className="font-semibold text-foreground mb-3">Trip Summary</h3>
            <div className="space-y-2">
              {[
                { label: "Duration", value: "7 nights" },
                { label: "Destinations", value: "2 cities" },
                { label: "Daily Average", value: `$${Math.round(total / 7)}/day` },
                { label: "Travellers", value: "2 adults" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-0">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-xs font-semibold text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
