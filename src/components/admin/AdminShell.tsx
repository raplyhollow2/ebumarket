"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Receipt,
  PanelsTopLeft,
  FlaskConical,
  BarChart3,
  Settings,
  ExternalLink,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MODULES = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Queue", icon: CheckSquare, exact: true },
  { href: "/admin/centers", label: "Centres", icon: Building2 },
  { href: "/admin/transactions", label: "Money", icon: Receipt },
  { href: "/admin/cms", label: "CMS", icon: PanelsTopLeft },
  { href: "/admin/experiments", label: "A/B", icon: FlaskConical },
  { href: "/admin/analytics", label: "Stats", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 md:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Zyra ERP
            </p>
            <h1 className="truncate font-[family-name:var(--font-display)] text-lg font-semibold md:text-xl">
              {title || "Operations"}
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Site
          </Link>
        </div>

        {/* Mobile: horizontal scroll module nav */}
        <nav
          className="flex gap-1 overflow-x-auto border-t px-2 py-2 md:hidden"
          aria-label="ERP modules"
        >
          {MODULES.map((m) => {
            const active = isActive(pathname, m.href, "exact" in m ? m.exact : false);
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={cn(
                  "flex min-w-[4.5rem] flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-3 py-4 md:grid-cols-[220px_1fr] md:px-6 md:py-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1 rounded-xl border bg-background p-2">
            {MODULES.map((m) => {
              const active = isActive(pathname, m.href, "exact" in m ? m.exact : false);
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {m.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 pb-8">{children}</main>
      </div>
    </div>
  );
}
