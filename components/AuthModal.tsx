'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff, User, Phone, Loader2, AlertCircle, Shield, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { BACKEND_URL } from '@/lib/config'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: (user: any, token: string) => void
  initialMode?: 'login' | 'register'
  redirectMessage?: string
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  initialMode = 'login',
  redirectMessage
}: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setIsLoginMode(initialMode === 'login')
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, initialMode])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!isLoginMode) {
      if (!formData.name || formData.name.trim().length < 3) {
        newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
      }
      if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = 'Telefone inválido'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Credenciais inválidas')
      }

      // Salvar em múltiplas chaves para garantir compatibilidade
      const token = data.access_token || data.token
      localStorage.setItem('auth_token', token)
      localStorage.setItem('uss_auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(data.user))
      localStorage.setItem('uss_user_data', JSON.stringify(data.user))

      toast.success(`Bem-vindo de volta, ${data.user.name}!`)
      onLoginSuccess?.(data.user, token)
      onClose()
      resetForm()

    } catch (error: any) {
      throw error
    }
  }

  const handleRegister = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta')
      }

      // Salvar em múltiplas chaves para garantir compatibilidade
      const token = data.access_token || data.token
      localStorage.setItem('auth_token', token)
      localStorage.setItem('uss_auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(data.user))
      localStorage.setItem('uss_user_data', JSON.stringify(data.user))

      toast.success(`Conta criada com sucesso! Bem-vindo, ${data.user.name}!`)
      onLoginSuccess?.(data.user, token)
      onClose()
      resetForm()

    } catch (error: any) {
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      if (isLoginMode) {
        await handleLogin()
      } else {
        await handleRegister()
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao processar requisição'
      setErrors({ general: errorMessage })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: ''
    })
    setErrors({})
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    resetForm()
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white w-full max-w-[420px] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com gradiente USS Brasil */}
            <div className="bg-gradient-to-r from-[#034a6e] to-[#065a84] px-6 py-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center justify-center gap-3 text-center pt-2">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <span className="text-[#034a6e] font-bold text-3xl">U</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-2xl tracking-wide">USS BRASIL</h1>
                  <p className="text-white/80 text-sm font-medium">Tecnologia Premium</p>
                </div>
              </div>
            </div>

            {/* Tabs Login/Cadastro */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => { setIsLoginMode(true); resetForm(); }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${
                  isLoginMode 
                    ? 'text-[#034a6e]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Entrar
                {isLoginMode && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#034a6e]" 
                  />
                )}
              </button>
              <button
                onClick={() => { setIsLoginMode(false); resetForm(); }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${
                  !isLoginMode 
                    ? 'text-[#034a6e]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Criar Conta
                {!isLoginMode && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#034a6e]" 
                  />
                )}
              </button>
            </div>

            {/* Form Container */}
            <div className="p-6">
              {/* Mensagem de redirecionamento */}
              {redirectMessage && (
                <div className="mb-4 p-3 bg-[#034a6e]/5 border border-[#034a6e]/20 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#034a6e] flex-shrink-0" />
                  <p className="text-sm text-[#034a6e]">{redirectMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Erro geral */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}

                {/* Campo Nome (apenas cadastro) */}
                <AnimatePresence mode="wait">
                  {!isLoginMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-gray-700 text-xs font-medium mb-1.5 uppercase tracking-wide">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-lg text-gray-900 text-sm
                                   placeholder-gray-400 focus:outline-none focus:bg-white transition-all
                                   ${errors.name 
                                     ? 'border-red-300 focus:border-red-400' 
                                     : 'border-gray-200 focus:border-[#034a6e] focus:ring-1 focus:ring-[#034a6e]/20'}`}
                          placeholder="Digite seu nome completo"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Campo Email */}
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-lg text-gray-900 text-sm
                               placeholder-gray-400 focus:outline-none focus:bg-white transition-all
                               ${errors.email 
                                 ? 'border-red-300 focus:border-red-400' 
                                 : 'border-gray-200 focus:border-[#034a6e] focus:ring-1 focus:ring-[#034a6e]/20'}`}
                      placeholder="seu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Campo Telefone (apenas cadastro) */}
                <AnimatePresence mode="wait">
                  {!isLoginMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-gray-700 text-xs font-medium mb-1.5 uppercase tracking-wide">
                        Telefone <span className="text-gray-400 font-normal">(opcional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-lg text-gray-900 text-sm
                                   placeholder-gray-400 focus:outline-none focus:bg-white transition-all
                                   ${errors.phone 
                                     ? 'border-red-300 focus:border-red-400' 
                                     : 'border-gray-200 focus:border-[#034a6e] focus:ring-1 focus:ring-[#034a6e]/20'}`}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Campo Senha */}
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-1.5 uppercase tracking-wide">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full pl-11 pr-11 py-3 bg-gray-50 border rounded-lg text-gray-900 text-sm
                               placeholder-gray-400 focus:outline-none focus:bg-white transition-all
                               ${errors.password 
                                 ? 'border-red-300 focus:border-red-400' 
                                 : 'border-gray-200 focus:border-[#034a6e] focus:ring-1 focus:ring-[#034a6e]/20'}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Campo Confirmar Senha (apenas cadastro) */}
                <AnimatePresence mode="wait">
                  {!isLoginMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-gray-700 text-xs font-medium mb-1.5 uppercase tracking-wide">
                        Confirmar Senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className={`w-full pl-11 pr-11 py-3 bg-gray-50 border rounded-lg text-gray-900 text-sm
                                   placeholder-gray-400 focus:outline-none focus:bg-white transition-all
                                   ${errors.confirmPassword 
                                     ? 'border-red-300 focus:border-red-400' 
                                     : 'border-gray-200 focus:border-[#034a6e] focus:ring-1 focus:ring-[#034a6e]/20'}`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Esqueci a senha (apenas login) */}
                {isLoginMode && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs text-[#034a6e] hover:text-[#065a84] font-medium transition-colors"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                )}

                {/* Botão de Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                  className="w-full bg-[#034a6e] hover:bg-[#023a58] text-white py-3.5 px-6 
                           rounded-lg font-semibold text-sm transition-all disabled:opacity-60 
                           disabled:cursor-not-allowed flex items-center justify-center gap-2
                           shadow-lg shadow-[#034a6e]/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isLoginMode ? 'Entrando...' : 'Criando conta...'}</span>
                    </>
                  ) : (
                    <span>{isLoginMode ? 'Entrar na minha conta' : 'Criar minha conta'}</span>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">ou continue com</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 
                           rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 
                           rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Conexão segura SSL 256-bit</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
