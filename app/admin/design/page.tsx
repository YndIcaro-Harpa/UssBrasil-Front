'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette,
  Search,
  Eye,
  Edit,
  X,
  Save,
  GripVertical,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Tag,
  Layers
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { api } from '@/services/api'
import { TableSkeleton } from '@/components/ui/SkeletonLoaders'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string
  color?: string
  isActive: boolean
  sortOrder: number
  _count?: {
    products: number
  }
}

export default function AdminDesignPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.categories.getAll()
      const cats = Array.isArray(response) ? response : (response as any)?.categories || []
      setCategories(cats)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [categories, searchTerm])

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(JSON.parse(JSON.stringify(category)))
  }

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return
    
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      await api.categories.update(selectedCategory.id, {
        name: selectedCategory.name,
        slug: selectedCategory.slug,
        description: selectedCategory.description,
        image: selectedCategory.image,
        icon: selectedCategory.icon,
        color: selectedCategory.color,
        isActive: selectedCategory.isActive,
        sortOrder: selectedCategory.sortOrder
      }, token || undefined)
      
      toast.success('Design da categoria atualizado!')
      fetchCategories()
      setSelectedCategory(null)
    } catch (error: any) {
      console.error('Error updating category:', error)
      toast.error(error.message || 'Erro ao atualizar categoria')
    } finally {
      setSaving(false)
    }
  }
  
  const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 }
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: springTransition }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <TableSkeleton rows={6} columns={5} />
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <motion.div 
        className="flex-1 p-4 sm:p-6 lg:p-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.header variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Palette className="w-7 h-7 text-[#001941]" />
                  Design de Categorias
                </h1>
                <p className="text-gray-500 mt-1">
                  Personalize a aparência visual das categorias da loja
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={fetchCategories}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </motion.header>

          {/* Search */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar categoria..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Layers className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-gray-900">{categories.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ativas</p>
                  <p className="text-xl font-bold text-gray-900">{categories.filter(c => c.isActive).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Com Imagem</p>
                  <p className="text-xl font-bold text-gray-900">{categories.filter(c => c.image).length}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Categories Table */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-100 bg-gray-50">
                      <tr>
                        <th className="p-4 font-medium text-gray-600 w-10"></th>
                        <th className="p-4 font-medium text-gray-600">Categoria</th>
                        <th className="p-4 font-medium text-gray-600">Slug</th>
                        <th className="p-4 font-medium text-gray-600 text-center">Produtos</th>
                        <th className="p-4 font-medium text-gray-600">Cor</th>
                        <th className="p-4 font-medium text-gray-600">Status</th>
                        <th className="p-4 font-medium text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredCategories.map(cat => (
                        <motion.tr 
                          key={cat.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleSelectCategory(cat)}
                          variants={itemVariants}
                          layout
                        >
                          <td className="p-4 text-center text-gray-400">
                            <GripVertical className="w-4 h-4" />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {cat.image ? (
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                                  <Image 
                                    src={cat.image} 
                                    alt={cat.name}
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Tag className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{cat.name}</p>
                                {cat.description && (
                                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{cat.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-500 font-mono text-sm">/{cat.slug}</td>
                          <td className="p-4 text-center text-gray-600">{cat._count?.products || 0}</td>
                          <td className="p-4">
                            {cat.color ? (
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-6 h-6 rounded-full border border-gray-200"
                                  style={{ backgroundColor: cat.color }}
                                />
                                <span className="text-xs text-gray-500 font-mono">{cat.color}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant={cat.isActive ? 'default' : 'outline'} className={cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                              {cat.isActive ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full hover:bg-gray-100" 
                              onClick={(e) => {e.stopPropagation(); handleSelectCategory(cat)}}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredCategories.length === 0 && (
                  <div className="p-12 text-center">
                    <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma categoria encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Editor Panel */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 420, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full bg-white border-l border-gray-200 shadow-xl flex flex-col"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Editar Design
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 p-5 space-y-5 overflow-y-auto">
              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-500 mb-3">Preview</p>
                <div className="flex items-center gap-3">
                  {selectedCategory.image ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm">
                      <Image 
                        src={selectedCategory.image} 
                        alt={selectedCategory.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: selectedCategory.color || '#f3f4f6' }}
                    >
                      <Tag className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{selectedCategory.name}</p>
                    <p className="text-sm text-gray-500">/{selectedCategory.slug}</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome</label>
                <Input 
                  value={selectedCategory.name} 
                  onChange={e => setSelectedCategory(p => p && {...p, name: e.target.value})}
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Slug</label>
                <Input 
                  value={selectedCategory.slug} 
                  onChange={e => setSelectedCategory(p => p && {...p, slug: e.target.value})}
                  className="font-mono"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <textarea 
                  value={selectedCategory.description || ''} 
                  onChange={e => setSelectedCategory(p => p && {...p, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                  rows={3}
                  placeholder="Descrição da categoria..."
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">URL da Imagem</label>
                <Input 
                  value={selectedCategory.image || ''} 
                  onChange={e => setSelectedCategory(p => p && {...p, image: e.target.value})}
                  placeholder="https://..."
                />
                {selectedCategory.image && (
                  <div className="mt-2 w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                    <Image 
                      src={selectedCategory.image} 
                      alt="Preview"
                      width={400}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>

              {/* Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cor da Categoria</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={selectedCategory.color || '#001941'} 
                    onChange={e => setSelectedCategory(p => p && {...p, color: e.target.value})}
                    className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <Input 
                    value={selectedCategory.color || ''} 
                    onChange={e => setSelectedCategory(p => p && {...p, color: e.target.value})}
                    placeholder="#001941"
                    className="font-mono flex-1"
                  />
                </div>
              </div>

              {/* Icon */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ícone (nome)</label>
                <Input 
                  value={selectedCategory.icon || ''} 
                  onChange={e => setSelectedCategory(p => p && {...p, icon: e.target.value})}
                  placeholder="smartphone, laptop, watch..."
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ordem de Exibição</label>
                <Input 
                  type="number"
                  value={selectedCategory.sortOrder || 0} 
                  onChange={e => setSelectedCategory(p => p && {...p, sortOrder: parseInt(e.target.value) || 0})}
                />
              </div>

              {/* Active */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Visível na loja</p>
                  <p className="text-xs text-gray-500">Exibir categoria para clientes</p>
                </div>
                <Switch 
                  checked={selectedCategory.isActive} 
                  onCheckedChange={c => setSelectedCategory(p => p && {...p, isActive: c})} 
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-100">
              <Button 
                className="w-full bg-[#001941] hover:bg-[#002a6b] text-white" 
                onClick={handleUpdateCategory}
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

