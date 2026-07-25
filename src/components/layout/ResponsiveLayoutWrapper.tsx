'use client'

import { useEffect, useState } from 'react'
import { useWindowSize } from '@/lib/hooks/use-window-size'
import { TeenShell } from './teen-shell'
import { DesktopShell } from './DesktopShell'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide'

export interface ResponsiveLayoutWrapperProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveLayoutWrapper({ children, className = '' }: ResponsiveLayoutWrapperProps) {
  const { width } = useWindowSize()
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('mobile')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    if (width < 768) {
      setBreakpoint('mobile')
    } else if (width < 1024) {
      setBreakpoint('tablet')
    } else if (width < 1280) {
      setBreakpoint('desktop')
    } else {
      setBreakpoint('wide')
    }
  }, [width, isClient])

  // Show mobile layout during SSR or while determining breakpoint
  if (!isClient) {
    return <TeenShell className={className}>{children}</TeenShell>
  }

  // Use mobile layout for mobile and tablet
  if (breakpoint === 'mobile' || breakpoint === 'tablet') {
    return <TeenShell className={className}>{children}</TeenShell>
  }

  // Use desktop layout for desktop and wide screens
  return <DesktopShell className={className}>{children}</DesktopShell>
}