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
import { X, Package, Image as ImageIcon, Tag, Palette, HardDrive, Upload, Loader2, Plus, Building2, Check, Settings, Eye, Edit2, Trash2, Layers, Copy, Save, DollarSign, Barcode, Archive, AlertTriangle, TrendingUp, TrendingDown, Percent, Calculator, ShoppingBag, ChevronDown } from 'lucide-react';
import { Product } from '@/hooks/use-admin-crud';
import { toast } from 'sonner';
import { BACKEND_URL } from '@/lib/config';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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
  color: { name: string; code: string; images: string[] };
  storage: string;
  size: string;
  price: number;
  originalPrice: number;
  costPrice: number;
  stock: number;
  supplierId: string;
  supplierName: string;
  image: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  condition?: 'new' | 'semi_new' | 'used';
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> | Partial<Product>) => Promise<void>;
  mode: 'create' | 'edit' | 'view';
  categories?: any[];
  brands?: any[];
}

const statusOptions = [
  { value: 'active', label: 'Ativo', color: 'bg-blue-600' },
  { value: 'inactive', label: 'Inativo', color: 'bg-gray-400' },
  { value: 'out_of_stock', label: 'Sem Estoque', color: 'bg-red-500' },
];

export function ProductModal({ isOpen, onClose, product, onSave, mode, categories = [], brands = [] }: ProductModalProps) {
  const { user, token } = useAdminAuth();
  const canEditPrice = user?.role === 'ADMIN' || user?.permissions?.includes('edit_price');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    // Campos de Preço - 3 campos principais
    costPrice: 0,           // Custo do Produto (valor pago ao fornecedor)
    price: 0,               // Valor de Venda (preço base/original)
    displayPrice: 0,        // Valor em Exposição (preço com desconto)
    originalPrice: 0,       // Preço Original (para compatibilidade)
    discountPercent: 0,     // Porcentagem de desconto (compatibilidade)
    discountType: 'original' as 'original' | 'vitrine', // Tipo de desconto ativo
    discountOriginal: 0,    // Desconto sobre preço original
    discountVitrine: 0,     // Desconto sobre preço de vitrine
    isOnSale: false,        // Produto em oferta/promoção
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
    colors: [{ name: '', code: '', images: [] as string[] }],
    storage: [''],
    specifications: {} as Record<string, string>,
    supplierId: '',
    variations: [] as ProductVariation[]
  });

  // Estado para upload de imagens de cor
  const [uploadingColorImage, setUploadingColorImage] = useState<number | null>(null);

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

  // Estado para marcas
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    image: ''
  });
  const [savingBrand, setSavingBrand] = useState(false);
  const [showBrandsListModal, setShowBrandsListModal] = useState(false);

  // Estado para categorias
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: ''
  });
  const [savingCategory, setSavingCategory] = useState(false);
  const [showCategoriesListModal, setShowCategoriesListModal] = useState(false);
  
  // Estado para modal de variações
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [productVariations, setProductVariations] = useState<ProductVariation[]>([]);
  const [currentVariation, setCurrentVariation] = useState<ProductVariation>({
    id: '',
    name: '',
    sku: '',
    ncm: '',
    color: { name: '', code: '#000000', images: [] },
    storage: '',
    size: '',
    price: 0,
    originalPrice: 0,
    costPrice: 0,
    stock: 0,
    supplierId: '',
    supplierName: '',
    image: '',
    status: 'active',
    condition: 'new'
  });
  const [editingVariationIndex, setEditingVariationIndex] = useState<number | null>(null);

  // Filtros e Confirmação
  const [variationFilters, setVariationFilters] = useState({
    status: 'all',
    stock: 'all',
    condition: 'all'
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean, index: number | null}>({isOpen: false, index: null});

  // Estado para dropdown de precificação detalhada
  const [showDetailedPricing, setShowDetailedPricing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // URL da API - usando config centralizada
  const API_URL = BACKEND_URL;
  
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Fallback to localStorage if user context doesn't have token yet
        const storedToken = localStorage.getItem('uss_auth_token');
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`;
        }
      }

      const response = await fetch(`${API_URL}/upload/product-image`, {
        method: 'POST',
        headers,
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
    displayPriceWithTax: 0,     // Valor em Exposição - 12% (relatório)
    // Novos campos exatos
    stripeFee: 0,               // Taxa Stripe (3.99%) sobre vitrine
    nfTax: 0,                   // NF / IR (7%) sobre vitrine
    receivedValue: 0,           // Valor que eu realmente recebo (vitrine - stripe - nf)
    // Parcelamento
    installments: [] as Array<{
      n: number;
      installmentValue: number;
      total: number;
      merchantReceives: number;
      interestRate: number;
    }>,
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
      // Preparar payload removendo campos vazios
      const payload: any = {
        name: newSupplier.name.trim()
      };
      
      // Só adicionar campos opcionais se tiverem valor
      if (newSupplier.cnpj?.trim()) payload.cnpj = newSupplier.cnpj.trim();
      if (newSupplier.email?.trim()) payload.email = newSupplier.email.trim();
      if (newSupplier.phone?.trim()) payload.phone = newSupplier.phone.trim();
      if (newSupplier.address?.trim()) payload.address = newSupplier.address.trim();
      
      console.log('Salvando fornecedor:', payload);
      console.log('API_URL:', API_URL);
      
      const response = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const created = await response.json();
        console.log('Fornecedor criado:', created);
        setSuppliers(prev => [...prev, created]);
        setFormData(prev => ({ ...prev, supplierId: created.id }));
        setShowSupplierModal(false);
        setNewSupplier({ name: '', cnpj: '', email: '', phone: '', address: '' });
        toast.success('Fornecedor cadastrado com sucesso!');
      } else {
        const errorData = await response.text();
        console.error('Erro response:', errorData);
        toast.error(`Erro: ${response.status} - ${errorData || 'Erro ao criar fornecedor'}`);
      }
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast.error(`Erro de conexão: ${error.message}`);
    } finally {
      setSavingSupplier(false);
    }
  };

  // Salvar nova marca
  const handleSaveBrand = async () => {
    if (!newBrand.name.trim()) {
      toast.error('Nome da marca é obrigatório');
      return;
    }

    setSavingBrand(true);
    try {
      const payload: any = {
        name: newBrand.name.trim(),
        slug: newBrand.slug.trim() || newBrand.name.toLowerCase().replace(/\s+/g, '-'),
        description: newBrand.description.trim(),
        logo: newBrand.logo.trim(),
        image: newBrand.image.trim()
      };

      console.log('Salvando marca:', payload);

      const response = await fetch(`${API_URL}/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const created = await response.json();
        console.log('Marca criada:', created);
        setFormData(prev => ({ ...prev, brand: created.id }));
        setShowBrandModal(false);
        setNewBrand({ name: '', slug: '', description: '', logo: '', image: '' });
        toast.success('Marca cadastrada com sucesso! Recarregue a página para ver na lista.');
      } else {
        const errorData = await response.text();
        console.error('Erro response:', errorData);
        toast.error(`Erro: ${response.status} - ${errorData || 'Erro ao criar marca'}`);
      }
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast.error(`Erro de conexão: ${error.message}`);
    } finally {
      setSavingBrand(false);
    }
  };

  // Salvar nova categoria
  const handleSaveCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setSavingCategory(true);
    try {
      const payload: any = {
        name: newCategory.name.trim(),
        slug: newCategory.slug.trim() || newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        description: newCategory.description.trim(),
        image: newCategory.image.trim(),
        parentId: newCategory.parentId.trim() || null
      };

      console.log('Salvando categoria:', payload);

      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const created = await response.json();
        console.log('Categoria criada:', created);
        setFormData(prev => ({ ...prev, category: created.id }));
        setShowCategoryModal(false);
        setNewCategory({ name: '', slug: '', description: '', image: '', parentId: '' });
        toast.success('Categoria cadastrada com sucesso! Recarregue a página para ver na lista.');
      } else {
        const errorData = await response.text();
        console.error('Erro response:', errorData);
        toast.error(`Erro: ${response.status} - ${errorData || 'Erro ao criar categoria'}`);
      }
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast.error(`Erro de conexão: ${error.message}`);
    } finally {
      setSavingCategory(false);
    }
  };

  // Copiar dados do produto pai para variação
  const copyFromParentProduct = () => {
    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
    const firstColor = formData.colors.find(c => c.name);
    setCurrentVariation({
      ...currentVariation,
      name: formData.name,
      sku: formData.sku ? `${formData.sku}-VAR-${productVariations.length + 1}` : '',
      ncm: formData.ncm || '',
      price: formData.displayPrice || formData.price,
      originalPrice: formData.originalPrice || 0,
      costPrice: formData.costPrice || 0,
      stock: formData.stock,
      supplierId: formData.supplierId,
      supplierName: selectedSupplier?.name || '',
      image: formData.images.main,
      status: formData.status,
      color: firstColor ? { name: firstColor.name, code: firstColor.code, images: firstColor.images || [] } : { name: '', code: '#000000', images: [] },
      storage: formData.storage[0] || ''
    });
    toast.success('Dados do produto copiados para a variação!');
  };

  // Salvar variação
  const confirmDeleteVariation = (index: number) => {
    setDeleteConfirmation({ isOpen: true, index });
  };

  const executeDeleteVariation = () => {
    if (deleteConfirmation.index !== null) {
      const newVariations = [...productVariations];
      newVariations.splice(deleteConfirmation.index, 1);
      setProductVariations(newVariations);
      setDeleteConfirmation({ isOpen: false, index: null });
      toast.success('Variação removida com sucesso');
    }
  };

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
      color: { name: '', code: '#000000', images: [] },
      storage: '',
      size: '',
      price: 0,
      originalPrice: 0,
      costPrice: 0,
      stock: 0,
      supplierId: '',
      supplierName: '',
      image: '',
      status: 'active',
      condition: 'new'
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
  // TAXAS REAIS DO MERCADO BRASILEIRO:
  // - Taxa de cartão de crédito: ~4.99% (média parcelado)
  // - Taxa de gateway (Stripe/PagSeguro): ~3.49%
  // - Imposto aproximado: ~6% (Simples Nacional)
  // - TOTAL APROXIMADO: ~14.48% (arredondado para 15%)
  // - Margem mínima recomendada: 20% sobre custo
  // ============================================
  
  const TAXA_TOTAL = 0.15; // 15% (cartão + gateway + impostos)
  const MARGEM_MINIMA_IDEAL = 0.20; // 20% margem mínima saudável
  const MARGEM_ATENCAO = 0.15; // 15% - margem de atenção (amarelo)
  const MARGEM_CRITICA = 0.10; // 10% - margem crítica (vermelho)
  
  useEffect(() => {
    const costPrice = Number(formData.costPrice) || 0;
    const salePrice = Number(formData.price) || 0;
    let displayPrice = Number(formData.displayPrice) || 0;

    // Aplicar desconto diretamente no valor de vitrine (independente do preço original)
    if (formData.discountOriginal > 0 && salePrice > 0) {
      // Desconto sobre o preço original (para compatibilidade)
      displayPrice = salePrice * (1 - formData.discountOriginal / 100);
    } else if (formData.discountVitrine > 0 && displayPrice > 0) {
      // Desconto aplicado diretamente no valor de vitrine
      displayPrice = Number(formData.displayPrice) || salePrice;
    } else {
      // Sem desconto, usar valor atual ou preço original como fallback
      displayPrice = Number(formData.displayPrice) || salePrice;
    }

    // 1. Preço Ideal = Custo + 20% de margem / (1 - taxa)
    const idealPrice = costPrice > 0
      ? (costPrice * (1 + MARGEM_MINIMA_IDEAL)) / (1 - TAXA_TOTAL)
      : salePrice * 1.15;

    // 2. Valores exatos baseados na VITRINE (displayPrice)
    const STRIPE_FEE_RATE = 0.0399; // 3.99% gateway
    const NF_RATE = 0.07; // 7% imposto/nota fiscal

    // Taxas aplicadas diretamente sobre o valor da vitrine
    const stripeFee = displayPrice * STRIPE_FEE_RATE;
    const nfTax = displayPrice * NF_RATE; // NF calculada sobre o valor bruto da vitrine

    // Valor que o lojista recebe: vitrine - stripe - nf
    const receivedValue = displayPrice - stripeFee - nfTax;

    // Mantemos também os cálculos de relatório (TAXA_TOTAL) para compatibilidade
    const idealPriceWithTax = idealPrice * (1 - TAXA_TOTAL);
    const displayPriceWithTax = displayPrice * (1 - TAXA_TOTAL);

    // 3. Calcular desconto atual baseado nos preços (apenas para exibição)
    let discountPercent = 0;
    if (formData.discountOriginal > 0) {
      discountPercent = formData.discountOriginal;
    } else if (formData.discountVitrine > 0) {
      // Para desconto na vitrine, calcular percentual baseado no preço original
      if (salePrice > 0 && displayPrice > 0) {
        discountPercent = Math.round(((salePrice - displayPrice) / salePrice) * 100);
      }
    }

    if (discountPercent > 0 && !formData.isOnSale) {
      setFormData(prev => ({ ...prev, isOnSale: true, discountPercent }));
    } else if (discountPercent === 0 && formData.discountPercent !== 0) {
      setFormData(prev => ({ ...prev, discountPercent: 0 }));
    }

    // Calcular margem atual LÍQUIDA com base no que realmente será recebido
    let currentMargin = 0;
    let profitValue = 0;

    if (costPrice > 0 && displayPrice > 0) {
      profitValue = receivedValue - costPrice; // lucro real após stripe + nf
      currentMargin = (profitValue / costPrice) * 100;
    }

    // Alertas de margem
    const hasValidPrices = costPrice > 0 && displayPrice > 0;
    const isGoodMargin = hasValidPrices && currentMargin >= (MARGEM_MINIMA_IDEAL * 100);
    const isLowMargin = hasValidPrices && currentMargin >= (MARGEM_CRITICA * 100) && currentMargin < (MARGEM_MINIMA_IDEAL * 100);
    const isCriticalMargin = hasValidPrices && currentMargin < (MARGEM_CRITICA * 100);
    const showIdealButton = costPrice > 0 && displayPrice < idealPrice;

    // Calcular opções de parcelamento (1..12)
    const MONTHLY_INTEREST = 0.0199; // 1.99% ao mês para parcelas com juros (configurável)
    const installments: Array<{n:number; installmentValue:number; total:number; merchantReceives:number; interestRate:number}> = [];
    for (let n = 1; n <= 12; n++) {
      const interestRate = n <= 3 ? 0 : MONTHLY_INTEREST; // sem juros até 3x
      let installmentValue = 0;
      if (interestRate === 0) {
        installmentValue = displayPrice / n;
      } else {
        const i = interestRate;
        const factor = Math.pow(1 + i, n);
        installmentValue = displayPrice * (i * factor) / (factor - 1);
      }
      const total = installmentValue * n;
      const merchantReceives = total - (STRIPE_FEE_RATE * total) - (NF_RATE * total);
      installments.push({
        n,
        installmentValue: Math.round(installmentValue * 100) / 100,
        total: Math.round(total * 100) / 100,
        merchantReceives: Math.round(merchantReceives * 100) / 100,
        interestRate
      });
    }

    setPriceCalculations({
      idealPrice,
      idealPriceWithTax,
      displayPriceWithTax,
      stripeFee,
      nfTax,
      receivedValue,
      installments,
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
  }, [formData.costPrice, formData.price, formData.displayPrice, formData.discountOriginal, formData.discountVitrine]);

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
        name: product.name || '',
        description: product.description || '',
        costPrice: (product as any).costPrice || product.originalPrice || 0,
        price: product.price || 0,
        displayPrice: (product as any).displayPrice || (product as any).discountPrice || product.price || 0,
        originalPrice: product.originalPrice || 0,
        discountPercent: (product as any).discountPercent || 0,
        discountType: 'original',
        discountOriginal: (product as any).discountPercent || 0,
        discountVitrine: 0,
        isOnSale: (product as any).isOnSale || ((product as any).discountPrice && (product as any).discountPrice < product.price) || false,
        category: product.category || '',
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        sku: product.sku || '',
        ncm: (product as any).ncm || '',
        stock: product.stock || 0,
        images: product.images || { main: '', gallery: [''] },
        status: product.status || 'active',
        isNew: product.isNew || false,
        isFeatured: product.isFeatured || false,
        colors: (product.colors || []).map(c => {
          // Processar imagens - pode ser string, array ou undefined
          let colorImages: string[] = [];
          if ((c as any).images) {
            if (Array.isArray((c as any).images)) {
              colorImages = (c as any).images;
            } else if (typeof (c as any).images === 'string') {
              try {
                colorImages = JSON.parse((c as any).images);
              } catch {
                colorImages = (c as any).images.split(',').map((s: string) => s.trim()).filter(Boolean);
              }
            }
          } else if ((c as any).image) {
            colorImages = [(c as any).image];
          }
          return { 
            name: c.name || '', 
            code: c.code || '', 
            images: colorImages 
          };
        }),
        storage: product.storage || [''],
        specifications: product.specifications || {},
        supplierId: (product as any).supplierId || '',
        variations: []
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
        discountPercent: 0,
        discountType: 'original',
        discountOriginal: 0,
        discountVitrine: 0,
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
        colors: [{ name: '', code: '', images: [] as string[] }],
        storage: [''],
        specifications: {},
        supplierId: '',
        variations: []
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
        const mappedVariations: ProductVariation[] = variations.map((v: any) => {
          // Processar imagens de cor
          let colorImages: string[] = [];
          if (v.colorImages) {
            if (Array.isArray(v.colorImages)) {
              colorImages = v.colorImages;
            } else if (typeof v.colorImages === 'string') {
              try {
                colorImages = JSON.parse(v.colorImages);
              } catch {
                colorImages = v.colorImages.split(',').map((s: string) => s.trim()).filter(Boolean);
              }
            }
          } else if (v.colorImage) {
            colorImages = [v.colorImage];
          }
          
          return {
            id: v.id,
            name: v.name,
            sku: v.sku,
            ncm: v.ncm || '',
            color: {
              name: v.colorName || '',
              code: v.colorCode || '#000000',
              images: colorImages
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
          };
        });
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
      // Limpar arrays vazios e preparar cores com imagens
      const cleanedData = {
        ...formData,
        colors: formData.colors
          .filter(color => color.name && color.code)
          .map(color => ({
            name: color.name,
            code: color.code,
            images: color.images || []
          })),
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
                colorImages: JSON.stringify(v.color.images || []),
                storage: v.storage,
                size: v.size,
                costPrice: v.originalPrice,
                price: v.price,
                stock: v.stock,
                status: v.status.toUpperCase(),
                image: v.image || (v.color.images && v.color.images[0]) || '',
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
      colors: [...prev.colors, { name: '', code: '', images: [] as string[] }]
    }));
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  // Upload de imagem de cor para Cloudinary
  const uploadColorImage = async (colorIndex: number, file: File) => {
    setUploadingColorImage(colorIndex);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', 'uss-brasil');
      
      const res = await fetch('https://api.cloudinary.com/v1_1/dnmazlvs6/image/upload', {
        method: 'POST',
        body: formDataUpload
      });
      
      const data = await res.json();
      
      if (data.secure_url) {
        setFormData(prev => ({
          ...prev,
          colors: prev.colors.map((color, idx) => {
            if (idx === colorIndex) {
              return {
                ...color,
                images: [...(color.images || []), data.secure_url]
              };
            }
            return color;
          })
        }));
        toast.success('Imagem adicionada!');
      }
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploadingColorImage(null);
    }
  };

  // Remover imagem de cor
  const removeColorImage = (colorIndex: number, imageIndex: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, idx) => {
        if (idx === colorIndex) {
          return {
            ...color,
            images: (color.images || []).filter((_, i) => i !== imageIndex)
          };
        }
        return color;
      })
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
      <DialogContent className="w-[65vw] !max-w-[65vw] sm:!max-w-[65vw] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col" showCloseButton={false}>
        <DialogHeader className="px-4 py-2 border-b shrink-0 bg-blue-600 text-white">
          <DialogTitle className="flex items-center gap-2 text-white text-base">
            <Package className="h-4 w-4 text-blue-400" />
            {mode === 'create' && 'Criar Novo Produto'}
            {mode === 'edit' && 'Editar Produto'}
            {mode === 'view' && 'Detalhes do Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 overflow-hidden">
          {/* Left Side - Form Fields */}
          <div className="flex-[4] overflow-y-auto p-3 border-r bg-white">
            
            {/* ========== SEÇÃO 1: IDENTIFICAÇÃO ========== */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-2 pb-1 border-b">
                <Package className="h-3 w-3 text-blue-600" />
                <h3 className="font-semibold text-gray-800 text-xs">Identificação</h3>
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {/* Nome - ocupa 3 colunas */}
                <div className="col-span-3 space-y-0.5">
                  <Label htmlFor="name" className="text-[10px] text-gray-600">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={mode === 'view'}
                    required
                    className="text-black h-7 text-xs"
                    placeholder="iPhone 15 Pro Max 256GB"
                  />
                </div>
                
                {/* SKU */}
                <div className="space-y-0.5">
                  <Label htmlFor="sku" className="text-[10px] text-gray-600">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    disabled={mode === 'view'}
                    required
                    className="text-black h-7 font-mono text-[10px]"
                    placeholder="IP15PM-256"
                  />
                </div>
                
                {/* NCM */}
                <div className="space-y-0.5">
                  <Label htmlFor="ncm" className="text-[10px] text-gray-600">NCM</Label>
                  <Input
                    id="ncm"
                    value={formData.ncm}
                    onChange={(e) => setFormData(prev => ({ ...prev, ncm: e.target.value }))}
                    disabled={mode === 'view'}
                    className="text-black h-7 font-mono text-[10px]"
                    placeholder="8517.12.31"
                  />
                </div>
                
                {/* Estoque */}
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-gray-600">Estoque *</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    disabled={mode === 'view'}
                    required
                    className="text-black h-7 text-xs"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* ========== SEÇÃO 2: CLASSIFICAÇÃO ========== */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-2 pb-1 border-b">
                <Tag className="h-3 w-3 text-green-600" />
                <h3 className="font-semibold text-gray-800 text-xs">Classificação</h3>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {/* Categoria */}
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-gray-600">Categoria *</Label>
                  <div className="flex gap-1">
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className="h-7 text-black text-xs flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id || category} value={category.id || category}>
                            {category.name || category}
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
                          onClick={() => setShowCategoryModal(true)}
                          className="h-9 w-9 p-0 bg-green-50 border-green-300 hover:bg-green-100"
                          title="Nova categoria"
                        >
                          <Plus className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCategoriesListModal(true)}
                          className="h-9 w-9 p-0"
                          title="Ver todas categorias"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Subcategoria */}
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-gray-600">Subcategoria</Label>
                  <Input
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    disabled={mode === 'view'}
                    className="text-black h-7 text-xs"
                    placeholder="Pro Max"
                  />
                </div>
                
                {/* Marca */}
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-gray-600">Marca</Label>
                  <div className="flex gap-1">
                    <Select
                      value={formData.brand}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className="h-7 text-black text-xs flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(brand => (
                          <SelectItem key={brand.id || brand} value={brand.id || brand}>
                            {brand.name || brand}
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
                          onClick={() => setShowBrandModal(true)}
                          className="h-9 w-9 p-0 bg-green-50 border-green-300 hover:bg-green-100"
                          title="Nova marca"
                        >
                          <Plus className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBrandsListModal(true)}
                          className="h-9 w-9 p-0"
                          title="Ver todas marcas"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Status */}
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-gray-600">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Product['status'] }))}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger className="h-7 text-black text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${option.color}`} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Fornecedor */}
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-gray-600 flex items-center gap-1">
                    <Building2 className="h-2.5 w-2.5" />
                    Fornecedor
                  </Label>
                  <div className="flex gap-1">
                    <Select
                      value={formData.supplierId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className="h-7 text-black text-xs flex-1">
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
                    {mode !== 'view' && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSupplierModal(true)}
                          className="h-9 w-9 p-0 bg-green-50 border-green-300 hover:bg-green-100"
                          title="Novo fornecedor"
                        >
                          <Plus className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSuppliersListModal(true)}
                          className="h-9 w-9 p-0"
                          title="Ver todos fornecedores"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ========== SEÇÃO 3: PRECIFICAÇÃO INTUITIVA ========== */}
            <div className="mb-3 p-3 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-200">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-800 text-sm">Precificação Inteligente</h3>
                  <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border">
                    Taxas: 15% (cartão + gateway + impostos)
                  </span>
                </div>
                {formData.costPrice > 0 && formData.displayPrice > 0 && (
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    priceCalculations.isCriticalMargin ? 'bg-red-100 text-red-700 border border-red-300' :
                    priceCalculations.isLowMargin ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                    'bg-green-100 text-green-700 border border-green-300'
                  }`}>
                    Margem: {priceCalculations.currentMargin.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Layout Compacto: 2 colunas lado a lado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-2">
                {/* COLUNA ESQUERDA: VALORES BÁSICOS */}
                <div className="bg-white p-3 rounded border">
                  <div className="space-y-3">
                    {/* Custo */}
                    <div>
                      <Label className="text-xs text-gray-600 font-medium">Custo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.costPrice || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                        disabled={mode === 'view' || !canEditPrice}
                        className="text-sm font-bold text-red-600 bg-red-50 border-red-300 h-8"
                        placeholder="0,00"
                      />
                    </div>

                    {/* Preço Original */}
                    <div>
                      <Label className="text-xs text-gray-600 font-medium">Original</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={(e) => {
                          const newPrice = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({ ...prev, price: newPrice }));
                        }}
                        disabled={mode === 'view' || !canEditPrice}
                        className="text-sm font-bold text-gray-700 bg-gray-50 h-8"
                        placeholder="0,00"
                      />
                    </div>

                    {/* Preço na Vitrine */}
                    <div>
                      <Label className="text-xs text-gray-600 font-medium">Vitrine</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.displayPrice || ''}
                        onChange={(e) => {
                          const newDisplayPrice = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({ ...prev, displayPrice: newDisplayPrice }));
                        }}
                        disabled={mode === 'view' || !canEditPrice}
                        className="text-sm font-bold text-gray-700 bg-gray-50 h-8"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>

                {/* COLUNA DIREITA: RELATÓRIO FINANCEIRO */}
                <div className="bg-white p-3 rounded border">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Recebimentos</h4>

                    {/* Valores Principais */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-50 p-2 rounded border">
                        <div className="text-green-700 font-medium">Você Recebe</div>
                        <div className="text-green-800 font-bold text-sm">
                          R$ {priceCalculations.receivedValue.toFixed(2)}
                        </div>
                        <div className="text-green-600 text-[10px]">Total líquido (vitrine - Stripe - NF)</div>
                      </div>

                      <div className="bg-blue-50 p-2 rounded border">
                        <div className="text-blue-700 font-medium">Valor Líquido</div>
                        <div className={`font-bold text-sm ${priceCalculations.profitValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {priceCalculations.profitValue.toFixed(2)}
                        </div>
                        <div className="text-blue-600 text-[10px]">Margem {priceCalculations.currentMargin.toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* Descontos */}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-orange-50 p-2 rounded border">
                          <div className="text-orange-700 font-medium">Stripe (3.99%)</div>
                          <div className="text-orange-800 font-bold text-sm">
                            R$ {priceCalculations.stripeFee.toFixed(2)}
                          </div>
                          <div className="text-orange-600 text-[10px]">Taxa gateway</div>
                        </div>

                        <div className="bg-red-50 p-2 rounded border">
                          <div className="text-red-700 font-medium">NF (7%)</div>
                          <div className="text-red-800 font-bold text-sm">
                            R$ {priceCalculations.nfTax.toFixed(2)}
                          </div>
                          <div className="text-red-600 text-[10px]">Imposto sobre valor bruto da vitrine</div>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown para Precificação Detalhada */}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowDetailedPricing(!showDetailedPricing)}
                        className="w-full flex items-center justify-between text-xs text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <span className="font-medium">Precificação Detalhada</span>
                        <ChevronDown className={`h-3 w-3 transition-transform ${showDetailedPricing ? 'rotate-180' : ''}`} />
                      </button>

                      {showDetailedPricing && (
                        <div className="mt-2 space-y-2 text-[10px]">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="bg-gray-50 p-1 rounded">
                              <div className="text-gray-600">Valor Bruto</div>
                              <div className="font-bold">R$ {formData.displayPrice.toFixed(2)}</div>
                            </div>
                            <div className="bg-gray-50 p-1 rounded">
                              <div className="text-gray-600">Após Stripe</div>
                              <div className="font-bold">R$ {(formData.displayPrice - priceCalculations.stripeFee).toFixed(2)}</div>
                            </div>
                              <div className="bg-gray-50 p-1 rounded">
                                <div className="text-gray-600">Após NF 7%</div>
                                <div className="font-bold">R$ {(formData.displayPrice - priceCalculations.nfTax).toFixed(2)}</div>
                              </div>
                              <div className="bg-gray-50 p-1 rounded">
                                <div className="text-gray-600">Recebido (Stripe + NF)</div>
                                <div className="font-bold">R$ {priceCalculations.receivedValue.toFixed(2)}</div>
                              </div>
                            <div className="bg-gray-50 p-1 rounded">
                              <div className="text-gray-600">Após 15% Total</div>
                              <div className="font-bold">R$ {priceCalculations.displayPriceWithTax.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status da Margem */}
                    {formData.costPrice > 0 && formData.displayPrice > 0 && (
                      <div className={`text-center text-[10px] font-semibold py-1 px-2 rounded mt-2 ${
                        priceCalculations.isCriticalMargin ? 'bg-red-100 text-red-700' :
                        priceCalculations.isLowMargin ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {priceCalculations.isCriticalMargin ? 'Crítica' : priceCalculations.isLowMargin ? 'Atenção' : 'Saudável'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            {/* ========== SEÇÃO 4: DESCRIÇÃO ========== */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Edit2 className="h-2.5 w-2.5 text-purple-600" />
                <Label className="font-semibold text-gray-800 text-[10px]">Descrição</Label>
              </div>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={mode === 'view'}
                rows={2}
                required
                className="text-black resize-none text-[10px]"
                placeholder="Descrição breve..."
              />
            </div>

            {/* ========== SEÇÃO 5: IMAGENS E OPÇÕES ========== */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-2 pb-1 border-b">
                <ImageIcon className="h-3 w-3 text-orange-600" />
                <h3 className="font-semibold text-gray-800 text-xs">Imagens e Opções</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Imagem Principal com Upload Cloudinary */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-gray-600">Imagem Principal</Label>
                  
                  {/* Upload Zone */}
                  <div 
                    className={`relative border-2 border-dashed rounded-lg p-2 transition-colors ${
                      mode === 'view' ? 'bg-gray-50' : 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    } ${formData.images.main ? 'border-green-300 bg-green-50' : 'border-gray-300'}`}
                    onClick={() => mode !== 'view' && mainImageInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={mainImageInputRef}
                      onChange={handleMainImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {uploading ? (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <span className="text-[9px] text-gray-500 mt-0.5">Enviando...</span>
                      </div>
                    ) : formData.images.main ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow">
                          <img src={formData.images.main} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-medium text-green-700">✓ Carregada</p>
                          {mode !== 'view' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData(prev => ({ ...prev, images: { ...prev.images, main: '' } }));
                              }}
                              className="text-[9px] text-red-500 hover:text-red-700"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-[9px] text-gray-500 mt-0.5">Upload</span>
                      </div>
                    )}
                  </div>

                  {/* Galeria */}
                  <Label className="text-[9px] text-gray-500">Galeria</Label>
                  <div className="flex gap-1">
                    {formData.images.gallery.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative">
                        <input
                          type="file"
                          ref={el => { galleryInputRefs.current[index] = el; }}
                          onChange={(e) => handleGalleryImageUpload(e, index)}
                          accept="image/*"
                          className="hidden"
                        />
                        <div
                          className={`w-10 h-10 rounded border-2 border-dashed flex items-center justify-center cursor-pointer ${
                            image ? 'border-green-300' : 'border-gray-300 hover:border-blue-400'
                          }`}
                          onClick={() => mode !== 'view' && galleryInputRefs.current[index]?.click()}
                        >
                          {uploadingIndex === index ? (
                            <Loader2 className="h-2.5 w-2.5 animate-spin text-blue-500" />
                          ) : image ? (
                            <img src={image} alt={`G${index + 1}`} className="w-full h-full object-cover rounded" />
                          ) : (
                            <Plus className="h-2.5 w-2.5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opções do Produto */}
                <div className="space-y-2">
                  {/* Switches em linha */}
                  <div className="flex items-center gap-3 p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-1">
                      <Switch
                        id="isNew"
                        checked={formData.isNew}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNew: checked }))}
                        disabled={mode === 'view'}
                        className="scale-75 data-[state=checked]:bg-green-600"
                      />
                      <Label htmlFor="isNew" className={`text-[9px] cursor-pointer ${formData.isNew ? 'text-green-700 font-bold' : 'text-gray-600'}`}>Novo</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                        disabled={mode === 'view'}
                        className="scale-75 data-[state=checked]:bg-blue-600"
                      />
                      <Label htmlFor="isFeatured" className={`text-[9px] cursor-pointer ${formData.isFeatured ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>Destaque</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch
                        id="isOnSale"
                        checked={formData.isOnSale}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOnSale: checked }))}
                        disabled={mode === 'view'}
                        className="scale-75 data-[state=checked]:bg-red-600"
                      />
                      <Label htmlFor="isOnSale" className={`text-[9px] cursor-pointer ${formData.isOnSale ? 'text-red-700 font-bold' : 'text-gray-600'}`}>Oferta</Label>
                    </div>
                  </div>

                  {/* Variações */}
                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-gray-600 flex items-center gap-1">
                      <Layers className="h-2.5 w-2.5" />
                      Variações
                      {productVariations.length > 0 && (
                        <Badge className="bg-indigo-100 text-indigo-700 text-[8px] ml-0.5 px-1 py-0">
                          {productVariations.length}
                        </Badge>
                      )}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVariationsModal(true)}
                      className="h-7 w-full justify-start text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 transition-colors font-medium"
                    >
                      <Palette className="h-3 w-3 mr-1.5" />
                      {productVariations.length > 0 ? 'Gerenciar Variações' : 'Adicionar Variações'}
                    </Button>
                  </div>

                  {/* Preview de Cores e Armazenamento */}
                  <div className="flex flex-wrap gap-1">
                    {formData.colors.filter(c => c.name).map((color, index) => (
                      <div key={index} className="flex items-center gap-0.5 bg-gray-100 rounded px-1 py-0.5">
                        <div className="w-2 h-2 rounded-full border" style={{ backgroundColor: color.code || '#ccc' }} />
                        <span className="text-[8px] text-gray-600">{color.name}</span>
                      </div>
                    ))}
                    {formData.storage.filter(s => s).map((storage, index) => (
                      <Badge key={index} variant="secondary" className="text-[8px] py-0 px-1">{storage}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 6: ESPECIFICAÇÕES */}
            <div className="space-y-1.5">
              <Label className="text-black text-xs flex items-center gap-2">
                <Tag className="h-3 w-3 text-gray-600" />
                Especificações
              </Label>
              {mode !== 'view' && (
                <div className="flex gap-1.5">
                  <Input
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="Chave"
                    className="flex-1 h-7 text-xs text-black"
                  />
                  <Input
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="Valor"
                    className="flex-1 h-7 text-xs text-black"
                  />
                  <Button type="button" onClick={addSpecification} size="sm" className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-xs">
                    +
                  </Button>
                </div>
              )}
              {/* Lista compacta de especificações */}
              <div className="max-h-24 overflow-y-auto bg-gray-50 rounded p-1.5">
                {Object.entries(formData.specifications).length > 0 ? (
                  <div className="space-y-0.5">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-white rounded px-2 py-0.5 text-[10px]">
                        <div className="flex items-center gap-1 overflow-hidden">
                          <span className="text-gray-500 font-medium shrink-0">{key}:</span>
                          <span className="text-black truncate">{value}</span>
                        </div>
                        {mode !== 'view' && (
                          <button type="button" onClick={() => removeSpecification(key)} className="text-red-400 hover:text-red-600 shrink-0 ml-1">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 text-center py-2">Nenhuma especificação</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Preview & Actions */}
          <div className="w-[180px] flex flex-col bg-gray-50 h-full shrink-0">
            <div className="p-2 border-b bg-gray-50">
              <h3 className="font-semibold text-black text-xs flex items-center gap-1">
                <Package className="h-3 w-3 text-gray-700" />
                Preview
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
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
                    <ImageIcon className="h-6 w-6 mx-auto mb-0.5 opacity-50" />
                    <span className="text-[9px]">Sem imagem</span>
                  </div>
                )}
                {formData.isNew && (
                  <Badge className="absolute top-0.5 left-0.5 bg-blue-500 text-[8px] px-1 py-0">Novo</Badge>
                )}
                {formData.isFeatured && (
                  <Badge className="absolute top-0.5 right-0.5 bg-blue-600 text-[8px] px-1 py-0">Dest.</Badge>
                )}
              </div>

              {/* Price Summary - Preview */}
              <div className="space-y-1.5">
                {/* Preço Ideal Sugerido */}
                <div className="p-1.5 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center justify-between">
                    <p className="text-blue-700 text-[8px] uppercase font-medium">Ideal</p>
                    {priceCalculations.showIdealButton && mode !== 'view' && (
                      <button
                        type="button"
                        onClick={applyIdealPrice}
                        className="text-[8px] text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Usar
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-bold text-blue-600">{formatCurrency(priceCalculations.idealPrice)}</p>
                </div>
                {/* Valor em Exposição */}
                <div className={`p-1.5 rounded ${priceCalculations.isCriticalMargin ? 'bg-red-100 border border-red-300' : priceCalculations.isLowMargin ? 'bg-yellow-100 border border-yellow-300' : 'bg-blue-600'}`}>
                  <p className={`text-[8px] uppercase ${priceCalculations.isCriticalMargin ? 'text-red-700' : priceCalculations.isLowMargin ? 'text-yellow-700' : 'text-blue-200'}`}>Vitrine</p>
                  <p className={`text-base font-bold ${priceCalculations.isCriticalMargin ? 'text-red-700' : priceCalculations.isLowMargin ? 'text-yellow-700' : 'text-white'}`}>{formatCurrency(formData.displayPrice)}</p>
                  <p className={`text-[7px] ${priceCalculations.isCriticalMargin ? 'text-red-600' : priceCalculations.isLowMargin ? 'text-yellow-600' : 'text-blue-300'}`}>
                    Margem: {priceCalculations.currentMargin.toFixed(0)}%
                  </p>
                </div>
                {/* Lucro */}
                <div className="p-1.5 bg-green-50 rounded border border-green-200">
                  <p className="text-green-700 text-[8px] uppercase">Lucro</p>
                  <p className="text-sm font-bold text-green-700">{formatCurrency(priceCalculations.profitValue)}</p>
                </div>

                {/* Parcelamento (tabela) */}
                <div className="border-t pt-2">
                  <h4 className="text-xs font-medium text-gray-700">Parcelamento</h4>
                  <div className="mt-1 text-xs max-h-36 overflow-y-auto">
                    <table className="w-full text-left text-[12px]">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="pb-1 pr-2">x</th>
                          <th className="pb-1 text-right">Parcela</th>
                          <th className="pb-1 text-right">Total</th>
                          <th className="pb-1 text-right">Recebo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceCalculations.installments && priceCalculations.installments.map((opt) => (
                          <tr key={opt.n} className="odd:bg-white even:bg-gray-50">
                            <td className="py-1 pr-2">{opt.n}x</td>
                            <td className="py-1 text-right">{formatCurrency(opt.installmentValue)}</td>
                            <td className="py-1 text-right">{formatCurrency(opt.total)}</td>
                            <td className="py-1 text-right text-green-700 font-medium">{formatCurrency(opt.merchantReceives)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-[10px] text-gray-400 mt-1">Sem juros até 3x; juros mensais aplicados a partir da 4ª parcela.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2 border-t bg-black-500">
              <div className="grid grid-cols-2 gap-1.5">
                <Button type="button" variant="outline" onClick={onClose} className="h-7 text-xs">
                  Cancelar
                </Button>
                {mode !== 'view' && (
                  <Button type="submit" disabled={loading} className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? '...' : mode === 'create' ? 'Criar' : 'Salvar'}
                  </Button>
                )}
              </div>
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
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] px-[10%]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowSupplierModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-sm"
              >
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Novo Fornecedor
                  </h3>
                  <button
                    onClick={() => setShowSupplierModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-3 space-y-2">
                  <div className="space-y-0.5">
                    <Label className="text-black text-xs">Nome *</Label>
                    <Input
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do fornecedor"
                      className="text-black h-7 text-xs"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-black text-xs">CNPJ</Label>
                    <Input
                      value={newSupplier.cnpj}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0000-00"
                      className="text-black h-7 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <Label className="text-black text-xs">Email</Label>
                      <Input
                        type="email"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                        className="text-black h-7 text-xs"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-black text-xs">Telefone</Label>
                      <Input
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(00) 00000-0000"
                        className="text-black h-7 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-black text-xs">Endereço</Label>
                    <Input
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Endereço completo"
                      className="text-black h-7 text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 border-t border-gray-200 flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSupplierModal(false)}
                    className="h-7 text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveSupplier}
                    disabled={savingSupplier}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    {savingSupplier ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
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
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-[10%]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowSuppliersListModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[70vh] flex flex-col"
              >
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Fornecedores
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setShowSuppliersListModal(false);
                        setShowSupplierModal(true);
                      }}
                      className="h-6 text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Novo
                    </Button>
                    <button
                      onClick={() => setShowSuppliersListModal(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  {suppliers.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-xs">Nenhum fornecedor cadastrado</p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setShowSuppliersListModal(false);
                          setShowSupplierModal(true);
                        }}
                        className="mt-3 h-6 text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Cadastrar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {suppliers.map(supplier => (
                        <div
                          key={supplier.id}
                          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
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
                              <div className="flex items-center gap-1">
                                <h4 className="font-semibold text-gray-900 text-xs">{supplier.name}</h4>
                                {formData.supplierId === supplier.id && (
                                  <Badge className="bg-blue-500 text-white text-[9px] px-1 py-0">Sel.</Badge>
                                )}
                              </div>
                              {supplier.cnpj && (
                                <p className="text-[10px] text-gray-500">{supplier.cnpj}</p>
                              )}
                              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[9px] text-gray-400">
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

                <div className="p-2 border-t border-gray-200 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSuppliersListModal(false)}
                    className="h-7 text-xs"
                  >
                    Fechar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Cadastro de Marca */}
        <AnimatePresence>
          {showBrandModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] px-[10%]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowBrandModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-sm"
              >
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    Nova Marca
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBrandModal(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-3 space-y-2">
                  <div>
                    <Label className="text-xs text-gray-600">Nome *</Label>
                    <Input
                      value={newBrand.name}
                      onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome da marca"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Slug</Label>
                    <Input
                      value={newBrand.slug}
                      onChange={(e) => setNewBrand(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="slug-da-marca"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Descrição</Label>
                    <Textarea
                      value={newBrand.description}
                      onChange={(e) => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da marca"
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Logo URL</Label>
                    <Input
                      value={newBrand.logo}
                      onChange={(e) => setNewBrand(prev => ({ ...prev, logo: e.target.value }))}
                      placeholder="https://..."
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Imagem</Label>
                    <Input
                      value={newBrand.image}
                      onChange={(e) => setNewBrand(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://..."
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="p-3 border-t border-gray-200 flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBrandModal(false)}
                    className="h-7 text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveBrand}
                    disabled={savingBrand}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    {savingBrand ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3 mr-1" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Lista de Marcas */}
        <AnimatePresence>
          {showBrandsListModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-[10%]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowBrandsListModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[70vh] flex flex-col"
              >
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    Marcas
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowBrandsListModal(false);
                        setShowBrandModal(true);
                      }}
                      className="h-6 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Nova
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBrandsListModal(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  {brands.length === 0 ? (
                    <div className="text-center py-8">
                      <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Nenhuma marca cadastrada</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowBrandsListModal(false);
                          setShowBrandModal(true);
                        }}
                        className="mt-3 h-6 text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Cadastrar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {brands.map(brand => (
                        <div
                          key={brand.id}
                          className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, brand: brand.id }));
                            setShowBrandsListModal(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {brand.logo ? (
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="w-6 h-6 rounded object-contain"
                              />
                            ) : (
                              <Tag className="h-4 w-4 text-gray-400" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-800">{brand.name}</p>
                              {brand.description && (
                                <p className="text-xs text-gray-500 line-clamp-1">{brand.description}</p>
                              )}
                            </div>
                          </div>
                          <Badge className="bg-blue-500 text-white text-[9px] px-1 py-0">Sel.</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-2 border-t border-gray-200 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBrandsListModal(false)}
                    className="h-7 text-xs"
                  >
                    Fechar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Cadastro de Categoria */}
        <AnimatePresence>
          {showCategoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] px-[10%]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowCategoryModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-sm"
              >
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600" />
                    Nova Categoria
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCategoryModal(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-3 space-y-2">
                  <div>
                    <Label className="text-xs text-gray-600">Nome *</Label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome da categoria"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Slug</Label>
                    <Input
                      value={newCategory.slug}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="slug-da-categoria"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Descrição</Label>
                    <Textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da categoria"
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Imagem</Label>
                    <Input
                      value={newCategory.image}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://..."
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Categoria Pai</Label>
                    <Select
                      value={newCategory.parentId || "none"}
                      onValueChange={(value) => setNewCategory(prev => ({ ...prev, parentId: value === "none" ? "" : value }))}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Selecione (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-3 border-t border-gray-200 flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCategoryModal(false)}
                    className="h-7 text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveCategory}
                    disabled={savingCategory}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    {savingCategory ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3 mr-1" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Lista de Categorias */}
        <AnimatePresence>
          {showCategoriesListModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-[10%]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowCategoriesListModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[70vh] flex flex-col"
              >
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600" />
                    Categorias
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCategoriesListModal(false);
                        setShowCategoryModal(true);
                      }}
                      className="h-6 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Nova
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCategoriesListModal(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  {categories.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Nenhuma categoria cadastrada</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCategoriesListModal(false);
                          setShowCategoryModal(true);
                        }}
                        className="mt-3 h-6 text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Cadastrar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {categories.map(category => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, category: category.id }));
                            setShowCategoriesListModal(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-6 h-6 rounded object-contain"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-gray-400" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-800">{category.name}</p>
                              {category.description && (
                                <p className="text-xs text-gray-500 line-clamp-1">{category.description}</p>
                              )}
                            </div>
                          </div>
                          <Badge className="bg-blue-500 text-white text-[9px] px-1 py-0">Sel.</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-2 border-t border-gray-200 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCategoriesListModal(false)}
                    className="h-7 text-xs"
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
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] md:px-[5%] px-0"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowVariationsModal(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white md:rounded-xl shadow-xl w-full h-full md:h-[85vh] md:max-w-5xl flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 md:rounded-t-xl shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Layers className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-black">Gerenciar Variações</h3>
                      <p className="text-xs text-gray-500">{formData.name || 'Novo Produto'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVariationsModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                  {/* Painel Esquerdo: Gerenciamento de Cores e Formulário */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 border-r border-gray-200 bg-white">
                    
                    {/* Seção 2: Formulário de Variação */}
                    <div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {editingVariationIndex !== null ? <Edit2 className="h-4 w-4 text-indigo-600" /> : <Plus className="h-4 w-4 text-indigo-600" />}
                            {editingVariationIndex !== null ? 'Editar Variação' : 'Nova Variação'}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">Preencha os dados específicos desta variação</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyFromParentProduct}
                            className="h-8 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1.5" />
                            Copiar do Produto
                          </Button>
                          {editingVariationIndex !== null && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={resetVariationForm}
                              className="h-8 text-xs text-red-600 hover:bg-red-50"
                            >
                              Cancelar Edição
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Coluna 1: Identificação */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">Identificação</h5>
                            
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Nome da Variação *</Label>
                                <Input
                                  value={currentVariation.name}
                                  onChange={(e) => setCurrentVariation({ ...currentVariation, name: e.target.value })}
                                  placeholder="Ex: iPhone 15 Pro Max - 256GB Preto"
                                  className="bg-white text-black"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-700">SKU *</Label>
                                  <Input
                                    value={currentVariation.sku}
                                    onChange={(e) => setCurrentVariation({ ...currentVariation, sku: e.target.value })}
                                    placeholder="SKU-VAR-001"
                                    className="bg-white text-black"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-700">NCM</Label>
                                  <Input
                                    value={currentVariation.ncm}
                                    onChange={(e) => setCurrentVariation({ ...currentVariation, ncm: e.target.value })}
                                    placeholder="0000.00.00"
                                    className="bg-white text-black"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Coluna 2: Características */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">Características</h5>
                            
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-700">Cor (da lista acima)</Label>
                                <Select
                                  value={currentVariation.color.name || ''}
                                  onValueChange={(colorName) => {
                                    const selectedColor = formData.colors.find(c => c.name === colorName);
                                    if (selectedColor) {
                                      setCurrentVariation({
                                        ...currentVariation,
                                        color: {
                                          name: selectedColor.name,
                                          code: selectedColor.code,
                                          images: selectedColor.images || []
                                        }
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="bg-white text-black">
                                    <SelectValue placeholder="Selecione uma cor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {formData.colors.filter(c => c.name).map((color, idx) => (
                                      <SelectItem key={idx} value={color.name}>
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color.code }} />
                                          {color.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Armazenamento (Múltipla Escolha)</Label>
                                <div className="flex flex-wrap gap-2">
                                  {["64GB", "128GB", "256GB", "512GB", "1TB"].map(opt => {
                                    const isSelected = currentVariation.storage?.split(',').map(s => s.trim()).includes(opt);
                                    return (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                          const currentStorages = currentVariation.storage ? currentVariation.storage.split(',').map(s => s.trim()).filter(Boolean) : [];
                                          let newStorages;
                                          if (currentStorages.includes(opt)) {
                                            newStorages = currentStorages.filter(s => s !== opt);
                                          } else {
                                            newStorages = [...currentStorages, opt];
                                          }
                                          setCurrentVariation({...currentVariation, storage: newStorages.join(', ')});
                                        }}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                          isSelected
                                            ? 'bg-indigo-600 text-white border-indigo-600' 
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Tamanho</Label>
                                  <Input
                                    value={currentVariation.size}
                                    onChange={(e) => setCurrentVariation({ ...currentVariation, size: e.target.value })}
                                    placeholder="Ex: G, 42mm"
                                    className="bg-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Condição</Label>
                                  <Select
                                    value={currentVariation.condition || 'new'}
                                    onValueChange={(value: any) => setCurrentVariation({ ...currentVariation, condition: value })}
                                  >
                                    <SelectTrigger className="bg-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new">Novo</SelectItem>
                                      <SelectItem value="semi_new">Semi Novo</SelectItem>
                                      <SelectItem value="used">Usado</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Coluna 3: Preços e Estoque */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">Comercial</h5>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Custo (R$)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={currentVariation.costPrice || 0}
                                  onChange={(e) => setCurrentVariation({ ...currentVariation, costPrice: Number(e.target.value) })}
                                  className="bg-white"
                                  disabled={!canEditPrice}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-indigo-900">Venda (R$)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={currentVariation.price}
                                  onChange={(e) => setCurrentVariation({ ...currentVariation, price: Number(e.target.value) })}
                                  className="bg-white border-indigo-200 focus:border-indigo-500"
                                  disabled={!canEditPrice}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Estoque</Label>
                                <Input
                                  type="number"
                                  value={currentVariation.stock}
                                  onChange={(e) => setCurrentVariation({ ...currentVariation, stock: Number(e.target.value) })}
                                  className="bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Status</Label>
                                <Select
                                  value={currentVariation.status}
                                  onValueChange={(value: any) => setCurrentVariation({ ...currentVariation, status: value })}
                                >
                                  <SelectTrigger className="bg-white">
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
                          </div>

                          {/* Coluna 4: Fornecedor e Imagem Principal */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">Outros</h5>
                            
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Fornecedor</Label>
                                <div className="flex gap-2">
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
                                    <SelectTrigger className="bg-white flex-1">
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
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowSupplierModal(true)}
                                    className="h-9 w-9 p-0 bg-green-50 border-green-200 hover:bg-green-100"
                                  >
                                    <Plus className="h-4 w-4 text-green-600" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs text-gray-700">Imagem Principal</Label>
                                <div className="flex gap-2 items-center">
                                  {currentVariation.image ? (
                                    <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden flex-shrink-0 bg-white">
                                      <img src={currentVariation.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                                      <ImageIcon className="h-4 w-4 text-gray-300" />
                                    </div>
                                  )}
                                  <label className={`flex-1 h-9 px-3 flex items-center justify-center gap-2 border rounded-md cursor-pointer transition-colors text-xs font-medium ${
                                    uploadingColorImage === -1 
                                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                                      : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700'
                                  }`}>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={uploadingColorImage === -1}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setUploadingColorImage(-1); // -1 indicates variation image upload
                                        try {
                                          const formData = new FormData();
                                          formData.append('file', file);
                                          formData.append('upload_preset', 'uss-brasil');
                                          const res = await fetch('https://api.cloudinary.com/v1_1/dnmazlvs6/image/upload', {
                                            method: 'POST',
                                            body: formData
                                          });
                                          const data = await res.json();
                                          if (data.secure_url) {
                                            setCurrentVariation({ ...currentVariation, image: data.secure_url });
                                            toast.success('Imagem da variação carregada!');
                                          }
                                        } catch (err) {
                                          console.error('Erro ao fazer upload:', err);
                                          toast.error('Erro ao carregar imagem');
                                        } finally {
                                          setUploadingColorImage(null);
                                        }
                                      }}
                                    />
                                    {uploadingColorImage === -1 ? (
                                      <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Enviando...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-3.5 w-3.5" />
                                        {currentVariation.image ? 'Alterar Imagem' : 'Nova Imagem'}
                                      </>
                                    )}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                          <Button
                            type="button"
                            onClick={saveVariation}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {editingVariationIndex !== null ? 'Atualizar Variação' : 'Adicionar Variação'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Painel Direito: Lista de Variações */}
                  <div className="w-full lg:w-[380px] bg-gray-50 flex flex-col border-l border-gray-200 h-[300px] lg:h-auto">
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Variações Criadas</h4>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                          {productVariations.length} itens
                        </Badge>
                      </div>
                      
                      {/* Filtros */}
                      <div className="flex gap-2">
                        <Select
                          value={variationFilters.status}
                          onValueChange={(v) => setVariationFilters({...variationFilters, status: v})}
                        >
                          <SelectTrigger className="h-7 text-[10px] bg-gray-50 text-black">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="active">Ativos</SelectItem>
                            <SelectItem value="inactive">Inativos</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={variationFilters.stock}
                          onValueChange={(v) => setVariationFilters({...variationFilters, stock: v})}
                        >
                          <SelectTrigger className="h-7 text-[10px] bg-gray-50 text-black">
                            <SelectValue placeholder="Estoque" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="low">Baixo (≤10)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {productVariations
                        .filter(v => {
                          if (variationFilters.status !== 'all' && v.status !== variationFilters.status) return false;
                          if (variationFilters.stock === 'low' && v.stock > 10) return false;
                          return true;
                        })
                        .length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
                          <Layers className="h-12 w-12 mb-3 opacity-20" />
                          <p className="text-sm">Nenhuma variação encontrada.</p>
                        </div>
                      ) : (
                        productVariations
                          .filter(v => {
                            if (variationFilters.status !== 'all' && v.status !== variationFilters.status) return false;
                            if (variationFilters.stock === 'low' && v.stock > 10) return false;
                            return true;
                          })
                          .map((variation, index) => (
                          <div
                            key={variation.id}
                            className={`bg-white p-3 rounded-xl border shadow-sm hover:shadow-md transition-all group ${
                              variation.status === 'inactive' ? 'opacity-60 border-gray-200' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100 hidden md:block">
                                {variation.image || (variation.color.images && variation.color.images[0]) ? (
                                  <img
                                    src={variation.image || variation.color.images[0]}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ backgroundColor: variation.color.code || '#eee' }}
                                  >
                                    {!variation.color.code && <ImageIcon className="h-4 w-4 text-gray-300" />}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h5 className="text-sm font-medium text-gray-900 truncate" title={variation.name}>
                                    {variation.name}
                                  </h5>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => editVariation(index)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => confirmDeleteVariation(index)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-1.5">
                                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-gray-50">
                                    {variation.sku}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-gray-50 flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: variation.color.code }} />
                                    {variation.color.name}
                                  </Badge>
                                  {variation.storage && (
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-gray-50">
                                      {variation.storage}
                                    </Badge>
                                  )}
                                  {variation.condition === 'semi_new' && (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-amber-100 text-amber-800">
                                      Semi Novo
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm font-bold text-gray-900">
                                    R$ {variation.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    variation.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {variation.stock} un
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer do Painel Direito */}
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-4">
                        <div>
                          <span className="block text-gray-400">Total em Estoque</span>
                          <span className="text-lg font-semibold text-gray-900">
                            {productVariations.reduce((acc, curr) => acc + (curr.stock || 0), 0)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Valor Médio</span>
                          <span className="text-lg font-semibold text-gray-900">
                            R$ {productVariations.length > 0 
                              ? (productVariations.reduce((acc, curr) => acc + curr.price, 0) / productVariations.length).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
                              : '0'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowVariationsModal(false)}
                          className="flex-1 h-10 bg-red-600 hover:bg-red-800 text-white border-transparent"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setShowVariationsModal(false)}
                          className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white h-10"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Concluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Confirmação de Exclusão */}
        <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => !open && setDeleteConfirmation({ isOpen: false, index: null })}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500">
                Tem certeza que deseja excluir esta variação?
                {deleteConfirmation.index !== null && productVariations[deleteConfirmation.index] && (
                  <span className="block mt-2 font-medium text-gray-900">
                    {productVariations[deleteConfirmation.index].name}
                  </span>
                )}
              </p>
              <p className="text-xs text-red-500 mt-2">
                Se houver pedidos vinculados, a variação será apenas desativada.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmation({ isOpen: false, index: null })}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={executeDeleteVariation}>
                Confirmar Exclusão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}


