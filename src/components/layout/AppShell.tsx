import { TopNav } from "./TopNav";

export function AppShell({ children, noPad }: { children: React.ReactNode; noPad?: boolean }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      {noPad
        ? <main className="flex-1 overflow-hidden">{children}</main>
        : <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-10">{children}</main>
      }
    </div>
  );
}
