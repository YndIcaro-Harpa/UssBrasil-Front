'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Save,
  Store,
  AlertTriangle,
  Check,
  Truck,
  CreditCard,
  RotateCcw
} from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import { toast } from 'sonner'

const SETTINGS_KEY = 'uss_admin_settings'

const defaultSettings = {
  // Store Info
  storeName: 'USS BRASIL',
  storeDescription: 'A melhor loja de produtos importados do Brasil com tecnologia de ponta e entrega rápida',
  storeEmail: 'contato@ussbrasil.com',
  storePhone: '(11) 98765-4321',
  storeAddress: 'Av. Paulista, 1234, São Paulo - SP',
  storeCnpj: '',
  // Notifications
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  orderNotifications: true,
  stockAlerts: true,
  lowStockThreshold: 10,
  // Security
  twoFactorAuth: true,
  passwordExpiry: '90',
  sessionTimeout: '30',
  // Appearance
  theme: 'light',
  locale: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  // System
  autoBackup: true,
  analyticsEnabled: true,
  cookieConsent: true,
  // Shipping
  freeShippingThreshold: 299,
  defaultShippingFee: 19.90,
  expressShippingFee: 39.90,
  // Payments
  pixEnabled: true,
  creditCardEnabled: true,
  bankSlipEnabled: true,
  cashOnDeliveryEnabled: false,
  maxInstallments: 12,
  minInstallmentValue: 50
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [activeTab, setActiveTab] = useState('store')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [savedSettings, setSavedSettings] = useState(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        const parsedSettings = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsedSettings })
        setSavedSettings({ ...defaultSettings, ...parsedSettings })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }, [])

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(savedSettings))
  }, [settings, savedSettings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Save to localStorage
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      setSavedSettings(settings)
      setHasChanges(false)
      
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Deseja restaurar as configurações padrão?')) {
      setSettings(defaultSettings)
      localStorage.removeItem(SETTINGS_KEY)
      setSavedSettings(defaultSettings)
      toast.success('Configurações restauradas')
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const SettingCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 shadow-sm"
    >
      <div className="flex items-center space-x-2 lg:space-x-3 mb-4 lg:mb-6">
        <div className="p-2 rounded-lg bg-[#001941]/20 text-[#001941]">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  )

  const SettingRow = ({ 
    label, 
    description, 
    children 
  }: { 
    label: string
    description: string
    children: React.ReactNode 
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="text-black font-semibold">{label}</p>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  )

  const Switch = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-[#001941]' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  const tabs = [
    { id: 'store', label: 'Loja', icon: Store },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'shipping', label: 'Frete', icon: Truck },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'system', label: 'Sistema', icon: Settings }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações do sistema e da loja"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Configurações' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="flex items-center space-x-2 bg-gray-200 text-gray-700
                       px-4 py-2.5 rounded-xl font-medium hover:bg-gray-300 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-medium transition-all
                ${hasChanges 
                  ? 'bg-[#001941] text-white hover:bg-blue-900' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{isSaving ? 'Salvando...' : hasChanges ? 'Salvar Alterações' : 'Salvo'}</span>
            </motion.button>
          </div>
        }
      />

      {/* Tabs Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm"
      >
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#001941] text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'store' && (
          <SettingCard icon={<Store className="w-5 h-5" />} title="Informações da Loja">
            <SettingRow label="Nome da Loja" description="Nome que aparecerá no site e emails">
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              />
            </SettingRow>

            <SettingRow label="Descrição" description="Descrição da loja para SEO">
              <textarea
                value={settings.storeDescription}
                onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                rows={2}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20
                         resize-none min-w-[300px]"
              />
            </SettingRow>

            <SettingRow label="Email" description="Email principal da loja">
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              />
            </SettingRow>

            <SettingRow label="Telefone" description="Telefone de contato">
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => handleInputChange('storePhone', e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              />
            </SettingRow>

            <SettingRow label="Endereço" description="Endereço físico da loja">
              <input
                type="text"
                value={settings.storeAddress}
                onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20
                         min-w-[300px]"
              />
            </SettingRow>

            <SettingRow label="CNPJ" description="CNPJ da empresa">
              <input
                type="text"
                value={settings.storeCnpj}
                onChange={(e) => handleInputChange('storeCnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              />
            </SettingRow>
          </SettingCard>
        )}

        {activeTab === 'notifications' && (
          <SettingCard icon={<Bell className="w-5 h-5" />} title="Configurações de Notificações">
            <SettingRow 
              label="Notificações por Email" 
              description="Receber alertas e relatórios por email"
            >
              <Switch
                checked={settings.emailNotifications}
                onChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </SettingRow>

            <SettingRow 
              label="Notificações SMS" 
              description="Receber alertas urgentes por SMS"
            >
              <Switch
                checked={settings.smsNotifications}
                onChange={(checked) => handleInputChange('smsNotifications', checked)}
              />
            </SettingRow>

            <SettingRow 
              label="Push Notifications" 
              description="Notificações no navegador"
            >
              <Switch
                checked={settings.pushNotifications}
                onChange={(checked) => handleInputChange('pushNotifications', checked)}
              />
            </SettingRow>

            <SettingRow 
              label="Novos Pedidos" 
              description="Notificar quando novos pedidos forem recebidos"
            >
              <Switch
                checked={settings.orderNotifications}
                onChange={(checked) => handleInputChange('orderNotifications', checked)}
              />
            </SettingRow>

            <SettingRow 
              label="Alerta de Estoque Baixo" 
              description="Notificar quando produtos estiverem com estoque baixo"
            >
              <Switch
                checked={settings.stockAlerts}
                onChange={(checked) => handleInputChange('stockAlerts', checked)}
              />
            </SettingRow>

            <SettingRow label="Limite de Estoque Baixo" description="Quantidade mínima para alerta">
              <input
                type="number"
                min="1"
                value={settings.lowStockThreshold}
                onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 10)}
                className="w-24 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              />
            </SettingRow>
          </SettingCard>
        )}

        {activeTab === 'shipping' && (
          <SettingCard icon={<Truck className="w-5 h-5" />} title="Configurações de Frete">
            <SettingRow label="Frete Grátis a partir de" description="Valor mínimo para frete grátis (R$)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.freeShippingThreshold}
                onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                className="w-32 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              />
            </SettingRow>

            <SettingRow label="Frete Padrão" description="Valor do frete normal (R$)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.defaultShippingFee}
                onChange={(e) => handleInputChange('defaultShippingFee', parseFloat(e.target.value) || 0)}
                className="w-32 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              />
            </SettingRow>

            <SettingRow label="Frete Expresso" description="Valor do frete expresso (R$)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.expressShippingFee}
                onChange={(e) => handleInputChange('expressShippingFee', parseFloat(e.target.value) || 0)}
                className="w-32 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              />
            </SettingRow>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-blue-800 text-sm">
                💡 <strong>Dica:</strong> Configure o frete grátis para incentivar compras maiores. 
                Valores acima de R$ {settings.freeShippingThreshold.toFixed(2)} terão frete grátis automaticamente.
              </p>
            </div>
          </SettingCard>
        )}

        {activeTab === 'payments' && (
          <SettingCard icon={<CreditCard className="w-5 h-5" />} title="Métodos de Pagamento">
            <SettingRow 
              label="PIX" 
              description="Aceitar pagamentos via PIX"
            >
              <Switch
                checked={settings.pixEnabled}
                onChange={(checked) => handleInputChange('pixEnabled', checked)}
              />
            </SettingRow>

            <SettingRow 
              label="Cartão de Crédito" 
              description="Aceitar pagamentos com cartão de crédito"
            >
              <Switch
                checked={settings.creditCardEnabled}
                onChange={(checked) => handleInputChange('creditCardEnabled', checked)}
              />
            </SettingRow>

            <SettingRow 
              label="Boleto Bancário" 
              description="Aceitar pagamentos via boleto"
            >
              <Switch
                checked={settings.bankSlipEnabled}
                onChange={(checked) => handleInputChange('bankSlipEnabled', checked)}
              />
            </SettingRow>

            <SettingRow 
              label="Dinheiro na Entrega" 
              description="Aceitar pagamento em dinheiro (vendas físicas)"
            >
              <Switch
                checked={settings.cashOnDeliveryEnabled}
                onChange={(checked) => handleInputChange('cashOnDeliveryEnabled', checked)}
              />
            </SettingRow>

            <SettingRow label="Máximo de Parcelas" description="Número máximo de parcelas no cartão">
              <select
                value={settings.maxInstallments}
                onChange={(e) => handleInputChange('maxInstallments', parseInt(e.target.value))}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              >
                <option value="1">1x (à vista)</option>
                <option value="3">até 3x</option>
                <option value="6">até 6x</option>
                <option value="10">até 10x</option>
                <option value="12">até 12x</option>
              </select>
            </SettingRow>

            <SettingRow label="Parcela Mínima" description="Valor mínimo por parcela (R$)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.minInstallmentValue}
                onChange={(e) => handleInputChange('minInstallmentValue', parseFloat(e.target.value) || 0)}
                className="w-32 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              />
            </SettingRow>
          </SettingCard>
        )}

        {activeTab === 'security' && (
          <SettingCard icon={<Shield className="w-5 h-5" />} title="Configurações de Segurança">
            <SettingRow 
              label="Autenticação de Dois Fatores" 
              description="Camada extra de segurança para login"
            >
              <Switch
                checked={settings.twoFactorAuth}
                onChange={(checked) => handleInputChange('twoFactorAuth', checked)}
              />
            </SettingRow>

            <SettingRow label="Expiração de Senha" description="Dias para expirar senha">
              <select
                value={settings.passwordExpiry}
                onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              >
                <option value="30" className="bg-white">30 dias</option>
                <option value="60" className="bg-white">60 dias</option>
                <option value="90" className="bg-white">90 dias</option>
                <option value="never" className="bg-white">Nunca</option>
              </select>
            </SettingRow>

            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Recomendação de Segurança</span>
              </div>
              <p className="text-yellow-300 text-sm">
                Mantenha sempre a autenticação de dois fatores ativada e senhas fortes.
              </p>
            </div>
          </SettingCard>
        )}

        {activeTab === 'appearance' && (
          <SettingCard icon={<Palette className="w-5 h-5" />} title="Aparência e Tema">
            <SettingRow label="Tema" description="Tema visual da interface">
              <select
                value={settings.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              >
                <option value="dark" className="bg-white">Escuro</option>
                <option value="light" className="bg-white">Claro</option>
                <option value="auto" className="bg-white">Automático</option>
              </select>
            </SettingRow>

            <SettingRow label="Idioma" description="Idioma da interface">
              <select
                value={settings.locale}
                onChange={(e) => handleInputChange('locale', e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              >
                <option value="pt-BR" className="bg-white">Português (Brasil)</option>
                <option value="en-US" className="bg-white">English (US)</option>
                <option value="es-ES" className="bg-white">Español</option>
              </select>
            </SettingRow>

            <SettingRow label="Moeda" description="Moeda padrão da loja">
              <select
                value={settings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              >
                <option value="BRL" className="bg-white">Real (R$)</option>
                <option value="USD" className="bg-white">Dólar ($)</option>
                <option value="EUR" className="bg-white">Euro (€)</option>
              </select>
            </SettingRow>
          </SettingCard>
        )}

        {activeTab === 'system' && (
          <SettingCard icon={<Settings className="w-5 h-5" />} title="Configurações do Sistema">
            <SettingRow 
              label="Backup Automático" 
              description="Backup diário dos dados"
            >
              <Switch
                checked={settings.autoBackup}
                onChange={(checked) => handleInputChange('autoBackup', checked)}
              />
            </SettingRow>

            <SettingRow 
              label="Analytics" 
              description="Coleta de dados de uso"
            >
              <Switch
                checked={settings.analyticsEnabled}
                onChange={(checked) => handleInputChange('analyticsEnabled', checked)}
              />
            </SettingRow>

            <SettingRow 
              label="Consentimento de Cookies" 
              description="Mostrar banner de cookies"
            >
              <Switch
                checked={settings.cookieConsent}
                onChange={(checked) => handleInputChange('cookieConsent', checked)}
              />
            </SettingRow>

            <SettingRow label="Fuso Horário" description="Fuso horário do sistema">
              <select
                value={settings.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 
                         focus:outline-none focus:border-[#001941] focus:ring-2 focus:ring-[#001941]/20"
              >
                <option value="America/Sao_Paulo" className="bg-white">São Paulo (GMT-3)</option>
                <option value="America/New_York" className="bg-white">New York (GMT-5)</option>
                <option value="Europe/London" className="bg-white">London (GMT+0)</option>
              </select>
            </SettingRow>
          </SettingCard>
        )}
      </div>
    </div>
  )
}

