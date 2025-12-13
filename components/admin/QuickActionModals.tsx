'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Package, 
  ShoppingCart, 
  User, 
  FileText,
  Plus,
  Upload,
  Save,
  Camera,
  Loader2,
  Search,
  Tag,
  Layers
} from 'lucide-react'
import { toast } from 'sonner'
import { api, Product, Category, Brand } from '@/services/api'
import { useAdminAuth } from '@/hooks/useAdminAuth'

// Cloudinary Config
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default'

interface QuickActionModalsProps {
  activeModal: string | null
  onClose: () => void
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

// Upload para Cloudinary
const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', 'uss-brasil/products')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) throw new Error('Erro ao fazer upload')
  const data = await response.json()
  return data.secure_url
}

export default function QuickActionModals({ activeModal, onClose }: QuickActionModalsProps) {
  const { token } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  
  // Product form
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    costPrice: '',
    stock: '',
    categoryId: '',
    brandId: '',
    description: '',
    sku: '',
    images: [] as string[]
  })
  
  // Customer form  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: {
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    }
  })

  // Report form
  const [reportForm, setReportForm] = useState({
    type: 'sales',
    period: 'month',
    format: 'pdf'
  })

  // Load categories and brands on mount
  useEffect(() => {
    if (activeModal === 'new-product') {
      loadCategoriesAndBrands()
    }
  }, [activeModal])

  const loadCategoriesAndBrands = async () => {
    try {
      const [cats, brs] = await Promise.all([
        api.categories.getAll(),
        api.brands.getAll()
      ])
      setCategories(cats || [])
      setBrands(brs || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, url]
      }))
      toast.success('Imagem enviada!')
    } catch (error) {
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Submit handlers
  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error('Nome e preço são obrigatórios')
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        originalPrice: productForm.costPrice ? parseFloat(productForm.costPrice) : undefined,
        stock: parseInt(productForm.stock) || 0,
        categoryId: productForm.categoryId || undefined,
        brandId: productForm.brandId || undefined,
        description: productForm.description,
        sku: productForm.sku || generateSlug(productForm.name).toUpperCase(),
        images: productForm.images.join(','),
        isActive: true
      }

      await api.products.create(payload, token || undefined)
      toast.success('Produto criado com sucesso!')
      resetProductForm()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar produto')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!customerForm.name || !customerForm.email) {
      toast.error('Nome e email são obrigatórios')
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: customerForm.name,
        email: customerForm.email,
        phone: customerForm.phone,
        cpf: customerForm.cpf,
        address: JSON.stringify(customerForm.address),
        role: 'USER'
      }

      await api.users.create(payload, token || undefined)
      toast.success('Cliente criado com sucesso!')
      resetCustomerForm()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`Relatório de ${
        reportForm.type === 'sales' ? 'Vendas' :
        reportForm.type === 'inventory' ? 'Estoque' :
        reportForm.type === 'customers' ? 'Clientes' : 'Financeiro'
      } gerado!`)
      
      onClose()
    } catch (error) {
      toast.error('Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

  const resetProductForm = () => {
    setProductForm({
      name: '', price: '', costPrice: '', stock: '',
      categoryId: '', brandId: '', description: '', sku: '', images: []
    })
  }

  const resetCustomerForm = () => {
    setCustomerForm({
      name: '', email: '', phone: '', cpf: '',
      address: { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' }
    })
  }

  const ModalWrapper = ({ children, title, icon: Icon }: { children: React.ReactNode, title: string, icon: any }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white border border-gray-200 rounded-xl 
                 w-[75vw] max-w-[900px] max-h-[85vh] overflow-hidden shadow-xl flex flex-col"
      >
        <div className="px-6 py-4 border-b bg-[#001941]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 
                       transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </motion.div>
    </div>
  )

  const InputField = ({ 
    label, 
    type = 'text', 
    value, 
    onChange, 
    placeholder,
    rows,
    required
  }: { 
    label: string
    type?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
    required?: boolean
  }) => (
    <div className="space-y-2">
      <label className="block text-gray-700 text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                   text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#001941] 
                   focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                   text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#001941] 
                   focus:ring-2 focus:ring-blue-400/20 transition-all"
        />
      )}
    </div>
  )

  const SelectField = ({ 
    label, 
    value, 
    onChange, 
    options,
    required
  }: { 
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string, label: string }[]
    required?: boolean
  }) => (
    <div className="space-y-2">
      <label className="block text-gray-700 text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl 
                 text-gray-900 focus:outline-none focus:border-[#001941] focus:ring-2 
                 focus:ring-blue-400/20 transition-all"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <AnimatePresence>
      {activeModal === 'new-product' && (
        <ModalWrapper title="Novo Produto" icon={Package}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Nome do Produto"
                value={productForm.name}
                onChange={(value) => setProductForm(p => ({ ...p, name: value }))}
                placeholder="iPhone 16 Pro Max"
                required
              />
              
              <InputField
                label="SKU"
                value={productForm.sku}
                onChange={(value) => setProductForm(p => ({ ...p, sku: value }))}
                placeholder="Auto-gerado se vazio"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Preço de Venda"
                type="number"
                value={productForm.price}
                onChange={(value) => setProductForm(p => ({ ...p, price: value }))}
                placeholder="9999.00"
                required
              />
              
              <InputField
                label="Preço de Custo"
                type="number"
                value={productForm.costPrice}
                onChange={(value) => setProductForm(p => ({ ...p, costPrice: value }))}
                placeholder="7500.00"
              />

              <InputField
                label="Estoque"
                type="number"
                value={productForm.stock}
                onChange={(value) => setProductForm(p => ({ ...p, stock: value }))}
                placeholder="50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Categoria"
                value={productForm.categoryId}
                onChange={(value) => setProductForm(p => ({ ...p, categoryId: value }))}
                options={[
                  { value: '', label: 'Selecione uma categoria' },
                  ...categories.map(c => ({ value: c.id, label: c.name }))
                ]}
              />

              <SelectField
                label="Marca"
                value={productForm.brandId}
                onChange={(value) => setProductForm(p => ({ ...p, brandId: value }))}
                options={[
                  { value: '', label: 'Selecione uma marca' },
                  ...brands.map(b => ({ value: b.id, label: b.name }))
                ]}
              />
            </div>

            <InputField
              label="Descrição"
              value={productForm.description}
              onChange={(value) => setProductForm(p => ({ ...p, description: value }))}
              placeholder="Descreva o produto..."
              rows={3}
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-medium">Imagens do Produto</label>
              
              {/* Image Preview Grid */}
              {productForm.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {productForm.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Produto ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full 
                                 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center
                            hover:border-[#001941] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="product-image-quick"
                  disabled={uploading}
                />
                <label htmlFor="product-image-quick" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 rounded-lg bg-[#001941]/10">
                      {uploading ? (
                        <Loader2 className="w-6 h-6 text-[#001941] animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-[#001941]" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">
                        {uploading ? 'Enviando...' : 'Clique para fazer upload'}
                      </p>
                      <p className="text-gray-500 text-sm">PNG, JPG até 10MB</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 
                         transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-[#001941] 
                         text-white rounded-xl hover:bg-blue-900 hover:shadow-lg 
                         transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Criar Produto</span>
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {activeModal === 'new-order' && (
        <ModalWrapper title="Novo Pedido Manual" icon={ShoppingCart}>
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                💡 Para criar pedidos manuais, recomendamos usar a página de pedidos 
                onde você pode selecionar produtos existentes e aplicar descontos.
              </p>
            </div>

            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Pedidos manuais devem ser criados na página de Pedidos
              </p>
              <button
                onClick={() => { onClose(); window.location.href = '/admin/orders' }}
                className="px-6 py-2.5 bg-[#001941] text-white rounded-xl hover:bg-blue-900"
              >
                Ir para Pedidos
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {activeModal === 'new-customer' && (
        <ModalWrapper title="Novo Cliente" icon={User}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Nome Completo"
                value={customerForm.name}
                onChange={(value) => setCustomerForm(p => ({ ...p, name: value }))}
                placeholder="João da Silva"
                required
              />

              <InputField
                label="Email"
                type="email"
                value={customerForm.email}
                onChange={(value) => setCustomerForm(p => ({ ...p, email: value }))}
                placeholder="cliente@email.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Telefone"
                type="tel"
                value={customerForm.phone}
                onChange={(value) => setCustomerForm(p => ({ ...p, phone: value }))}
                placeholder="(11) 99999-9999"
              />

              <InputField
                label="CPF"
                value={customerForm.cpf}
                onChange={(value) => setCustomerForm(p => ({ ...p, cpf: value }))}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Endereço</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <InputField
                    label="Rua"
                    value={customerForm.address.rua}
                    onChange={(value) => setCustomerForm(p => ({ 
                      ...p, address: { ...p.address, rua: value } 
                    }))}
                    placeholder="Rua das Flores"
                  />
                </div>
                <InputField
                  label="Número"
                  value={customerForm.address.numero}
                  onChange={(value) => setCustomerForm(p => ({ 
                    ...p, address: { ...p.address, numero: value } 
                  }))}
                  placeholder="123"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InputField
                  label="Complemento"
                  value={customerForm.address.complemento}
                  onChange={(value) => setCustomerForm(p => ({ 
                    ...p, address: { ...p.address, complemento: value } 
                  }))}
                  placeholder="Apto 101"
                />
                <InputField
                  label="Bairro"
                  value={customerForm.address.bairro}
                  onChange={(value) => setCustomerForm(p => ({ 
                    ...p, address: { ...p.address, bairro: value } 
                  }))}
                  placeholder="Centro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <InputField
                  label="Cidade"
                  value={customerForm.address.cidade}
                  onChange={(value) => setCustomerForm(p => ({ 
                    ...p, address: { ...p.address, cidade: value } 
                  }))}
                  placeholder="São Paulo"
                />
                <InputField
                  label="Estado"
                  value={customerForm.address.estado}
                  onChange={(value) => setCustomerForm(p => ({ 
                    ...p, address: { ...p.address, estado: value } 
                  }))}
                  placeholder="SP"
                />
                <InputField
                  label="CEP"
                  value={customerForm.address.cep}
                  onChange={(value) => setCustomerForm(p => ({ 
                    ...p, address: { ...p.address, cep: value } 
                  }))}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 
                         transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-[#001941] 
                         text-white rounded-xl hover:bg-blue-900 hover:shadow-lg 
                         transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                <span>Criar Cliente</span>
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {activeModal === 'new-report' && (
        <ModalWrapper title="Gerar Relatório" icon={FileText}>
          <div className="space-y-6">
            <SelectField
              label="Tipo de Relatório"
              value={reportForm.type}
              onChange={(value) => setReportForm(p => ({ ...p, type: value }))}
              options={[
                { value: 'sales', label: '📊 Vendas' },
                { value: 'inventory', label: '📦 Estoque' },
                { value: 'customers', label: '👥 Clientes' },
                { value: 'financial', label: '💰 Financeiro' }
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Período"
                value={reportForm.period}
                onChange={(value) => setReportForm(p => ({ ...p, period: value }))}
                options={[
                  { value: 'today', label: 'Hoje' },
                  { value: 'week', label: 'Última semana' },
                  { value: 'month', label: 'Último mês' },
                  { value: 'quarter', label: 'Último trimestre' },
                  { value: 'year', label: 'Último ano' }
                ]}
              />

              <SelectField
                label="Formato"
                value={reportForm.format}
                onChange={(value) => setReportForm(p => ({ ...p, format: value }))}
                options={[
                  { value: 'pdf', label: '📄 PDF' },
                  { value: 'excel', label: '📊 Excel' },
                  { value: 'csv', label: '📋 CSV' }
                ]}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-blue-800 font-medium mb-2">O que será incluído:</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                {reportForm.type === 'sales' && (
                  <>
                    <li>• Total de vendas no período</li>
                    <li>• Produtos mais vendidos</li>
                    <li>• Ticket médio</li>
                    <li>• Gráfico de vendas por dia</li>
                  </>
                )}
                {reportForm.type === 'inventory' && (
                  <>
                    <li>• Produtos em estoque</li>
                    <li>• Produtos com estoque baixo</li>
                    <li>• Valor total do estoque</li>
                    <li>• Produtos sem estoque</li>
                  </>
                )}
                {reportForm.type === 'customers' && (
                  <>
                    <li>• Total de clientes cadastrados</li>
                    <li>• Novos clientes no período</li>
                    <li>• Clientes mais ativos</li>
                    <li>• Distribuição por região</li>
                  </>
                )}
                {reportForm.type === 'financial' && (
                  <>
                    <li>• Receita total</li>
                    <li>• Custos operacionais</li>
                    <li>• Lucro bruto e líquido</li>
                    <li>• Taxas e impostos</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 
                         transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-[#001941] 
                         text-white rounded-xl hover:bg-blue-900 hover:shadow-lg 
                         transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>Gerar Relatório</span>
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </AnimatePresence>
  )
}

