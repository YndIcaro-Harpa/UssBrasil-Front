'use client'

import { usePathname } from 'next/navigation'
import NavbarImproved from '@/components/navbar-improved'
import ModernFooter from '@/components/navigation/modern-footer'
import GlobalModals from '@/components/modals'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin') || false

  return (
    <>
      {!isAdminRoute && <NavbarImproved />}
      <main className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
        <div className="relative">
          {children}
        </div>
      </main>
      {!isAdminRoute && <ModernFooter />}
      {!isAdminRoute && <GlobalModals />}
    </>
  )
}
