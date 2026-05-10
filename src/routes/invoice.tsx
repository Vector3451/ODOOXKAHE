import { createFileRoute } from "@tanstack/react-router";
import {
  Printer, Download, TrendingDown, TrendingUp,
  DollarSign, Plane, Hotel, Utensils, Bus, Camera,
  AlertCircle, CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

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
  id: string; date: string; description: string; category: string;
  city: string; unitCost: number; qty: number;
  icon: React.ComponentType<{ className?: string }>; iconColor: string;
};

const expenses: ExpenseRow[] = [
  { id: "e1", date: "Jun 12", description: "Flights: SFO → ATH (Round trip)",  category: "Transport",     city: "San Francisco", unitCost: 980, qty: 1, icon: Plane,    iconColor: "text-blue-600 bg-blue-50"    },
  { id: "e2", date: "Jun 12", description: "Hotel Oia Palace — 4 nights",       category: "Accommodation", city: "Santorini",     unitCost: 280, qty: 4, icon: Hotel,    iconColor: "text-purple-600 bg-purple-50" },
  { id: "e3", date: "Jun 13", description: "Sunset Catamaran Cruise",           category: "Activity",      city: "Santorini",     unitCost: 95,  qty: 2, icon: Camera,   iconColor: "text-green-600 bg-green-50"   },
  { id: "e4", date: "Jun 14", description: "Fine Dining at Ammoudi Bay",        category: "Food",          city: "Santorini",     unitCost: 120, qty: 1, icon: Utensils, iconColor: "text-orange-500 bg-orange-50" },
  { id: "e5", date: "Jun 14", description: "Winery Tour — Santo Wines",         category: "Activity",      city: "Santorini",     unitCost: 65,  qty: 2, icon: Camera,   iconColor: "text-green-600 bg-green-50"   },
  { id: "e6", date: "Jun 15", description: "Ferry: Santorini → Athens",         category: "Transport",     city: "Santorini",     unitCost: 42,  qty: 2, icon: Bus,      iconColor: "text-blue-600 bg-blue-50"    },
  { id: "e7", date: "Jun 15", description: "Hotel Plaka, Athens — 3 nights",    category: "Accommodation", city: "Athens",        unitCost: 185, qty: 3, icon: Hotel,    iconColor: "text-purple-600 bg-purple-50" },
  { id: "e8", date: "Jun 16", description: "Acropolis + Museum Tickets",        category: "Activity",      city: "Athens",        unitCost: 38,  qty: 2, icon: Camera,   iconColor: "text-green-600 bg-green-50"   },
  { id: "e9", date: "Jun 17", description: "Restaurant meals (est.)",           category: "Food",          city: "Athens",        unitCost: 45,  qty: 6, icon: Utensils, iconColor: "text-orange-500 bg-orange-50" },
];

const BUDGET_TOTAL = 3200;
const TAX_RATE     = 0.08;

const CAT_COLORS: Record<string, string> = {
  Transport:     "#2563eb",
  Accommodation: "#a855f7",
  Activity:      "#22c55e",
  Food:          "#f97316",
};

const dayBreakdown = [
  { day: "Jun 12", cost: 1092 },
  { day: "Jun 13", cost: 190 },
  { day: "Jun 14", cost: 250 },
  { day: "Jun 15", cost: 629 },
  { day: "Jun 16", cost: 76 },
  { day: "Jun 17", cost: 270 },
];

