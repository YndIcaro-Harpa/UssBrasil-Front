'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Package, Image as ImageIcon, Tag, Palette, HardDrive, Upload, Loader2, Plus, Building2, Check, Settings, Eye, Edit2, Trash2, Layers, Copy, Save, DollarSign, Barcode, Archive, AlertTriangle, TrendingUp, TrendingDown, Percent, Calculator, ShoppingBag } from 'lucide-react';
import { Product } from '@/hooks/use-admin-crud';
import { toast } from 'sonner';

// Interface para Fornecedor
interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Interface para Variação de Produto
interface ProductVariation {
  id: string;
  name: string;
  sku: string;
  ncm: string;
  color: { name: string; code: string; image: string };
  storage: string;
  size: string;
  price: number;
  originalPrice: number;
  stock: number;
  supplierId: string;
  supplierName: string;
  image: string;
  status: 'active' | 'inactive' | 'out_of_stock';
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> | Partial<Product>) => Promise<void>;
  mode: 'create' | 'edit' | 'view';
}

const categories = [
  'Smartphones',
  'Tablets',
  'Laptops',
  'Desktops',
  'Watches',
  'Audio',
  'Acessórios'
];

const brands = [
  'Apple',
  'Sony',
  'LG',
  'Dell',
  'HP',
  'Asus'
];

const statusOptions = [
  { value: 'active', label: 'Ativo', color: 'bg-blue-600' },
  { value: 'inactive', label: 'Inativo', color: 'bg-gray-400' },
  { value: 'out_of_stock', label: 'Sem Estoque', color: 'bg-red-500' },
];

