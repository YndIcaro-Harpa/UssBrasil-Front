/**
 * Audit Log System
 * Tracks all important actions in the system for security and compliance
 */

export type AuditAction = 
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  | 'CATEGORY_CREATE'
  | 'CATEGORY_UPDATE'
  | 'CATEGORY_DELETE'
  | 'ORDER_CREATE'
  | 'ORDER_UPDATE'
  | 'ORDER_CANCEL'
  | 'ORDER_REFUND'
  | 'COUPON_CREATE'
  | 'COUPON_UPDATE'
  | 'COUPON_DELETE'
  | 'COUPON_USED'
  | 'ADMIN_ACCESS'
  | 'SETTINGS_UPDATE'
  | 'EXPORT_DATA'
  | 'IMPORT_DATA'
  | 'API_ACCESS'

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface AuditLogEntry {
  id: string
  timestamp: string
  action: AuditAction
  severity: AuditSeverity
  userId?: string
  userEmail?: string
  userName?: string
  userRole?: string
  ip?: string
  userAgent?: string
  resource?: string
  resourceId?: string
  details?: Record<string, any>
  changes?: {
    before?: Record<string, any>
    after?: Record<string, any>
  }
  success: boolean
  errorMessage?: string
}

// In-memory store (use database in production)
const auditLogs: AuditLogEntry[] = []
const MAX_LOGS = 10000 // Keep last 10000 logs in memory

// Severity levels for different actions
const actionSeverity: Record<AuditAction, AuditSeverity> = {
  USER_LOGIN: 'low',
  USER_LOGOUT: 'low',
  USER_REGISTER: 'medium',
  USER_UPDATE: 'medium',
  USER_DELETE: 'high',
  PASSWORD_CHANGE: 'high',
  PASSWORD_RESET: 'high',
  PRODUCT_CREATE: 'medium',
  PRODUCT_UPDATE: 'medium',
  PRODUCT_DELETE: 'high',
  CATEGORY_CREATE: 'medium',
  CATEGORY_UPDATE: 'medium',
  CATEGORY_DELETE: 'high',
  ORDER_CREATE: 'medium',
  ORDER_UPDATE: 'medium',
  ORDER_CANCEL: 'high',
  ORDER_REFUND: 'critical',
  COUPON_CREATE: 'medium',
  COUPON_UPDATE: 'medium',
  COUPON_DELETE: 'high',
  COUPON_USED: 'low',
  ADMIN_ACCESS: 'medium',
  SETTINGS_UPDATE: 'high',
  EXPORT_DATA: 'high',
  IMPORT_DATA: 'critical',
  API_ACCESS: 'low'
}

/**
 * Log an audit event
 */
export function logAudit(params: {
  action: AuditAction
  userId?: string
  userEmail?: string
  userName?: string
  userRole?: string
  ip?: string
  userAgent?: string
  resource?: string
  resourceId?: string
  details?: Record<string, any>
  changes?: {
    before?: Record<string, any>
    after?: Record<string, any>
  }
  success?: boolean
  errorMessage?: string
}): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action: params.action,
    severity: actionSeverity[params.action],
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    userRole: params.userRole,
    ip: params.ip,
    userAgent: params.userAgent,
    resource: params.resource,
    resourceId: params.resourceId,
    details: params.details,
    changes: params.changes,
    success: params.success ?? true,
    errorMessage: params.errorMessage
  }
  
  // Add to logs
  auditLogs.unshift(entry)
  
  // Trim logs if exceeds max
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.splice(MAX_LOGS)
  }
  
  // Log critical events to console
  if (entry.severity === 'critical' || entry.severity === 'high') {
    console.log(`[AUDIT][${entry.severity.toUpperCase()}] ${entry.action}`, {
      user: entry.userEmail,
      resource: entry.resource,
      resourceId: entry.resourceId,
      success: entry.success
    })
  }
  
  return entry
}

/**
 * Get audit logs with filtering
 */
