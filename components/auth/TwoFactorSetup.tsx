'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, Smartphone, Key, Copy, Check, Loader2, 
  AlertTriangle, RefreshCw, X, Eye, EyeOff, Mail
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

interface TwoFactorSetupProps {
  onComplete?: () => void
}

type Step = 'initial' | 'setup' | 'confirm' | 'backup-codes' | 'complete'

export default function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('initial')
  const [enabled, setEnabled] = useState(false)
  const [backupCodesRemaining, setBackupCodesRemaining] = useState(0)
  
  // Setup data
  const [secret, setSecret] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showSecret, setShowSecret] = useState(false)
  
  // Verification
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedBackup, setCopiedBackup] = useState(false)

  // Check 2FA status on mount
  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/two-factor', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setEnabled(data.twoFactorEnabled)
        setBackupCodesRemaining(data.backupCodesRemaining)
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetup = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'setup' })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSecret(data.secret)
        setQrCodeUrl(data.qrCodeUrl)
        setBackupCodes(data.backupCodes)
        setStep('setup')
      } else {
        const error = await response.json()
        toast.error(error.error)
      }
    } catch (error) {
      toast.error('Erro ao iniciar configuração')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (code.length !== 6) {
      toast.error('Digite um código de 6 dígitos')
      return
    }
    
    setVerifying(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'confirm', code })
      })
      
      if (response.ok) {
        toast.success('2FA ativado com sucesso!')
        setStep('backup-codes')
      } else {
        const error = await response.json()
        toast.error(error.error)
        setCode('')
      }
    } catch (error) {
      toast.error('Erro ao verificar código')
    } finally {
      setVerifying(false)
    }
  }

  const handleDisable = async () => {
    if (code.length !== 6 && code.length !== 9) {
      toast.error('Digite um código válido')
      return
    }
    
    setVerifying(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/auth/two-factor?code=${code}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        toast.success('2FA desativado')
        setEnabled(false)
        setStep('initial')
        setCode('')
      } else {
        const error = await response.json()
        toast.error(error.error)
      }
    } catch (error) {
      toast.error('Erro ao desativar 2FA')
    } finally {
      setVerifying(false)
    }
  }

  const handleRegenerateBackupCodes = async () => {
    if (code.length !== 6) {
      toast.error('Digite o código do seu autenticador')
      return
    }
    
    setVerifying(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'regenerate-backup', code })
      })
      
      if (response.ok) {
        const data = await response.json()
        setBackupCodes(data.backupCodes)
        setBackupCodesRemaining(data.backupCodes.length)
        toast.success('Novos códigos gerados!')
        setCode('')
      } else {
        const error = await response.json()
        toast.error(error.error)
      }
    } catch (error) {
      toast.error('Erro ao gerar novos códigos')
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = (text: string, isBackup = false) => {
    navigator.clipboard.writeText(text)
    if (isBackup) {
      setCopiedBackup(true)
      setTimeout(() => setCopiedBackup(false), 2000)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    toast.success('Copiado!')
  }

  if (loading && step === 'initial') {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#034a6e]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#034a6e]" />
          Autenticação de Dois Fatores (2FA)
        </CardTitle>
        <CardDescription>
          Adicione uma camada extra de segurança à sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {/* Initial State */}
          {step === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {enabled ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">2FA está ativado</p>
                      <p className="text-sm text-green-600">
                        {backupCodesRemaining} código(s) de backup restante(s)
                      </p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-700">Ativo</Badge>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Códigos de Backup
                      </h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Gere novos códigos de backup se você perdeu os anteriores
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Código do autenticador"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="max-w-[200px]"
                        />
                        <Button
                          onClick={handleRegenerateBackupCodes}
                          disabled={verifying || code.length !== 6}
                          variant="outline"
                        >
                          {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                          Gerar Novos
                        </Button>
                      </div>
                      
                      {backupCodes.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Seus códigos de backup:</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(backupCodes.join('\n'), true)}
                            >
                              {copiedBackup ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {backupCodes.map((code, i) => (
                              <code key={i} className="text-sm bg-white p-2 rounded border font-mono">
                                {code}
                              </code>
                            ))}
                          </div>
                          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Guarde estes códigos em local seguro!
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h4 className="font-medium text-red-800 mb-2">Desativar 2FA</h4>
                      <p className="text-sm text-red-600 mb-4">
                        Digite seu código para desativar a autenticação de dois fatores
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Código"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/[^A-Za-z0-9-]/g, '').slice(0, 9))}
                          className="max-w-[200px]"
                        />
                        <Button
                          onClick={handleDisable}
                          disabled={verifying}
                          variant="destructive"
                        >
                          {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Desativar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-800">2FA não está ativado</p>
                      <p className="text-sm text-amber-600">
                        Sua conta está menos protegida
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg hover:border-[#034a6e] transition-colors cursor-pointer" onClick={handleSetup}>
                      <div className="flex items-center gap-3 mb-3">
                        <Smartphone className="w-8 h-8 text-[#034a6e]" />
                        <div>
                          <h4 className="font-medium">App Autenticador</h4>
                          <p className="text-sm text-gray-500">Google Authenticator, Authy, etc.</p>
                        </div>
                      </div>
                      <Button className="w-full bg-[#034a6e] hover:bg-[#023a58]" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Configurar'}
                      </Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg opacity-60">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-8 h-8 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-600">Email</h4>
                          <p className="text-sm text-gray-400">Em breve</p>
                        </div>
                      </div>
                      <Button className="w-full" disabled>
                        Em Breve
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Setup Step */}
          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Escaneie o QR Code</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Use seu app autenticador para escanear o código abaixo
                </p>
                
                {qrCodeUrl && (
                  <div className="inline-block p-4 bg-white border-2 rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Ou digite o código manualmente:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                    {showSecret ? secret : '••••••••••••••••'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(secret)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <label className="block text-sm font-medium mb-2">
                  Digite o código do seu autenticador para confirmar
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="max-w-[200px] text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleConfirm}
                    disabled={verifying || code.length !== 6}
                    className="bg-[#034a6e] hover:bg-[#023a58]"
                  >
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Verificar
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setStep('initial')}
                className="w-full"
              >
                Cancelar
              </Button>
            </motion.div>
          )}

          {/* Backup Codes Step */}
          {step === 'backup-codes' && (
            <motion.div
              key="backup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2FA Ativado com Sucesso!</h3>
                <p className="text-sm text-gray-500">
                  Guarde estes códigos de backup em um local seguro
                </p>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Importante!</p>
                    <p className="text-sm text-amber-700">
                      Cada código só pode ser usado uma vez. Se perder acesso ao seu autenticador, 
                      use um código de backup para entrar na conta.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Códigos de Backup</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(backupCodes.join('\n'), true)}
                  >
                    {copiedBackup ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    Copiar Todos
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <code key={i} className="text-sm bg-white p-2 rounded border font-mono text-center">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={() => {
                  setStep('initial')
                  setEnabled(true)
                  setBackupCodesRemaining(backupCodes.length)
                  onComplete?.()
                }}
                className="w-full bg-[#034a6e] hover:bg-[#023a58]"
              >
                Entendi, Continuar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
