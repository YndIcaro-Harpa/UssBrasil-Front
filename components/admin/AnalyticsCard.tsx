import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalyticsCardProps {
  title: string
  value: string | number
  change?: number
  isPositive?: boolean
  icon: LucideIcon
  description?: string
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
  variant?: 'default' | 'gradient' | 'outlined'
}

// USS Brasil - Cores Institucionais
const USS_COLORS = {
  primary: '#001941',      // Azul Profundo
  primaryHover: '#001941', // Azul Médio
  accent: '#60a5fa',       // Turquesa Suave
  cta: '#007aff',          // Azul Elétrico
  silver: '#c0c7cd',       // Prata Metálico
}

export function AnalyticsCard({ 
  title, 
  value, 
  change, 
  isPositive = true,
  icon: IconComponent, 
  description,
  color = 'primary',
  variant = 'default'
}: AnalyticsCardProps) {
  const colorVariants = {
    primary: {
      gradient: 'from-[#001941] to-[#001941]',
      bg: 'bg-[#001941]/10',
      text: 'text-[#001941]',
      border: 'border-[#001941]/20',
      iconBg: 'bg-[#001941]/10',
      iconText: 'text-[#001941]'
    },
    accent: {
      gradient: 'from-[#60a5fa] to-[#3db8c4]',
      bg: 'bg-[#60a5fa]/10',
      text: 'text-[#3db8c4]',
      border: 'border-[#60a5fa]/20',
      iconBg: 'bg-[#60a5fa]/10',
      iconText: 'text-[#60a5fa]'
    },
    success: {
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600'
    },
    warning: {
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600'
    },
    danger: {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600'
    },
    info: {
      gradient: 'from-sky-500 to-sky-600',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      iconBg: 'bg-sky-100',
      iconText: 'text-sky-600'
    }
  }

  const currentColor = colorVariants[color]

  // Variant: Gradient (para cards mais destacados)
  if (variant === 'gradient') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="h-full"
      >
        <div className={`h-full relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentColor.gradient} p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white rounded-full" />
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white rounded-full" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <IconComponent className="h-5 w-5" />
              </div>
              {change !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${
                  isPositive ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            
            <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold">{value}</p>
            {description && (
              <p className="text-white/60 text-xs mt-2">{description}</p>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Variant: Outlined
  if (variant === 'outlined') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }}
        className="h-full"
      >
        <div className={`h-full rounded-2xl border-2 ${currentColor.border} ${currentColor.bg} p-5 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2.5 ${currentColor.iconBg} rounded-xl`}>
              <IconComponent className={`h-5 w-5 ${currentColor.iconText}`} />
            </div>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className={`text-2xl lg:text-3xl font-bold ${currentColor.text}`}>{value}</p>
          {description && (
            <p className="text-gray-500 text-xs mt-2">{description}</p>
          )}
        </div>
      </motion.div>
    )
  }

  // Variant: Default
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className={`h-1.5 bg-gradient-to-r ${currentColor.gradient}`} />
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
            <motion.div 
              className={`p-2.5 rounded-xl ${currentColor.iconBg}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <IconComponent className={`h-5 w-5 ${currentColor.iconText}`} />
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-5">
          <div className="space-y-2">
            <motion.div 
              className={`text-2xl lg:text-3xl font-bold ${currentColor.text}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {value}
            </motion.div>
            
            {change !== undefined && (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isPositive 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(change)}%
                </div>
                <span className="text-xs text-gray-500">vs anterior</span>
              </motion.div>
            )}
            
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

