import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Sparkles, MapPin, Star, ArrowRight, Globe2, Wallet, ShieldCheck, Users, Plane, Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import santorini from "@/assets/trip-santorini.jpg";
import bali from "@/assets/dest-bali.jpg";
import paris from "@/assets/dest-paris.jpg";
import tokyo from "@/assets/dest-tokyo.jpg";
import { publicAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Traveloop — Plan unforgettable trips with AI" },
      { name: "description", content: "Traveloop is the AI-powered travel planner that crafts personalized itineraries, budgets and maps in seconds." },
    ],
  }),
  component: LandingPage,
});



const features = [
  { icon: Sparkles, title: "AI itineraries", desc: "Day-by-day plans tailored to your style, pace and budget — generated in seconds." },
  { icon: Wallet, title: "Smart budgets", desc: "Real-time tracking, expense splitting and clear breakdowns across categories." },
  { icon: Globe2, title: "Maps that move", desc: "Beautiful interactive routes with rich destination context built right in." },
  { icon: ShieldCheck, title: "Safe & private", desc: "Your trips, photos and notes stay yours. Encrypted by default, always." },
  { icon: Users, title: "Travel community", desc: "Discover real itineraries, photos and tips from travelers like you." },
  { icon: Compass, title: "Offline ready", desc: "Pack lists, tickets and maps in your pocket — even off the grid." },
];

function LandingPage() {
  const { data: statsData } = useQuery({
    queryKey: ["stats"],
    queryFn: () => publicAPI.getStats(),
  });

  const stats = [
    { value: statsData?.trips || 0, label: "Trips planned" },
    { value: statsData?.countries || 0, label: "Countries" },
    { value: statsData?.users || 0, label: "Travelers" },
    { value: statsData?.posts || 0, label: "Memories Shared" },
  ];

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      {/* Nav */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Traveloop</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Sign in</Link>
            <Link to="/register">
              <Button className="rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 shadow-md">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 mb-6"
            >
              <Sparkles className="h-4 w-4" /> AI Planner now in public beta
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
            >
              Plan unforgettable trips, <span className="text-blue-600">in seconds.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed"
            >
              Traveloop's AI crafts personalized itineraries, smart budgets and beautiful maps — 
              so you spend less time planning and more time exploring the world.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link to="/register">
                <Button className="h-14 px-8 rounded-2xl bg-blue-600 text-lg font-bold text-white hover:bg-blue-700 shadow-xl shadow-blue-200">
                  <Sparkles className="h-5 w-5 mr-2" /> Start Planning with AI
                </Button>
              </Link>
              <Link to="/landing">
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 text-lg font-bold text-slate-700 hover:bg-slate-50 bg-white">
                  Explore Destinations
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              {stats.map(s => (
                <div key={s.label} className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Why Traveloop</h2>
            <p className="text-4xl font-bold text-slate-900 leading-tight">Everything you need, <br/>nothing you don't.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-20 opacity-10">
          <Plane className="h-64 w-64 rotate-12" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Join over a million travelers.</h2>
              <p className="text-slate-400 text-lg mb-10">
                From solo backpackers to luxury families, Traveloop is the OS for the curious. 
                Get started today and see why we're the #1 rated travel planner.
              </p>
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="h-12 w-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold">
                       {["JD", "SC", "MR", "PS"][i-1]}
                     </div>
                   ))}
                 </div>
                 <p className="text-sm font-semibold text-slate-300">Trusted by 42k+ new users this month</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {[paris, tokyo, bali, santorini].map((img, i) => (
                 <div key={i} className={cn("rounded-3xl overflow-hidden h-48", i % 2 !== 0 && "mt-8")}>
                    <img src={img} className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer" />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-slate-900">Traveloop</span>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-slate-400">© 2026 Traveloop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
