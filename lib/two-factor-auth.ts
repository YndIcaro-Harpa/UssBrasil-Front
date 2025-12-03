/**
 * Two-Factor Authentication (2FA) System
 * Uses Web Crypto API for Edge Runtime compatibility
 */

// TOTP Configuration
const TOTP_CONFIG = {
  digits: 6,
  period: 30, // seconds
  algorithm: 'SHA-1',
  issuer: 'USS Brasil'
}

// In-memory storage for 2FA secrets and backup codes (use database in production)
const userSecrets = new Map<string, {
  secret: string
  enabled: boolean
  backupCodes: string[]
  verifiedAt?: string
}>()

// Pending email verification codes
const pendingEmailCodes = new Map<string, {
  code: string
  expiresAt: number
  attempts: number
}>()

/**
 * Generate random bytes using Web Crypto API
 */
function getRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

/**
 * Generate a random base32 secret for TOTP
 */
export function generateTOTPSecret(): string {
  const buffer = getRandomBytes(20)
  return base32Encode(buffer)
}

/**
 * Base32 encoding for TOTP secrets
 */
function base32Encode(buffer: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = ''
  let bits = 0
  let value = 0
  
  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8
    
    while (bits >= 5) {
      result += alphabet[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  
  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 31]
  }
  
  return result
}

/**
 * Base32 decoding
 */
function base32Decode(encoded: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const cleanedInput = encoded.replace(/=+$/, '').toUpperCase()
  
  let bits = 0
  let value = 0
  const result: number[] = []
  
  for (const char of cleanedInput) {
    const index = alphabet.indexOf(char)
    if (index === -1) continue
    
    value = (value << 5) | index
    bits += 5
    
    if (bits >= 8) {
      result.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  
  return new Uint8Array(result)
}

/**
 * HMAC-SHA1 using Web Crypto API
 */
async function hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data.buffer as ArrayBuffer)
  return new Uint8Array(signature)
}

/**
 * Generate TOTP code
 */
export async function generateTOTP(secret: string, time?: number): Promise<string> {
  const now = time || Math.floor(Date.now() / 1000)
  const counter = Math.floor(now / TOTP_CONFIG.period)
  
  const secretBytes = base32Decode(secret)
  const counterBytes = new Uint8Array(8)
  let temp = counter
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = temp & 0xff
    temp = Math.floor(temp / 256)
  }
  
  const hmac = await hmacSha1(secretBytes, counterBytes)
  const offset = hmac[hmac.length - 1] & 0x0f
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % Math.pow(10, TOTP_CONFIG.digits)
  
  return code.toString().padStart(TOTP_CONFIG.digits, '0')
}

/**
 * Verify TOTP code with time window tolerance
 */
export async function verifyTOTP(secret: string, code: string, window: number = 1): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000)
  
  for (let i = -window; i <= window; i++) {
    const time = now + (i * TOTP_CONFIG.period)
    const expectedCode = await generateTOTP(secret, time)
    if (expectedCode === code) {
      return true
    }
  }
  
  return false
}

/**
 * Generate TOTP URI for QR code
 */
