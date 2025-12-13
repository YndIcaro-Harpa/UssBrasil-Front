'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon,
  Package,
  DollarSign,
  FileText,
  Layers,
  Trash2,
  Loader2,
  Plus,
  Edit2,
  Barcode,
  Hash
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { api } from '@/services/api'

// Componente de Label padronizado
function FormLabel({ label, required = false }: { label: string; required?: boolean }) {
  return (
    <p className="text-sm font-semibold text-black mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </p>
  )
}

// Interface para variação de produto com SKU/NCM único
interface ProductVariation {
  id: string
  name: string           // Ex: "iPhone 15 Pro 256GB Preto"
  sku: string            // SKU único da variação
  ncm: string            // NCM da variação
  image: string          // URL da imagem da variação
  stock: number          // Estoque desta variação
  priceAdjustment: number // Ajuste de preço (+/- em relação ao preço base)
  serialNumbers: string[] // Números de série das unidades
  isActive: boolean
}

interface ProductFormData {
  id: string
  name: string
  slug: string
  description: string
  // Campos de Precificação
  costPrice: number
  suggestedPrice: number
  originalPrice: number
  price: number
  discountPercent: number
  discountPrice: number
  stripeDiscount: number
  stripeFinalPrice: number
  finalPrice: number
  markup: number
  profitMargin: number
  profitValue: number
  // Outros campos
  stock: number
  sku: string
  ncm: string
  brandId: string
  categoryId: string
  featured: boolean
  isPreOrder: boolean
  isActive: boolean
  images: string[]
  specifications: Record<string, string>
  tags?: string
  weight?: number
  dimensions?: string
  warranty?: number
  // Variações de produto com SKU/NCM
  productVariations: ProductVariation[]
  hasVariations: boolean
}

interface Brand {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { token, isLoading: authLoading } = useAdminAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const variationImageInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<ProductFormData>({
    id: '',
    name: '',
    slug: '',
    description: '',
    // Precificação
    costPrice: 0,
    suggestedPrice: 0,
    originalPrice: 0,
    price: 0,
    discountPercent: 0,
    discountPrice: 0,
    stripeDiscount: 0,
    stripeFinalPrice: 0,
    finalPrice: 0,
    markup: 0,
    profitMargin: 0,
    profitValue: 0,
    // Outros
    stock: 0,
    sku: '',
    ncm: '',
    brandId: '',
    categoryId: '',
    featured: false,
    isPreOrder: false,
    isActive: true,
    images: [],
    specifications: {},
    tags: '',
    weight: 0,
    dimensions: '',
    warranty: 12,
    // Variações
    productVariations: [],
    hasVariations: false
  })

  const [specKey, setSpecKey] = useState('')
  const [specValue, setSpecValue] = useState('')
  
