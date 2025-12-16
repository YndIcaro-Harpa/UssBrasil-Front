'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import QuickActionModals from '@/components/admin/QuickActionModals'
import { PageTransition } from '@/components/admin/PageTransition'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleQuickAction = (action: string) => {
    setActiveModal(action)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar 
        collapsed={sidebarCollapsed}
        open={sidebarOpen}
        isMobile={isMobile}
        onToggleCollapse={toggleSidebar}
        onCloseMobile={closeMobileSidebar}
        onQuickAction={handleQuickAction}
      />

      {/* Header */}
      <AdminHeader 
        sidebarCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <main 
        className={`pt-12 min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-20' : 'ml-72')
        }`}
      >
        <div className="p-4">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

      {/* Quick Action Modals */}
      <QuickActionModals
        activeModal={activeModal}
        onClose={closeModal}
      />
    </div>
  )
}

