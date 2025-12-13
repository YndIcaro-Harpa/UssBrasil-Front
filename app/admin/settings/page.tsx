'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, Bell, Save, Store, Truck, CreditCard, RotateCcw, 
  Mail, Phone, Package, Percent, Eye
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const SETTINGS_KEY = 'uss_admin_settings'

const defaultSettings = {
  // Store Info - Essential
  storeName: 'USS BRASIL',
  storeEmail: 'contato@ussbrasil.com',
  storePhone: '(11) 98765-4321',
  storeCnpj: '',
  // Shipping
  freeShippingThreshold: 299,
  defaultShippingFee: 19.90,
  expressShippingFee: 39.90,
  // Stock
  lowStockThreshold: 10,
  stockAlerts: true,
  // Payments
  pixEnabled: true,
  creditCardEnabled: true,
  bankSlipEnabled: true,
  maxInstallments: 12,
  minInstallmentValue: 50,
  // Notifications
  orderNotifications: true,
  emailNotifications: true,
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [savedSettings, setSavedSettings] = useState(defaultSettings)

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

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(savedSettings))
  }, [settings, savedSettings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      setSavedSettings(settings)
      setHasChanges(false)
      toast.success('Configurações salvas!')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Restaurar configurações padrão?')) {
      setSettings(defaultSettings)
      localStorage.removeItem(SETTINGS_KEY)
      setSavedSettings(defaultSettings)
      toast.success('Restaurado')
    }
  }

  const update = (field: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const Switch = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )

  return (
    <div className="p-2 lg:p-3 bg-gray-50/50 min-h-screen">
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 mb-2 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-600" />
          <h1 className="text-sm font-bold text-gray-900">Configurações</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${
              hasChanges 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            <span>{isSaving ? 'Salvando...' : hasChanges ? 'Salvar' : 'Salvo'}</span>
          </button>
        </div>
      </div>

      {/* Settings Grid - 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        
        {/* Store Info */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">Dados da Loja</span>
          </div>
          <div className="p-2.5 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-medium text-gray-500 uppercase mb-0.5 block">Nome</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => update('storeName', e.target.value)}
                  className="w-full px-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="text-[9px] font-medium text-gray-500 uppercase mb-0.5 block">CNPJ</label>
                <input
                  type="text"
                  value={settings.storeCnpj}
                  onChange={(e) => update('storeCnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-medium text-gray-500 uppercase mb-0.5 flex items-center gap-1">
                  <Mail className="w-2.5 h-2.5" /> Email
                </label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => update('storeEmail', e.target.value)}
                  className="w-full px-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="text-[9px] font-medium text-gray-500 uppercase mb-0.5 flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5" /> Telefone
                </label>
                <input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(e) => update('storePhone', e.target.value)}
                  className="w-full px-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">Frete</span>
          </div>
          <div className="p-2.5 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] font-medium text-gray-500 uppercase mb-0.5 block">Grátis acima de</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">R$</span>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => update('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-medium text-gray-500 uppercase mb-0.5 block">Padrão</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.defaultShippingFee}
                    onChange={(e) => update('defaultShippingFee', parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-medium text-gray-500 uppercase mb-0.5 block">Expresso</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.expressShippingFee}
                    onChange={(e) => update('expressShippingFee', parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
            <div className="p-1.5 bg-emerald-50 rounded text-[9px] text-emerald-700">
              <strong>Dica:</strong> Pedidos acima de R$ {settings.freeShippingThreshold.toFixed(2)} têm frete grátis
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
            <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">Pagamentos</span>
          </div>
          <div className="p-2.5">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                onClick={() => update('pixEnabled', !settings.pixEnabled)}
                className={`p-2 rounded-lg border text-center transition-all ${
                  settings.pixEnabled 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="text-[10px] font-bold">PIX</div>
                <div className="text-[8px]">{settings.pixEnabled ? 'Ativo' : 'Inativo'}</div>
              </button>
              <button
                onClick={() => update('creditCardEnabled', !settings.creditCardEnabled)}
                className={`p-2 rounded-lg border text-center transition-all ${
                  settings.creditCardEnabled 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="text-[10px] font-bold">Cartão</div>
                <div className="text-[8px]">{settings.creditCardEnabled ? 'Ativo' : 'Inativo'}</div>
              </button>
              <button
                onClick={() => update('bankSlipEnabled', !settings.bankSlipEnabled)}
                className={`p-2 rounded-lg border text-center transition-all ${
                  settings.bankSlipEnabled 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="text-[10px] font-bold">Boleto</div>
                <div className="text-[8px]">{settings.bankSlipEnabled ? 'Ativo' : 'Inativo'}</div>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-medium text-gray-500 uppercase mb-0.5 block">Máx. Parcelas</label>
                <select
                  value={settings.maxInstallments}
                  onChange={(e) => update('maxInstallments', parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
                >
                  <option value="1">1x</option>
                  <option value="3">3x</option>
                  <option value="6">6x</option>
                  <option value="10">10x</option>
                  <option value="12">12x</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-medium text-gray-500 uppercase mb-0.5 block">Parcela Mín.</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">R$</span>
                  <input
                    type="number"
                    value={settings.minInstallmentValue}
                    onChange={(e) => update('minInstallmentValue', parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock & Notifications */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">Alertas & Estoque</span>
          </div>
          <div className="p-2.5 space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div>
                <p className="text-[11px] font-medium text-gray-900">Alerta de Estoque Baixo</p>
                <p className="text-[9px] text-gray-500">Notificar quando estoque estiver baixo</p>
              </div>
              <Switch checked={settings.stockAlerts} onChange={(v) => update('stockAlerts', v)} />
            </div>
            <div>
              <label className="text-[9px] font-medium text-gray-500 uppercase mb-0.5 block">Limite Estoque Baixo</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={settings.lowStockThreshold}
                  onChange={(e) => update('lowStockThreshold', parseInt(e.target.value) || 10)}
                  className="w-20 px-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
                />
                <span className="text-[10px] text-gray-500">unidades</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div>
                <p className="text-[11px] font-medium text-gray-900">Notificação de Pedidos</p>
                <p className="text-[9px] text-gray-500">Alertar quando novos pedidos chegarem</p>
              </div>
              <Switch checked={settings.orderNotifications} onChange={(v) => update('orderNotifications', v)} />
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div>
                <p className="text-[11px] font-medium text-gray-900">Notificações por Email</p>
                <p className="text-[9px] text-gray-500">Receber relatórios por email</p>
              </div>
              <Switch checked={settings.emailNotifications} onChange={(v) => update('emailNotifications', v)} />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Links */}
      <div className="mt-2 bg-white rounded-lg border border-gray-100 shadow-sm px-3 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[9px] text-gray-400 uppercase font-medium shrink-0">Mais:</span>
          {[
            { label: 'Cupons', href: '/admin/coupons', icon: Percent },
            { label: 'Estoque', href: '/admin/stock-alerts', icon: Package },
            { label: 'Relatórios', href: '/admin/reports', icon: Eye },
          ].map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors shrink-0"
            >
              <link.icon className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] font-medium text-gray-700">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

