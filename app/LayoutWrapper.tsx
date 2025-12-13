'use client'

import { usePathname } from 'next/navigation'
import NavbarImproved from '@/components/navbar-improved'
import ModernFooter from '@/components/navigation/modern-footer'
import GlobalModals from '@/components/modals'
import { WhatsAppButton } from '@/components/WhatsAppButton'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin') || false

  return (
    <>
      {!isAdminRoute && <NavbarImproved />}
      {/* Espaçamento para navbar sticky */}
      {!isAdminRoute && <div className="h-12" />}
      <main className="min-h-screen bg-white transition-colors duration-300">
        <div className="relative">
          {children}
        </div>
      </main>
      {!isAdminRoute && <ModernFooter />}
      {!isAdminRoute && <GlobalModals />}
      {!isAdminRoute && <WhatsAppButton />}
    </>
  )
}

