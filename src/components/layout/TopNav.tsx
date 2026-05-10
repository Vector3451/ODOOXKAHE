import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Plane, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { to: "/landing", label: "Explore" },
  { to: "/trips", label: "My Trips" },
  { to: "/ai-planner", label: "AI Planner" },
  { to: "/search", label: "Search" },
  { to: "/packing", label: "Packing" },
  { to: "/map", label: "Map" },
  { to: "/invoice", label: "Invoice" },
  { to: "/admin", label: "Admin" },
];

export function TopNav() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-elevated transition-transform group-hover:scale-105">
            <Plane className="h-5 w-5 text-primary-foreground -rotate-45" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">Traveloop</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = path === item.to || path.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/profile">
            <Avatar className="h-9 w-9 ring-2 ring-border hover:ring-primary transition-all cursor-pointer">
              <AvatarFallback className="bg-gradient-hero text-primary-foreground text-sm font-semibold">
                {user ? user.name.split(' ').map((n: string) => n[0]).join('') : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            Sign Out
          </Button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
            <div className="mt-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={handleLogout} className="w-full text-destructive hover:bg-destructive/10 border-destructive/30">Sign Out</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
