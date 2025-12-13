'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Edit3,
  Save,
  X,
  Loader2,
  Image as ImageIcon,
  Camera
} from 'lucide-react'
import { toast } from 'sonner'
import { User as UserType } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface ProfileInfoProps {
  user: UserType | null
  onUpdate: (data: Partial<UserType>) => Promise<void>
  session: any
}

export default function ProfileInfo({ user, onUpdate, session }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || session?.user?.name || '',
    email: user?.email || session?.user?.email || '',
    phone: user?.phone || '',
    image: user?.image || '',
  })

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      await onUpdate({
        name: formData.name,
        phone: formData.phone || undefined,
        image: formData.image || undefined,
      })
      setIsEditing(false)
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || session?.user?.name || '',
      email: user?.email || session?.user?.email || '',
      phone: user?.phone || '',
      image: user?.image || '',
    })
    setIsEditing(false)
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
          <h2 className="text-xl font-bold text-gray-900">Meus Dados</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie suas informações pessoais
          </p>
        </div>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="gap-2 bg-[#034a6e] hover:bg-[#023a58]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar
            </Button>
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-4 border-white shadow-md">
                {formData.image ? (
                  <Image
                    src={formData.image}
                    alt={formData.name || 'Avatar'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  formData.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              {isEditing && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <Camera className="h-3 w-3" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="image" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ImageIcon className="h-4 w-4 text-gray-400" />
                URL da Foto de Perfil
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                disabled={!isEditing}
                placeholder="https://exemplo.com/sua-foto.jpg"
                className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
              />
              <p className="text-xs text-gray-400 mt-1">
                Cole a URL de uma imagem para usar como foto de perfil
              </p>
            </div>
          </div>
        </div>

        {/* Other Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            Nome Completo
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
            placeholder="Seu nome completo"
            className={!isEditing ? 'bg-gray-50' : ''}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-400">
            O email não pode ser alterado
          </p>
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            Telefone
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!isEditing}
            placeholder="(00) 00000-0000"
            className={!isEditing ? 'bg-gray-50' : ''}
          />
        </div>

        {/* Data de Cadastro */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            Membro desde
          </Label>
          <Input
            value={new Date(user?.createdAt || Date.now()).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
            disabled
            className="bg-gray-50"
          />
        </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-3">Status da Conta</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${user?.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {user?.isActive !== false ? 'Conta ativa' : 'Conta inativa'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">
              {user?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