function InvoicePage() {
  const subtotal   = expenses.reduce((s, e) => s + e.unitCost * e.qty, 0);
  const tax        = Math.round(subtotal * TAX_RATE);
  const total      = subtotal + tax;
  const budgetDiff = BUDGET_TOTAL - total;
  const overBudget = budgetDiff < 0;
  const pct        = Math.min((total / BUDGET_TOTAL) * 100, 100);

  const byCategory: Record<string, number> = {};
  expenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] ?? 0) + e.unitCost * e.qty; });
  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expense Invoice</h1>
          <p className="mt-1 text-slate-500 text-sm">Santorini Escape · Jun 12 – Jun 19, 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 rounded-xl gap-2 border-slate-200 text-slate-600 hover:bg-slate-50">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="h-9 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Budget Status Bar */}
      <div className={`rounded-2xl border p-5 mb-6 ${overBudget ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {overBudget
              ? <AlertCircle className="h-5 w-5 text-red-500" />
              : <CheckCircle2 className="h-5 w-5 text-green-600" />}
            <p className="font-semibold text-slate-900">Budget Status</p>
          </div>
          <div className={`text-sm font-bold inline-flex items-center gap-1.5 ${overBudget ? "text-red-600" : "text-green-700"}`}>
            {overBudget
              ? <><TrendingDown className="h-4 w-4" /> ${Math.abs(budgetDiff).toLocaleString()} over budget</>
              : <><TrendingUp className="h-4 w-4" /> ${budgetDiff.toLocaleString()} under budget</>}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
          <span>Budget: <strong className="tabular-nums">${BUDGET_TOTAL.toLocaleString()}</strong></span>
          <span>Spent: <strong className="tabular-nums">${total.toLocaleString()}</strong></span>
        </div>
        {/* Progress bar — smoothly transitions green→red */}
        <div className="h-2.5 rounded-full bg-white/80 overflow-hidden border border-slate-200">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: overBudget
                ? "#ef4444"
                : `linear-gradient(to right, #22c55e, ${pct > 80 ? "#f97316" : "#22c55e"})`,
            }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 tabular-nums">{pct.toFixed(1)}% of budget used</p>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">

        {/* LEFT — Expense data table */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Itemized Expenses</h2>
            <p className="text-xs text-slate-400 mt-0.5">{expenses.length} line items</p>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_80px_80px] gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Description</span>
            <span>Category</span>
            <span>City</span>
            <span className="text-right">Unit</span>
            <span className="text-right">Total</span>
          </div>

          <div className="divide-y divide-slate-100">
            {expenses.map((e) => {
              const Icon = e.icon;
              const rowTotal = e.unitCost * e.qty;
              return (
                <div key={e.id} className="hidden sm:grid grid-cols-[2fr_1fr_1fr_80px_80px] gap-4 px-5 py-3.5 items-center hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${e.iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{e.description}</p>
                      <p className="text-xs text-slate-400">{e.date} · Qty: {e.qty}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CAT_COLORS[e.category] }} />
                    <span className="text-xs text-slate-500">{e.category}</span>
                  </span>
                  <span className="text-xs text-slate-500">{e.city}</span>
                  <span className="text-right text-sm text-slate-600 tabular-nums">${e.unitCost.toLocaleString()}</span>
                  <span className="text-right text-sm font-bold text-slate-900 tabular-nums">${rowTotal.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="border-t-2 border-slate-200 bg-slate-50">
            {[
              { label: "Subtotal",             val: `$${subtotal.toLocaleString()}`,      bold: false },
              { label: "Tax & Service (8%)",   val: `+$${tax.toLocaleString()}`,          bold: false },
              { label: "Total",                val: `$${total.toLocaleString()}`,          bold: true  },
            ].map(({ label, val, bold }) => (
              <div key={label} className={`flex justify-between px-5 py-3 ${bold ? "bg-blue-50 border-t border-blue-100" : "border-t border-slate-200"}`}>
                <span className={`text-sm ${bold ? "font-bold text-slate-900" : "text-slate-500"}`}>{label}</span>
                <span className={`tabular-nums text-sm ${bold ? "font-bold text-blue-600 text-base" : "font-semibold text-slate-900"}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Charts */}
        <div className="space-y-5">

          {/* Pie chart */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Spending by Category</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={CAT_COLORS[entry.name] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                    contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {pieData.sort((a, b) => b.value - a.value).map(({ name, value }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CAT_COLORS[name] }} />
                    {name}
                  </span>
                  <span className="font-bold tabular-nums text-slate-900">${value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart — daily cost */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Cost per Day</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayBreakdown} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40}
                    tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v}`, "Cost"]}
                    contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Bar dataKey="cost" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trip Summary */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Trip Summary</h3>
            <div className="space-y-2">
              {[
                { label: "Duration",      val: "7 nights" },
                { label: "Destinations", val: "2 cities" },
                { label: "Daily Average",val: `$${Math.round(total / 7)}/day` },
                { label: "Travellers",   val: "2 adults" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
