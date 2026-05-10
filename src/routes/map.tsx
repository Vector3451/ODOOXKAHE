import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Layers, Navigation, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "World Map — Traveloop" },
      { name: "description", content: "Explore your destinations on an interactive map." },
    ],
  }),
  component: MapPage,
});

const points = [
  { id: "santorini", name: "Santorini", lat: 36.3932, lng: 25.4615 },
  { id: "paris", name: "Paris", lat: 48.8566, lng: 2.3522 },
  { id: "tokyo", name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { id: "bali", name: "Bali", lat: -8.3405, lng: 115.0920 },
  { id: "iceland", name: "Reykjavík", lat: 64.1466, lng: -21.9426 },
];

function MapPage() {
  const [Leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import("react-leaflet"),
      import("leaflet")
    ]).then(([rl, L]) => {
      // Fix default marker icon issues
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setLeaflet(rl);
    });
  }, []);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">World Map</h1>
            <p className="mt-1.5 text-muted-foreground text-sm">Interactive visualization of all your travel destinations.</p>
          </div>
          <div className="flex gap-2">
            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-border shadow-sm hover:bg-slate-50 transition-colors">
              <Layers className="h-4 w-4 text-slate-600" />
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-border shadow-sm hover:bg-slate-50 transition-colors">
              <Navigation className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden h-[50vh] sm:h-[500px] lg:h-[600px] relative">
            {!Leaflet ? (
              <div className="h-full w-full flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-500">Loading Map Engine...</p>
                </div>
              </div>
            ) : (
              <Leaflet.MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} className="h-full w-full z-10">
                <Leaflet.TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Leaflet.Polyline 
                  positions={points.map(p => [p.lat, p.lng])} 
                  pathOptions={{ color: "#2563eb", weight: 2, dashArray: "5, 10" }} 
                />
                {points.map(p => (
                  <Leaflet.Marker key={p.id} position={[p.lat, p.lng]}>
                    <Leaflet.Popup>
                      <div className="p-1">
                        <p className="font-bold text-slate-900 mb-0.5">{p.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Saved Destination</p>
                      </div>
                    </Leaflet.Popup>
                  </Leaflet.Marker>
                ))}
              </Leaflet.MapContainer>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest px-1">Recent Pinned</h3>
            <div className="space-y-3">
              {points.map(p => (
                <div key={p.id} className="group p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <MapPin className="h-5 w-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                     <p className="text-[11px] text-slate-500 font-medium">Lat: {p.lat.toFixed(2)}, Lng: {p.lng.toFixed(2)}</p>
                   </div>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
               <h4 className="font-bold text-sm">Distance Tracked</h4>
               <p className="text-2xl font-black mt-1">12,482 <span className="text-xs font-medium opacity-80">km</span></p>
               <p className="text-[10px] opacity-80 mt-2 leading-relaxed">You've traveled 42% of the world's circumference this year!</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
