'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  previousValue?: string | number
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  description?: string
  className?: string
}

export default function StatCard({
  title,
  value,
  previousValue,
  icon,
  trend,
  trendValue,
  description,
  className = ''
}: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />
      case 'neutral':
        return <Minus className="h-3 w-3 text-gray-400" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      case 'neutral':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white border border-gray-100 rounded-xl p-2 
                  hover:border-blue-400/50 transition-all duration-300 
                  shadow-sm hover:shadow-md overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-gray-500 text-[8px] lg:text-[10px] font-medium uppercase tracking-wider truncate pr-1">
          {title}
        </div>
        {icon && (
          <div className="p-1 bg-blue-50 rounded text-blue-400 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <div className="text-sm lg:text-base font-bold text-gray-900 truncate">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {(trend || trendValue) && (
          <div className="flex items-center space-x-0.5">
            {getTrendIcon()}
            <span className={`text-[8px] lg:text-[10px] font-medium ${getTrendColor()}`}>
              {trendValue}
            </span>
            {previousValue && (
              <span className="text-gray-500 text-[8px] lg:text-[10px] truncate">
                vs {typeof previousValue === 'number' ? previousValue.toLocaleString() : previousValue}
              </span>
            )}
          </div>
        )}

        {description && (
          <p className="text-gray-500 text-[8px] lg:text-[10px] truncate">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

