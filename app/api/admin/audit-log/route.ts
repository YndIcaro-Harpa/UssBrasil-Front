import { NextRequest, NextResponse } from 'next/server'
import { getAuditLogs, getAuditStats, type AuditAction, type AuditSeverity } from '@/lib/audit-log'

// GET - Get audit logs or stats
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization (simplified - in production use proper auth)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    
    // If requesting stats
    if (searchParams.get('stats') === 'true') {
      const days = parseInt(searchParams.get('days') || '7')
      const stats = getAuditStats(days)
      return NextResponse.json({ success: true, stats })
    }
    
    // Get logs with filters
    const action = searchParams.get('action') as AuditAction | null
    const severity = searchParams.get('severity') as AuditSeverity | null
    const userId = searchParams.get('userId')
    const userEmail = searchParams.get('userEmail')
    const resource = searchParams.get('resource')
    const resourceId = searchParams.get('resourceId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const success = searchParams.get('success')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const result = getAuditLogs({
      action: action || undefined,
      severity: severity || undefined,
      userId: userId || undefined,
      userEmail: userEmail || undefined,
      resource: resource || undefined,
      resourceId: resourceId || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      success: success !== null ? success === 'true' : undefined,
      limit,
      offset
    })
    
    return NextResponse.json({
      success: true,
      ...result,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < result.total
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
