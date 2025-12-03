// Utils for password hashing compatible with Edge Runtime
// Uses Web Crypto API instead of Node.js crypto module

const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'default-secret-key'

// Hash password using Web Crypto API (Edge Runtime compatible)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + SECRET_KEY)
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}

// Synchronous version using simple hash (for compatibility)
export function hashPasswordSync(password: string): string {
  // Simple hash implementation for sync operations
  let hash = 0
  const str = password + SECRET_KEY
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

export function verifyPasswordSync(password: string, hashedPassword: string): boolean {
  const hash = hashPasswordSync(password)
  return hash === hashedPassword
}
