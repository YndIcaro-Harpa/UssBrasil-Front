'use client'

import { ReactNode } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'

// Inicializar Stripe com a chave pública
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51O49XgH5ZUZLNkrznDBAV7SCKaSoTqL10KHpqVyXUCicYqY1GSVcH0BpSfBQkAaJBXW10eyN3TqZzTH8mERnPq2D00syAXD04t'
)

interface StripeProviderProps {
  clientSecret: string
  children: ReactNode
  appearance?: StripeElementsOptions['appearance']
}

export default function StripeProvider({ 
  clientSecret, 
  children,
  appearance 
}: StripeProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: appearance || {
      theme: 'stripe',
      variables: {
        colorPrimary: '#60a5fa', // blue-400
        colorBackground: '#ffffff',
        colorText: '#1f2937', // gray-800
        colorDanger: '#ef4444', // red-500
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '0.75rem', // rounded-xl
        colorTextPlaceholder: '#9ca3af', // gray-400
      },
      rules: {
        '.Input': {
          border: '1px solid #e5e7eb', // gray-200
          padding: '12px',
          fontSize: '16px',
        },
        '.Input:focus': {
          borderColor: '#60a5fa', // blue-400
          boxShadow: '0 0 0 3px rgba(96, 165, 250, 0.1)',
        },
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151', // gray-700
          marginBottom: '8px',
        },
        '.Tab': {
          border: '1px solid #e5e7eb',
          padding: '12px 24px',
          borderRadius: '0.75rem',
        },
        '.Tab--selected': {
          borderColor: '#60a5fa',
          backgroundColor: '#eff6ff', // blue-50
        },
      },
    },
    loader: 'auto',
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}
