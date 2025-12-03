'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Activity, Clock, User, Shield, AlertTriangle, 
  Filter, Download, RefreshCw, ChevronDown, Search,
  CheckCircle, XCircle, Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FadeInUp, AnimatedCard } from '@/components/admin/PageTransition'
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/SkeletonLoaders'
import { toast } from 'react-hot-toast'

interface AuditLog {
  id: string
  timestamp: string
  action: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  userEmail?: string
  userName?: string
  userRole?: string
  resource?: string
  resourceId?: string
  details?: Record<string, any>
  success: boolean
  errorMessage?: string
}

interface AuditStats {
  totalLogs: number
  byAction: Record<string, number>
  bySeverity: Record<string, number>
  byDay: { date: string; count: number }[]
  failedAttempts: number
  topUsers: { email: string; count: number }[]
}

const severityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700'
}

const actionLabels: Record<string, string> = {
  USER_LOGIN: 'Login de Usuário',
  USER_LOGOUT: 'Logout de Usuário',
  USER_REGISTER: 'Registro de Usuário',
  USER_UPDATE: 'Atualização de Usuário',
  USER_DELETE: 'Exclusão de Usuário',
  PASSWORD_CHANGE: 'Alteração de Senha',
  PASSWORD_RESET: 'Redefinição de Senha',
  PRODUCT_CREATE: 'Criação de Produto',
  PRODUCT_UPDATE: 'Atualização de Produto',
  PRODUCT_DELETE: 'Exclusão de Produto',
  CATEGORY_CREATE: 'Criação de Categoria',
  CATEGORY_UPDATE: 'Atualização de Categoria',
  CATEGORY_DELETE: 'Exclusão de Categoria',
  ORDER_CREATE: 'Novo Pedido',
  ORDER_UPDATE: 'Atualização de Pedido',
  ORDER_CANCEL: 'Cancelamento de Pedido',
  ORDER_REFUND: 'Reembolso de Pedido',
  COUPON_CREATE: 'Criação de Cupom',
  COUPON_UPDATE: 'Atualização de Cupom',
  COUPON_DELETE: 'Exclusão de Cupom',
  COUPON_USED: 'Uso de Cupom',
  ADMIN_ACCESS: 'Acesso ao Admin',
  SETTINGS_UPDATE: 'Atualização de Configurações',
  EXPORT_DATA: 'Exportação de Dados',
  IMPORT_DATA: 'Importação de Dados',
  API_ACCESS: 'Acesso à API'
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    severity: '',
    action: '',
    search: '',
    success: ''
  })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const fetchLogs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (filter.severity) params.set('severity', filter.severity)
      if (filter.action) params.set('action', filter.action)
      if (filter.success) params.set('success', filter.success)
      if (filter.search) params.set('userEmail', filter.search)
      
      const response = await fetch(`/api/admin/audit-log?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/audit-log?stats=true&days=7', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [fetchLogs, fetchStats])

  const exportLogs = () => {
    const csv = [
      ['Data', 'Ação', 'Severidade', 'Usuário', 'Recurso', 'Sucesso'].join(','),
      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString('pt-BR'),
        actionLabels[log.action] || log.action,
        log.severity,
        log.userEmail || '-',
        log.resource || '-',
        log.success ? 'Sim' : 'Não'
      ].map(v => `"${v}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Logs exportados!')
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={10} columns={6} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-6 w-6 text-[#001941]" />
              Registro de Auditoria
            </h1>
            <p className="text-gray-500">Histórico de atividades do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={exportLogs}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button 
              onClick={() => { fetchLogs(); fetchStats(); }}
              className="bg-[#001941] hover:bg-[#023a58]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </FadeInUp>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AnimatedCard delay={0.1}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total (7 dias)</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalLogs}</p>
                  </div>
                  <Activity className="h-10 w-10 text-[#001941]/20" />
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Falhas</p>
                    <p className="text-3xl font-bold text-red-700">{stats.failedAttempts}</p>
                  </div>
                  <XCircle className="h-10 w-10 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.3}>
            <Card className="border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Alta Severidade</p>
                    <p className="text-3xl font-bold text-orange-700">
                      {(stats.bySeverity.high || 0) + (stats.bySeverity.critical || 0)}
                    </p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.4}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Usuários Ativos</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.topUsers.length}</p>
                  </div>
                  <User className="h-10 w-10 text-[#001941]/20" />
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      )}

      {/* Filters */}
      <FadeInUp delay={0.2}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por email..."
                  value={filter.search}
                  onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="w-full"
                />
              </div>
              <select
                value={filter.severity}
                onChange={(e) => setFilter(f => ({ ...f, severity: e.target.value }))}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#001941]"
              >
                <option value="">Todas Severidades</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
              <select
                value={filter.success}
                onChange={(e) => setFilter(f => ({ ...f, success: e.target.value }))}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#001941]"
              >
                <option value="">Todos Status</option>
                <option value="true">Sucesso</option>
                <option value="false">Falha</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </FadeInUp>

      {/* Logs Table */}
      <FadeInUp delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>Logs de Atividade</CardTitle>
            <CardDescription>{logs.length} registro(s) encontrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum log encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Data/Hora</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Ação</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Usuário</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Severidade</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr 
                        key={log.id} 
                        className={`border-b hover:bg-gray-50 transition-colors ${
                          log.severity === 'critical' ? 'bg-red-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">
                            {actionLabels[log.action] || log.action}
                          </span>
                          {log.resource && (
                            <p className="text-xs text-gray-500">
                              {log.resource} {log.resourceId && `#${log.resourceId}`}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {log.userEmail || log.userName || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={severityColors[log.severity]}>
                            {log.severity === 'low' ? 'Baixa' :
                             log.severity === 'medium' ? 'Média' :
                             log.severity === 'high' ? 'Alta' : 'Crítica'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {log.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log)
                              setShowDetails(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInUp>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detalhes do Log</span>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-mono text-sm">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data/Hora</p>
                  <p>{new Date(selectedLog.timestamp).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ação</p>
                  <p className="font-medium">{actionLabels[selectedLog.action] || selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Severidade</p>
                  <Badge className={severityColors[selectedLog.severity]}>
                    {selectedLog.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Usuário</p>
                  <p>{selectedLog.userEmail || selectedLog.userName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={selectedLog.success ? 'text-green-600' : 'text-red-600'}>
                    {selectedLog.success ? 'Sucesso' : 'Falha'}
                  </p>
                </div>
              </div>
              
              {selectedLog.resource && (
                <div>
                  <p className="text-sm text-gray-500">Recurso</p>
                  <p>{selectedLog.resource} {selectedLog.resourceId && `#${selectedLog.resourceId}`}</p>
                </div>
              )}
              
              {selectedLog.errorMessage && (
                <div>
                  <p className="text-sm text-gray-500">Erro</p>
                  <p className="text-red-600 bg-red-50 p-2 rounded">{selectedLog.errorMessage}</p>
                </div>
              )}
              
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Detalhes</p>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

