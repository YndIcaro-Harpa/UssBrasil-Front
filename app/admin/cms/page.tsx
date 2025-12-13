'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, Layout, Loader2, Plus, Trash2, Upload, Image as ImageIcon, 
  Video, Link2, Package, GripVertical, ChevronDown, ChevronUp,
  Eye, EyeOff, Settings, Smartphone, Monitor, X, Search,
  Layers, FileImage, Type, ShoppingBag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { api, Product } from '@/services/api'

// Cloudinary Config
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default'

interface SiteConfig {
  key: string
  value: string
  type: string
  description: string
}

interface PromoSection {
  id: string
  title: string
  subtitle?: string
  type: 'banner' | 'video' | 'products' | 'cards' | 'hero'
  enabled: boolean
  order: number
  content: {
    imageUrl?: string
    videoUrl?: string
    link?: string
    buttonText?: string
    productIds?: string[]
    cards?: Array<{
      title: string
      description: string
      imageUrl: string
      link: string
    }>
    backgroundColor?: string
    textColor?: string
  }
}

// Upload para Cloudinary
const uploadToCloudinary = async (file: File, type: 'image' | 'video' = 'image'): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', 'uss-brasil/cms')

  const resourceType = type === 'video' ? 'video' : 'image'
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) throw new Error('Erro ao fazer upload')
  const data = await response.json()
  return data.secure_url
}

