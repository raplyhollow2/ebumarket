'use client'

import { ReactNode } from 'react'
import { DesktopHeader } from './DesktopHeader'
import { DesktopNavigation } from '../navigation/DesktopNavigation'

export interface DesktopShellProps {
  children: ReactNode
  className?: string
}

export function DesktopShell({ children, className = '' }: DesktopShellProps) {
  return (
    <div className={`desktop-shell min-h-screen bg-background ${className}`}>
      <DesktopHeader />
      <DesktopNavigation />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}