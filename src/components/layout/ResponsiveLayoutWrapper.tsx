"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { DesktopNavigation } from "@/components/navigation/DesktopNavigation";
import { cn } from "@/lib/utils";

/**
 * Single React tree for teen pages — mobile + desktop chrome via CSS only.
 * (Previously mounted children twice inside TeenShell + DesktopShell.)
 */
export function ResponsiveLayoutWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-dvh bg-background", className)}>
      <div className="hidden md:block">
        <DesktopHeader />
        <DesktopNavigation />
      </div>

      <main className="mx-auto w-full max-w-lg px-4 pb-24 pt-4 md:container md:max-w-none md:px-4 md:py-6 md:pb-8">
        {children}
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
