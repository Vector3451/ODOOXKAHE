import { useState, useEffect, useRef } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when route changes
  useEffect(() => { setOpen(false); }, [path]);

  // Close menu on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userInitials = user ? user.name.split(' ').map((n: string) => n[0]).join('') : null;

  return (
    <header ref={menuRef} className="sticky top-0 z-40 w-full border-b border-border/60 bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
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
                {userInitials ?? <User className="h-4 w-4" />}
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
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden border-t border-border bg-surface shadow-elevated">
          {/* User identity strip */}
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-gradient-hero text-primary-foreground text-sm font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          <nav className="px-3 py-2 flex flex-col">
            {navItems.map((item) => {
              const active = path === item.to || path.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" /> Profile
            </Link>
          </nav>

          <div className="px-4 pb-4 pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full text-destructive hover:bg-destructive/10 border-destructive/30 rounded-xl h-11"
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
