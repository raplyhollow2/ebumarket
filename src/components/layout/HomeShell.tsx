"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";

/** Full-bleed home shell — no container padding so the hero can edge-to-edge. */
export function HomeShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="md:hidden">
        <div className="mx-auto min-h-dvh w-full max-w-lg bg-[#f7f4ef]">
          <main className="pb-24">{children}</main>
          <BottomNav />
        </div>
      </div>
      <div className="hidden min-h-screen bg-[#f7f4ef] md:block">
        <DesktopHeader />
        <main>{children}</main>
      </div>
    </>
  );
}
