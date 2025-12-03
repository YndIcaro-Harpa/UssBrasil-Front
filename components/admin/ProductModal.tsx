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
import { X, Package, Image as ImageIcon, Tag, Palette, HardDrive, Upload, Loader2, Plus, Building2, Check } from 'lucide-react';
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
    price: 0,
    originalPrice: 0,
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
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

  // Price Calculation State
  const [priceCalculations, setPriceCalculations] = useState({
    discounted: 0,
    proposed: 0,
    receivable: 0
  });

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

  // Aplicar preço sugerido
  const applyProposedPrice = () => {
    setFormData(prev => ({ ...prev, price: Math.round(priceCalculations.proposed * 100) / 100 }));
    toast.success('Preço sugerido aplicado!');
  };

  // Calculate prices whenever base price changes
  useEffect(() => {
    const basePrice = Number(formData.price) || 0;
    
    // 1. Valor com 12% de desconto (Preço à vista para o cliente)
    const discounted = basePrice * 0.88;
    
    // 2. Valor Proposto/Sugerido (Custo + 15% de margem)
    const costPrice = Number(formData.originalPrice) || 0;
    const proposed = costPrice > 0 ? costPrice * 1.15 : basePrice * 1.15;
    
    // 3. Valor que você recebe (após taxas)
    // Taxas: Stripe (~3.99% + 0.39) + 7% Fixo (Nota Fiscal)
    const stripeFee = (discounted * 0.0399) + 0.39;
    const taxFee = discounted * 0.07;
    const receivable = discounted - stripeFee - taxFee;

    setPriceCalculations({
      discounted,
      proposed,
      receivable
    });
  }, [formData.price, formData.originalPrice]);

  useEffect(() => {
    if (product && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || 0,
        category: product.category,
        subcategory: product.subcategory || '',
        brand: product.brand,
        sku: product.sku,
        stock: product.stock,
        images: product.images,
        status: product.status,
        isNew: product.isNew,
        isFeatured: product.isFeatured,
        colors: (product.colors || []).map(c => ({ name: c.name || '', code: c.code || '', image: (c as any).image || '' })),
        storage: product.storage || [''],
        specifications: product.specifications
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        category: '',
        subcategory: '',
        brand: '',
        sku: '',
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
        specifications: {}
      });
    }
  }, [product, mode]);

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
      
      await onSave(cleanedData);
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
              <div className="lg:col-span-2 space-y-1">
                <Label htmlFor="name" className="text-black text-sm">Nome do Produto</Label>
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
                <Label htmlFor="sku" className="text-black text-sm">SKU</Label>
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
                  )}
                </div>
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
                <Label className="text-black text-sm">Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  disabled={mode === 'view'}
                  required
                  className="text-black h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-black text-sm">Custo do Produto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                  disabled={mode === 'view'}
                  className="text-black h-9"
                />
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
                
                {/* Colors inline */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-black text-sm">Cores:</Label>
                  {formData.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                      <input
                        type="color"
                        value={color.code || '#000000'}
                        onChange={(e) => {
                          const newColors = [...formData.colors];
                          newColors[index] = { ...newColors[index], code: e.target.value };
                          setFormData(prev => ({ ...prev, colors: newColors }));
                        }}
                        disabled={mode === 'view'}
                        className="w-5 h-5 border-0 p-0 cursor-pointer"
                      />
                      <Input
                        value={color.name}
                        onChange={(e) => {
                          const newColors = [...formData.colors];
                          newColors[index] = { ...newColors[index], name: e.target.value };
                          setFormData(prev => ({ ...prev, colors: newColors }));
                        }}
                        disabled={mode === 'view'}
                        placeholder="Nome"
                        className="w-20 h-7 text-xs text-black"
                      />
                      {mode !== 'view' && formData.colors.length > 1 && (
                        <button type="button" onClick={() => removeColor(index)} className="text-red-500 hover:text-red-700">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {mode !== 'view' && (
                    <Button type="button" variant="outline" size="sm" onClick={addColor} className="h-7 px-2 text-xs">
                      + Cor
                    </Button>
                  )}
                </div>

                {/* Storage inline */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-black text-sm">Armazenamento:</Label>
                  {formData.storage.map((storage, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                      <Input
                        value={storage}
                        onChange={(e) => {
                          const newStorage = [...formData.storage];
                          newStorage[index] = e.target.value;
                          setFormData(prev => ({ ...prev, storage: newStorage }));
                        }}
                        disabled={mode === 'view'}
                        className="w-16 h-7 text-xs text-black"
                        placeholder="128GB"
                      />
                      {mode !== 'view' && formData.storage.length > 1 && (
                        <button type="button" onClick={() => removeStorage(index)} className="text-red-500 hover:text-red-700">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {mode !== 'view' && (
                    <Button type="button" variant="outline" size="sm" onClick={addStorage} className="h-7 px-2 text-xs">
                      + Armazenamento
                    </Button>
                  )}
                </div>
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

              {/* Price Summary */}
              <div className="space-y-2">
                {/* Preço de Venda (com taxas) */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-500 text-xs uppercase">Preço de Venda</p>
                    {mode !== 'view' && (
                      <button
                        type="button"
                        onClick={applyProposedPrice}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        title="Aplicar este valor ao preço"
                      >
                        <Check className="h-3 w-3" />
                        Aplicar
                      </button>
                    )}
                  </div>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(priceCalculations.proposed)}</p>
                  <p className="text-[9px] text-gray-500">Custo + 15% de margem</p>
                </div>
                {/* Valor com Desconto (à vista para cliente) */}
                <div className="p-3 bg-[#001941] rounded-lg">
                  <p className="text-blue-200 text-xs uppercase">Valor c/ Desconto</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(priceCalculations.discounted)}</p>
                  <p className="text-[9px] text-blue-300">Preço à vista (12% OFF)</p>
                </div>
                {/* Valor Recebido (líquido após taxas) */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 text-xs uppercase">Você Recebe</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(priceCalculations.receivable)}</p>
                  <p className="text-[9px] text-green-600">Após taxas Stripe + NF (~11%)</p>
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
      </DialogContent>
    </Dialog>
  );
}

