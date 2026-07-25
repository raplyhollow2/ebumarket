import { TeenShell } from './teen-shell'
import { DesktopShell } from './DesktopShell'

export interface ResponsiveLayoutWrapperProps {
  children: React.ReactNode
  className?: string
}

/**
 * CSS-first responsive layout wrapper that eliminates mobile flash on desktop.
 * Uses Tailwind responsive classes instead of JavaScript for instant layout switching.
 */
export function ResponsiveLayoutWrapper({ children, className = '' }: ResponsiveLayoutWrapperProps) {
  return (
    <div className={className}>
      {/* Mobile layout: visible on screens < 768px (mobile and tablet) */}
      <div className="block md:hidden">
        <TeenShell>{children}</TeenShell>
      </div>

      {/* Desktop layout: visible on screens >= 768px (desktop and wide) */}
      <div className="hidden md:block">
        <DesktopShell>{children}</DesktopShell>
      </div>
    </div>
  )
}