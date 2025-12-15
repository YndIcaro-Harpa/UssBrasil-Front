'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  GripVertical,
  RefreshCw,
  Loader2,
  ExternalLink,
  Globe,
  Calendar
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { api } from '@/services/api'
import { TableSkeleton } from '@/components/ui/SkeletonLoaders'

interface StaticPage {
  id: string
  title: string
  slug: string
  content: string
  metaTitle?: string
  metaDescription?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

// Páginas estáticas do sistema
const systemPages = [
  { slug: 'sobre', title: 'Sobre Nós', route: '/sobre' },
  { slug: 'contato', title: 'Contato', route: '/contato' },
  { slug: 'faq', title: 'FAQ', route: '/faq' },
  { slug: 'politica-de-privacidade', title: 'Política de Privacidade', route: '/politica-de-privacidade' },
  { slug: 'termos-de-uso', title: 'Termos de Uso', route: '/termos-de-uso' },
  { slug: 'garantia', title: 'Garantia', route: '/garantia' },
  { slug: 'trocas-devolucoes', title: 'Trocas e Devoluções', route: '/trocas-devolucoes' },
  { slug: 'metodos-envio', title: 'Métodos de Envio', route: '/metodos-envio' },
  { slug: 'seguranca-pagamentos', title: 'Segurança nos Pagamentos', route: '/seguranca-pagamentos' },
  { slug: 'como-comprar', title: 'Como Comprar', route: '/como-comprar' },
  { slug: 'trabalhe-conosco', title: 'Trabalhe Conosco', route: '/trabalhe-conosco' },
  { slug: 'central-ajuda', title: 'Central de Ajuda', route: '/central-ajuda' },
]

export default function AdminPagesPage() {
  const [pages, setPages] = useState<StaticPage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPage, setSelectedPage] = useState<StaticPage | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Buscar páginas da API CMS
  const fetchPages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.cms.getAll()
      const pagesData = response?.pages || response || []
      setPages(pagesData)
    } catch (error) {
      console.error('Error fetching pages:', error)
      // Se não houver API de CMS, usar páginas do sistema como fallback
      const fallbackPages: StaticPage[] = systemPages.map((p, idx) => ({
        id: `page-${idx}`,
        title: p.title,
        slug: p.slug,
        content: '',
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
      setPages(fallbackPages)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  const filteredPages = useMemo(() => {
    return pages.filter(page => 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [pages, searchTerm])

  const handleSelectPage = (page: StaticPage) => {
    setSelectedPage(JSON.parse(JSON.stringify(page)))
    setIsCreating(false)
  }

  const handleCreateNew = () => {
    setSelectedPage({
      id: '',
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    setIsCreating(true)
  }

  const handleSavePage = async () => {
    if (!selectedPage) return
    
    if (!selectedPage.title || !selectedPage.slug) {
      toast.error('Título e slug são obrigatórios')
      return
    }
    
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      
      if (isCreating) {
        await api.cms.create({
          title: selectedPage.title,
          slug: selectedPage.slug,
          content: selectedPage.content,
          metaTitle: selectedPage.metaTitle,
          metaDescription: selectedPage.metaDescription,
          isPublished: selectedPage.isPublished
        }, token || undefined)
        toast.success('Página criada com sucesso!')
      } else {
        await api.cms.update(selectedPage.id, {
          title: selectedPage.title,
          slug: selectedPage.slug,
          content: selectedPage.content,
          metaTitle: selectedPage.metaTitle,
          metaDescription: selectedPage.metaDescription,
          isPublished: selectedPage.isPublished
        }, token || undefined)
        toast.success('Página atualizada com sucesso!')
      }
      
      fetchPages()
      setSelectedPage(null)
      setIsCreating(false)
    } catch (error: any) {
      console.error('Error saving page:', error)
      toast.error(error.message || 'Erro ao salvar página')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta página?')) return
    
    try {
      const token = localStorage.getItem('token')
      await api.cms.delete(pageId, token || undefined)
      toast.success('Página excluída com sucesso!')
      fetchPages()
      if (selectedPage?.id === pageId) {
        setSelectedPage(null)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir página')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
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
                  <FileText className="w-7 h-7 text-[#001941]" />
                  Gerenciar Páginas
                </h1>
                <p className="text-gray-500 mt-1">
                  Crie e edite páginas estáticas do site
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={fetchPages}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button 
                  className="bg-[#001941] hover:bg-[#002a6b] text-white"
                  onClick={handleCreateNew}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Página
                </Button>
              </div>
            </div>
          </motion.header>

          {/* Search */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar página..."
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
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-gray-900">{pages.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Publicadas</p>
                  <p className="text-xl font-bold text-gray-900">{pages.filter(p => p.isPublished).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Eye className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rascunhos</p>
                  <p className="text-xl font-bold text-gray-900">{pages.filter(p => !p.isPublished).length}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pages Table */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-100 bg-gray-50">
                      <tr>
                        <th className="p-4 font-medium text-gray-600 w-10"></th>
                        <th className="p-4 font-medium text-gray-600">Título</th>
                        <th className="p-4 font-medium text-gray-600">Slug</th>
                        <th className="p-4 font-medium text-gray-600">Atualizado</th>
                        <th className="p-4 font-medium text-gray-600">Status</th>
                        <th className="p-4 font-medium text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPages.map(page => (
                        <motion.tr 
                          key={page.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleSelectPage(page)}
                          variants={itemVariants}
                          layout
                        >
                          <td className="p-4 text-center text-gray-400">
                            <GripVertical className="w-4 h-4" />
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-gray-900">{page.title}</p>
                            {page.metaTitle && (
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{page.metaTitle}</p>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 font-mono text-sm">/{page.slug}</span>
                              <a 
                                href={`/${page.slug}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-500 hover:text-blue-600"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {formatDate(page.updatedAt)}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={page.isPublished ? 'default' : 'outline'} className={page.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {page.isPublished ? 'Publicada' : 'Rascunho'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full hover:bg-gray-100" 
                                onClick={(e) => {e.stopPropagation(); handleSelectPage(page)}}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600" 
                                onClick={(e) => {e.stopPropagation(); handleDeletePage(page.id)}}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredPages.length === 0 && (
                  <div className="p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma página encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Editor Panel */}
      <AnimatePresence>
        {selectedPage && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 480, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full bg-white border-l border-gray-200 shadow-xl flex flex-col"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {isCreating ? 'Nova Página' : 'Editar Página'}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => {setSelectedPage(null); setIsCreating(false)}} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 p-5 space-y-5 overflow-y-auto">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Título *</label>
                <Input 
                  value={selectedPage.title} 
                  onChange={e => setSelectedPage(p => p && {...p, title: e.target.value})}
                  placeholder="Título da página"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Slug *</label>
                <Input 
                  value={selectedPage.slug} 
                  onChange={e => setSelectedPage(p => p && {...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="font-mono"
                  placeholder="slug-da-pagina"
                />
                <p className="text-xs text-gray-500">URL: /{selectedPage.slug}</p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Conteúdo</label>
                <textarea 
                  value={selectedPage.content || ''} 
                  onChange={e => setSelectedPage(p => p && {...p, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none font-mono"
                  rows={10}
                  placeholder="Conteúdo HTML da página..."
                />
              </div>

              {/* SEO Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <p className="text-sm font-medium text-gray-700">SEO</p>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Meta Título</label>
                  <Input 
                    value={selectedPage.metaTitle || ''} 
                    onChange={e => setSelectedPage(p => p && {...p, metaTitle: e.target.value})}
                    placeholder="Título para SEO"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Meta Descrição</label>
                  <textarea 
                    value={selectedPage.metaDescription || ''} 
                    onChange={e => setSelectedPage(p => p && {...p, metaDescription: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                    rows={3}
                    placeholder="Descrição para SEO..."
                  />
                </div>
              </div>

              {/* Published */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Publicar</p>
                  <p className="text-xs text-gray-500">Tornar página visível no site</p>
                </div>
                <Switch 
                  checked={selectedPage.isPublished} 
                  onCheckedChange={c => setSelectedPage(p => p && {...p, isPublished: c})} 
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-100">
              <Button 
                className="w-full bg-[#001941] hover:bg-[#002a6b] text-white" 
                onClick={handleSavePage}
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> {isCreating ? 'Criar Página' : 'Salvar Alterações'}</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

