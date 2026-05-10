import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plane, Mail, Lock, User, Phone, MapPin, Globe, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-travel.jpg";
import { authAPI } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — Traveloop" },
      { name: "description", content: "Join Traveloop to start planning unforgettable trips." },
    ],
  }),
  component: RegisterPage,
});

function FloatingInput({
  id, type = "text", label, value, onChange, icon: Icon, error,
}: {
  id: string; type?: string; label: string; value: string;
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

function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    city: "", country: "", password: "", confirm: "", additionalInfo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (v: string) => setForm((f) => ({ ...f, [field]: v }));

  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.country.trim()) errs.country = "Country is required";
    if (form.password.length < 6) errs.password = "At least 6 characters";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length !== 0) return;

    setLoading(true);
    try {
      const res = await authAPI.register({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        city: form.city,
        country: form.country,
        phone: form.phone,
        additionalInfo: form.additionalInfo,
      });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      nav({ to: "/dashboard" });
    } catch (error: any) {
      alert(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left hero panel */}
      <div className="relative hidden lg:block">
        <img src={heroImg} alt="Scenic travel" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/75 via-primary/35 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/login" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface/20 backdrop-blur">
              <Plane className="h-5 w-5 -rotate-45" />
            </span>
            <span className="text-xl font-bold">Traveloop</span>
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight">Your next adventure starts here.</h2>
            <p className="mt-3 text-base text-primary-foreground/85 max-w-md">
              Create your account and join thousands of travellers building beautiful journeys with Traveloop.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-gradient-soft overflow-y-auto">
        <div className="w-full max-w-md py-4">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
              <Plane className="h-5 w-5 text-primary-foreground -rotate-45" />
            </span>
            <span className="text-xl font-bold">Traveloop</span>
          </div>

          <div className="rounded-2xl bg-card p-7 sm:p-8 shadow-card border border-border/60">
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Fill in your details to get started.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <FloatingInput id="firstName" label="First Name" value={form.firstName} onChange={set("firstName")} icon={User} error={errors.firstName} />
                <FloatingInput id="lastName" label="Last Name" value={form.lastName} onChange={set("lastName")} icon={User} error={errors.lastName} />
              </div>

              <FloatingInput id="email" type="email" label="Email Address" value={form.email} onChange={set("email")} icon={Mail} error={errors.email} />
              <FloatingInput id="phone" type="tel" label="Phone Number" value={form.phone} onChange={set("phone")} icon={Phone} error={errors.phone} />

              {/* City / Country row */}
              <div className="grid grid-cols-2 gap-3">
                <FloatingInput id="city" label="City" value={form.city} onChange={set("city")} icon={MapPin} error={errors.city} />
                <FloatingInput id="country" label="Country" value={form.country} onChange={set("country")} icon={Globe} error={errors.country} />
              </div>

              <FloatingInput id="password" type="password" label="Password" value={form.password} onChange={set("password")} icon={Lock} error={errors.password} />
              <FloatingInput id="confirm" type="password" label="Confirm Password" value={form.confirm} onChange={set("confirm")} icon={Lock} error={errors.confirm} />

              {/* Additional Info */}
              <div className="relative">
                <FileText className="absolute left-3.5 top-4 h-4 w-4 text-muted-foreground pointer-events-none" />
                <textarea
                  id="additionalInfo"
                  value={form.additionalInfo}
                  onChange={(e) => set("additionalInfo")(e.target.value)}
                  rows={3}
                  placeholder="Additional information (travel preferences, accessibility needs, etc.)"
                  className="w-full rounded-xl border border-input bg-surface pl-10 pr-3 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15 resize-none"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-xl shadow-elevated transition-all">
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
