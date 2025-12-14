import { NextRequest, NextResponse } from 'next/server'


// In-memory storage for wishlist (in production, use database)
const wishlists = new Map<string, Set<string>>()

// Helper to get user ID from token
function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  
  const token = authHeader.substring(7)
  try {
    // In production, verify JWT token properly
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub || payload.id
  } catch {
    return null
  }
}

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userWishlist = wishlists.get(userId) || new Set()
    
    return NextResponse.json({
      success: true,
      wishlist: Array.from(userWishlist),
      count: userWishlist.size
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { productId } = body
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    if (!wishlists.has(userId)) {
      wishlists.set(userId, new Set())
    }
    
    const userWishlist = wishlists.get(userId)!
    userWishlist.add(String(productId))
    
    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: Array.from(userWishlist),
      count: userWishlist.size
    })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}

// PUT - Toggle item in wishlist (add if not exists, remove if exists)
export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { productId } = body
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    if (!wishlists.has(userId)) {
      wishlists.set(userId, new Set())
    }
    
    const userWishlist = wishlists.get(userId)!
    const productIdStr = String(productId)
    let action: 'added' | 'removed'
    
    if (userWishlist.has(productIdStr)) {
      userWishlist.delete(productIdStr)
      action = 'removed'
    } else {
      userWishlist.add(productIdStr)
      action = 'added'
    }
    
    return NextResponse.json({
      success: true,
      action,
      message: action === 'added' ? 'Added to wishlist' : 'Removed from wishlist',
      wishlist: Array.from(userWishlist),
      count: userWishlist.size
    })
  } catch (error) {
    console.error('Error toggling wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to toggle wishlist' },
      { status: 500 }
    )
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const clearAll = searchParams.get('clearAll') === 'true'
    
    if (!wishlists.has(userId)) {
      return NextResponse.json({
        success: true,
        message: 'Wishlist is already empty',
        wishlist: [],
        count: 0
      })
    }
    
    const userWishlist = wishlists.get(userId)!
    
    if (clearAll) {
      userWishlist.clear()
      return NextResponse.json({
        success: true,
        message: 'Wishlist cleared',
        wishlist: [],
        count: 0
      })
    }
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    userWishlist.delete(String(productId))
    
    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: Array.from(userWishlist),
      count: userWishlist.size
    })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}
