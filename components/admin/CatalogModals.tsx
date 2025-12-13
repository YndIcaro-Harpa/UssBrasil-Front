'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Save, Loader2, Upload, Image as ImageIcon,
  Tag, Layers, FolderTree, Plus, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { api, Brand, Category } from '@/services/api'

// Cloudinary Config
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default'

// Upload para Cloudinary
const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', 'uss-brasil/catalog')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) throw new Error('Erro ao fazer upload')
  const data = await response.json()
  return data.secure_url
}

// Gera slug a partir do nome
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Base Modal Wrapper
function ModalWrapper({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  icon: any
  children: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-[600px] max-h-[85vh] overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b bg-[#001941]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// Image Uploader Component
function ImageUploader({
  value,
  onChange,
  label
}: {
  value?: string
  onChange: (url: string) => void
  label?: string
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 5MB')
      return
    }

    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      onChange(url)
      toast.success('Upload realizado!')
    } catch (error) {
      toast.error('Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-[#001941] transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          className="hidden"
        />

        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#001941]" />
        ) : value ? (
          <div className="space-y-2">
            <img src={value} alt="Preview" className="max-h-24 mx-auto rounded-lg object-contain" />
            <p className="text-xs text-gray-500">Clique para alterar</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <ImageIcon className="w-6 h-6 text-gray-400" />
            <p className="text-sm text-gray-600">Clique para upload</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ou cole a URL da imagem"
          className="flex-1"
        />
        {value && (
          <Button variant="outline" size="sm" onClick={() => onChange('')}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================
// BRAND MODAL
// ============================================

interface BrandModalProps {
  isOpen: boolean
  onClose: () => void
  brand?: Brand | null
  token?: string
  onSuccess?: () => void
}

export function BrandModal({ isOpen, onClose, brand, token, onSuccess }: BrandModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    isActive: true
  })

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        slug: brand.slug || '',
        description: brand.description || '',
        logo: brand.logo || '',
        isActive: brand.isActive ?? true
      })
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        logo: '',
        isActive: true
      })
    }
  }, [brand, isOpen])

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name)
      }

      if (brand?.id) {
        await api.brands.update(brand.id, payload, token)
        toast.success('Marca atualizada com sucesso!')
      } else {
        await api.brands.create(payload, token)
        toast.success('Marca criada com sucesso!')
      }

      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar marca')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={brand ? 'Editar Marca' : 'Nova Marca'}
      icon={Tag}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nome *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Apple"
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
              placeholder="apple"
            />
          </div>
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            placeholder="Descrição da marca"
            rows={3}
          />
        </div>

        <ImageUploader
          value={formData.logo}
          onChange={(url) => setFormData(p => ({ ...p, logo: url }))}
          label="Logo da Marca"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="brand-active"
            checked={formData.isActive}
            onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <Label htmlFor="brand-active" className="cursor-pointer">Marca ativa</Label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#001941] hover:bg-blue-900"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {brand ? 'Atualizar' : 'Criar'} Marca
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ============================================
// CATEGORY MODAL
// ============================================

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category | null
  token?: string
  onSuccess?: () => void
}

export function CategoryModal({ isOpen, onClose, category, token, onSuccess }: CategoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image: '',
    isActive: true
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        icon: category.icon || '',
        image: category.image || '',
        isActive: category.isActive ?? true
      })
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        image: '',
        isActive: true
      })
    }
  }, [category, isOpen])

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name)
      }

      if (category?.id) {
        await api.categories.update(category.id, payload, token)
        toast.success('Categoria atualizada com sucesso!')
      } else {
        await api.categories.create(payload, token)
        toast.success('Categoria criada com sucesso!')
      }

      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar categoria')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Editar Categoria' : 'Nova Categoria'}
      icon={Layers}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nome *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Smartphones"
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
              placeholder="smartphones"
            />
          </div>
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            placeholder="Descrição da categoria"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Ícone (nome do Lucide icon ou emoji)</Label>
            <Input
              value={formData.icon}
              onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))}
              placeholder="📱 ou Smartphone"
            />
          </div>
        </div>

        <ImageUploader
          value={formData.image}
          onChange={(url) => setFormData(p => ({ ...p, image: url }))}
          label="Imagem da Categoria"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="category-active"
            checked={formData.isActive}
            onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <Label htmlFor="category-active" className="cursor-pointer">Categoria ativa</Label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#001941] hover:bg-blue-900"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {category ? 'Atualizar' : 'Criar'} Categoria
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ============================================
// SUBCATEGORY MODAL
// ============================================