export function getAuditLogs(params?: {
  action?: AuditAction | AuditAction[]
  severity?: AuditSeverity | AuditSeverity[]
  userId?: string
  userEmail?: string
  resource?: string
  resourceId?: string
  startDate?: Date
  endDate?: Date
  success?: boolean
  limit?: number
  offset?: number
}): { logs: AuditLogEntry[]; total: number } {
  let filtered = [...auditLogs]
  
  if (params?.action) {
    const actions = Array.isArray(params.action) ? params.action : [params.action]
    filtered = filtered.filter(log => actions.includes(log.action))
  }
  
  if (params?.severity) {
    const severities = Array.isArray(params.severity) ? params.severity : [params.severity]
    filtered = filtered.filter(log => severities.includes(log.severity))
  }
  
  if (params?.userId) {
    filtered = filtered.filter(log => log.userId === params.userId)
  }
  
  if (params?.userEmail) {
    filtered = filtered.filter(log => log.userEmail?.toLowerCase().includes(params.userEmail!.toLowerCase()))
  }
  
  if (params?.resource) {
    filtered = filtered.filter(log => log.resource === params.resource)
  }
  
  if (params?.resourceId) {
    filtered = filtered.filter(log => log.resourceId === params.resourceId)
  }
  
  if (params?.startDate) {
    filtered = filtered.filter(log => new Date(log.timestamp) >= params.startDate!)
  }
  
  if (params?.endDate) {
    filtered = filtered.filter(log => new Date(log.timestamp) <= params.endDate!)
  }
  
  if (params?.success !== undefined) {
    filtered = filtered.filter(log => log.success === params.success)
  }
  
  const total = filtered.length
  const offset = params?.offset || 0
  const limit = params?.limit || 50
  
  return {
    logs: filtered.slice(offset, offset + limit),
    total
  }
}

/**
 * Get audit statistics
 */
export function getAuditStats(days: number = 7): {
  totalLogs: number
  byAction: Record<string, number>
  bySeverity: Record<AuditSeverity, number>
  byDay: { date: string; count: number }[]
  failedAttempts: number
  topUsers: { email: string; count: number }[]
} {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  const recentLogs = auditLogs.filter(log => new Date(log.timestamp) >= cutoffDate)
  
  // By action
  const byAction: Record<string, number> = {}
  recentLogs.forEach(log => {
    byAction[log.action] = (byAction[log.action] || 0) + 1
  })
  
  // By severity
  const bySeverity: Record<AuditSeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  }
  recentLogs.forEach(log => {
    bySeverity[log.severity]++
  })
  
  // By day
  const dayMap: Record<string, number> = {}
  recentLogs.forEach(log => {
    const date = log.timestamp.split('T')[0]
    dayMap[date] = (dayMap[date] || 0) + 1
  })
  const byDay = Object.entries(dayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
  
  // Failed attempts
  const failedAttempts = recentLogs.filter(log => !log.success).length
  
  // Top users
  const userMap: Record<string, number> = {}
  recentLogs.forEach(log => {
    if (log.userEmail) {
      userMap[log.userEmail] = (userMap[log.userEmail] || 0) + 1
    }
  })
  const topUsers = Object.entries(userMap)
    .map(([email, count]) => ({ email, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  return {
    totalLogs: recentLogs.length,
    byAction,
    bySeverity,
    byDay,
    failedAttempts,
    topUsers
  }
}

/**
 * Clear old logs (for maintenance)
 */
export function clearOldLogs(olderThan: Date): number {
  const initialCount = auditLogs.length
  const cutoffTime = olderThan.getTime()
  
  let i = auditLogs.length - 1
  while (i >= 0 && new Date(auditLogs[i].timestamp).getTime() < cutoffTime) {
    auditLogs.pop()
    i--
  }
  
  return initialCount - auditLogs.length
}

/**
 * Export logs to JSON
 */
export function exportLogs(params?: Parameters<typeof getAuditLogs>[0]): string {
  const { logs } = getAuditLogs({ ...params, limit: undefined })
  return JSON.stringify(logs, null, 2)
}

export default {
  log: logAudit,
  get: getAuditLogs,
  stats: getAuditStats,
  clear: clearOldLogs,
  export: exportLogs
}
