'use client'

import { usePathname } from 'next/navigation'
import NavbarEnhanced from './navbar-enhanced'
import ModernFooter from './navigation/modern-footer'
import GlobalModals from './modals'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin') || false

  return (
    <>
      {!isAdminRoute && <NavbarEnhanced />}
      <main className="min-h-screen bg-white transition-colors duration-300">
        <div className="relative">
          {children}
        </div>
      </main>
      {!isAdminRoute && <ModernFooter />}
      {!isAdminRoute && <GlobalModals />}
    </>
  )
}

