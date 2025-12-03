'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// GA4 Measurement ID - Get from environment variable
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

// Check if analytics should be enabled
const isEnabled = () => {
  if (typeof window === 'undefined') return false
  if (!GA_MEASUREMENT_ID) return false
  if (process.env.NODE_ENV !== 'production') return false
  return true
}

// Send page view to GA
export const pageview = (url: string) => {
  if (!isEnabled()) return
  
  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: url
  })
}

// Send event to GA
export const event = ({
  action,
  category,
  label,
  value
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (!isEnabled()) return
  
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value
  })
}

// E-commerce specific events
export const ecommerce = {
  viewItem: (item: {
    id: string
    name: string
    category?: string
    brand?: string
    price: number
  }) => {
    if (!isEnabled()) return
    
    window.gtag?.('event', 'view_item', {
      currency: 'BRL',
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        item_brand: item.brand,
        price: item.price
      }]
    })
  },
  
  addToCart: (item: {
    id: string
    name: string
    category?: string
    brand?: string
    price: number
    quantity: number
  }) => {
    if (!isEnabled()) return
    
    window.gtag?.('event', 'add_to_cart', {
      currency: 'BRL',
      value: item.price * item.quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        item_brand: item.brand,
        price: item.price,
        quantity: item.quantity
      }]
    })
  },
  
  removeFromCart: (item: {
    id: string
    name: string
    price: number
    quantity: number
  }) => {
    if (!isEnabled()) return
    
    window.gtag?.('event', 'remove_from_cart', {
      currency: 'BRL',
      value: item.price * item.quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }]
    })
  },
  
  beginCheckout: (items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>, value: number) => {
    if (!isEnabled()) return
    
    window.gtag?.('event', 'begin_checkout', {
      currency: 'BRL',
      value,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    })
  },
  
  purchase: (transaction: {
    transactionId: string
    value: number
    shipping?: number
    tax?: number
    items: Array<{
      id: string
      name: string
      price: number
      quantity: number
    }>
  }) => {
    if (!isEnabled()) return
    
    window.gtag?.('event', 'purchase', {
      transaction_id: transaction.transactionId,
      currency: 'BRL',
      value: transaction.value,
      shipping: transaction.shipping,
      tax: transaction.tax,
      items: transaction.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    })
  },
  
  search: (searchTerm: string) => {
    if (!isEnabled()) return
    
    window.gtag?.('event', 'search', {
      search_term: searchTerm
    })
  },
  
  viewItemList: (listName: string, items: Array<{
    id: string
    name: string
    price: number
  }>) => {
    if (!isEnabled()) return
    
    window.gtag?.('event', 'view_item_list', {
      item_list_name: listName,
      items: items.map((item, index) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        index
      }))
    })
  },
  
  addToWishlist: (item: {
    id: string
    name: string
    price: number
  }) => {
    if (!isEnabled()) return
    
    window.gtag?.('event', 'add_to_wishlist', {
      currency: 'BRL',
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price
      }]
    })
  }
}

// User events
export const user = {
  login: (method: string) => {
    if (!isEnabled()) return
    window.gtag?.('event', 'login', { method })
  },
  
  signUp: (method: string) => {
    if (!isEnabled()) return
    window.gtag?.('event', 'sign_up', { method })
  }
}

// Component to track page views
function AnalyticsPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (!pathname) return
    
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname
    
    pageview(url)
  }, [pathname, searchParams])
  
  return null
}

// Main GoogleAnalytics component
export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null
  
  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `
        }}
      />
      <Suspense fallback={null}>
        <AnalyticsPageview />
      </Suspense>
    </>
  )
}

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
  }
}
