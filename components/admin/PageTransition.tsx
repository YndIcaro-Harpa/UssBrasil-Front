'use client'

import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      when: 'beforeChildren' as const,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
}

const childVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
}

/**
 * PageTransition - Componente para animações suaves de transição entre páginas
 * 
 * Features:
 * - Fade in/out com movimento suave
 * - Scale effect sutil para profundidade
 * - Stagger animation para elementos filhos
 * - Responsivo e otimizado para performance
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * StaggeredContainer - Container para animação em cascata dos elementos
 */
interface StaggeredContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function StaggeredContainer({ 
  children, 
  className = '',
  delay = 0 
}: StaggeredContainerProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      className={className}
      variants={{
        initial: {},
        enter: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * FadeInUp - Animação de entrada com fade e movimento para cima
 */
interface FadeInUpProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FadeInUp({ children, className = '', delay = 0 }: FadeInUpProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * SlideIn - Animação de entrada com slide lateral
 */
interface SlideInProps {
  children: ReactNode
  className?: string
  direction?: 'left' | 'right'
  delay?: number
}

export function SlideIn({ 
  children, 
  className = '', 
  direction = 'left',
  delay = 0 
}: SlideInProps) {
  const x = direction === 'left' ? -30 : 30

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.4, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * ScaleIn - Animação de entrada com scale
 */
interface ScaleInProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScaleIn({ children, className = '', delay = 0 }: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * AnimatedCard - Card com hover e animação de entrada
 */
interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      transition={{ 
        duration: 0.4, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
