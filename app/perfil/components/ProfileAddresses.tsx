'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Star,
  Save,
  X,
  Loader2,
  Home,
  Building,
  Package
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

// Interface local estendida para incluir neighborhood (usado no formulário)
interface AddressForm {
  id?: string
  label: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

interface ProfileAddressesProps {
  userId: string
}

const addressIcons: Record<string, React.ElementType> = {
  'Casa': Home,
  'Trabalho': Building,
  'Outro': Package,
}

// Função para converter do formato do AuthContext para o formato do formulário
const toFormAddress = (addr: any): AddressForm => ({
  id: addr.id,
  label: addr.label || 'Casa',
  street: addr.street || '',
  number: addr.number || '',
  complement: addr.complement || '',
  neighborhood: addr.neighborhood || '',
  city: addr.city || '',
  state: addr.state || '',
  zipCode: addr.zip || addr.zipCode || '',
  isDefault: addr.default || addr.isDefault || false
})

// Função para converter do formulário para o formato do AuthContext
const toAuthAddress = (form: AddressForm): Omit<any, 'id'> => ({
  label: form.label,
  street: form.street,
  number: form.number,
  complement: form.complement,
  neighborhood: form.neighborhood,
  city: form.city,
  state: form.state,
  zip: form.zipCode,
  default: form.isDefault
})

export default function ProfileAddresses({ userId }: ProfileAddressesProps) {
  const { addresses: authAddresses, addAddress, removeAddress, setDefaultAddress, isAuthenticated } = useAuth()
  
  // Converter endereços do contexto para o formato local
  const [localAddresses, setLocalAddresses] = useState<AddressForm[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newAddress, setNewAddress] = useState<AddressForm>({
    label: 'Casa',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  })

  // Sincronizar endereços do AuthContext com o estado local
  useEffect(() => {
    if (authAddresses) {
      setLocalAddresses(authAddresses.map(toFormAddress))
    }
  }, [authAddresses])

  const handleSearchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setLoading(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        toast.error('CEP não encontrado')
        return
      }

      setNewAddress(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }))
      toast.success('Endereço encontrado!')
    } catch (error) {
      toast.error('Erro ao buscar CEP')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAddress = async () => {
    if (!newAddress.street || !newAddress.number || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        // Editar endereço existente - remover o antigo e adicionar o novo
        removeAddress(editingId)
        const authAddr = toAuthAddress({ ...newAddress, isDefault: newAddress.isDefault })
        const saved = addAddress(authAddr)
        
        // Se for padrão, atualizar
        if (newAddress.isDefault) {
          setDefaultAddress(saved.id)
        }
        
        toast.success('Endereço atualizado com sucesso!')
      } else {
        // Adicionar novo endereço
        const authAddr = toAuthAddress(newAddress)
        const saved = addAddress(authAddr)
        
        // Se for padrão, atualizar
        if (newAddress.isDefault) {
          setDefaultAddress(saved.id)
        }
        
        toast.success('Endereço adicionado com sucesso!')
      }

      setIsAdding(false)
      setEditingId(null)
      setNewAddress({
        label: 'Casa',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false
      })
    } catch (error) {
      toast.error('Erro ao salvar endereço')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (address: AddressForm) => {
    setNewAddress(address)
    setEditingId(address.id || null)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este endereço?')) return

    try {
      removeAddress(id)
      toast.success('Endereço removido com sucesso!')
    } catch (error) {
      toast.error('Erro ao remover endereço')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      setDefaultAddress(id)
      toast.success('Endereço padrão atualizado!')
    } catch (error) {
      toast.error('Erro ao definir endereço padrão')
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setNewAddress({
      label: 'Casa',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Meus Endereços</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie seus endereços de entrega
          </p>
        </div>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="gap-2 bg-[#034a6e] hover:bg-[#023a58]"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Endereço' : 'Novo Endereço'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Label */}
            <div className="space-y-2">
              <Label>Identificação</Label>
              <select
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#54c4cf] focus:border-[#54c4cf] transition-colors"
              >
                <option value="Casa">🏠 Casa</option>
                <option value="Trabalho">🏢 Trabalho</option>
                <option value="Outro">📦 Outro</option>
              </select>
            </div>

            {/* CEP */}
            <div className="space-y-2">
              <Label>CEP *</Label>
              <div className="relative">
                <Input
                  value={newAddress.zipCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                    setNewAddress({ ...newAddress, zipCode: value })
                    if (value.length === 8) handleSearchCep(value)
                  }}
                  placeholder="00000-000"
                  className="focus:ring-2 focus:ring-[#54c4cf] focus:border-[#54c4cf]"
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#034a6e]" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">Digite o CEP para buscar o endereço automaticamente</p>
            </div>

            {/* Street */}
            <div className="space-y-2 md:col-span-2">
              <Label>Rua *</Label>
              <Input
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                placeholder="Nome da rua"
                className="focus:ring-2 focus:ring-[#54c4cf] focus:border-[#54c4cf]"
              />
            </div>

            {/* Number */}
            <div className="space-y-2">
              <Label>Número *</Label>
              <Input
                value={newAddress.number}
                onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                placeholder="123"
                className="focus:ring-2 focus:ring-[#54c4cf] focus:border-[#54c4cf]"
              />
            </div>

            {/* Complement */}
            <div className="space-y-2">
              <Label>Complemento</Label>
              <Input
                value={newAddress.complement}
                onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                placeholder="Apto, Bloco, etc"
                className="focus:ring-2 focus:ring-[#54c4cf] focus:border-[#54c4cf]"
              />
            </div>

            {/* Neighborhood */}
            <div className="space-y-2">
              <Label>Bairro *</Label>
              <Input
                value={newAddress.neighborhood}
                onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                placeholder="Bairro"
                className="focus:ring-2 focus:ring-[#54c4cf] focus:border-[#54c4cf]"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label>Cidade *</Label>
              <Input
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                placeholder="Cidade"
                className="focus:ring-2 focus:ring-[#54c4cf] focus:border-[#54c4cf]"
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label>Estado *</Label>
              <Input
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value.toUpperCase() })}
                placeholder="UF"
                maxLength={2}
                className="focus:ring-2 focus:ring-[#54c4cf] focus:border-[#54c4cf]"
              />
            </div>

            {/* Default */}
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[#034a6e] focus:ring-[#54c4cf]"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Definir como endereço padrão para entregas
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveAddress} 
              disabled={loading}
              className="bg-[#034a6e] hover:bg-[#023a58]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingId ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Addresses List */}
      {localAddresses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum endereço cadastrado
          </h3>
          <p className="text-gray-500 mb-6">
            Adicione um endereço para facilitar suas compras
          </p>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#034a6e] hover:bg-[#023a58]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Endereço
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localAddresses.map((address) => {
            const Icon = addressIcons[address.label] || MapPin

            return (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  address.isDefault
                    ? 'border-[#034a6e] bg-gradient-to-br from-[#034a6e]/5 to-[#54c4cf]/10'
                    : 'border-gray-200 hover:border-[#54c4cf]'
                }`}
              >
                {address.isDefault && (
                  <div className="absolute -top-2 -right-2 bg-[#034a6e] text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Padrão
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${address.isDefault ? 'bg-[#034a6e]/10' : 'bg-gray-100'}`}>
                    <Icon className={`h-5 w-5 ${address.isDefault ? 'text-[#034a6e]' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900">
                      {address.label}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {address.street}, {address.number}
                      {address.complement && ` - ${address.complement}`}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {address.neighborhood}, {address.city} - {address.state}
                    </p>
                    <p className="text-sm text-gray-400 font-mono">
                      CEP: {address.zipCode}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address.id!)}
                      className="flex-1 text-[#034a6e] hover:text-[#023a58] hover:bg-[#034a6e]/10"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Definir como padrão
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(address)}
                    className="text-gray-600 hover:text-[#034a6e] hover:bg-[#034a6e]/10"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address.id!)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Info message when not authenticated */}
      {!isAuthenticated && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Nota:</strong> Faça login para salvar seus endereços permanentemente.
          </p>
        </div>
      )}
    </motion.div>
  )
}
