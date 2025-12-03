'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/hooks/use-theme'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ModalProvider } from '@/contexts/ModalContext'
import { Toaster } from 'sonner'
import { Toaster as HotToaster } from 'react-hot-toast'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SessionProvider 
        refetchInterval={5 * 60} // Refetch a cada 5 minutos
        refetchOnWindowFocus={true}
      >
        <AuthProvider>
          <CartProvider>
            <ModalProvider>
              {children}
              <Toaster 
                position="top-center" 
                richColors 
                className="toast-uss"
                toastOptions={{
                  style: {
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                  },
                }}
              />
              <HotToaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#ffffff',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  },
                  success: {
                    style: {
                      background: '#00CED1',
                      color: '#fff',
                      border: '1px solid #00CED1',
                    },
                  },
                  error: {
                    style: {
                      background: '#ef4444',
                      color: '#fff',
                      border: '1px solid #ef4444',
                    },
                  },
                }}
              />
            </ModalProvider>
          </CartProvider>
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}

