'use client'

import { BottomNav } from "@/components/layout/bottom-nav"

export interface TeenShellProps {
  children: React.ReactNode
  className?: string
}

export function TeenShell({ children, className = '' }: TeenShellProps) {
  return (
    <div className={`mobile-shell mx-auto min-h-dvh w-full max-w-lg bg-background ${className}`}>
      <main className="px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