// Modal de Seleção de Produtos
function ProductSelectorModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedIds 
}: { 
  isOpen: boolean
  onClose: () => void
  onSelect: (ids: string[]) => void
  selectedIds: string[]
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>(selectedIds)

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
      setSelected(selectedIds)
    }
  }, [isOpen, selectedIds])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await api.products.getAll({ limit: 50 })
      setProducts(res.data || [])
    } catch (error) {
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-[800px] max-h-[80vh] overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b bg-[#001941]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              Selecionar Produtos
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#001941]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selected.includes(product.id)
                      ? 'border-[#001941] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                    <img
                      src={product.images?.[0] || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">
                    R$ {product.price?.toFixed(2) || '0.00'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {selected.length} produto(s) selecionado(s)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button 
              className="bg-[#001941] hover:bg-blue-900"
              onClick={() => { onSelect(selected); onClose() }}
            >
              Confirmar Seleção
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Componente de Upload com Cloudinary
function CloudinaryUploader({ 
  type = 'image',
  value,
  onChange,
  label
}: {
  type?: 'image' | 'video'
  value?: string
  onChange: (url: string) => void
  label?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (!file) return
    
    // Validação de tipo
    const validTypes = type === 'video' 
      ? ['video/mp4', 'video/webm', 'video/quicktime']
      : ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    
    if (!validTypes.includes(file.type)) {
      toast.error(`Tipo de arquivo inválido. Use: ${validTypes.join(', ')}`)
      return
    }

    // Validação de tamanho (50MB para vídeo, 10MB para imagem)
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Máximo: ${type === 'video' ? '50MB' : '10MB'}`)
      return
    }

    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, type)
      onChange(url)
      toast.success('Upload realizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver 
            ? 'border-[#001941] bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={type === 'video' ? 'video/*' : 'image/*'}
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#001941]" />
            <p className="text-sm text-gray-600">Fazendo upload...</p>
          </div>
        ) : value ? (
          <div className="space-y-2">
            {type === 'video' ? (
              <video src={value} controls className="max-h-40 mx-auto rounded-lg" />
            ) : (
              <img src={value} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
            )}
            <p className="text-xs text-gray-500">Clique para alterar</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {type === 'video' ? <Video className="w-8 h-8 text-gray-400" /> : <ImageIcon className="w-8 h-8 text-gray-400" />}
            <p className="text-sm text-gray-600">
              Arraste ou clique para upload
            </p>
            <p className="text-xs text-gray-400">
              {type === 'video' ? 'MP4, WebM até 50MB' : 'JPG, PNG, WebP até 10MB'}
            </p>
          </div>
        )}
      </div>
      
      {/* Opção de URL manual */}
      <div className="flex gap-2 items-center">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Ou cole a URL do ${type === 'video' ? 'vídeo' : 'imagem'}`}
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

// Componente de Seção Promocional
function PromoSectionEditor({
  section,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: {
  section: PromoSection
  onChange: (section: PromoSection) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)

  const updateContent = (key: string, value: any) => {
    onChange({
      ...section,
      content: { ...section.content, [key]: value }
    })
  }

  const sectionTypeIcons: Record<string, any> = {
    banner: FileImage,
    video: Video,
    products: ShoppingBag,
    cards: Layers,
    hero: Monitor
  }

  const SectionIcon = sectionTypeIcons[section.type] || Layers

  return (
    <>
      <Card className={`transition-all ${!section.enabled ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <button
                  onClick={onMoveUp}
                  disabled={isFirst}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={onMoveDown}
                  disabled={isLast}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
              <div className={`p-2 rounded-lg ${section.enabled ? 'bg-[#001941]' : 'bg-gray-400'}`}>
                <SectionIcon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1">
                <Input
                  value={section.title}
                  onChange={(e) => onChange({ ...section, title: e.target.value })}
                  className="font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                  placeholder="Título da seção"
                />
                <p className="text-xs text-gray-500 mt-0.5">
                  Tipo: {section.type === 'banner' ? 'Banner' : section.type === 'video' ? 'Vídeo' : section.type === 'products' ? 'Produtos' : section.type === 'cards' ? 'Cards' : 'Hero'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChange({ ...section, enabled: !section.enabled })}
                className={`p-2 rounded-lg transition-colors ${
                  section.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {section.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              <button
                onClick={onDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="pt-4 space-y-4">
                {/* Subtítulo */}
                <div>
                  <Label>Subtítulo</Label>
                  <Input
                    value={section.subtitle || ''}
                    onChange={(e) => onChange({ ...section, subtitle: e.target.value })}
                    placeholder="Subtítulo opcional"
                  />
                </div>

                {/* Conteúdo baseado no tipo */}
                {(section.type === 'banner' || section.type === 'hero') && (
                  <>
                    <CloudinaryUploader
                      type="image"
                      value={section.content.imageUrl}
                      onChange={(url) => updateContent('imageUrl', url)}
                      label="Imagem de Fundo"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Link de Destino</Label>
                        <Input
                          value={section.content.link || ''}
                          onChange={(e) => updateContent('link', e.target.value)}
                          placeholder="/ofertas"
                        />
                      </div>
                      <div>
                        <Label>Texto do Botão</Label>
                        <Input
                          value={section.content.buttonText || ''}
                          onChange={(e) => updateContent('buttonText', e.target.value)}
                          placeholder="Ver Ofertas"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cor de Fundo</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={section.content.backgroundColor || '#001941'}
                            onChange={(e) => updateContent('backgroundColor', e.target.value)}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={section.content.backgroundColor || '#001941'}
                            onChange={(e) => updateContent('backgroundColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Cor do Texto</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={section.content.textColor || '#FFFFFF'}
                            onChange={(e) => updateContent('textColor', e.target.value)}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={section.content.textColor || '#FFFFFF'}
                            onChange={(e) => updateContent('textColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {section.type === 'video' && (
                  <CloudinaryUploader
                    type="video"
                    value={section.content.videoUrl}
                    onChange={(url) => updateContent('videoUrl', url)}
                    label="Vídeo"
                  />
                )}

                {section.type === 'products' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Produtos Vinculados ({section.content.productIds?.length || 0})</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowProductModal(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Selecionar Produtos
                      </Button>
                    </div>
                    {section.content.productIds && section.content.productIds.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          {section.content.productIds.length} produto(s) selecionado(s)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {section.type === 'cards' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Cards ({section.content.cards?.length || 0})</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateContent('cards', [
                          ...(section.content.cards || []),
                          { title: 'Novo Card', description: '', imageUrl: '', link: '' }
                        ])}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Card
                      </Button>
                    </div>
                    
                    {section.content.cards?.map((card, idx) => (
                      <Card key={idx} className="border-dashed">
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex justify-between">
                            <Label>Card {idx + 1}</Label>
                            <button
                              onClick={() => updateContent('cards', section.content.cards?.filter((_, i) => i !== idx))}
                              className="text-red-500 text-sm hover:underline"
                            >
                              Remover
                            </button>
                          </div>
                          <Input
                            value={card.title}
                            onChange={(e) => {
                              const newCards = [...(section.content.cards || [])]
                              newCards[idx] = { ...card, title: e.target.value }
                              updateContent('cards', newCards)
                            }}
                            placeholder="Título do card"
                          />
                          <Textarea
                            value={card.description}
                            onChange={(e) => {
                              const newCards = [...(section.content.cards || [])]
                              newCards[idx] = { ...card, description: e.target.value }
                              updateContent('cards', newCards)
                            }}
                            placeholder="Descrição"
                            rows={2}
                          />
                          <CloudinaryUploader
                            value={card.imageUrl}
                            onChange={(url) => {
                              const newCards = [...(section.content.cards || [])]
                              newCards[idx] = { ...card, imageUrl: url }
                              updateContent('cards', newCards)
                            }}
                          />
                          <Input
                            value={card.link}
                            onChange={(e) => {
                              const newCards = [...(section.content.cards || [])]
                              newCards[idx] = { ...card, link: e.target.value }
                              updateContent('cards', newCards)
                            }}
                            placeholder="Link de destino"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <ProductSelectorModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        selectedIds={section.content.productIds || []}
        onSelect={(ids) => updateContent('productIds', ids)}
      />
    </>
  )
}

// Página Principal do CMS
export default function CMSPage() {
  const { token } = useAdminAuth()
  const [configs, setConfigs] = useState<SiteConfig[]>([])
  const [promoSections, setPromoSections] = useState<PromoSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'sections'>('sections')

  useEffect(() => {
    if (token) {
      fetchConfigs()
      loadPromoSections()
    }
  }, [token])

  const fetchConfigs = async () => {
    try {
      const response = await apiClient.get('/site-config/admin', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setConfigs(response.data)
    } catch (error) {
      console.error('Error fetching configs:', error)
      // Configurações padrão se a API falhar
      setConfigs([])
    } finally {
      setLoading(false)
    }
  }

  const loadPromoSections = () => {
    // Carregar do localStorage ou usar seções padrão
    const saved = localStorage.getItem('cms_promo_sections')
    if (saved) {
      setPromoSections(JSON.parse(saved))
    } else {
      // Seções padrão iniciais
      setPromoSections([
        {
          id: '1',
          title: 'iPhone 17 Pro - Lançamento',
          subtitle: 'O mais avançado iPhone já criado',
          type: 'hero',
          enabled: true,
          order: 0,
          content: {
            imageUrl: '',
            link: '/iphone17-pro',
            buttonText: 'Saiba Mais',
            backgroundColor: '#001941',
            textColor: '#FFFFFF'
          }
        },
        {
          id: '2',
          title: 'Vídeo Institucional',
          type: 'video',
          enabled: true,
          order: 1,
          content: {
            videoUrl: ''
          }
        },
        {
          id: '3',
          title: 'Produtos em Destaque',
          subtitle: 'Confira nossas ofertas especiais',
          type: 'products',
          enabled: true,
          order: 2,
          content: {
            productIds: []
          }
        }
      ])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Salvar configurações gerais
      if (configs.length > 0) {
        await apiClient.put('/site-config', {
          configs: configs.map(c => ({ key: c.key, value: c.value }))
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      // Salvar seções promocionais no localStorage (ou enviar para API)
      localStorage.setItem('cms_promo_sections', JSON.stringify(promoSections))
      
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Error saving configs:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (key: string, value: string) => {
    setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c))
  }

  const addSection = (type: PromoSection['type']) => {
    const newSection: PromoSection = {
      id: Date.now().toString(),
      title: type === 'hero' ? 'Nova Hero Section' : 
             type === 'banner' ? 'Novo Banner' :
             type === 'video' ? 'Novo Vídeo' :
             type === 'products' ? 'Nova Seção de Produtos' : 'Novos Cards',
      type,
      enabled: true,
      order: promoSections.length,
      content: {}
    }
    setPromoSections([...promoSections, newSection])
  }

  const updateSection = (index: number, section: PromoSection) => {
    const newSections = [...promoSections]
    newSections[index] = section
    setPromoSections(newSections)
  }

  const deleteSection = (index: number) => {
    if (confirm('Tem certeza que deseja excluir esta seção?')) {
      setPromoSections(promoSections.filter((_, i) => i !== index))
    }
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...promoSections]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newSections.length) return
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]]
    setPromoSections(newSections)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#001941]" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layout className="h-6 w-6 text-[#001941]" />
            Gerenciador de Conteúdo (CMS)
          </h1>
          <p className="text-gray-500">Configure banners, seções promocionais, vídeos e produtos da home.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar Site
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#001941] hover:bg-blue-900 text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'sections' 
              ? 'border-[#001941] text-[#001941] font-medium' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4 inline mr-2" />
          Seções Promocionais
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'general' 
              ? 'border-[#001941] text-[#001941] font-medium' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Configurações Gerais
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          {/* Botões para adicionar seções */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Adicionar Nova Seção</CardTitle>
              <CardDescription>Escolha o tipo de seção que deseja adicionar à página inicial</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => addSection('hero')}>
                  <Monitor className="w-4 h-4 mr-2" />
                  Hero Section
                </Button>
                <Button variant="outline" onClick={() => addSection('banner')}>
                  <FileImage className="w-4 h-4 mr-2" />
                  Banner
                </Button>
                <Button variant="outline" onClick={() => addSection('video')}>
                  <Video className="w-4 h-4 mr-2" />
                  Vídeo
                </Button>
                <Button variant="outline" onClick={() => addSection('products')}>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Produtos
                </Button>
                <Button variant="outline" onClick={() => addSection('cards')}>
                  <Layers className="w-4 h-4 mr-2" />
                  Cards
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Seções */}
          <div className="space-y-4">
            {promoSections.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma seção criada ainda.</p>
                  <p className="text-sm">Use os botões acima para adicionar seções à página inicial.</p>
                </CardContent>
              </Card>
            ) : (
              promoSections.map((section, index) => (
                <PromoSectionEditor
                  key={section.id}
                  section={section}
                  onChange={(s) => updateSection(index, s)}
                  onDelete={() => deleteSection(index)}
                  onMoveUp={() => moveSection(index, 'up')}
                  onMoveDown={() => moveSection(index, 'down')}
                  isFirst={index === 0}
                  isLast={index === promoSections.length - 1}
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'general' && (
        <div className="grid grid-cols-1 gap-6">
          {configs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma configuração geral disponível.</p>
                <p className="text-sm">As configurações serão carregadas da API quando disponíveis.</p>
              </CardContent>
            </Card>
          ) : (
            configs.map((config) => (
              <Card key={config.key}>
                <CardHeader>
                  <CardTitle className="text-base font-medium">{config.key}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {config.type === 'json' ? (
                    <Textarea
                      value={config.value}
                      onChange={(e) => updateConfig(config.key, e.target.value)}
                      className="font-mono text-sm min-h-[100px]"
                    />
                  ) : config.type === 'video' ? (
                    <CloudinaryUploader
                      type="video"
                      value={config.value}
                      onChange={(url) => updateConfig(config.key, url)}
                    />
                  ) : config.type === 'image' ? (
                    <CloudinaryUploader
                      type="image"
                      value={config.value}
                      onChange={(url) => updateConfig(config.key, url)}
                    />
                  ) : (
                    <Input
                      value={config.value}
                      onChange={(e) => updateConfig(config.key, e.target.value)}
                    />
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
