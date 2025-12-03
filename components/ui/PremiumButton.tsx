'use client'

import { motion } from 'framer-motion'
import { ReactNode, ButtonHTMLAttributes } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface PremiumButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
  glowEffect?: boolean
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const PremiumButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  glowEffect = false,
  className = '',
  disabled,
  onClick,
  type = 'button'
}: PremiumButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }

  const getVariantStyles = () => {
    const baseStyles = "relative overflow-hidden font-semibold rounded-xl transition-all duration-300 transform active:scale-95"
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} text-white shadow-lg hover:shadow-xl`
      case 'secondary':
        return `${baseStyles} text-white shadow-lg hover:shadow-xl`
      case 'accent':
        return `${baseStyles} text-white shadow-lg hover:shadow-xl`
      case 'outline':
        return `${baseStyles} bg-transparent border-2 text-current hover:text-white shadow-md hover:shadow-lg`
      default:
        return baseStyles
    }
  }

  const getBackgroundStyle = () => {
    switch (variant) {
      case 'primary':
        return { background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }
      case 'secondary':
        return { background: '#f3f4f6', color: '#374151' }
      case 'accent':
        return { background: 'linear-gradient(135deg, #06B6D4, #0EA5E9)' }
      case 'outline':
        return { 
          border: '2px solid #60a5fa',
          background: 'transparent',
          color: '#3b82f6'
        }
      default:
        return { background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }
    }
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      className={`
        ${getVariantStyles()}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${glowEffect ? 'hover:shadow-2xl' : ''}
        ${className}
      `}
      style={getBackgroundStyle()}
      whileHover={!isDisabled ? { 
        y: -2,
        boxShadow: glowEffect ? '0 10px 40px -10px rgba(96, 165, 250, 0.5)' : '0 10px 30px -10px rgba(0, 0, 0, 0.2)'
      } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
    >
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative flex items-center justify-center gap-2">
        {loading ? (
          <LoadingSpinner size="sm" variant="accent" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        
        <span className={loading ? 'opacity-70' : ''}>
          {loading ? 'Carregando...' : children}
        </span>
      </div>

      {/* Glow overlay for premium effect */}
      {glowEffect && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0"
          style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}
          whileHover={{ opacity: 0.1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  )
}

export default PremiumButton

