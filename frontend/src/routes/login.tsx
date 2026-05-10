import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plane, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-travel.jpg";
import { authAPI } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Traveloop" },
      { name: "description", content: "Log in to plan and manage your trips with Traveloop." },
    ],
  }),
  component: LoginPage,
});

function FloatingInput({
  id, type, label, value, onChange, icon: Icon, error,
}: {
  id: string; type: string; label: string; value: string;
  onChange: (v: string) => void; icon: React.ComponentType<{ className?: string }>; error?: string;
}) {
  return (
    <div className="relative">
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          className="peer w-full rounded-xl border border-input bg-surface pl-10 pr-3 pt-5 pb-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-10 top-1.5 text-[11px] font-medium text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-primary"
        >
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-destructive pl-1">{error}</p>}
    </div>
  );
}

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (password.length < 6) errs.password = "At least 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length !== 0) return;

    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      nav({ to: "/dashboard" });
    } catch (error: any) {
      alert(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:block">
        <img src={heroImg} alt="Tropical beach" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/70 via-primary/30 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/login" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface/20 backdrop-blur">
              <Plane className="h-5 w-5 -rotate-45" />
            </span>
            <span className="text-xl font-bold">Traveloop</span>
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight">Plan unforgettable journeys.</h2>
            <p className="mt-3 text-base text-primary-foreground/85 max-w-md">
              Build multi-city itineraries, track budgets, and share your adventures — all in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-gradient-soft">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
              <Plane className="h-5 w-5 text-primary-foreground -rotate-45" />
            </span>
            <span className="text-xl font-bold">Traveloop</span>
          </div>

          <div className="rounded-2xl bg-card p-7 sm:p-8 shadow-card border border-border/60">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Log in to continue planning your next trip.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <FloatingInput id="email" type="email" label="Email address" value={email} onChange={setEmail} icon={Mail} error={errors.email} />
              <FloatingInput id="password" type="password" label="Password" value={password} onChange={setPassword} icon={Lock} error={errors.password} />

              <div className="flex justify-end">
                <button type="button" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-xl shadow-elevated transition-all">
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button className="font-semibold text-primary hover:text-primary-hover transition-colors">Sign up</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