export function generateTOTPUri(secret: string, email: string): string {
  const issuer = encodeURIComponent(TOTP_CONFIG.issuer)
  const account = encodeURIComponent(email)
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=${TOTP_CONFIG.algorithm}&digits=${TOTP_CONFIG.digits}&period=${TOTP_CONFIG.period}`
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const bytes = getRandomBytes(4)
    const code = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    codes.push(code.slice(0, 4) + '-' + code.slice(4))
  }
  return codes
}

/**
 * Setup 2FA for a user
 */
export function setup2FA(userId: string): { secret: string; backupCodes: string[]; uri: string } {
  const secret = generateTOTPSecret()
  const backupCodes = generateBackupCodes()
  
  userSecrets.set(userId, {
    secret,
    enabled: false,
    backupCodes,
  })
  
  return {
    secret,
    backupCodes,
    uri: generateTOTPUri(secret, userId)
  }
}

/**
 * Verify and enable 2FA
 */
export async function verify2FA(userId: string, code: string): Promise<boolean> {
  const data = userSecrets.get(userId)
  if (!data) return false
  
  const isValid = await verifyTOTP(data.secret, code)
  if (isValid) {
    data.enabled = true
    data.verifiedAt = new Date().toISOString()
    userSecrets.set(userId, data)
  }
  
  return isValid
}

/**
 * Check if 2FA is enabled for user
 */
export function is2FAEnabled(userId: string): boolean {
  const data = userSecrets.get(userId)
  return data?.enabled || false
}

/**
 * Verify 2FA code or backup code
 */
export async function verify2FACode(userId: string, code: string): Promise<boolean> {
  const data = userSecrets.get(userId)
  if (!data || !data.enabled) return false
  
  // Try TOTP first
  if (await verifyTOTP(data.secret, code)) {
    return true
  }
  
  // Try backup codes
  const normalizedCode = code.replace('-', '').toUpperCase()
  const backupIndex = data.backupCodes.findIndex(bc => 
    bc.replace('-', '').toUpperCase() === normalizedCode
  )
  
  if (backupIndex !== -1) {
    data.backupCodes.splice(backupIndex, 1)
    userSecrets.set(userId, data)
    return true
  }
  
  return false
}

/**
 * Disable 2FA for user
 */
export function disable2FA(userId: string): boolean {
  return userSecrets.delete(userId)
}

/**
 * Generate email verification code
 */
export function generateEmailCode(userId: string): string {
  const bytes = getRandomBytes(3)
  const code = Array.from(bytes).map(b => (b % 10).toString()).join('')
  
  pendingEmailCodes.set(userId, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0
  })
  
  return code
}

/**
 * Verify email code
 */
export function verifyEmailCode(userId: string, code: string): boolean {
  const pending = pendingEmailCodes.get(userId)
  if (!pending) return false
  
  if (Date.now() > pending.expiresAt) {
    pendingEmailCodes.delete(userId)
    return false
  }
  
  pending.attempts++
  if (pending.attempts > 3) {
    pendingEmailCodes.delete(userId)
    return false
  }
  
  if (pending.code === code) {
    pendingEmailCodes.delete(userId)
    return true
  }
  
  pendingEmailCodes.set(userId, pending)
  return false
}

// Export types
export interface TwoFactorSetupResult {
  secret: string
  backupCodes: string[]
  uri: string
}

export interface TwoFactorVerifyResult {
  success: boolean
  message: string
}

// Default export with all methods grouped
const twoFactorAuth = {
  // Setup and configuration
  setup: setup2FA,
  enable: (userId: string) => {
    const result = setup2FA(userId)
    return {
      secret: result.secret,
      backupCodes: result.backupCodes,
      provisioningURI: result.uri
    }
  },
  confirm: async (userId: string, code: string) => {
    const result = await verify2FA(userId, code)
    return result
  },
  disable: disable2FA,
  
  // Verification
  verify: async (userId: string, code: string) => {
    const data = userSecrets.get(userId)
    if (!data?.enabled) return { valid: false, method: null }
    
    // Try TOTP first
    const totpValid = await verifyTOTP(data.secret, code)
    if (totpValid) return { valid: true, method: 'totp' }
    
    // Try backup code
    const backupIndex = data.backupCodes.indexOf(code)
    if (backupIndex !== -1) {
      data.backupCodes.splice(backupIndex, 1)
      userSecrets.set(userId, data)
      return { valid: true, method: 'backup' }
    }
    
    return { valid: false, method: null }
  },
  
  // Status checks
  isEnabled: is2FAEnabled,
  getBackupCodesCount: (userId: string) => {
    const data = userSecrets.get(userId)
    return data?.backupCodes?.length || 0
  },
  
  // Backup codes
  regenerateBackupCodes: async (userId: string, code: string) => {
    const valid = await verify2FACode(userId, code)
    if (!valid) return null
    
    const data = userSecrets.get(userId)
    if (!data) return null
    
    const newCodes = generateBackupCodes(10)
    data.backupCodes = newCodes
    userSecrets.set(userId, data)
    return newCodes
  },
  
  // Email verification
  generateEmailCode,
  verifyEmailCode,
  
  // Core functions
  generateSecret: generateTOTPSecret,
  generateTOTP,
  verifyTOTP,
  generateBackupCodes
}

export default twoFactorAuth
