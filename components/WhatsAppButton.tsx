'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

interface WhatsAppButtonProps {
  message?: string
  position?: 'bottom-right' | 'bottom-left'
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export function WhatsAppButton({ 
  message = '👋 Olá! Vim do site da USS Brasil Tecnologia e gostaria de mais informações.',
  position = 'bottom-right',
  size = 'lg',
  showTooltip = true
}: WhatsAppButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltipState, setShowTooltipState] = useState(false)
  const whatsappNumber = '5548991832760' // WhatsApp USS Brasil
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

  useEffect(() => {
    // Mostrar botão após 1 segundo
    const timer = setTimeout(() => setIsVisible(true), 1000)
    
    // Mostrar tooltip após 3 segundos (apenas na primeira vez)
    const tooltipTimer = setTimeout(() => {
      if (!localStorage.getItem('whatsapp-tooltip-shown')) {
        setShowTooltipState(true)
        localStorage.setItem('whatsapp-tooltip-shown', 'true')
        
        // Esconder tooltip após 5 segundos
        setTimeout(() => setShowTooltipState(false), 5000)
      }
    }, 3000)

    return () => {
      clearTimeout(timer)
      clearTimeout(tooltipTimer)
    }
  }, [])

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  }

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7'
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Tooltip */}
            {showTooltip && showTooltipState && (
              <motion.div
                initial={{ opacity: 0, x: position === 'bottom-right' ? 20 : -20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: position === 'bottom-right' ? 20 : -20, y: 20 }}
                className={`fixed z-[9999] ${position === 'bottom-right' ? 'right-24' : 'left-24'} bottom-8`}
              >
                <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-xs">
                  <button
                    onClick={() => setShowTooltipState(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-start gap-3 pr-6">
                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 mb-1">
                        USS Brasil Tecnologia
                      </p>
                      <p className="text-sm text-gray-600">
                        Precisa de ajuda? Fale conosco agora!
                      </p>
                    </div>
                  </div>
                  
                  {/* Seta apontando para o botão */}
                  <div 
                    className={`absolute -bottom-2 ${position === 'bottom-right' ? 'right-8' : 'left-8'} w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45`}
                  />
                </div>
              </motion.div>
            )}

            {/* Botão Principal */}
            <motion.a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className={`fixed z-[10000] ${positionClasses[position]} ${sizeClasses[size]} bg-[#25D366] hover:bg-[#20BD5A] rounded-full shadow-2xl flex items-center justify-center group cursor-pointer`}
              title="Fale conosco no WhatsApp"
            >
              {/* Pulse Animation */}
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping" />
              
              {/* Ícone WhatsApp */}
              <svg 
                className={`${iconSizes[size]} text-white relative z-10`}
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>

              {/* Badge de notificação (opcional) */}
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">1</span>
              </span>
            </motion.a>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