export function ProductModal({ isOpen, onClose, product, onSave, mode }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    // Campos de Preço - 3 campos principais
    costPrice: 0,           // Custo do Produto (valor pago ao fornecedor)
    price: 0,               // Valor de Venda (preço base)
    displayPrice: 0,        // Valor em Exposição (preço exibido na loja)
    originalPrice: 0,       // Preço Original (para compatibilidade)
    isOnSale: false,        // Produto em oferta
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    ncm: '',
    stock: 0,
    images: {
      main: '',
      gallery: ['']
    },
    status: 'active' as Product['status'],
    isNew: false,
    isFeatured: false,
    colors: [{ name: '', code: '', image: '' }],
    storage: [''],
    specifications: {} as Record<string, string>,
    supplierId: ''
  });

  // Estado para fornecedores
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: ''
  });
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [showSuppliersListModal, setShowSuppliersListModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  // Estado para modal de variações
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [productVariations, setProductVariations] = useState<ProductVariation[]>([]);
  const [currentVariation, setCurrentVariation] = useState<ProductVariation>({
    id: '',
    name: '',
    sku: '',
    ncm: '',
    color: { name: '', code: '#000000', image: '' },
    storage: '',
    size: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    supplierId: '',
    supplierName: '',
    image: '',
    status: 'active'
  });
  const [editingVariationIndex, setEditingVariationIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cloudinary Upload Function
  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(`${API_URL}/upload/product-image`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erro no upload');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const url = await uploadToCloudinary(file);
    setUploading(false);
    
    if (url) {
      setFormData(prev => ({
        ...prev,
        images: { ...prev.images, main: url }
      }));
      toast.success('Imagem principal carregada!');
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingIndex(index);
    const url = await uploadToCloudinary(file);
    setUploadingIndex(null);
    
    if (url) {
      const newGallery = [...formData.images.gallery];
      newGallery[index] = url;
      setFormData(prev => ({
        ...prev,
        images: { ...prev.images, gallery: newGallery }
      }));
      toast.success(`Imagem ${index + 1} carregada!`);
    }
  };

  // ============================================
  // SISTEMA DE PRECIFICAÇÃO COMPLETO
  // ============================================
  
  // Estados de cálculos de preço
  const [priceCalculations, setPriceCalculations] = useState({
    // Cálculos automáticos
    idealPrice: 0,              // Valor de Venda + 15%
    idealPriceWithTax: 0,       // Preço Ideal - 12%
    displayPriceWithTax: 0,     // Valor em Exposição - 12%
    // Margens
    currentMargin: 0,           // Margem atual (%)
    profitValue: 0,             // Lucro em R$
    // Alertas
    isLowMargin: false,         // Margem < 15%
    isCriticalMargin: false,    // Margem < 12% (prejuízo)
    showIdealButton: false,     // Mostrar botão "Aplicar Valor Ideal"
  });

  // Estado para confirmação de preço abaixo da margem
  const [showLowMarginConfirm, setShowLowMarginConfirm] = useState(false);

  // Carregar fornecedores
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await fetch(`${API_URL}/suppliers`);
        if (response.ok) {
          const data = await response.json();
          setSuppliers(data.data || data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
      }
    };
    loadSuppliers();
  }, []);

  // Salvar novo fornecedor
  const handleSaveSupplier = async () => {
    if (!newSupplier.name.trim()) {
      toast.error('Nome do fornecedor é obrigatório');
      return;
    }

    setSavingSupplier(true);
    try {
      const response = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier)
      });

      if (response.ok) {
        const created = await response.json();
        setSuppliers(prev => [...prev, created]);
        setFormData(prev => ({ ...prev, supplierId: created.id }));
        setShowSupplierModal(false);
        setNewSupplier({ name: '', cnpj: '', email: '', phone: '', address: '' });
        toast.success('Fornecedor cadastrado com sucesso!');
      } else {
        throw new Error('Erro ao criar fornecedor');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao cadastrar fornecedor');
    } finally {
      setSavingSupplier(false);
    }
  };

  // Copiar dados do produto pai para variação
  const copyFromParentProduct = () => {
    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
    setCurrentVariation({
      ...currentVariation,
      name: formData.name,
      sku: formData.sku ? `${formData.sku}-VAR-${productVariations.length + 1}` : '',
      ncm: formData.ncm || '',
      price: formData.displayPrice || formData.price,
      originalPrice: formData.costPrice,
      stock: formData.stock,
      supplierId: formData.supplierId,
      supplierName: selectedSupplier?.name || '',
      image: formData.images.main,
      status: formData.status,
      color: formData.colors[0] || { name: '', code: '#000000', image: '' },
      storage: formData.storage[0] || ''
    });
    toast.success('Dados do produto copiados para a variação!');
  };

  // Salvar variação
  const saveVariation = () => {
    if (!currentVariation.name.trim()) {
      toast.error('Nome da variação é obrigatório');
      return;
    }
    if (!currentVariation.sku.trim()) {
      toast.error('SKU da variação é obrigatório');
      return;
    }

    if (editingVariationIndex !== null) {
      // Editando variação existente
      const updated = [...productVariations];
      updated[editingVariationIndex] = { ...currentVariation, id: productVariations[editingVariationIndex].id };
      setProductVariations(updated);
      toast.success('Variação atualizada!');
    } else {
      // Nova variação
      const newVariation: ProductVariation = {
        ...currentVariation,
        id: `var-${Date.now()}`
      };
      setProductVariations([...productVariations, newVariation]);
      toast.success('Variação adicionada!');
    }

    // Reset form
    resetVariationForm();
  };

  // Reset variation form
  const resetVariationForm = () => {
    setCurrentVariation({
      id: '',
      name: '',
      sku: '',
      ncm: '',
      color: { name: '', code: '#000000', image: '' },
      storage: '',
      size: '',
      price: 0,
      originalPrice: 0,
      stock: 0,
      supplierId: '',
      supplierName: '',
      image: '',
      status: 'active'
    });
    setEditingVariationIndex(null);
  };

  // Editar variação
  const editVariation = (index: number) => {
    setCurrentVariation(productVariations[index]);
    setEditingVariationIndex(index);
  };

  // Excluir variação
  const deleteVariation = (index: number) => {
    if (confirm('Tem certeza que deseja excluir esta variação?')) {
      const updated = productVariations.filter((_, i) => i !== index);
      setProductVariations(updated);
      toast.success('Variação excluída!');
    }
  };

  // ============================================
  // CÁLCULOS AUTOMÁTICOS DE PREÇO
  // ============================================
  useEffect(() => {
    const costPrice = Number(formData.costPrice) || 0;
    const salePrice = Number(formData.price) || 0;
    const displayPrice = Number(formData.displayPrice) || 0;
    
    // 1. Preço Ideal = Valor de Venda + 15%
    const idealPrice = salePrice * 1.15;
    
    // 2. Valor Total a Receber com Preço Ideal (aplica 12% de desconto)
    const idealPriceWithTax = idealPrice * 0.88;
    
    // 3. Valor Original com Desconto de 12%
    const displayPriceWithTax = displayPrice * 0.88;
    
    // Calcular margem atual
    let currentMargin = 0;
    let profitValue = 0;
    
    if (costPrice > 0 && displayPrice > 0) {
      profitValue = displayPrice - costPrice;
      currentMargin = ((displayPrice - costPrice) / costPrice) * 100;
    }
    
    // Verificar alertas de margem (só se houver custo preenchido)
    // Níveis: >= 15% = OK (verde), 12-15% = Atenção (amarelo), < 12% = Crítico (vermelho)
    const hasValidPrices = costPrice > 0 && displayPrice > 0;
    const isGoodMargin = hasValidPrices && currentMargin >= 15;
    const isLowMargin = hasValidPrices && currentMargin >= 12 && currentMargin < 15;
    const isCriticalMargin = hasValidPrices && currentMargin < 12;
    const showIdealButton = hasValidPrices && displayPrice < idealPrice;
    
    setPriceCalculations({
      idealPrice,
      idealPriceWithTax,
      displayPriceWithTax,
      currentMargin,
      profitValue,
      isLowMargin,
      isCriticalMargin,
      showIdealButton
    });
    
    // Mostrar confirmação se margem crítica
    if (isCriticalMargin && displayPrice > 0 && costPrice > 0) {
      setShowLowMarginConfirm(true);
    } else {
      setShowLowMarginConfirm(false);
    }
  }, [formData.costPrice, formData.price, formData.displayPrice]);

  // Aplicar Valor Ideal
  const applyIdealPrice = () => {
    setFormData(prev => ({ 
      ...prev, 
      displayPrice: Math.round(priceCalculations.idealPrice * 100) / 100 
    }));
    toast.success('Preço ideal aplicado!');
  };

  // Confirmar produto em oferta
  const confirmProductOnSale = () => {
    setFormData(prev => ({ ...prev, isOnSale: true }));
    setShowLowMarginConfirm(false);
    toast.success('Produto marcado como "Em Oferta"');
  };

  // Manter preço abaixo da margem
  const keepLowPrice = () => {
    setShowLowMarginConfirm(false);
    toast.info('Preço mantido abaixo da margem ideal');
  };

  useEffect(() => {
    if (product && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: product.name,
        description: product.description,
        costPrice: (product as any).costPrice || product.originalPrice || 0,
        price: product.price,
        displayPrice: (product as any).displayPrice || product.price || 0,
        originalPrice: product.originalPrice || 0,
        isOnSale: (product as any).isOnSale || false,
        category: product.category,
        subcategory: product.subcategory || '',
        brand: product.brand,
        sku: product.sku,
        ncm: (product as any).ncm || '',
        stock: product.stock,
        images: product.images,
        status: product.status,
        isNew: product.isNew,
        isFeatured: product.isFeatured,
        colors: (product.colors || []).map(c => ({ name: c.name || '', code: c.code || '', image: (c as any).image || '' })),
        storage: product.storage || [''],
        specifications: product.specifications,
        supplierId: (product as any).supplierId || ''
      });
      
      // Carregar variações existentes do produto
      if (product.id) {
        loadProductVariations(product.id);
      }
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        costPrice: 0,
        price: 0,
        displayPrice: 0,
        originalPrice: 0,
        isOnSale: false,
        category: '',
        subcategory: '',
        brand: '',
        sku: '',
        ncm: '',
        stock: 0,
        images: {
          main: '',
          gallery: ['']
        },
        status: 'active',
        isNew: false,
        isFeatured: false,
        colors: [{ name: '', code: '', image: '' }],
        storage: [''],
        specifications: {},
        supplierId: ''
      });
      // Limpar variações ao criar novo produto
      setProductVariations([]);
    }
  }, [product, mode]);

  // Carregar variações do produto
  const loadProductVariations = async (productId: string) => {
    try {
      const response = await fetch(`${API_URL}/variations/product/${productId}`);
      if (response.ok) {
        const variations = await response.json();
        const mappedVariations: ProductVariation[] = variations.map((v: any) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          ncm: v.ncm || '',
          color: {
            name: v.colorName || '',
            code: v.colorCode || '#000000',
            image: v.colorImage || ''
          },
          storage: v.storage || '',
          size: v.size || '',
          price: v.price,
          originalPrice: v.costPrice || 0,
          stock: v.stock,
          supplierId: v.supplierId || '',
          supplierName: v.supplierName || '',
          image: v.image || '',
          status: (v.status || 'ACTIVE').toLowerCase() as 'active' | 'inactive' | 'out_of_stock'
        }));
        setProductVariations(mappedVariations);
      }
    } catch (error) {
      console.error('Erro ao carregar variações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Limpar arrays vazios
      const cleanedData = {
        ...formData,
        colors: formData.colors.filter(color => color.name && color.code),
        storage: formData.storage.filter(storage => storage.trim()),
        images: {
          ...formData.images,
          gallery: formData.images.gallery.filter(img => img.trim())
        }
      };
      
      // Salvar produto
      const savedProduct = await onSave(cleanedData);
      
      // Se tem variações, salvar no backend
      if (productVariations.length > 0 && savedProduct && (savedProduct as any).id) {
        const productId = (savedProduct as any).id;
        
        // Salvar variações em bulk
        try {
          await fetch(`${API_URL}/variations/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId,
              variations: productVariations.map(v => ({
                productId,
                name: v.name,
                sku: v.sku,
                ncm: v.ncm,
                colorName: v.color.name,
                colorCode: v.color.code,
                colorImage: v.color.image,
                storage: v.storage,
                size: v.size,
                costPrice: v.originalPrice,
                price: v.price,
                stock: v.stock,
                status: v.status.toUpperCase(),
                image: v.image,
                supplierId: v.supplierId || null,
                supplierName: v.supplierName || null,
              }))
            })
          });
          toast.success(`${productVariations.length} variação(ões) salvas!`);
        } catch (varError) {
          console.error('Erro ao salvar variações:', varError);
          toast.error('Produto salvo, mas erro ao salvar variações');
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', code: '', image: '' }]
    }));
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const addStorage = () => {
    setFormData(prev => ({
      ...prev,
      storage: [...prev.storage, '']
    }));
  };

  const removeStorage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      storage: prev.storage.filter((_, i) => i !== index)
    }));
  };

  const addGalleryImage = () => {
    setFormData(prev => ({
      ...prev,
      images: {
        ...prev.images,
        gallery: [...prev.images.gallery, '']
      }
    }));
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: {
        ...prev.images,
        gallery: prev.images.gallery.filter((_, i) => i !== index)
      }
    }));
  };

  const addSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey]: newSpecValue
        }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: Object.fromEntries(
        Object.entries(prev.specifications).filter(([k]) => k !== key)
      )
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] !max-w-[95vw] sm:!max-w-[95vw] h-[95vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-[#001941] text-white">
          <DialogTitle className="flex items-center gap-2 text-white text-xl">
            <Package className="h-5 w-5 text-blue-400" />
            {mode === 'create' && 'Criar Novo Produto'}
            {mode === 'edit' && 'Editar Produto'}
            {mode === 'view' && 'Detalhes do Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 overflow-hidden">
          {/* Left Side - Form Fields */}
          <div className="flex-[3] overflow-y-auto p-6 border-r bg-white">
            
            {/* Row 1: Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 mb-4">
              <div className="lg:col-span-2 space-y-1">
                <Label htmlFor="name" className="text-black text-sm">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={mode === 'view'}
                  required
                  className="text-black h-9"
                  placeholder="Nome do produto"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sku" className="text-black text-sm">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  disabled={mode === 'view'}
                  required
                  className="text-black h-9"
                  placeholder="SKU-001"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ncm" className="text-black text-sm">NCM</Label>
                <Input
                  id="ncm"
                  value={formData.ncm}
                  onChange={(e) => setFormData(prev => ({ ...prev, ncm: e.target.value }))}
                  disabled={mode === 'view'}
                  className="text-black h-9"
                  placeholder="8517.12.31"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="brand" className="text-black text-sm">Marca</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                  disabled={mode === 'view'}
                >
                  <SelectTrigger className="h-9 text-black">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-black text-sm">Subcategoria</Label>
                <Input
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  disabled={mode === 'view'}
                  className="text-black h-9"
                  placeholder="Ex: Pro Max"
                />
              </div>
            </div>

            {/* Row 1.5: Fornecedor */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
              <div className="lg:col-span-2 space-y-1">
                <Label className="text-black text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  Fornecedor
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger className="h-9 text-black flex-1">
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name} {supplier.cnpj && `(${supplier.cnpj})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mode !== 'view' && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSupplierModal(true)}
                        className="h-9 px-3 bg-white hover:bg-gray-50"
                        title="Adicionar novo fornecedor"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSuppliersListModal(true)}
                        className="h-9 px-3 bg-white hover:bg-gray-50"
                        title="Gerenciar fornecedores"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Botão de Variações */}
              <div className="lg:col-span-2 space-y-1">
                <Label className="text-black text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-gray-600" />
                  Variações do Produto
                  {productVariations.length > 0 && (
                    <Badge className="bg-indigo-100 text-indigo-700 text-xs ml-1">
                      {productVariations.length} cadastrada(s)
                    </Badge>
                  )}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowVariationsModal(true)}
                  className="h-9 w-full justify-start text-black bg-white hover:bg-gray-50"
                >
                  <Palette className="h-4 w-4 mr-2 text-gray-600" />
                  {productVariations.length > 0 
                    ? `${productVariations.length} variação(ões) - Clique para gerenciar`
                    : 'Clique para adicionar variações'
                  }
                  <Settings className="h-4 w-4 ml-auto text-gray-400" />
                </Button>
              </div>
            </div>

            {/* Row 2: Category, Status, Price, Stock */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <div className="space-y-1">
                <Label className="text-black text-sm">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  disabled={mode === 'view'}
                >
                  <SelectTrigger className="h-9 text-black">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-black text-sm">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Product['status'] }))}
                  disabled={mode === 'view'}
                >
                  <SelectTrigger className="h-9 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-black text-sm">Estoque</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  disabled={mode === 'view'}
                  required
                  className="text-black h-9"
                />
              </div>
            </div>

            {/* ============================================ */}
            {/* SEÇÃO DE PRECIFICAÇÃO SIMPLIFICADA */}
            {/* ============================================ */}
            <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Precificação</h3>
                </div>
                {formData.costPrice > 0 && formData.displayPrice > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    priceCalculations.isCriticalMargin ? 'bg-red-500 text-white' :
                    priceCalculations.isLowMargin ? 'bg-yellow-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    {priceCalculations.isCriticalMargin ? '⚠️ < 12%' :
                     priceCalculations.isLowMargin ? '⚡ 12-15%' :
                     `✅ ${priceCalculations.currentMargin.toFixed(0)}%`}
                  </span>
                )}
              </div>

              {/* Campos de Preço em Linha */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {/* Custo */}
                <div>
                  <Label className="text-[10px] font-medium text-gray-600 mb-1 block">
                    Custo (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.costPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                    disabled={mode === 'view'}
                    className="text-black h-8 text-sm bg-white"
                    placeholder="0,00"
                  />
                </div>

                {/* Preço Base */}
                <div>
                  <Label className="text-[10px] font-medium text-gray-600 mb-1 block">
                    Preço Base (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    disabled={mode === 'view'}
                    className="text-black h-8 text-sm bg-white"
                    placeholder="0,00"
                  />
                </div>

                {/* Preço Exposição com Indicador */}
                <div className="relative">
                  <Label className="text-[10px] font-medium text-gray-600 mb-1 block">
                    Exposição (R$)
                  </Label>
                  {/* Indicação do Valor Ideal - Em cima do campo */}
                  {priceCalculations.showIdealButton && formData.costPrice > 0 && (
                    <div className="absolute -top-1 right-0 flex items-center gap-1">
                      <span className="text-[9px] text-indigo-600 font-medium">
                        Ideal: R$ {priceCalculations.idealPrice.toFixed(2)}
                      </span>
                      {mode !== 'view' && (
                        <button
                          type="button"
                          onClick={applyIdealPrice}
                          className="text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded hover:bg-indigo-600"
                        >
                          Aplicar
                        </button>
                      )}
                    </div>
                  )}
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.displayPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayPrice: parseFloat(e.target.value) || 0 }))}
                    disabled={mode === 'view'}
                    className={`text-black h-8 text-sm bg-white ${
                      priceCalculations.isCriticalMargin ? 'border-red-500 ring-1 ring-red-200' :
                      priceCalculations.isLowMargin ? 'border-yellow-500 ring-1 ring-yellow-200' : ''
                    }`}
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Resumo em Linha */}
              {formData.costPrice > 0 && (
                <div className="flex items-center gap-4 p-2 bg-white rounded-lg border text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Lucro:</span>
                    <span className={`font-bold ${priceCalculations.profitValue < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      R$ {priceCalculations.profitValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Margem:</span>
                    <span className={`font-bold ${
                      priceCalculations.isCriticalMargin ? 'text-red-600' :
                      priceCalculations.isLowMargin ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {priceCalculations.currentMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Recebe (-12%):</span>
                    <span className="font-bold text-purple-600">
                      R$ {priceCalculations.displayPriceWithTax.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Alerta de Margem Crítica */}
              {priceCalculations.isCriticalMargin && (
                <div className="mt-2 p-2 rounded-lg bg-red-500 text-white text-[10px] flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Margem crítica! Aplique o preço ideal ou confirme como oferta.</span>
                  {mode !== 'view' && (
                    <button
                      type="button"
                      onClick={confirmProductOnSale}
                      className="ml-auto bg-white text-red-600 px-2 py-0.5 rounded text-[9px] font-medium hover:bg-red-50"
                    >
                      Marcar Oferta
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Row 3: Description */}
            <div className="mb-4 space-y-1">
              <Label className="text-black text-sm">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={mode === 'view'}
                rows={2}
                required
                className="text-black resize-none"
                placeholder="Descrição do produto..."
              />
            </div>

            {/* Row 4: Images + Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Images with Cloudinary Upload */}
              <div className="space-y-3">
                <Label className="text-black text-sm flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-gray-600" />
                  Imagens
                </Label>
                
                {/* Main Image */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Imagem Principal</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.images.main}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        images: { ...prev.images, main: e.target.value }
                      }))}
                      disabled={mode === 'view'}
                      placeholder="URL da imagem principal"
                      className="text-black h-9 flex-1"
                    />
                    <input
                      type="file"
                      ref={mainImageInputRef}
                      onChange={handleMainImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => mainImageInputRef.current?.click()}
                      disabled={mode === 'view' || uploading}
                      className="h-9 px-3 bg-white hover:bg-gray-50"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formData.images.main && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border">
                      <img src={formData.images.main} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Gallery Images */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Galeria</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.images.gallery.slice(0, 3).map((image, index) => (
                      <div key={index} className="flex gap-1 items-center">
                        <div className="relative flex-1">
                          <Input
                            value={image}
                            onChange={(e) => {
                              const newGallery = [...formData.images.gallery];
                              newGallery[index] = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                images: { ...prev.images, gallery: newGallery }
                              }));
                            }}
                            disabled={mode === 'view'}
                            placeholder={`Imagem ${index + 1}`}
                            className="text-black h-9 w-32 text-xs"
                          />
                        </div>
                        <input
                          type="file"
                          ref={el => { galleryInputRefs.current[index] = el; }}
                          onChange={(e) => handleGalleryImageUpload(e, index)}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => galleryInputRefs.current[index]?.click()}
                          disabled={mode === 'view' || uploadingIndex === index}
                          className="h-9 w-9 p-0 bg-white hover:bg-gray-50"
                        >
                          {uploadingIndex === index ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Upload className="h-3 w-3" />
                          )}
                        </Button>
                        {image && (
                          <div className="w-9 h-9 rounded overflow-hidden border">
                            <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Options: New, Featured, Colors, Storage */}
              <div className="space-y-3">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isNew"
                      checked={formData.isNew}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNew: checked }))}
                      disabled={mode === 'view'}
                    />
                    <Label htmlFor="isNew" className="text-black text-sm">Novo</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                      disabled={mode === 'view'}
                    />
                    <Label htmlFor="isFeatured" className="text-black text-sm">Destaque</Label>
                  </div>
                </div>
                
                {/* Preview das variações */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-black text-sm">Cores:</Label>
                  {formData.colors.filter(c => c.name).map((color, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.code || '#ccc' }}
                      />
                      <span className="text-xs text-black">{color.name}</span>
                    </div>
                  ))}
                  {formData.colors.filter(c => c.name).length === 0 && (
                    <span className="text-xs text-gray-400">Nenhuma cor definida</span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-black text-sm">Armazenamento:</Label>
                  {formData.storage.filter(s => s).map((storage, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {storage}
                    </Badge>
                  ))}
                  {formData.storage.filter(s => s).length === 0 && (
                    <span className="text-xs text-gray-400">Nenhum armazenamento definido</span>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVariationsModal(true)}
                  className="h-8 text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Editar Variações
                </Button>
              </div>
            </div>

            {/* Row 5: Specifications */}
            <div className="space-y-2">
              <Label className="text-black text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-600" />
                Especificações
              </Label>
              {mode !== 'view' && (
                <div className="flex gap-2">
                  <Input
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="Chave (ex: Processador)"
                    className="flex-1 h-8 text-sm text-black"
                  />
                  <Input
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="Valor (ex: A15 Bionic)"
                    className="flex-1 h-8 text-sm text-black"
                  />
                  <Button type="button" onClick={addSpecification} size="sm" className="h-8 px-3 bg-[#001941] hover:bg-blue-900">
                    Adicionar
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-sm">
                    <span className="text-gray-700 font-medium">{key}:</span>
                    <span className="text-black">{value}</span>
                    {mode !== 'view' && (
                      <button type="button" onClick={() => removeSpecification(key)} className="text-red-500 hover:text-red-700 ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Preview & Actions */}
          <div className="w-[280px] flex flex-col bg-gray-50 h-full shrink-0">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-semibold text-black text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-700" />
                Preview
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Image Preview */}
              <div className="aspect-square rounded-lg border border-gray-200 flex items-center justify-center bg-white overflow-hidden relative">
                {formData.images.main ? (
                  <img 
                    src={formData.images.main} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">Sem imagem</span>
                  </div>
                )}
                {formData.isNew && (
                  <Badge className="absolute top-1 left-1 bg-blue-500 hover:bg-blue-600 text-xs px-1.5 py-0.5">Novo</Badge>
                )}
                {formData.isFeatured && (
                  <Badge className="absolute top-1 right-1 bg-[#001941] hover:bg-blue-900 text-xs px-1.5 py-0.5">Destaque</Badge>
                )}
              </div>

              {/* Price Summary - Preview */}
              <div className="space-y-2">
                {/* Preço Ideal Sugerido */}
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <p className="text-blue-700 text-[10px] uppercase font-medium">Preço Ideal</p>
                    {priceCalculations.showIdealButton && mode !== 'view' && (
                      <button
                        type="button"
                        onClick={applyIdealPrice}
                        className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Check className="h-3 w-3" />
                        Aplicar
                      </button>
                    )}
                  </div>
                  <p className="text-base font-bold text-blue-600">{formatCurrency(priceCalculations.idealPrice)}</p>
                  <p className="text-[8px] text-blue-500">+15% margem sobre custo</p>
                </div>
                {/* Valor em Exposição */}
                <div className={`p-2 rounded-lg ${priceCalculations.isCriticalMargin ? 'bg-red-100 border border-red-300' : priceCalculations.isLowMargin ? 'bg-yellow-100 border border-yellow-300' : 'bg-[#001941]'}`}>
                  <p className={`text-[10px] uppercase ${priceCalculations.isCriticalMargin ? 'text-red-700' : priceCalculations.isLowMargin ? 'text-yellow-700' : 'text-blue-200'}`}>Exposição</p>
                  <p className={`text-lg font-bold ${priceCalculations.isCriticalMargin ? 'text-red-700' : priceCalculations.isLowMargin ? 'text-yellow-700' : 'text-white'}`}>{formatCurrency(formData.displayPrice)}</p>
                  <p className={`text-[8px] ${priceCalculations.isCriticalMargin ? 'text-red-600' : priceCalculations.isLowMargin ? 'text-yellow-600' : 'text-blue-300'}`}>
                    Margem: {priceCalculations.currentMargin.toFixed(1)}%
                  </p>
                </div>
                {/* Lucro */}
                <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 text-[10px] uppercase">Lucro Bruto</p>
                  <p className="text-base font-bold text-green-700">{formatCurrency(priceCalculations.profitValue)}</p>
                  <p className="text-[8px] text-green-600">Por unidade vendida</p>
                </div>
              </div>
            </div>

            <div className="p-3 border-t bg-gray-50">
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="h-9 text-sm">
                  Cancelar
                </Button>
                {mode !== 'view' && (
                  <Button type="submit" disabled={loading} className="h-9 text-sm bg-[#001941] hover:bg-blue-900 text-white">
                    {loading ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Modal de Cadastro de Fornecedor */}
        <AnimatePresence>
          {showSupplierModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowSupplierModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md"
              >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Novo Fornecedor
                  </h3>
                  <button
                    onClick={() => setShowSupplierModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-black text-sm">Nome *</Label>
                    <Input
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do fornecedor"
                      className="text-black h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-black text-sm">CNPJ</Label>
                    <Input
                      value={newSupplier.cnpj}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0000-00"
                      className="text-black h-9"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-black text-sm">Email</Label>
                      <Input
                        type="email"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                        className="text-black h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-black text-sm">Telefone</Label>
                      <Input
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(00) 00000-0000"
                        className="text-black h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-black text-sm">Endereço</Label>
                    <Input
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Endereço completo"
                      className="text-black h-9"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSupplierModal(false)}
                    className="h-9"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveSupplier}
                    disabled={savingSupplier}
                    className="h-9 bg-[#001941] hover:bg-blue-900"
                  >
                    {savingSupplier ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Cadastrar'
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Lista de Fornecedores */}
        <AnimatePresence>
          {showSuppliersListModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowSuppliersListModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
              >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Gerenciar Fornecedores
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setShowSuppliersListModal(false);
                        setShowSupplierModal(true);
                      }}
                      className="h-8 bg-[#001941] hover:bg-blue-900"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Novo
                    </Button>
                    <button
                      onClick={() => setShowSuppliersListModal(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {suppliers.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum fornecedor cadastrado</p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setShowSuppliersListModal(false);
                          setShowSupplierModal(true);
                        }}
                        className="mt-4 h-8 bg-[#001941] hover:bg-blue-900"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Cadastrar Fornecedor
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {suppliers.map(supplier => (
                        <div
                          key={supplier.id}
                          className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                            formData.supplierId === supplier.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, supplierId: supplier.id }));
                            toast.success(`Fornecedor "${supplier.name}" selecionado`);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                                {formData.supplierId === supplier.id && (
                                  <Badge className="bg-blue-500 text-white text-xs">Selecionado</Badge>
                                )}
                              </div>
                              {supplier.cnpj && (
                                <p className="text-sm text-gray-500">CNPJ: {supplier.cnpj}</p>
                              )}
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                                {supplier.email && <span>{supplier.email}</span>}
                                {supplier.phone && <span>{supplier.phone}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-200 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSuppliersListModal(false)}
                    className="h-9"
                  >
                    Fechar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Variações - Cadastro Completo */}
        <AnimatePresence>
          {showVariationsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowVariationsModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col"
              >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-indigo-600" />
                    Variações do Produto: {formData.name || 'Novo Produto'}
                  </h3>
                  <button
                    onClick={() => setShowVariationsModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulário de Nova Variação */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">
                          {editingVariationIndex !== null ? 'Editar Variação' : 'Nova Variação'}
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyFromParentProduct}
                          className="h-8 text-xs bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar do Produto
                        </Button>
                      </div>

                      {/* Nome e SKU */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Nome da Variação *</Label>
                          <Input
                            value={currentVariation.name}
                            onChange={(e) => setCurrentVariation({ ...currentVariation, name: e.target.value })}
                            placeholder="Ex: iPhone 15 Pro Max - 256GB Preto"
                            className="h-9 text-sm text-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">SKU *</Label>
                          <Input
                            value={currentVariation.sku}
                            onChange={(e) => setCurrentVariation({ ...currentVariation, sku: e.target.value })}
                            placeholder="IPHONE15PM-256-BLK"
                            className="h-9 text-sm text-black"
                          />
                        </div>
                      </div>

                      {/* NCM e Tamanho */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">NCM</Label>
                          <Input
                            value={currentVariation.ncm}
                            onChange={(e) => setCurrentVariation({ ...currentVariation, ncm: e.target.value })}
                            placeholder="8517.12.31"
                            className="h-9 text-sm text-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Tamanho</Label>
                          <Input
                            value={currentVariation.size}
                            onChange={(e) => setCurrentVariation({ ...currentVariation, size: e.target.value })}
                            placeholder="6.7 polegadas"
                            className="h-9 text-sm text-black"
                          />
                        </div>
                      </div>

                      {/* Cor */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 flex items-center gap-1">
                          <Palette className="h-3 w-3" />
                          Cor
                        </Label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="color"
                            value={currentVariation.color.code}
                            onChange={(e) => setCurrentVariation({
                              ...currentVariation,
                              color: { ...currentVariation.color, code: e.target.value }
                            })}
                            className="w-10 h-10 border-2 border-gray-200 rounded-lg p-0 cursor-pointer"
                          />
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                              value={currentVariation.color.name}
                              onChange={(e) => setCurrentVariation({
                                ...currentVariation,
                                color: { ...currentVariation.color, name: e.target.value }
                              })}
                              placeholder="Nome da cor"
                              className="h-9 text-sm text-black"
                            />
                            <Input
                              value={currentVariation.color.image}
                              onChange={(e) => setCurrentVariation({
                                ...currentVariation,
                                color: { ...currentVariation.color, image: e.target.value }
                              })}
                              placeholder="URL imagem (opcional)"
                              className="h-9 text-sm text-black"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Armazenamento */}
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600 flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          Armazenamento
                        </Label>
                        <Input
                          value={currentVariation.storage}
                          onChange={(e) => setCurrentVariation({ ...currentVariation, storage: e.target.value })}
                          placeholder="256GB"
                          className="h-9 text-sm text-black"
                        />
                      </div>

                      {/* Preços */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Preço de Custo (R$)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={currentVariation.originalPrice}
                            onChange={(e) => setCurrentVariation({ ...currentVariation, originalPrice: Number(e.target.value) })}
                            className="h-9 text-sm text-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Preço de Venda (R$)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={currentVariation.price}
                            onChange={(e) => setCurrentVariation({ ...currentVariation, price: Number(e.target.value) })}
                            className="h-9 text-sm text-black"
                          />
                        </div>
                      </div>

                      {/* Estoque e Fornecedor */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600 flex items-center gap-1">
                            <Archive className="h-3 w-3" />
                            Estoque
                          </Label>
                          <Input
                            type="number"
                            value={currentVariation.stock}
                            onChange={(e) => setCurrentVariation({ ...currentVariation, stock: Number(e.target.value) })}
                            className="h-9 text-sm text-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Fornecedor
                          </Label>
                          <Select
                            value={currentVariation.supplierId}
                            onValueChange={(value) => {
                              const supplier = suppliers.find(s => s.id === value);
                              setCurrentVariation({
                                ...currentVariation,
                                supplierId: value,
                                supplierName: supplier?.name || ''
                              });
                            }}
                          >
                            <SelectTrigger className="h-9 text-sm text-black">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map(supplier => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Imagem e Status */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Imagem URL</Label>
                          <Input
                            value={currentVariation.image}
                            onChange={(e) => setCurrentVariation({ ...currentVariation, image: e.target.value })}
                            placeholder="https://..."
                            className="h-9 text-sm text-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Status</Label>
                          <Select
                            value={currentVariation.status}
                            onValueChange={(value: 'active' | 'inactive' | 'out_of_stock') =>
                              setCurrentVariation({ ...currentVariation, status: value })
                            }
                          >
                            <SelectTrigger className="h-9 text-sm text-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                              <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          onClick={saveVariation}
                          className="flex-1 h-9 bg-[#001941] hover:bg-blue-900 text-white"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {editingVariationIndex !== null ? 'Atualizar' : 'Adicionar'} Variação
                        </Button>
                        {editingVariationIndex !== null && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetVariationForm}
                            className="h-9"
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Lista de Variações Cadastradas */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">
                          Variações Cadastradas ({productVariations.length})
                        </h4>
                      </div>

                      {productVariations.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                          <Layers className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Nenhuma variação cadastrada</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Use "Copiar do Produto" para começar rapidamente
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                          {productVariations.map((variation, index) => (
                            <div
                              key={variation.id}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                {/* Preview da Cor/Imagem */}
                                <div className="flex-shrink-0">
                                  {variation.image ? (
                                    <img
                                      src={variation.image}
                                      alt={variation.name}
                                      className="w-12 h-12 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div
                                      className="w-12 h-12 rounded-lg border-2 border-gray-200"
                                      style={{ backgroundColor: variation.color.code }}
                                    />
                                  )}
                                </div>

                                {/* Informações */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-medium text-gray-900 text-sm truncate">
                                      {variation.name}
                                    </h5>
                                    <Badge
                                      className={`text-xs ${
                                        variation.status === 'active'
                                          ? 'bg-green-100 text-green-700'
                                          : variation.status === 'out_of_stock'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {variation.status === 'active' ? 'Ativo' : variation.status === 'out_of_stock' ? 'Sem Estoque' : 'Inativo'}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                                    <span>SKU: {variation.sku}</span>
                                    <span>Estoque: {variation.stock}</span>
                                    <span className="flex items-center gap-1">
                                      <span
                                        className="w-3 h-3 rounded-full inline-block border"
                                        style={{ backgroundColor: variation.color.code }}
                                      />
                                      {variation.color.name || 'Sem cor'}
                                    </span>
                                    <span>Arm: {variation.storage || '-'}</span>
                                  </div>

                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-sm font-bold text-green-600">
                                      R$ {variation.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                    {variation.supplierName && (
                                      <span className="text-xs text-gray-400">
                                        {variation.supplierName}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Ações */}
                                <div className="flex flex-col gap-1">
                                  <button
                                    type="button"
                                    onClick={() => editVariation(index)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Editar"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteVariation(index)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                    title="Excluir"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Resumo */}
                      {productVariations.length > 0 && (
                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 mt-4">
                          <h5 className="font-semibold text-indigo-900 text-sm mb-2">Resumo</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-indigo-700">Total variações:</span>
                              <span className="font-bold text-indigo-900 ml-1">{productVariations.length}</span>
                            </div>
                            <div>
                              <span className="text-indigo-700">Estoque total:</span>
                              <span className="font-bold text-indigo-900 ml-1">
                                {productVariations.reduce((sum, v) => sum + v.stock, 0)}
                              </span>
                            </div>
                            <div>
                              <span className="text-indigo-700">Preço min:</span>
                              <span className="font-bold text-indigo-900 ml-1">
                                R$ {Math.min(...productVariations.map(v => v.price)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div>
                              <span className="text-indigo-700">Preço max:</span>
                              <span className="font-bold text-indigo-900 ml-1">
                                R$ {Math.max(...productVariations.map(v => v.price)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetVariationForm();
                      setShowVariationsModal(false);
                    }}
                    className="h-9"
                  >
                    Fechar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowVariationsModal(false)}
                    className="h-9 bg-[#001941] hover:bg-blue-900"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Concluir ({productVariations.length} variações)
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

