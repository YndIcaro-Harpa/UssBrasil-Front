'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Key,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Loader2,
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileSecurityProps {
  userId: string
  session: any
}

export default function ProfileSecurity({ userId, session }: ProfileSecurityProps) {
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handleChangePassword = async () => {
    // Validations
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Preencha todos os campos')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const token = session?.accessToken
      await api.auth.changePassword(token, passwordForm.currentPassword, passwordForm.newPassword)
      
      toast.success('Senha alterada com sucesso!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle2FA = async () => {
    toast.info('Autenticação em dois fatores em breve!')
  }

  const handleLogoutAllDevices = async () => {
    if (!confirm('Isso irá desconectar você de todos os dispositivos. Continuar?')) return

    try {
      await signOut({ redirect: true, callbackUrl: '/' })
      toast.success('Desconectado de todos os dispositivos')
    } catch (error) {
      toast.error('Erro ao desconectar')
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const configs = [
      { label: 'Muito fraca', color: 'bg-red-500' },
      { label: 'Fraca', color: 'bg-orange-500' },
      { label: 'Razoável', color: 'bg-yellow-500' },
      { label: 'Boa', color: 'bg-blue-500' },
      { label: 'Forte', color: 'bg-green-500' },
    ]

    return { strength, ...configs[Math.min(strength, 4)] }
  }

  const passwordStrength = getPasswordStrength(passwordForm.newPassword)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Segurança</h2>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie sua senha e configurações de segurança
        </p>
      </div>

      {/* Change Password */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Alterar Senha</h3>
            <p className="text-sm text-gray-500">Mantenha sua conta segura com uma senha forte</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="pl-10 pr-10"
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="pl-10 pr-10"
                placeholder="Digite sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Password Strength */}
            {passwordForm.newPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
                  {passwordStrength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="pl-10 pr-10"
                placeholder="Confirme sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                As senhas não coincidem
              </p>
            )}
            {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
              <p className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                As senhas coincidem
              </p>
            )}
          </div>

          <Button 
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Key className="h-4 w-4 mr-2" />
            )}
            Alterar Senha
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Smartphone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Autenticação em Dois Fatores
              </h3>
              <p className="text-sm text-gray-500">
                Adicione uma camada extra de segurança à sua conta
              </p>
            </div>
          </div>
          <Button
            variant={twoFactorEnabled ? 'destructive' : 'default'}
            onClick={handleToggle2FA}
          >
            {twoFactorEnabled ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <LogOut className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Sessões Ativas
              </h3>
              <p className="text-sm text-gray-500">
                Desconecte-se de todos os dispositivos
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogoutAllDevices}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Sair de Tudo
          </Button>
        </div>
      </div>

      {/* Security Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Dicas de Segurança</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Use uma senha com pelo menos 8 caracteres</li>
              <li>• Inclua letras maiúsculas, números e símbolos</li>
              <li>• Não use a mesma senha em outros sites</li>
              <li>• Ative a autenticação em dois fatores</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
