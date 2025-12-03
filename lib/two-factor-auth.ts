/**
 * Two-Factor Authentication (2FA) System
 * Supports TOTP (Time-based One-Time Password) and Email verification
 */

import { randomBytes, createHmac } from 'crypto'

// TOTP Configuration
const TOTP_CONFIG = {
  digits: 6,
  period: 30, // seconds
  algorithm: 'SHA1',
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
 * Generate a random base32 secret for TOTP
 */
export function generateTOTPSecret(): string {
  const buffer = randomBytes(20)
  return base32Encode(buffer)
}

/**
 * Base32 encoding for TOTP secrets
 */
function base32Encode(buffer: Buffer): string {
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
function base32Decode(encoded: string): Buffer {
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
  
  return Buffer.from(result)
}

/**
 * Generate TOTP code based on secret and current time
 */
export function generateTOTP(secret: string, timestamp?: number): string {
  const time = timestamp ?? Date.now()
  const counter = Math.floor(time / 1000 / TOTP_CONFIG.period)
  
  // Convert counter to 8-byte buffer
  const counterBuffer = Buffer.alloc(8)
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = counter & 0xff
    counter >>> 8
  }
  
  // Generate HMAC
  const key = base32Decode(secret)
  const hmac = createHmac('sha1', key)
  hmac.update(counterBuffer)
  const hash = hmac.digest()
  
  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f
  const code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff)
  
  const otp = code % Math.pow(10, TOTP_CONFIG.digits)
  return otp.toString().padStart(TOTP_CONFIG.digits, '0')
}

/**
 * Verify TOTP code with time window tolerance
 */
export function verifyTOTP(secret: string, code: string, window: number = 1): boolean {
  const now = Date.now()
  
  // Check current and adjacent time windows
  for (let i = -window; i <= window; i++) {
    const time = now + (i * TOTP_CONFIG.period * 1000)
    const expectedCode = generateTOTP(secret, time)
    
    if (expectedCode === code) {
      return true
    }
  }
  
  return false
}

/**
 * Generate provisioning URI for authenticator apps
 */
export function generateProvisioningURI(
  secret: string, 
  userEmail: string,
  issuer: string = TOTP_CONFIG.issuer
): string {
  const encodedEmail = encodeURIComponent(userEmail)
  const encodedIssuer = encodeURIComponent(issuer)
  
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?` +
         `secret=${secret}&issuer=${encodedIssuer}&algorithm=${TOTP_CONFIG.algorithm}&` +
         `digits=${TOTP_CONFIG.digits}&period=${TOTP_CONFIG.period}`
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = []
  
  for (let i = 0; i < count; i++) {
    const bytes = randomBytes(4)
    const code = bytes.toString('hex').toUpperCase()
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`)
  }
  
  return codes
}

/**
 * Enable 2FA for a user
 */
export function enableTwoFactor(userId: string): {
  secret: string
  provisioningURI: string
  backupCodes: string[]
} {
  const secret = generateTOTPSecret()
  const backupCodes = generateBackupCodes()
  
  userSecrets.set(userId, {
    secret,
    enabled: false, // Not enabled until verified
    backupCodes
  })
  
  return {
    secret,
    provisioningURI: generateProvisioningURI(secret, userId),
    backupCodes
  }
}

/**
 * Confirm and activate 2FA after first successful verification
 */
export function confirmTwoFactor(userId: string, code: string): boolean {
  const userData = userSecrets.get(userId)
  
  if (!userData) {
    return false
  }
  
  if (verifyTOTP(userData.secret, code)) {
    userData.enabled = true
    userData.verifiedAt = new Date().toISOString()
    userSecrets.set(userId, userData)
    return true
  }
  
  return false
}

/**
 * Verify 2FA code (TOTP or backup code)
 */
export function verifyTwoFactor(userId: string, code: string): {
  valid: boolean
  method?: 'totp' | 'backup'
} {
  const userData = userSecrets.get(userId)
  
  if (!userData || !userData.enabled) {
    return { valid: false }
  }
  
  // Try TOTP first
  if (verifyTOTP(userData.secret, code)) {
    return { valid: true, method: 'totp' }
  }
  
  // Try backup codes
  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const formattedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4, 8)}`
  
  const backupIndex = userData.backupCodes.indexOf(formattedCode)
  if (backupIndex !== -1) {
    // Remove used backup code
    userData.backupCodes.splice(backupIndex, 1)
    userSecrets.set(userId, userData)
    return { valid: true, method: 'backup' }
  }
  
  return { valid: false }
}

/**
 * Disable 2FA for a user
 */
export function disableTwoFactor(userId: string, code: string): boolean {
  const userData = userSecrets.get(userId)
  
  if (!userData) {
    return false
  }
  
  // Require valid code to disable
  const verification = verifyTwoFactor(userId, code)
  if (verification.valid) {
    userSecrets.delete(userId)
    return true
  }
  
  return false
}

/**
 * Check if user has 2FA enabled
 */
export function hasTwoFactorEnabled(userId: string): boolean {
  const userData = userSecrets.get(userId)
  return userData?.enabled ?? false
}

/**
 * Get remaining backup codes count
 */
export function getBackupCodesCount(userId: string): number {
  const userData = userSecrets.get(userId)
  return userData?.backupCodes.length ?? 0
}

/**
 * Regenerate backup codes
 */
export function regenerateBackupCodes(userId: string, code: string): string[] | null {
  const userData = userSecrets.get(userId)
  
  if (!userData || !userData.enabled) {
    return null
  }
  
  // Verify with current code first
  if (!verifyTOTP(userData.secret, code)) {
    return null
  }
  
  const newCodes = generateBackupCodes()
  userData.backupCodes = newCodes
  userSecrets.set(userId, userData)
  
  return newCodes
}

// ============ Email-based 2FA (simpler alternative) ============

/**
 * Generate and store email verification code
 */
export function generateEmailCode(userId: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  
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
export function verifyEmailCode(userId: string, code: string): {
  valid: boolean
  expired?: boolean
  maxAttempts?: boolean
} {
  const pending = pendingEmailCodes.get(userId)
  
  if (!pending) {
    return { valid: false }
  }
  
  if (Date.now() > pending.expiresAt) {
    pendingEmailCodes.delete(userId)
    return { valid: false, expired: true }
  }
  
  pending.attempts++
  
  if (pending.attempts > 5) {
    pendingEmailCodes.delete(userId)
    return { valid: false, maxAttempts: true }
  }
  
  if (pending.code === code) {
    pendingEmailCodes.delete(userId)
    return { valid: true }
  }
  
  pendingEmailCodes.set(userId, pending)
  return { valid: false }
}

/**
 * Clean up expired email codes (call periodically)
 */
export function cleanupExpiredCodes(): number {
  const now = Date.now()
  let cleaned = 0
  
  for (const [userId, data] of pendingEmailCodes) {
    if (now > data.expiresAt) {
      pendingEmailCodes.delete(userId)
      cleaned++
    }
  }
  
  return cleaned
}

// Cleanup expired codes every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredCodes, 5 * 60 * 1000)
}

export default {
  // TOTP
  generateSecret: generateTOTPSecret,
  generateTOTP,
  verifyTOTP,
  generateProvisioningURI,
  generateBackupCodes,
  // User management
  enable: enableTwoFactor,
  confirm: confirmTwoFactor,
  verify: verifyTwoFactor,
  disable: disableTwoFactor,
  isEnabled: hasTwoFactorEnabled,
  getBackupCodesCount,
  regenerateBackupCodes,
  // Email-based
  generateEmailCode,
  verifyEmailCode
}
