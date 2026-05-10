import { TopNav } from "./TopNav";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-10">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
