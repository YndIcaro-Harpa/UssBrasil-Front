'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Plus, Filter, Search } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
  showSearch?: boolean
  onSearch?: (query: string) => void
  searchPlaceholder?: string
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  showSearch = false,
  onSearch,
  searchPlaceholder = "Buscar..."
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-3 lg:mb-4"
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1.5 text-[10px] lg:text-xs text-gray-500 mb-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center space-x-1.5">
              {index > 0 && <ChevronRight className="w-3 h-3" />}
              {crumb.href ? (
                <a 
                  href={crumb.href}
                  className="hover:text-blue-400 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-3">
        {/* Title and Description */}
        <div className="min-w-0">
          <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 text-xs lg:text-sm truncate">
              {description}
            </p>
          )}
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg 
                          text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:border-blue-400 
                          focus:ring-2 focus:ring-blue-400/20 transition-all w-full sm:w-40 lg:w-52"
              />
            </div>
          )}
          
          {actions && (
            <div className="flex items-center gap-1.5 lg:gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

