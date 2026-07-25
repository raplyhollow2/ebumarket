"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";

/** Full-bleed home — single tree; no container padding so hero is edge-to-edge. */
export function HomeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="hidden md:block">
        <DesktopHeader />
      </div>
      <main className="pb-24 md:pb-0">{children}</main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
