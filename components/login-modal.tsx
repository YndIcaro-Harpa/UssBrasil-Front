'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff, User, Phone, Loader2, AlertCircle, Shield, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: (user: any) => void
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const { login: authLogin, register: authRegister } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
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
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'email':
        if (!value) return 'Email é obrigatório'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Digite um email válido'
        return ''
      case 'password':
        if (!value) return 'Senha é obrigatória'
        if (value.length < 6) return 'Mínimo 6 caracteres'
        if (!/[A-Za-z]/.test(value)) return 'Deve conter ao menos uma letra'
        if (!/[0-9]/.test(value)) return 'Deve conter ao menos um número'
        return ''
      case 'confirmPassword':
        if (!value) return 'Confirme sua senha'
        if (value !== formData.password) return 'Senhas não coincidem'
        return ''
      case 'name':
        if (!value) return 'Nome é obrigatório'
        if (value.length < 3) return 'Nome deve ter ao menos 3 caracteres'
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Nome deve conter apenas letras'
        return ''
      case 'phone':
        if (value && value.replace(/\D/g, '').length < 10) return 'Telefone inválido'
        return ''
      default:
        return ''
    }
  }

  const validateForm = (): boolean => {
    const fieldsToValidate = isLoginMode 
      ? ['email', 'password'] 
      : ['name', 'email', 'password', 'confirmPassword']
    
    const newErrors: Record<string, string> = {}
    let isValid = true

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    if (!isLoginMode && formData.phone) {
      const phoneError = validateField('phone', formData.phone)
      if (phoneError) {
        newErrors.phone = phoneError
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field as keyof typeof formData])
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setTouched(allTouched)
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      if (isLoginMode) {
        await authLogin(formData.email, formData.password)
        const userData = localStorage.getItem('uss_user_data')
        const user = userData ? JSON.parse(userData) : null
        toast.success(`Bem-vindo de volta${user?.name ? `, ${user.name}` : ''}!`)
        onLoginSuccess?.(user)
      } else {
        await authRegister(formData.name, formData.email, formData.password, formData.phone || undefined)
        const userData = localStorage.getItem('uss_user_data')
        const user = userData ? JSON.parse(userData) : null
        toast.success(`Conta criada com sucesso! Bem-vindo${user?.name ? `, ${user.name}` : ''}!`)
        onLoginSuccess?.(user)
      }

      onClose()
      resetForm()

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
    setTouched({})
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const getFieldStatus = (field: string) => {
    if (!touched[field]) return 'idle'
    if (errors[field]) return 'error'
    if (formData[field as keyof typeof formData]) return 'valid'
    return 'idle'
  }

  const getInputClasses = (field: string) => {
    const status = getFieldStatus(field)
    const baseClasses = "w-full pl-12 pr-12 py-4 bg-white border-2 rounded-2xl text-gray-800 text-sm placeholder-gray-400 focus:outline-none transition-all duration-300"
    
    switch (status) {
      case 'error':
        return `${baseClasses} border-red-300 focus:border-red-400 shadow-sm shadow-red-100`
      case 'valid':
        return `${baseClasses} border-emerald-300 focus:border-emerald-400 shadow-sm shadow-emerald-100`
      default:
        return `${baseClasses} border-slate-200 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-100`
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-blue-400 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-gradient-to-b from-slate-50 to-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-blue-400 px-8 pt-8 pb-12">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300/30 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-500/20 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors p-2.5 rounded-full hover:bg-white/10 backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="relative flex flex-col items-center justify-center">
                <div className="w-40 h-20 flex items-center justify-center">
                  <Image 
                    src="/Empresa/02.png" 
                    alt="USS Brasil" 
                    width={160} 
                    height={80}
                    className="object-contain brightness-0 invert"
                    priority
                  />
                </div>
                <p className="text-blue-100 text-sm font-medium mt-2">Tecnologia Premium</p>
              </div>
            </div>

            {/* Tabs com animação fluida */}
            <div className="relative -mt-6 mx-6">
              <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-1.5 flex relative">
                {/* Indicador animado */}
                <motion.div
                  className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-blue-400 rounded-xl shadow-md shadow-blue-400/30"
                  animate={{ x: isLoginMode ? 0 : 'calc(100% + 6px)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
                <button
                  onClick={() => { setIsLoginMode(true); resetForm(); }}
                  className={`relative z-10 flex-1 py-3 text-sm font-semibold rounded-xl transition-colors duration-300 ${
                    isLoginMode ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => { setIsLoginMode(false); resetForm(); }}
                  className={`relative z-10 flex-1 py-3 text-sm font-semibold rounded-xl transition-colors duration-300 ${
                    !isLoginMode ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Criar Conta
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 pt-6 pb-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Erro geral */}
                <AnimatePresence>
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-600 text-sm font-medium">{errors.general}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Nome */}
                <AnimatePresence mode="popLayout">
                  {!isLoginMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
                    >
                      <label className="block text-slate-600 text-xs font-bold mb-2.5 uppercase tracking-wider">
                        Nome Completo <span className="text-red-400">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 group-focus-within:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                          <User className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          onBlur={() => handleBlur('name')}
                          className={getInputClasses('name')}
                          placeholder="Digite seu nome completo"
                        />
                        {getFieldStatus('name') === 'valid' && (
                          <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      {errors.name && touched.name && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.name}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-2.5 uppercase tracking-wider">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 group-focus-within:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                      <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={getInputClasses('email')}
                      placeholder="seu@email.com"
                    />
                    {getFieldStatus('email') === 'valid' && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  {errors.email && touched.email && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Telefone */}
                <AnimatePresence mode="popLayout">
                  {!isLoginMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8, delay: 0.05 }}
                    >
                      <label className="block text-slate-600 text-xs font-bold mb-2.5 uppercase tracking-wider">
                        Telefone <span className="text-slate-400 font-normal">(opcional)</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 group-focus-within:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                          <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                          onBlur={() => handleBlur('phone')}
                          className={getInputClasses('phone')}
                          placeholder="(11) 99999-9999"
                        />
                        {getFieldStatus('phone') === 'valid' && formData.phone && (
                          <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      {errors.phone && touched.phone && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.phone}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Senha */}
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-2.5 uppercase tracking-wider">
                    Senha <span className="text-red-400">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 group-focus-within:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                      <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      className={getInputClasses('password')}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.password}
                    </motion.p>
                  )}
                  {/* Força da senha */}
                  {!isLoginMode && formData.password && (
                    <div className="mt-3">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((level) => {
                          const strength = 
                            (formData.password.length >= 6 ? 1 : 0) +
                            (/[A-Z]/.test(formData.password) ? 1 : 0) +
                            (/[0-9]/.test(formData.password) ? 1 : 0) +
                            (/[^A-Za-z0-9]/.test(formData.password) ? 1 : 0)
                          
                          return (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                level <= strength 
                                  ? strength <= 1 ? 'bg-red-400' 
                                    : strength <= 2 ? 'bg-amber-400' 
                                    : strength <= 3 ? 'bg-blue-400' 
                                    : 'bg-emerald-400'
                                  : 'bg-slate-200'
                              }`}
                            />
                          )
                        })}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Use letras, números e símbolos para uma senha forte
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar Senha */}
                <AnimatePresence mode="popLayout">
                  {!isLoginMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8, delay: 0.1 }}
                    >
                      <label className="block text-slate-600 text-xs font-bold mb-2.5 uppercase tracking-wider">
                        Confirmar Senha <span className="text-red-400">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 group-focus-within:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                          <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          onBlur={() => handleBlur('confirmPassword')}
                          className={getInputClasses('confirmPassword')}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                        </button>
                      </div>
                      {errors.confirmPassword && touched.confirmPassword && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                      {getFieldStatus('confirmPassword') === 'valid' && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-emerald-500 text-xs mt-2 flex items-center gap-1.5 font-medium"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Senhas coincidem
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Esqueci a senha */}
                {isLoginMode && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-blue-400 hover:text-blue-500 font-semibold transition-colors"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-blue-400 hover:bg-blue-500 text-white py-4 px-6 rounded-2xl font-bold text-sm 
                           transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5
                           shadow-xl shadow-blue-400/40 hover:shadow-blue-500/50 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isLoginMode ? 'Entrando...' : 'Criando conta...'}</span>
                    </>
                  ) : (
                    <span>{isLoginMode ? 'Entrar na minha conta' : 'Criar minha conta'}</span>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-slate-100"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-slate-400 text-xs font-medium uppercase tracking-wider">ou</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 bg-white border-2 border-slate-200 
                           rounded-2xl text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
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
                  className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 bg-white border-2 border-slate-200 
                           rounded-2xl text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
                <Shield className="w-4 h-4" />
                <span>Conexão segura SSL 256-bit</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}