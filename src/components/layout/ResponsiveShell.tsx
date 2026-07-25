'use client'

import { useEffect, useState } from 'react'
import { useWindowSize } from '@/lib/hooks/use-window-size'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide'

export interface ResponsiveShellProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveShell({ children, className = '' }: ResponsiveShellProps) {
  const { width } = useWindowSize()
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('mobile')

  useEffect(() => {
    if (width < 768) {
      setBreakpoint('mobile')
    } else if (width < 1024) {
      setBreakpoint('tablet')
    } else if (width < 1280) {
      setBreakpoint('desktop')
    } else {
      setBreakpoint('wide')
    }
  }, [width])

  return (
    <div className={`responsive-shell breakpoint-${breakpoint} ${className}`}>
      {children}
    </div>
  )
}