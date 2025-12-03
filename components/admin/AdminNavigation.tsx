'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  description?: string
  badge?: string
  badgeColor?: 'default' | 'warning' | 'success' | 'error'
}

interface AdminNavigationProps {
  items: NavigationItem[]
  collapsed?: boolean
}

export default function AdminNavigation({ items, collapsed = false }: AdminNavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="px-2 lg:px-3 space-y-1">
      {items.map((item) => {
        const active = isActive(item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.name}
            href={item.href}
            className="block"
          >
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex items-center px-2 py-2 lg:px-3 lg:py-2.5 rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 ${active ? 'text-white' : 'text-blue-400'}`} />
              
              {!collapsed && (
                <>
                  <div className="ml-2 lg:ml-3 flex-1 min-w-0">
                    <span className={`text-xs lg:text-sm font-medium ${active ? 'text-white' : ''} truncate block`}>
                      {item.name}
                    </span>
                    {item.description && (
                      <p className={`text-xs mt-0.5 ${active ? 'text-white/70' : 'text-blue-400'} hidden lg:block truncate`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  {item.badge && (
                    <span className={`
                      ml-auto px-1.5 lg:px-2 py-0.5 text-xs font-medium rounded-full
                      ${active 
                        ? 'bg-white/20 text-white' 
                        : item.badgeColor === 'warning'
                          ? 'bg-amber-500 text-white'
                          : item.badgeColor === 'success'
                            ? 'bg-green-500 text-white'
                            : item.badgeColor === 'error'
                              ? 'bg-red-500 text-white'
                              : 'bg-blue-500 text-white'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </motion.div>
          </Link>
        )
      })}
    </nav>
  )
}