  // Estados para variações de produto com SKU/NCM
  const [showVariationModal, setShowVariationModal] = useState(false)
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null)
  const [variationForm, setVariationForm] = useState({
    name: '',
    sku: '',
    ncm: '',
    image: '',
    stock: 0,
    priceAdjustment: 0,
    serialNumbers: ''
  })

  // Helper para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  // Função para calcular estoque total a partir das variações
  const calculateTotalStockFromVariations = (variations: ProductVariation[]) => {
    return variations.reduce((total, v) => total + v.stock, 0)
  }

  // Efeito para atualizar estoque quando variações mudam
  useEffect(() => {
    if (formData.hasVariations && formData.productVariations.length > 0) {
      const totalStock = calculateTotalStockFromVariations(formData.productVariations)
      if (totalStock !== formData.stock) {
        setFormData(prev => ({ ...prev, stock: totalStock }))
      }
    }
  }, [formData.productVariations, formData.hasVariations, formData.stock])

  // Função para adicionar/editar variação
  const handleSaveVariation = () => {
    if (!variationForm.name || !variationForm.sku) {
      toast.error('Nome e SKU são obrigatórios')
      return
    }

    const newVariation: ProductVariation = {
      id: editingVariation?.id || `var-${Date.now()}`,
      name: variationForm.name,
      sku: variationForm.sku,
      ncm: variationForm.ncm,
      image: variationForm.image,
      stock: variationForm.stock,
      priceAdjustment: variationForm.priceAdjustment,
      serialNumbers: variationForm.serialNumbers.split(',').map(s => s.trim()).filter(Boolean),
      isActive: true
    }

    if (editingVariation) {
      setFormData(prev => ({
        ...prev,
        productVariations: prev.productVariations.map(v => 
          v.id === editingVariation.id ? newVariation : v
        )
      }))
      toast.success('Variação atualizada!')
    } else {
      setFormData(prev => ({
        ...prev,
        productVariations: [...prev.productVariations, newVariation]
      }))
      toast.success('Variação adicionada!')
    }

    setVariationForm({ name: '', sku: '', ncm: '', image: '', stock: 0, priceAdjustment: 0, serialNumbers: '' })
    setEditingVariation(null)
    setShowVariationModal(false)
  }

  // Função para editar variação
  const handleEditVariation = (variation: ProductVariation) => {
    setVariationForm({
      name: variation.name,
      sku: variation.sku,
      ncm: variation.ncm,
      image: variation.image,
      stock: variation.stock,
      priceAdjustment: variation.priceAdjustment,
      serialNumbers: variation.serialNumbers.join(', ')
    })
    setEditingVariation(variation)
    setShowVariationModal(true)
  }

  // Função para remover variação
  const handleRemoveVariation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      productVariations: prev.productVariations.filter(v => v.id !== id)
    }))
    toast.success('Variação removida!')
  }

  // Função para calcular todos os preços automaticamente
  const calculatePrices = (data: Partial<ProductFormData>) => {
    const costPrice = data.costPrice ?? formData.costPrice
    const price = data.price ?? formData.price
    const discountPercent = data.discountPercent ?? formData.discountPercent
    const stripeDiscount = data.stripeDiscount ?? formData.stripeDiscount

    const discountPrice = discountPercent > 0 
      ? price * (1 - discountPercent / 100) 
      : 0

    const basePrice = discountPrice > 0 ? discountPrice : price

    const stripeFinalPrice = stripeDiscount > 0 
      ? basePrice * (1 - stripeDiscount / 100) 
      : 0

    const finalPrice = stripeFinalPrice > 0 
      ? stripeFinalPrice 
      : (discountPrice > 0 ? discountPrice : price)

    const markup = costPrice > 0 ? ((price - costPrice) / costPrice) * 100 : 0

    const profitMargin = finalPrice > 0 && costPrice > 0 
      ? ((finalPrice - costPrice) / finalPrice) * 100 
      : 0

    const profitValue = finalPrice - costPrice

    return {
      discountPrice: Math.round(discountPrice * 100) / 100,
      stripeFinalPrice: Math.round(stripeFinalPrice * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      markup: Math.round(markup * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      profitValue: Math.round(profitValue * 100) / 100
    }
  }

  // Helper para campos de preço com cálculo automático
  const handlePriceChange = (field: keyof ProductFormData, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value) || 0
    const newData = { ...formData, [field]: numValue }
    
    const priceFields = ['costPrice', 'price', 'discountPercent', 'stripeDiscount']
    
    if (priceFields.includes(field)) {
      const calculated = calculatePrices({ [field]: numValue })
      setFormData({
        ...newData,
        ...calculated
      })
    } else {
      setFormData(newData)
    }
  }

  // Helper para evitar NaN em inputs numéricos
  const handleNumericChange = (field: 'stock', value: string) => {
    setFormData({ ...formData, [field]: value === '' ? 0 : parseInt(value) || 0 })
  }

  useEffect(() => {
    loadData()
  }, [productId])

  const loadData = async () => {
    try {
      const [product, brandsRes, categoriesRes] = await Promise.all([
        api.products.getById(productId),
        api.brands.getAll(),
        api.categories.getAll()
      ])
      
      if (product) {
        // Parse JSON strings para arrays/objetos
        let images: string[] = []
        let specifications: Record<string, string> = {}
        
        try {
          if (typeof product.images === 'string') {
            images = JSON.parse(product.images)
          } else if (Array.isArray(product.images)) {
            images = product.images
          }
        } catch {
          images = []
        }
        
        try {
          if (typeof product.specifications === 'string') {
            specifications = JSON.parse(product.specifications)
          } else if (product.specifications && typeof product.specifications === 'object') {
            specifications = product.specifications
          }
        } catch {
          specifications = {}
        }

        setFormData({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          // Precificação
          costPrice: product.costPrice || 0,
          suggestedPrice: product.suggestedPrice || 0,
          originalPrice: product.originalPrice || 0,
          price: product.price || 0,
          discountPercent: product.discountPercent || 0,
          discountPrice: product.discountPrice || 0,
          stripeDiscount: product.stripeDiscount || 0,
          stripeFinalPrice: product.stripeFinalPrice || 0,
          finalPrice: product.finalPrice || product.price || 0,
          markup: product.markup || 0,
          profitMargin: product.profitMargin || 0,
          profitValue: product.profitValue || 0,
          // Outros campos
          stock: product.stock,
          sku: product.sku || product.slug || '',
          ncm: (product as any).ncm || '',
          brandId: product.brandId || '',
          categoryId: product.categoryId || '',
          featured: product.featured || false,
          isPreOrder: product.isPreOrder || false,
          isActive: product.isActive ?? true,
          images,
          specifications,
          tags: product.tags || '',
          weight: product.weight || 0,
          dimensions: product.dimensions || '',
          warranty: product.warranty || 12,
          // Variações
          productVariations: (product as any).productVariations || [],
          hasVariations: (product as any).hasVariations || false
        })
      } else {
        toast.error('Produto não encontrado')
        router.push('/admin/products')
      }
      
      // Tratar resposta que pode ter .data ou ser array direto
      const brandsData = Array.isArray(brandsRes) ? brandsRes : (brandsRes as any).data || []
      const categoriesData = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes as any).data || []
      setBrands(brandsData)
      setCategories(categoriesData)
    } catch (error) {
      toast.error('Erro ao carregar produto')
      console.error(error)
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!formData.name || !formData.slug || !formData.price || !formData.brandId || !formData.categoryId) {
        toast.error('Preencha todos os campos obrigatórios')
        setSaving(false)
        return
      }

      // Preparar dados para envio - converter arrays/objects para JSON strings
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        // Campos de Precificação
        costPrice: formData.costPrice || undefined,
        suggestedPrice: formData.suggestedPrice || undefined,
        originalPrice: formData.originalPrice || undefined,
        price: formData.price,
        discountPercent: formData.discountPercent || undefined,
        discountPrice: formData.discountPrice || undefined,
        stripeDiscount: formData.stripeDiscount || undefined,
        stripeFinalPrice: formData.stripeFinalPrice || undefined,
        finalPrice: formData.finalPrice || formData.price,
        markup: formData.markup || undefined,
        profitMargin: formData.profitMargin || undefined,
        profitValue: formData.profitValue || undefined,
        // Outros campos
        stock: formData.stock,
        brandId: formData.brandId,
        categoryId: formData.categoryId,
        featured: formData.featured,
        isPreOrder: formData.isPreOrder,
        isActive: formData.isActive,
        images: JSON.stringify(formData.images),
        specifications: JSON.stringify(formData.specifications),
        tags: formData.tags || '',
        weight: formData.weight || 0,
        dimensions: formData.dimensions || '',
        warranty: formData.warranty || 12
      }

      await api.products.update(productId, productData, token || undefined)
      toast.success('Produto atualizado com sucesso!')
      router.push('/admin/products')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar produto')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeleting(true)

    try {
      await api.products.delete(productId, token || undefined)
      toast.success('Produto excluído com sucesso!')
      router.push('/admin/products')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir produto')
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        const formDataUpload = new FormData()
        formDataUpload.append('image', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formDataUpload
        })

        if (response.ok) {
          const data = await response.json()
          if (data.url) {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, data.url]
            }))
            toast.success('Imagem enviada com sucesso!')
          }
        } else {
          const error = await response.json()
          toast.error(error.error || 'Erro ao enviar imagem')
        }
      }
    } catch (error: any) {
      toast.error('Erro ao enviar imagem')
      console.error(error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAddSpecification = () => {
    if (specKey && specValue) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specKey]: specValue
        }
      })
      setSpecKey('')
      setSpecValue('')
      toast.success('Especificação adicionada')
    }
  }

  const handleRemoveSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications }
    delete newSpecs[key]
    setFormData({ ...formData, specifications: newSpecs })
    toast.success('Especificação removida')
  }

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
    toast.success('Imagem removida')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Editar Produto</h1>
              <p className="text-sm sm:text-base text-gray-500">Atualize os dados do produto</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2 text-red-500 hover:text-red-700 hover:border-red-300 w-full sm:w-auto"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/products')}
                className="gap-2 w-full sm:w-auto"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Informações Básicas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Informações Básicas</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormLabel label="Nome do Produto" required />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="iPhone 16 Pro Max 256GB"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <FormLabel label="Slug (URL)" required />
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="iphone-16-pro-max-256gb"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <FormLabel label="SKU" required />
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="APL-IPH16PM-256"
                  required
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <FormLabel label="Descrição" />
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do produto..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </motion.div>

          {/* Preço e Estoque */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Precificação Completa</h2>
            </div>

            {/* Linha 1: Custos e Preço Base */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <FormLabel label="Preço de Custo (R$)" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice || ''}
                  onChange={(e) => handlePriceChange('costPrice', e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Quanto você paga</p>
              </div>

              <div>
                <FormLabel label="Preço Sugerido (R$)" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.suggestedPrice || ''}
                  onChange={(e) => handlePriceChange('suggestedPrice', e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Referência de mercado</p>
              </div>

              <div>
                <FormLabel label="Preço Original 'De' (R$)" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice || ''}
                  onChange={(e) => handlePriceChange('originalPrice', e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Preço riscado</p>
              </div>

              <div>
                <FormLabel label="Preço Base (R$)" required />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) => handlePriceChange('price', e.target.value)}
                  placeholder="0.00"
                  required
                  className="mt-1 border-blue-300 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Preço de venda</p>
              </div>
            </div>

            {/* Linha 2: Descontos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <FormLabel label="Desconto (%)" />
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.discountPercent || ''}
                  onChange={(e) => handlePriceChange('discountPercent', e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Desconto geral</p>
              </div>

              <div>
                <FormLabel label="Preço c/ Desconto (R$)" />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discountPrice || ''}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
                <p className="text-xs text-green-600 mt-1">
                  {formData.discountPercent > 0 ? `${formData.discountPercent}% OFF` : 'Sem desconto'}
                </p>
              </div>

              <div>
                <FormLabel label="Desconto Stripe (%)" />
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.stripeDiscount || ''}
                  onChange={(e) => handlePriceChange('stripeDiscount', e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Desconto adicional</p>
              </div>

              <div>
                <FormLabel label="Preço Stripe (R$)" />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.stripeFinalPrice || ''}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
                <p className="text-xs text-purple-600 mt-1">
                  {formData.stripeDiscount > 0 ? `+${formData.stripeDiscount}% OFF` : 'Sem desconto Stripe'}
                </p>
              </div>
            </div>

            {/* Linha 3: Preço Final e Margens */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-1">
                <FormLabel label="PREÇO FINAL (R$)" required />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.finalPrice || ''}
                  onChange={(e) => handlePriceChange('finalPrice', e.target.value)}
                  className="mt-1 border-2 border-green-400 bg-green-50 text-lg font-bold text-green-700"
                />
                <p className="text-xs text-green-600 font-medium mt-1">Preço exibido ao cliente</p>
              </div>

              <div>
                <FormLabel label="Markup (%)" />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.markup || ''}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Sobre o custo</p>
              </div>

              <div>
                <FormLabel label="Margem de Lucro (%)" />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.profitMargin || ''}
                  readOnly
                  className={`mt-1 ${formData.profitMargin >= 20 ? 'bg-green-50 text-green-700' : formData.profitMargin >= 10 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}
                />
                <p className={`text-xs mt-1 ${formData.profitMargin >= 20 ? 'text-green-600' : formData.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {formData.profitMargin >= 20 ? 'Margem saudável' : formData.profitMargin >= 10 ? 'Margem baixa' : 'Margem crítica'}
                </p>
              </div>

              <div>
                <FormLabel label="Lucro (R$)" />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.profitValue || ''}
                  readOnly
                  className={`mt-1 ${formData.profitValue > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                />
                <p className="text-xs text-gray-500 mt-1">Por unidade vendida</p>
              </div>
            </div>

            {/* Resumo Visual */}
            {formData.price > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3">Resumo de Precificação</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Custo</p>
                    <p className="font-bold text-gray-700">{formatCurrency(formData.costPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Preço Base</p>
                    <p className="font-bold text-gray-700">{formatCurrency(formData.price)}</p>
                  </div>
                  {formData.discountPrice > 0 && (
                    <div>
                      <p className="text-xs text-gray-500">C/ Desconto</p>
                      <p className="font-bold text-orange-600">{formatCurrency(formData.discountPrice)}</p>
                    </div>
                  )}
                  {formData.stripeFinalPrice > 0 && (
                    <div>
                      <p className="text-xs text-gray-500">Stripe</p>
                      <p className="font-bold text-purple-600">{formatCurrency(formData.stripeFinalPrice)}</p>
                    </div>
                  )}
                  <div className="bg-green-100 rounded-lg p-2">
                    <p className="text-xs text-green-600 font-medium">FINAL</p>
                    <p className="font-bold text-green-700 text-lg">{formatCurrency(formData.finalPrice)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Estoque e Identificação */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <FormLabel label="NCM" />
                  <Input
                    id="ncm"
                    type="text"
                    value={formData.ncm}
                    onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                    placeholder="Ex: 8517.12.31"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nomenclatura Comum do Mercosul</p>
                </div>
                <div>
                  <FormLabel label="Estoque" required />
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock || ''}
                    onChange={(e) => handleNumericChange('stock', e.target.value)}
                    placeholder="0"
                    required
                    disabled={formData.hasVariations}
                    className={`mt-1 ${formData.hasVariations ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {formData.hasVariations && (
                    <p className="text-xs text-amber-600 mt-1">
                      Estoque calculado automaticamente pelas variações
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-6">
                    <input
                      type="checkbox"
                      checked={formData.hasVariations}
                      onChange={(e) => setFormData({ ...formData, hasVariations: e.target.checked })}
                      className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Produto com Variações</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Categorização */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Layers className="h-5 w-5 text-purple-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Categorização</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel label="Marca" required />
                <select
                  id="brandId"
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                  required
                >
                  <option value="">Selecione uma marca</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <FormLabel label="Categoria" required />
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-400 border-gray-300 rounded focus:ring-blue-400"
                  />
                  <span className="text-sm font-medium text-gray-700">Produto em Destaque</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPreOrder}
                    onChange={(e) => setFormData({ ...formData, isPreOrder: e.target.checked })}
                    className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Produto Sob Encomenda</span>
                  <span className="text-xs text-gray-500">(Disponível apenas via WhatsApp)</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Imagens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-pink-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Imagens</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload-edit"
                />
                <label 
                  htmlFor="image-upload-edit"
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                      <span className="text-gray-600">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="text-gray-600">Clique para fazer upload ou arraste imagens aqui</span>
                    </>
                  )}
                </label>
              </div>

              <p className="text-sm text-gray-500">
                As imagens serão enviadas para o Cloudinary automaticamente. Formatos aceitos: JPG, PNG, WebP.
              </p>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Especificações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Especificações Técnicas</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  placeholder="Nome (ex: Processador)"
                />
                <Input
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  placeholder="Valor (ex: A17 Pro)"
                />
                <Button type="button" onClick={handleAddSpecification} className="bg-blue-400 hover:bg-blue-500">
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {Object.keys(formData.specifications).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{key}:</span>
                        <span className="ml-2 text-gray-600">{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecification(key)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Variações de Produto com SKU/NCM */}
          {formData.hasVariations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-sm p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Barcode className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Variações com SKU/NCM</h2>
                    <p className="text-sm text-gray-500">Gerencie SKU, NCM, estoque e números de série por variação</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setVariationForm({ name: '', sku: '', ncm: '', image: '', stock: 0, priceAdjustment: 0, serialNumbers: '' })
                    setEditingVariation(null)
                    setShowVariationModal(true)
                  }}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Variação
                </Button>
              </div>

              {/* Lista de Variações */}
              {formData.productVariations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Barcode className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Nenhuma variação cadastrada</p>
                  <p className="text-sm text-gray-400">
                    Clique em &quot;Nova Variação&quot; para adicionar variações com SKU, NCM e estoque individual
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.productVariations.map((variation) => (
                    <div
                      key={variation.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-cyan-300 transition-colors"
                    >
                      {/* Imagem da Variação */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                        {variation.image ? (
                          <img
                            src={variation.image}
                            alt={variation.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Informações da Variação */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{variation.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                          <span className="text-gray-600">
                            <span className="font-medium">SKU:</span> {variation.sku}
                          </span>
                          {variation.ncm && (
                            <span className="text-gray-600">
                              <span className="font-medium">NCM:</span> {variation.ncm}
                            </span>
                          )}
                          <span className="text-gray-600">
                            <span className="font-medium">Estoque:</span>{' '}
                            <span className={variation.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                              {variation.stock} un
                            </span>
                          </span>
                          {variation.priceAdjustment !== 0 && (
                            <span className={variation.priceAdjustment > 0 ? 'text-red-600' : 'text-green-600'}>
                              {variation.priceAdjustment > 0 ? '+' : ''}{formatCurrency(variation.priceAdjustment)}
                            </span>
                          )}
                        </div>
                        {variation.serialNumbers.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            <Hash className="h-3 w-3 inline mr-1" />
                            {variation.serialNumbers.length} número(s) de série
                          </p>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditVariation(variation)}
                          className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          title="Editar variação"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariation(variation.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover variação"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Resumo do Estoque */}
                  <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-xl border border-cyan-200 mt-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-cyan-600" />
                      <span className="font-medium text-cyan-900">Estoque Total</span>
                    </div>
                    <span className="text-xl font-bold text-cyan-700">
                      {calculateTotalStockFromVariations(formData.productVariations)} unidades
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Modal de Variação */}
          <AnimatePresence>
            {showVariationModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowVariationModal(false)
                    setEditingVariation(null)
                  }
                }}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingVariation ? 'Editar Variação' : 'Nova Variação'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Defina SKU, NCM, estoque e números de série para esta variação
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Nome da Variação */}
                    <div>
                      <FormLabel label="Nome da Variação" required />
                      <Input
                        value={variationForm.name}
                        onChange={(e) => setVariationForm({ ...variationForm, name: e.target.value })}
                        placeholder="Ex: iPhone 15 Pro 256GB Preto"
                        className="mt-1"
                      />
                    </div>

                    {/* SKU e NCM */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel label="SKU" required />
                        <Input
                          value={variationForm.sku}
                          onChange={(e) => setVariationForm({ ...variationForm, sku: e.target.value })}
                          placeholder="Ex: IPH15-PRO-256-BLK"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <FormLabel label="NCM" />
                        <Input
                          value={variationForm.ncm}
                          onChange={(e) => setVariationForm({ ...variationForm, ncm: e.target.value })}
                          placeholder="Ex: 8517.12.31"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Estoque e Ajuste de Preço */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel label="Estoque" required />
                        <Input
                          type="number"
                          min="0"
                          value={variationForm.stock || ''}
                          onChange={(e) => setVariationForm({ ...variationForm, stock: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <FormLabel label="Ajuste de Preço (R$)" />
                        <Input
                          type="number"
                          step="0.01"
                          value={variationForm.priceAdjustment || ''}
                          onChange={(e) => setVariationForm({ ...variationForm, priceAdjustment: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Positivo para aumentar, negativo para diminuir
                        </p>
                      </div>
                    </div>

                    {/* Imagem da Variação */}
                    <div>
                      <FormLabel label="Imagem da Variação" />
                      <div className="mt-1 flex items-center gap-4">
                        {variationForm.image ? (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                            <img
                              src={variationForm.image}
                              alt="Variação"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setVariationForm({ ...variationForm, image: '' })}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <X className="h-6 w-6 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => variationImageInputRef.current?.click()}
                            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-cyan-400 hover:text-cyan-500 transition-colors"
                          >
                            <Upload className="h-6 w-6" />
                            <span className="text-xs mt-1">Upload</span>
                          </button>
                        )}
                        <input
                          ref={variationImageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            
                            setUploading(true)
                            try {
                              const formDataUpload = new FormData()
                              formDataUpload.append('image', file)
                              
                              const response = await fetch('/api/upload', {
                                method: 'POST',
                                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                                body: formDataUpload
                              })
                              
                              if (response.ok) {
                                const data = await response.json()
                                if (data.url) {
                                  setVariationForm(prev => ({ ...prev, image: data.url }))
                                  toast.success('Imagem enviada!')
                                }
                              } else {
                                toast.error('Erro ao enviar imagem')
                              }
                            } catch {
                              toast.error('Erro ao enviar imagem')
                            } finally {
                              setUploading(false)
                              e.target.value = ''
                            }
                          }}
                        />
                        {uploading && (
                          <div className="flex items-center gap-2 text-cyan-600">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Enviando...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Números de Série */}
                    <div>
                      <FormLabel label="Números de Série" />
                      <Textarea
                        value={variationForm.serialNumbers}
                        onChange={(e) => setVariationForm({ ...variationForm, serialNumbers: e.target.value })}
                        placeholder="Separe os números de série por vírgula. Ex: SN001, SN002, SN003"
                        rows={3}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {variationForm.serialNumbers.split(',').filter(s => s.trim()).length} número(s) de série informado(s)
                      </p>
                    </div>
                  </div>

                  {/* Botões do Modal */}
                  <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowVariationModal(false)
                        setEditingVariation(null)
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveVariation}
                      className="bg-cyan-500 hover:bg-cyan-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingVariation ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
              className="gap-2 w-full sm:w-auto order-2 sm:order-1"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="gap-2 bg-blue-500 hover:bg-blue-600 w-full sm:w-auto order-1 sm:order-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