interface Subcategory {
  id?: string
  name: string
  slug: string
  description?: string
  image?: string
  parentCategoryId: string
  isActive: boolean
}

interface SubcategoryModalProps {
  isOpen: boolean
  onClose: () => void
  subcategory?: Subcategory | null
  categories: Category[]
  token?: string
  onSuccess?: () => void
}

export function SubcategoryModal({
  isOpen,
  onClose,
  subcategory,
  categories,
  token,
  onSuccess
}: SubcategoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentCategoryId: '',
    isActive: true
  })

  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name || '',
        slug: subcategory.slug || '',
        description: subcategory.description || '',
        image: subcategory.image || '',
        parentCategoryId: subcategory.parentCategoryId || '',
        isActive: subcategory.isActive ?? true
      })
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        parentCategoryId: categories[0]?.id || '',
        isActive: true
      })
    }
  }, [subcategory, isOpen, categories])

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    if (!formData.parentCategoryId) {
      toast.error('Categoria pai é obrigatória')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name)
      }

      // A subcategoria é tratada como uma categoria com parentId
      // Adaptamos para usar a API de categorias
      const apiPayload = {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        image: payload.image,
        parentId: payload.parentCategoryId,
        isActive: payload.isActive
      }

      if (subcategory?.id) {
        await api.categories.update(subcategory.id, apiPayload, token)
        toast.success('Subcategoria atualizada com sucesso!')
      } else {
        await api.categories.create(apiPayload, token)
        toast.success('Subcategoria criada com sucesso!')
      }

      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar subcategoria')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={subcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
      icon={FolderTree}
    >
      <div className="space-y-4">
        <div>
          <Label>Categoria Pai *</Label>
          <select
            value={formData.parentCategoryId}
            onChange={(e) => setFormData(p => ({ ...p, parentCategoryId: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:border-[#001941] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Selecione uma categoria</option>
            {categories.filter(c => !(c as any).parentId).map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nome *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: iPhone"
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
              placeholder="iphone"
            />
          </div>
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            placeholder="Descrição da subcategoria"
            rows={3}
          />
        </div>

        <ImageUploader
          value={formData.image}
          onChange={(url) => setFormData(p => ({ ...p, image: url }))}
          label="Imagem da Subcategoria"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="subcategory-active"
            checked={formData.isActive}
            onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <Label htmlFor="subcategory-active" className="cursor-pointer">Subcategoria ativa</Label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#001941] hover:bg-blue-900"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {subcategory ? 'Atualizar' : 'Criar'} Subcategoria
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// ============================================
// CATALOG MANAGEMENT PANEL (inline buttons)
// ============================================

interface CatalogManagementProps {
  token?: string
  onDataChange?: () => void
}

export function CatalogManagementButtons({ token, onDataChange }: CatalogManagementProps) {
  const [brandModalOpen, setBrandModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await api.categories.getAll()
      setCategories(data || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const handleSuccess = () => {
    loadCategories()
    onDataChange?.()
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBrandModalOpen(true)}
          className="text-xs"
        >
          <Tag className="w-3 h-3 mr-1" />
          Nova Marca
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryModalOpen(true)}
          className="text-xs"
        >
          <Layers className="w-3 h-3 mr-1" />
          Nova Categoria
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSubcategoryModalOpen(true)}
          className="text-xs"
        >
          <FolderTree className="w-3 h-3 mr-1" />
          Nova Subcategoria
        </Button>
      </div>

      <BrandModal
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        token={token}
        onSuccess={handleSuccess}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        token={token}
        onSuccess={handleSuccess}
      />

      <SubcategoryModal
        isOpen={subcategoryModalOpen}
        onClose={() => setSubcategoryModalOpen(false)}
        categories={categories}
        token={token}
        onSuccess={handleSuccess}
      />
    </>
  )
}
