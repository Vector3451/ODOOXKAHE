import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Compass, Map, Luggage, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/landing", icon: Compass, label: "Explore" },
  { to: "/trips", icon: Luggage, label: "Trips" },
  { to: "/ai-planner", icon: Sparkles, label: "AI" },
  { to: "/map", icon: Map, label: "Map" },
];

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur border-t border-border/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">
        {mobileNavItems.map(({ to, icon: Icon, label }) => {
          const active = path === to || path.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all",
                  active ? "bg-primary/10 scale-105" : ""
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
