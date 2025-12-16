'use client';

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Package, User, MapPin, Search, Check, Plus, Minus, Trash2, Loader2, CreditCard, Wallet, QrCode, Banknote, ChevronRight, ChevronLeft } from 'lucide-react';
import { Order as CrudOrder } from '@/hooks/use-admin-crud';
import { Order as ApiOrder, Product } from '@/services/api';
import { api } from '@/services/api';
import { toast } from 'sonner';

// Union type to accept both Order types
type OrderInput = CrudOrder | ApiOrder;

// Type for order items
type OrderItem = {
  id: string;
  productId: string;
  name?: string;
  productName?: string;
  image?: string;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedStorage?: string;
  product?: {
    name: string;
  };
};

// Type for order status
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: OrderInput;
  onSave: (order: Omit<CrudOrder, 'id' | 'createdAt' | 'updatedAt'> | Partial<CrudOrder>) => Promise<void>;
  mode: 'create' | 'edit' | 'view';
}

const statusOptions = [
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-500' },
  { value: 'processing', label: 'Processando', color: 'bg-blue-500' },
  { value: 'shipped', label: 'Enviado', color: 'bg-purple-500' },
  { value: 'delivered', label: 'Entregue', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500' },
];

const paymentMethods = [
  { value: 'PIX', label: 'PIX', icon: QrCode, color: 'bg-teal-500' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: CreditCard, color: 'bg-blue-500' },
  { value: 'DEBIT_CARD', label: 'Cartão de Débito', icon: Wallet, color: 'bg-indigo-500' },
  { value: 'BOLETO', label: 'Boleto', icon: Banknote, color: 'bg-orange-500' },
  { value: 'CASH', label: 'Dinheiro', icon: Banknote, color: 'bg-green-500' },
];

const paymentStatusOptions = [
  { value: 'PENDING', label: 'Pendente', color: 'bg-yellow-500' },
  { value: 'PAID', label: 'Pago', color: 'bg-green-500' },
  { value: 'FAILED', label: 'Falhou', color: 'bg-red-500' },
  { value: 'REFUNDED', label: 'Reembolsado', color: 'bg-gray-500' },
];

export function OrderModal({ isOpen, onClose, order, onSave, mode }: OrderModalProps) {
  const [formData, setFormData] = useState<{
    number: string;
    customer: {
      id: string;
      name: string;
      email: string;
      avatar: string;
    };
    status: OrderStatus;
    saleType: 'online' | 'presencial';
    paymentMethod: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO' | 'CASH';
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    installments: number;
    items: OrderItem[];
    total: number;
    subtotal: number;
    shipping: number;
    discount: number;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  }>({
    number: '',
    customer: {
      id: '',
      name: '',
      email: '',
      avatar: ''
    },
    status: 'pending',
    saleType: 'online',
    paymentMethod: 'PIX',
    paymentStatus: 'PENDING',
    installments: 1,
    items: [],
    total: 0,
    subtotal: 0,
    shipping: 0,
    discount: 0,
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    }
  });

  // Stepper state for create mode
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { number: 1, title: 'Cliente', description: 'Dados do cliente', icon: User },
    { number: 2, title: 'Produtos', description: 'Itens do pedido', icon: Package },
    { number: 3, title: 'Pagamento', description: 'Forma de pagamento', icon: CreditCard }
  ];

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Product search state
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  
  // Product variation selection state
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  
  // Customer creation modal state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [cpfError, setCpfError] = useState<string>('');
  const [isValidatingCpf, setIsValidatingCpf] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Validation functions for steps
  const canProceedToStep2 = () => {
    return formData.customer.id && formData.customer.name && formData.shippingAddress.street && formData.shippingAddress.city;
  };

  const canProceedToStep3 = () => {
    return formData.items.length > 0;
  };

  const canSubmit = () => {
    return formData.paymentMethod && formData.customer.id && formData.items.length > 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && !canProceedToStep2()) {
      toast.error('Preencha os dados do cliente e endereço');
      return;
    }
    if (currentStep === 2 && !canProceedToStep3()) {
      toast.error('Adicione pelo menos um produto');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Função para validar CPF
  const validateCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // CPF deve ter 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  };

  // Função para verificar se CPF já existe no sistema
  const checkCpfExists = async (cpf: string): Promise<boolean> => {
    try {
      const cleanCpf = cpf.replace(/\D/g, '');
      const response = await api.users.getCustomers({ search: cleanCpf, limit: 1 });
      if (response && response.customers && response.customers.length > 0) {
        // Verifica se o CPF encontrado é exatamente o mesmo
        const foundCpf = response.customers[0].cpf?.replace(/\D/g, '');
        return foundCpf === cleanCpf;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Validar CPF quando o campo perde o foco
  const handleCpfBlur = async (cpf: string) => {
    setCpfError('');
    
    if (!cpf.trim()) return;
    
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Validar formato do CPF
    if (cleanCpf.length === 11) {
      if (!validateCPF(cleanCpf)) {
        setCpfError('CPF inválido');
        toast.error('CPF inválido');
        return;
      }
      
      // Verificar se já existe
      setIsValidatingCpf(true);
      try {
        const exists = await checkCpfExists(cpf);
        if (exists) {
          setCpfError('CPF já cadastrado no sistema');
          toast.error('Este CPF já está cadastrado. Use a busca para encontrar o cliente.');
        }
      } finally {
        setIsValidatingCpf(false);
      }
    }
  };
  
  // Parse product variations
  const getProductVariations = (product: Product) => {
    let colors: { name: string; code: string }[] = [];
    let storage: string[] = [];
    
    try {
      if (product.specifications) {
        const specs = typeof product.specifications === 'string' 
          ? JSON.parse(product.specifications) 
          : product.specifications;
        
        if (specs._isComplexSpecs) {
          colors = specs.colors || [];
          storage = specs.storage || [];
        }
      }
      
      // Also check direct properties
      if ((product as any).colors) {
        colors = (product as any).colors;
      }
      if ((product as any).storage) {
        storage = (product as any).storage;
      }
    } catch (e) {
      // No variations
    }
    
    return { colors, storage };
  };

  useEffect(() => {
    if (order && (mode === 'edit' || mode === 'view')) {
      // Handle both Order types - check if it's ApiOrder or CrudOrder
      const isApiOrder = 'userId' in order;
      
      if (isApiOrder) {
        // ApiOrder type
        const apiOrder = order as ApiOrder;
        const items = (apiOrder.items || apiOrder.orderItems || []).map(item => {
          let itemImage = '';
          if (item.product?.images) {
            try {
              const images = typeof item.product.images === 'string' 
                ? JSON.parse(item.product.images) 
                : item.product.images;
              if (Array.isArray(images)) {
                itemImage = images[0] || '';
              } else if (typeof images === 'object' && images !== null) {
                itemImage = (images as Record<string, string>).main || '';
              } else if (typeof images === 'string') {
                itemImage = images;
              }
            } catch {
              itemImage = typeof item.product.images === 'string' ? item.product.images : '';
            }
          }
          return {
            id: item.id,
            productId: item.productId,
            name: item.product?.name || 'Produto',
            image: itemImage,
            quantity: item.quantity,
            price: item.price
          };
        });
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setFormData({
          number: apiOrder.id,
          customer: {
            id: apiOrder.userId || '',
            name: apiOrder.user?.name || 'Cliente',
            email: apiOrder.user?.email || '',
            avatar: apiOrder.user?.image || ''
          },
          status: apiOrder.status.toLowerCase() as OrderStatus,
          saleType: 'online',
          paymentMethod: (apiOrder as any).paymentMethod || 'PIX',
          paymentStatus: (apiOrder as any).paymentStatus || 'PENDING',
          installments: (apiOrder as any).installments || 1,
          items,
          subtotal,
          shipping: (apiOrder as any).shipping || 0,
          discount: (apiOrder as any).discount || 0,
          total: apiOrder.total,
          shippingAddress: apiOrder.shippingAddress || {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          }
        });
      } else {
        // CrudOrder type
        const crudOrder = order as CrudOrder;
        const itemsSubtotal = crudOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setFormData({
          number: crudOrder.number,
          customer: {
            ...crudOrder.customer,
            avatar: crudOrder.customer.avatar || ''
          },
          status: crudOrder.status,
          saleType: (crudOrder as any).saleType || 'online',
          paymentMethod: (crudOrder as any).paymentMethod || 'PIX',
          paymentStatus: (crudOrder as any).paymentStatus || 'PENDING',
          installments: (crudOrder as any).installments || 1,
          items: crudOrder.items,
          subtotal: itemsSubtotal,
          shipping: (crudOrder as any).shipping || 0,
          discount: (crudOrder as any).discount || 0,
          total: crudOrder.total,
          shippingAddress: crudOrder.shippingAddress
        });
      }
    } else if (mode === 'create') {
      setFormData({
        number: `ORD-${Date.now()}`,
        customer: {
          id: '',
          name: '',
          email: '',
          avatar: ''
        },
        status: 'pending',
        saleType: 'online',
        paymentMethod: 'PIX',
        paymentStatus: 'PENDING',
        installments: 1,
        items: [],
        total: 0,
        subtotal: 0,
        shipping: 0,
        discount: 0,
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
    }
  }, [order, mode]);

  const handleSearchCustomer = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.users.getCustomers({ search: term, limit: 5 });
      if (response && response.customers) {
        setSearchResults(response.customers);
      } else {
        setSearchResults([]);
      }
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error);
      // Silent fail - just show no results
      setSearchResults([]);
      if (error.message?.includes('fetch')) {
        toast.error('Erro de conexão com o servidor');
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Create new customer
  const handleCreateCustomer = async () => {
    // Validation
    if (!newCustomerData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!newCustomerData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }
    if (!newCustomerData.cpf.trim()) {
      toast.error('CPF é obrigatório');
      return;
    }
    if (!newCustomerData.phone.trim()) {
      toast.error('Telefone é obrigatório');
      return;
    }

    // Validar CPF
    const cleanCpf = newCustomerData.cpf.replace(/\D/g, '');
    if (!validateCPF(cleanCpf)) {
      toast.error('CPF inválido');
      setCpfError('CPF inválido');
      return;
    }

    // Verificar se CPF já existe
    const cpfExists = await checkCpfExists(newCustomerData.cpf);
    if (cpfExists) {
      toast.error('Este CPF já está cadastrado no sistema');
      setCpfError('CPF já cadastrado');
      return;
    }

    setIsCreatingCustomer(true);
    try {
      // Generate a temporary password
      const tempPassword = `USS${Date.now().toString(36)}!`;
      
      const createdUser = await api.users.create({
        name: newCustomerData.name,
        email: newCustomerData.email,
        password: tempPassword,
        phone: newCustomerData.phone,
        cpf: newCustomerData.cpf,
        address: newCustomerData.address,
        city: newCustomerData.city,
        state: newCustomerData.state,
        zipCode: newCustomerData.zipCode,
        role: 'USER'
      });

      // Select the new customer
      setFormData(prev => ({
        ...prev,
        customer: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          avatar: ''
        },
        shippingAddress: {
          street: newCustomerData.address || '',
          city: newCustomerData.city || '',
          state: newCustomerData.state || '',
          zipCode: newCustomerData.zipCode || ''
        }
      }));

      // Reset form and close modal
      setNewCustomerData({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      });
      setShowCustomerModal(false);
      setSearchTerm('');
      setSearchResults([]);
      toast.success('Cliente criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      toast.error(error.message || 'Erro ao criar cliente');
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  // Search products by name, SKU, brand or category
  const handleSearchProduct = async (term: string) => {
    setProductSearchTerm(term);
    if (term.length < 2) {
      setProductSearchResults([]);
      return;
    }

    setIsSearchingProducts(true);
    try {
      const response = await api.products.getAll({ search: term, limit: 10 });
      if (response && response.data) {
        setProductSearchResults(response.data);
      } else {
        setProductSearchResults([]);
      }
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error);
      setProductSearchResults([]);
      if (error.message?.includes('fetch')) {
        toast.error('Erro de conexão com o servidor');
      }
    } finally {
      setIsSearchingProducts(false);
    }
  };

  // Add product to order
  const addProductToOrder = (product: Product, color?: string, storage?: string) => {
    // Get product image
    let imageUrl = '';
    try {
      if (product.images) {
        if (product.images.startsWith('[')) {
          const images = JSON.parse(product.images);
          imageUrl = images[0] || '';
        } else if (product.images.includes(',')) {
          imageUrl = product.images.split(',')[0].trim();
        } else {
          imageUrl = product.images;
        }
      }
    } catch (e) {
      imageUrl = product.images || '';
    }

    // Build variant name
    let variantName = product.name;
    const variantParts: string[] = [];
    if (color) variantParts.push(color);
    if (storage) variantParts.push(storage);
    if (variantParts.length > 0) {
      variantName = `${product.name} - ${variantParts.join(' / ')}`;
    }

    // Create unique key for variant
    const variantKey = `${product.id}-${color || ''}-${storage || ''}`;
    const existingItemIndex = formData.items.findIndex(item => 
      item.productId === product.id && 
      (item as any).variantKey === variantKey
    );

    if (existingItemIndex > -1) {
      // Update quantity if same variant already in order
      const newItems = [...formData.items];
      newItems[existingItemIndex].quantity += 1;
      const newSubtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setFormData(prev => ({ 
        ...prev, 
        items: newItems, 
        subtotal: newSubtotal,
        total: newSubtotal + prev.shipping - prev.discount 
      }));
    } else {
      // Add new product/variant
      const newItem = {
        id: `item-${Date.now()}`,
        productId: product.id,
        name: variantName,
        image: imageUrl,
        quantity: 1,
        price: product.discountPrice || product.price,
        variantKey,
        color: color || undefined,
        storage: storage || undefined
      };
      const newItems = [...formData.items, newItem];
      const newSubtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setFormData(prev => ({ 
        ...prev, 
        items: newItems, 
        subtotal: newSubtotal,
        total: newSubtotal + prev.shipping - prev.discount 
      }));
    }
    
    setProductSearchTerm('');
    setProductSearchResults([]);
    setSelectedProductForVariation(null);
    setSelectedColor('');
    setSelectedStorage('');
    toast.success(`${variantName} adicionado ao pedido`);
  };

  // Handle product selection - check for variations
  const handleProductSelect = (product: Product) => {
    const { colors, storage } = getProductVariations(product);
    
    if (colors.length > 0 || storage.length > 0) {
      // Product has variations, show selection
      setSelectedProductForVariation(product);
      setSelectedColor(colors.length > 0 ? colors[0].name : '');
      setSelectedStorage(storage.length > 0 ? storage[0] : '');
      setProductSearchTerm('');
      setProductSearchResults([]);
    } else {
      // No variations, add directly
      addProductToOrder(product);
    }
  };

  // Confirm adding product with variations
  const confirmAddProductWithVariations = () => {
    if (selectedProductForVariation) {
      addProductToOrder(selectedProductForVariation, selectedColor, selectedStorage);
    }
  };

  // Cancel variation selection
  const cancelVariationSelection = () => {
    setSelectedProductForVariation(null);
    setSelectedColor('');
    setSelectedStorage('');
  };

  // Update item quantity
  const updateItemQuantity = (index: number, delta: number) => {
    const newItems = [...formData.items];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    const newSubtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setFormData(prev => ({ 
      ...prev, 
      items: newItems, 
      subtotal: newSubtotal,
      total: newSubtotal + prev.shipping - prev.discount 
    }));
  };

  // Remove item from order
  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const newSubtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setFormData(prev => ({ 
      ...prev, 
      items: newItems, 
      subtotal: newSubtotal,
      total: newSubtotal + prev.shipping - prev.discount 
    }));
  };

  const selectCustomer = (customer: any) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        avatar: customer.image || ''
      },
      shippingAddress: {
        street: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || ''
      }
    }));
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
      setCurrentStep(1); // Reset step on close
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
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

  // Stepper Component
  const StepperHeader = () => (
    <div className="flex items-center justify-center gap-2 py-4 px-6 bg-gray-50 border-b">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        
        return (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isActive
                  ? 'bg-uss-admin text-white'
                  : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                isActive ? 'bg-white/20' : isCompleted ? 'bg-white/20' : 'bg-gray-300'
              }`}>
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{step.title}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 text-gray-400 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => { onClose(); setCurrentStep(1); }}>
      <DialogContent className="w-[75vw] max-w-[75vw] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-uss-admin text-white">
          <DialogTitle className="flex items-center gap-2 text-white text-lg">
            <Package className="h-5 w-5 text-blue-400" />
            {mode === 'create' && 'Criar Novo Pedido'}
            {mode === 'edit' && 'Editar Pedido'}
            {mode === 'view' && 'Detalhes do Pedido'}
          </DialogTitle>
        </DialogHeader>

        {/* Stepper for create mode */}
        {mode === 'create' && <StepperHeader />}

        <form onSubmit={handleSubmit} className="flex flex-1 overflow-hidden">
          {/* Content Area */}
          {mode === 'create' ? (
            // Stepper Content for Create Mode
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* Step 1: Customer Data */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-uss-admin flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Dados do Cliente</h3>
                          <p className="text-sm text-gray-500">Selecione ou cadastre um cliente</p>
                        </div>
                      </div>

                      {/* Sale Type */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, saleType: 'online' }))}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.saleType === 'online'
                              ? 'border-[uss-admin] bg-[uss-admin]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Package className={`w-6 h-6 mx-auto mb-2 ${formData.saleType === 'online' ? 'text-[uss-admin]' : 'text-gray-400'}`} />
                          <p className={`text-sm font-medium ${formData.saleType === 'online' ? 'text-[uss-admin]' : 'text-gray-600'}`}>Venda Online</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, saleType: 'presencial' }))}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.saleType === 'presencial'
                              ? 'border-[uss-admin] bg-[uss-admin]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <User className={`w-6 h-6 mx-auto mb-2 ${formData.saleType === 'presencial' ? 'text-[uss-admin]' : 'text-gray-400'}`} />
                          <p className={`text-sm font-medium ${formData.saleType === 'presencial' ? 'text-[uss-admin]' : 'text-gray-600'}`}>Venda Presencial</p>
                        </button>
                      </div>

                      {/* Customer Search */}
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-4">
                            <User className="h-5 w-5 text-gray-700" />
                            <h3 className="font-semibold text-gray-900">Informações do Cliente</h3>
                          </div>
                          
                          {!formData.customer.id && (
                            <div className="mb-4 relative">
                              <Label className="text-gray-900">Buscar Cliente</Label>
                              <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input 
                                  placeholder="Buscar por nome, CPF ou email..." 
                                  className="pl-9"
                                  value={searchTerm}
                                  onChange={(e) => handleSearchCustomer(e.target.value)}
                                />
                                {isSearching && (
                                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                                )}
                              </div>
                              {searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                  {searchResults.map(customer => (
                                    <div 
                                      key={customer.id}
                                      className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                                      onClick={() => selectCustomer(customer)}
                                    >
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={customer.image} />
                                        <AvatarFallback>{customer.name?.charAt(0) || '?'}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900">{customer.name || 'Sem nome'}</p>
                                        <p className="text-xs text-gray-500">{customer.email}</p>
                                        {customer.phone && (
                                          <p className="text-xs text-gray-400">{customer.phone}</p>
                                        )}
                                      </div>
                                      <Check className="w-4 h-4 text-gray-400" />
                                    </div>
                                  ))}
                                </div>
                              )}
                              {searchTerm.length >= 3 && searchResults.length === 0 && !isSearching && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center">
                                  <p className="text-gray-500 text-sm mb-3">Nenhum cliente encontrado</p>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      setNewCustomerData(prev => ({ ...prev, name: searchTerm }));
                                      setShowCustomerModal(true);
                                    }}
                                    className="bg-[uss-admin] hover:bg-[uss-admin]/90 text-white"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Criar Novo Cliente
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {formData.customer.id && (
                            <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={formData.customer.avatar} />
                                <AvatarFallback className="bg-green-600 text-white">
                                  {formData.customer.name ? formData.customer.name.split(' ').map(n => n[0]).join('') : '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{formData.customer.name}</p>
                                <p className="text-sm text-gray-600">{formData.customer.email}</p>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setFormData(prev => ({ ...prev, customer: { id: '', name: '', email: '', avatar: '' } }))}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remover
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Shipping Address */}
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-4">
                            <MapPin className="h-5 w-5 text-gray-700" />
                            <h3 className="font-semibold text-gray-900">Endereço de Entrega</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="zipCode" className="text-gray-900">CEP *</Label>
                              <Input
                                id="zipCode"
                                value={formData.shippingAddress.zipCode}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  let formatted = value;
                                  if (value.length > 5) formatted = value.slice(0, 5) + '-' + value.slice(5, 8);
                                  setFormData(prev => ({
                                    ...prev,
                                    shippingAddress: { ...prev.shippingAddress, zipCode: formatted }
                                  }));
                                }}
                                onBlur={async (e) => {
                                  const cep = e.target.value.replace(/\D/g, '');
                                  if (cep.length === 8) {
                                    try {
                                      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                                      const data = await response.json();
                                      if (!data.erro) {
                                        setFormData(prev => ({
                                          ...prev,
                                          shippingAddress: {
                                            ...prev.shippingAddress,
                                            street: data.logradouro || prev.shippingAddress.street,
                                            neighborhood: data.bairro || '',
                                            city: data.localidade || prev.shippingAddress.city,
                                            state: data.uf || prev.shippingAddress.state
                                          }
                                        }));
                                        toast.success('Endereço encontrado!');
                                      } else {
                                        toast.error('CEP não encontrado');
                                      }
                                    } catch (error) {
                                      console.error('Erro ao buscar CEP:', error);
                                    }
                                  }
                                }}
                                placeholder="00000-000"
                                maxLength={9}
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="street" className="text-gray-900">Logradouro *</Label>
                              <Input
                                id="street"
                                value={formData.shippingAddress.street}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  shippingAddress: { ...prev.shippingAddress, street: e.target.value }
                                }))}
                                placeholder="Rua, Avenida, etc."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="number" className="text-gray-900">Número</Label>
                              <Input
                                id="number"
                                value={(formData.shippingAddress as any).number || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  shippingAddress: { ...prev.shippingAddress, number: e.target.value }
                                }))}
                                placeholder="123"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="complement" className="text-gray-900">Complemento</Label>
                              <Input
                                id="complement"
                                value={(formData.shippingAddress as any).complement || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  shippingAddress: { ...prev.shippingAddress, complement: e.target.value }
                                }))}
                                placeholder="Apto, Bloco, etc."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="neighborhood" className="text-gray-900">Bairro</Label>
                              <Input
                                id="neighborhood"
                                value={(formData.shippingAddress as any).neighborhood || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  shippingAddress: { ...prev.shippingAddress, neighborhood: e.target.value }
                                }))}
                                placeholder="Bairro"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city" className="text-gray-900">Cidade *</Label>
                              <Input
                                id="city"
                                value={formData.shippingAddress.city}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                                }))}
                                placeholder="Cidade"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="state" className="text-gray-900">Estado *</Label>
                              <Input
                                id="state"
                                value={formData.shippingAddress.state}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                                }))}
                                placeholder="UF"
                                maxLength={2}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Step 2: Products */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[uss-admin] flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Produtos do Pedido</h3>
                          <p className="text-sm text-gray-500">Adicione os produtos ao pedido</p>
                        </div>
                      </div>

                      {/* Product Search */}
                      <Card>
                        <CardContent className="pt-6">
                          <div className="relative mb-4">
                            <Label className="text-gray-900 mb-2 block">Buscar Produto</Label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input 
                                placeholder="Buscar produto (nome, SKU, marca)..." 
                                className="pl-9"
                                value={productSearchTerm}
                                onChange={(e) => handleSearchProduct(e.target.value)}
                              />
                              {isSearchingProducts && (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                              )}
                            </div>
                            {productSearchResults.length > 0 && (
                              <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                {productSearchResults.map(product => {
                                  let imageUrl = '';
                                  try {
                                    if (product.images) {
                                      if (product.images.startsWith('[')) {
                                        const images = JSON.parse(product.images);
                                        imageUrl = images[0] || '';
                                      } else if (product.images.includes(',')) {
                                        imageUrl = product.images.split(',')[0].trim();
                                      } else {
                                        imageUrl = product.images;
                                      }
                                    }
                                  } catch (e) {
                                    imageUrl = product.images || '';
                                  }
                                  
                                  return (
                                    <div 
                                      key={product.id}
                                      className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                                      onClick={() => handleProductSelect(product)}
                                    >
                                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                        {imageUrl ? (
                                          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-5 h-5 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <span>{product.category?.name || 'Sem categoria'}</span>
                                          <span>•</span>
                                          <span className="font-medium text-blue-600">{formatCurrency(product.discountPrice || product.price)}</span>
                                        </div>
                                      </div>
                                      <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Variation Selection Panel */}
                            {selectedProductForVariation && (
                              <div className="absolute z-30 w-full mt-1 bg-white border rounded-lg shadow-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-sm text-gray-900">Selecionar Variação</h4>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={cancelVariationSelection}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                                  <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                    {(() => {
                                      let imgUrl = '';
                                      try {
                                        if (selectedProductForVariation.images) {
                                          if (selectedProductForVariation.images.startsWith('[')) {
                                            imgUrl = JSON.parse(selectedProductForVariation.images)[0] || '';
                                          } else {
                                            imgUrl = selectedProductForVariation.images.split(',')[0].trim();
                                          }
                                        }
                                      } catch { }
                                      return imgUrl ? (
                                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Package className="w-5 h-5 text-gray-400" />
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm text-gray-900">{selectedProductForVariation.name}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(selectedProductForVariation.discountPrice || selectedProductForVariation.price)}</p>
                                  </div>
                                </div>
                                
                                {/* Color Selection */}
                                {(() => {
                                  const { colors, storage } = getProductVariations(selectedProductForVariation);
                                  return (
                                    <>
                                      {colors.length > 0 && (
                                        <div className="mb-3">
                                          <Label className="text-gray-900 text-xs mb-2 block">Cor</Label>
                                          <div className="flex flex-wrap gap-2">
                                            {colors.map((color: any) => (
                                              <button
                                                key={color.name}
                                                type="button"
                                                onClick={() => setSelectedColor(color.name)}
                                                className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs ${
                                                  selectedColor === color.name 
                                                    ? 'border-[uss-admin] bg-[uss-admin]/5' 
                                                    : 'border-gray-200'
                                                }`}
                                              >
                                                <span 
                                                  className="w-3 h-3 rounded-full border"
                                                  style={{ backgroundColor: color.code || '#ccc' }}
                                                />
                                                {color.name}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {storage.length > 0 && (
                                        <div className="mb-3">
                                          <Label className="text-gray-900 text-xs mb-2 block">Armazenamento</Label>
                                          <div className="flex flex-wrap gap-2">
                                            {storage.map((s: string) => (
                                              <button
                                                key={s}
                                                type="button"
                                                onClick={() => setSelectedStorage(s)}
                                                className={`px-3 py-1 rounded-full border text-xs ${
                                                  selectedStorage === s 
                                                    ? 'border-[uss-admin] bg-[uss-admin]/5 text-[uss-admin]' 
                                                    : 'border-gray-200 text-gray-600'
                                                }`}
                                              >
                                                {s}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                                
                                <Button
                                  type="button"
                                  className="w-full bg-[uss-admin] hover:bg-[uss-admin]/90"
                                  onClick={confirmAddProductWithVariations}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Adicionar ao Pedido
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Order Items List */}
                          <div className="space-y-3">
                            {formData.items.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Nenhum produto adicionado</p>
                                <p className="text-sm">Use a busca acima para adicionar produtos</p>
                              </div>
                            ) : (
                              formData.items.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                                  <div className="w-14 h-14 rounded-lg bg-white border overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-300" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                                    {(item.selectedColor || item.selectedStorage) && (
                                      <div className="flex gap-1 mt-0.5">
                                        {item.selectedColor && (
                                          <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">{item.selectedColor}</span>
                                        )}
                                        {item.selectedStorage && (
                                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{item.selectedStorage}</span>
                                        )}
                                      </div>
                                    )}
                                    <p className="text-sm text-gray-600 mt-1">{formatCurrency(item.price)}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => updateItemQuantity(index, -1)}
                                      className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateItemQuantity(index, 1)}
                                      className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="text-right min-w-[80px]">
                                    <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Order Summary */}
                      {formData.items.length > 0 && (
                        <Card>
                          <CardContent className="pt-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Resumo do Pedido</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal ({formData.items.length} {formData.items.length === 1 ? 'item' : 'itens'})</span>
                                <span className="text-gray-900">{formatCurrency(formData.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Frete</span>
                                <Input
                                  type="number"
                                  value={formData.shipping}
                                  onChange={(e) => {
                                    const shipping = parseFloat(e.target.value) || 0;
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      shipping,
                                      total: prev.subtotal + shipping - prev.discount
                                    }));
                                  }}
                                  className="w-24 h-7 text-right text-sm"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Desconto</span>
                                <Input
                                  type="number"
                                  value={formData.discount}
                                  onChange={(e) => {
                                    const discount = parseFloat(e.target.value) || 0;
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      discount,
                                      total: prev.subtotal + prev.shipping - discount
                                    }));
                                  }}
                                  className="w-24 h-7 text-right text-sm"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span className="text-gray-900">Total</span>
                                <span className="text-[uss-admin]">{formatCurrency(formData.total)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Payment */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[uss-admin] flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Forma de Pagamento</h3>
                          <p className="text-sm text-gray-500">Selecione o método de pagamento</p>
                        </div>
                      </div>

                      <Card>
                        <CardContent className="pt-6">
                          {/* Payment Method Selection */}
                          <div className="mb-6">
                            <Label className="text-gray-900 mb-3 block">Método de Pagamento</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {paymentMethods.map((method) => {
                                const IconComponent = method.icon;
                                return (
                                  <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ 
                                      ...prev, 
                                      paymentMethod: method.value as any,
                                      installments: method.value === 'CREDIT_CARD' ? prev.installments : 1
                                    }))}
                                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                                      formData.paymentMethod === method.value
                                        ? 'border-[uss-admin] bg-[uss-admin]/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <IconComponent className={`h-6 w-6 mb-2 ${
                                      formData.paymentMethod === method.value ? 'text-[uss-admin]' : 'text-gray-500'
                                    }`} />
                                    <span className={`text-sm font-medium ${
                                      formData.paymentMethod === method.value ? 'text-[uss-admin]' : 'text-gray-600'
                                    }`}>
                                      {method.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Installments (only for credit card) */}
                          {formData.paymentMethod === 'CREDIT_CARD' && (
                            <div className="mb-6">
                              <Label className="text-gray-900 mb-2 block">Parcelas</Label>
                              <Select
                                value={formData.installments.toString()}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, installments: parseInt(value) }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                    <SelectItem key={n} value={n.toString()}>
                                      {n}x de {formatCurrency(formData.total / n)}
                                      {n === 1 ? ' à vista' : ''}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Payment Status */}
                          <div className="mb-6">
                            <Label className="text-gray-900 mb-2 block">Status do Pagamento</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {paymentStatusOptions.map(option => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, paymentStatus: option.value as any }))}
                                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                    formData.paymentStatus === option.value
                                      ? 'border-[uss-admin] bg-[uss-admin]/5 text-[uss-admin]'
                                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${option.color}`} />
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Final Order Summary */}
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Resumo Final do Pedido</h4>
                          
                          {/* Customer */}
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-[uss-admin] text-white">
                                {formData.customer.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm text-gray-900">{formData.customer.name}</p>
                              <p className="text-xs text-gray-500">{formData.customer.email}</p>
                            </div>
                          </div>
                          
                          {/* Items Count */}
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg mb-3">
                            <span className="text-sm text-gray-600">{formData.items.length} {formData.items.length === 1 ? 'produto' : 'produtos'}</span>
                            <span className="text-sm font-medium text-gray-900">{formatCurrency(formData.subtotal)}</span>
                          </div>
                          
                          {/* Totals */}
                          <div className="space-y-2 pt-3 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="text-gray-900">{formatCurrency(formData.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Frete</span>
                              <span className="text-gray-900">{formatCurrency(formData.shipping)}</span>
                            </div>
                            {formData.discount > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Desconto</span>
                                <span className="text-green-600">-{formatCurrency(formData.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                              <span className="text-gray-900">Total</span>
                              <span className="text-[uss-admin]">{formatCurrency(formData.total)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Stepper Navigation */}
              <div className="border-t bg-white px-6 py-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </Button>
                
                <div className="flex items-center gap-2">
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentStep >= step.number ? 'bg-[uss-admin]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="gap-2 bg-[uss-admin] hover:bg-[uss-admin]/90"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading || !canSubmit()}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Finalizar Pedido
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Original Layout for Edit/View Mode
            <>
              {/* Left Side - Customer & Info */}
              <div className="flex-[2] overflow-y-auto p-6 border-r space-y-5 bg-white">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number" className="text-gray-900">Número do Pedido</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                      disabled={mode === 'view'}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-black">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as OrderStatus }))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className="text-black">
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

                  <div className="space-y-2">
                    <Label htmlFor="saleType" className="text-black">Tipo de Venda</Label>
                    <Select
                      value={formData.saleType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, saleType: value as 'online' | 'presencial' }))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className="text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="presencial">Presencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

            {/* Customer Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-5 w-5 text-gray-700" />
                  <h3 className="font-semibold text-black">Informações do Cliente</h3>
                </div>
                
                {!formData.customer.id && (
                  <div className="mb-4 relative">
                    <Label className="text-black">Buscar Cliente</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por nome, CPF ou email..."
                        className="pl-9 text-black"
                        value={searchTerm}
                        onChange={(e) => handleSearchCustomer(e.target.value)}
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {searchResults.map(customer => (
                          <div
                            key={customer.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                            onClick={() => selectCustomer(customer)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={customer.image} />
                              <AvatarFallback>{customer.name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-black">{customer.name || 'Sem nome'}</p>
                              <p className="text-xs text-gray-500">{customer.email}</p>
                              {customer.phone && (
                                <p className="text-xs text-gray-400">{customer.phone}</p>
                              )}
                            </div>
                            <Check className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    )}
                    {searchTerm.length >= 3 && searchResults.length === 0 && !isSearching && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center">
                        <p className="text-gray-500 text-sm mb-3">Nenhum cliente encontrado</p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setNewCustomerData(prev => ({ ...prev, name: searchTerm }));
                            setShowCustomerModal(true);
                          }}
                          className="bg-[uss-admin] hover:bg-[uss-admin]/90 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Novo Cliente
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <Avatar>
                    <AvatarImage src={formData.customer.avatar} />
                    <AvatarFallback>
                      {formData.customer.name ? formData.customer.name.split(' ').map(n => n[0]).join('') : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Nome</Label>
                      <div className="flex gap-2">
                        <Input
                          id="customerName"
                          value={formData.customer.name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            customer: { ...prev.customer, name: e.target.value }
                          }))}
                          disabled={mode === 'view'}
                          required
                        />
                        {mode === 'edit' && formData.customer.id && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setFormData(prev => ({ ...prev, customer: { id: '', name: '', email: '', avatar: '' } }))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customer.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          customer: { ...prev.customer, email: e.target.value }
                        }))}
                        disabled={mode === 'view'}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-gray-700" />
                  <h3 className="font-semibold text-black">Endereço de Entrega</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street" className="text-black">Endereço</Label>
                    <Input
                      id="street"
                      value={formData.shippingAddress.street}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, street: e.target.value }
                      }))}
                      disabled={mode === 'view'}
                      required
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-black">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.shippingAddress.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                      }))}
                      disabled={mode === 'view'}
                      required
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-black">Estado</Label>
                    <Input
                      id="state"
                      value={formData.shippingAddress.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                      }))}
                      disabled={mode === 'view'}
                      required
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-black">CEP</Label>
                    <Input
                      id="zipCode"
                      value={formData.shippingAddress.zipCode}
                      onChange={(e) => {
                        // Format CEP: 00000-000
                        const value = e.target.value.replace(/\D/g, '');
                        let formatted = value;
                        if (value.length > 5) formatted = value.slice(0, 5) + '-' + value.slice(5, 8);
                        setFormData(prev => ({
                          ...prev,
                          shippingAddress: { ...prev.shippingAddress, zipCode: formatted }
                        }));
                      }}
                      onBlur={async (e) => {
                        const cep = e.target.value.replace(/\D/g, '');
                        if (cep.length === 8) {
                          try {
                            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                            const data = await response.json();
                            if (!data.erro) {
                              setFormData(prev => ({
                                ...prev,
                                shippingAddress: {
                                  ...prev.shippingAddress,
                                  street: data.logradouro || prev.shippingAddress.street,
                                  city: data.localidade || prev.shippingAddress.city,
                                  state: data.uf || prev.shippingAddress.state
                                }
                              }));
                              toast.success('Endereço encontrado!');
                            } else {
                              toast.error('CEP não encontrado');
                            }
                          } catch (error) {
                            console.error('Erro ao buscar CEP:', error);
                            toast.error('Erro ao buscar CEP');
                          }
                        }
                      }}
                      disabled={mode === 'view'}
                      placeholder="00000-000"
                      maxLength={9}
                      required
                      className="text-black"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-5 w-5 text-gray-700" />
                  <h3 className="font-semibold text-black">Forma de Pagamento</h3>
                </div>
                
                {/* Payment Method Selection */}
                <div className="mb-4">
                  <Label className="text-black mb-3 block">Método de Pagamento</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <button
                          key={method.value}
                          type="button"
                          disabled={mode === 'view'}
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            paymentMethod: method.value as any,
                            installments: method.value === 'CREDIT_CARD' ? prev.installments : 1
                          }))}
                          className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                            formData.paymentMethod === method.value
                              ? 'border-[uss-admin] bg-[uss-admin]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${mode === 'view' ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <IconComponent className={`h-5 w-5 mb-1 ${
                            formData.paymentMethod === method.value ? 'text-[uss-admin]' : 'text-gray-500'
                          }`} />
                          <span className={`text-xs font-medium ${
                            formData.paymentMethod === method.value ? 'text-[uss-admin]' : 'text-gray-600'
                          }`}>
                            {method.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Installments (only for credit card) */}
                {formData.paymentMethod === 'CREDIT_CARD' && (
                  <div className="mb-4">
                    <Label className="text-black mb-2 block">Parcelas</Label>
                    <Select
                      value={formData.installments.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, installments: parseInt(value) }))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className="text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                          <SelectItem key={n} value={n.toString()}>
                            {n}x de {formatCurrency(formData.total / n)}
                            {n === 1 ? ' à vista' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Payment Status */}
                <div>
                  <Label className="text-black mb-2 block">Status do Pagamento</Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentStatus: value as any }))}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger className="text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatusOptions.map(option => (
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
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Products & Totals */}
          <div className="flex-1 max-w-[380px] flex flex-col bg-gray-50 h-full border-l">
            <div className="px-4 py-3 border-b bg-[uss-admin]">
              <h3 className="font-semibold flex items-center gap-2 text-white">
                <Package className="h-4 w-4 text-blue-400" />
                Itens do Pedido
              </h3>
            </div>

            {/* Product Search */}
            {mode !== 'view' && (
              <div className="p-3 border-b bg-white relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Buscar produto (nome, SKU, marca)..." 
                    className="pl-9 text-black h-9 text-sm"
                    value={productSearchTerm}
                    onChange={(e) => handleSearchProduct(e.target.value)}
                  />
                  {isSearchingProducts && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                {productSearchResults.length > 0 && (
                  <div className="absolute z-20 left-3 right-3 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {productSearchResults.map(product => {
                      let imageUrl = '';
                      try {
                        if (product.images) {
                          if (product.images.startsWith('[')) {
                            const images = JSON.parse(product.images);
                            imageUrl = images[0] || '';
                          } else if (product.images.includes(',')) {
                            imageUrl = product.images.split(',')[0].trim();
                          } else {
                            imageUrl = product.images;
                          }
                        }
                      } catch (e) {
                        imageUrl = product.images || '';
                      }
                      
                      return (
                        <div 
                          key={product.id}
                          className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 border-b last:border-0"
                          onClick={() => handleProductSelect(product)}
                        >
                          <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                            {imageUrl ? (
                              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-black truncate">{product.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{product.category?.name || 'Sem categoria'}</span>
                              <span>•</span>
                              <span className="font-medium text-blue-600">{formatCurrency(product.discountPrice || product.price)}</span>
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Variation Selection Panel */}
                {selectedProductForVariation && (
                  <div className="absolute z-30 left-3 right-3 mt-1 bg-white border rounded-lg shadow-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm text-black">Selecionar Variação</h4>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={cancelVariationSelection}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {(() => {
                          let imgUrl = '';
                          try {
                            if (selectedProductForVariation.images) {
                              if (selectedProductForVariation.images.startsWith('[')) {
                                imgUrl = JSON.parse(selectedProductForVariation.images)[0] || '';
                              } else {
                                imgUrl = selectedProductForVariation.images.split(',')[0].trim();
                              }
                            }
                          } catch (e) {}
                          return imgUrl ? (
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          );
                        })()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-black">{selectedProductForVariation.name}</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {formatCurrency(selectedProductForVariation.discountPrice || selectedProductForVariation.price)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Color Selection */}
                      {(() => {
                        const { colors } = getProductVariations(selectedProductForVariation);
                        if (colors.length === 0) return null;
                        return (
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">Cor</Label>
                            <div className="flex flex-wrap gap-2">
                              {colors.map((color: any) => (
                                <button
                                  key={color.name}
                                  type="button"
                                  onClick={() => setSelectedColor(color.name)}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                                    selectedColor === color.name 
                                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                  }`}
                                >
                                  {color.code && (
                                    <span 
                                      className="w-3 h-3 rounded-full border border-gray-300" 
                                      style={{ backgroundColor: color.code }}
                                    />
                                  )}
                                  {color.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Storage Selection */}
                      {(() => {
                        const { storage } = getProductVariations(selectedProductForVariation);
                        if (storage.length === 0) return null;
                        return (
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">Armazenamento</Label>
                            <div className="flex flex-wrap gap-2">
                              {storage.map((size: string) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => setSelectedStorage(size)}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                    selectedStorage === size 
                                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={cancelVariationSelection}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={confirmAddProductWithVariations}
                        className="flex-1 bg-[uss-admin] hover:bg-blue-900 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {formData.items.length > 0 ? (
                formData.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-white border rounded-lg shadow-sm">
                    <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-black truncate" title={item.name}>{item.name}</p>
                      {/* Show variation badges */}
                      {((item as any).color || (item as any).storage) && (
                        <div className="flex gap-1 mt-0.5">
                          {(item as any).color && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">
                              {(item as any).color}
                            </span>
                          )}
                          {(item as any).storage && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600">
                              {(item as any).storage}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">{formatCurrency(item.price)} cada</p>
                      <div className="flex items-center justify-between mt-1">
                        {mode !== 'view' ? (
                          <div className="flex items-center gap-1">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => updateItemQuantity(index, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => updateItemQuantity(index, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 ml-1"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">Qtd: {item.quantity}</span>
                        )}
                        <p className="font-semibold text-sm text-blue-600">
                          {formatCurrency(item.quantity * item.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nenhum item adicionado</p>
                  {mode !== 'view' && (
                    <p className="text-xs mt-1">Busque produtos acima</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-white space-y-4">
              {/* Shipping and Discount inputs */}
              {mode !== 'view' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">Frete</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.shipping}
                      onChange={(e) => {
                        const shipping = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({
                          ...prev,
                          shipping,
                          total: prev.subtotal + shipping - prev.discount
                        }));
                      }}
                      className="h-8 text-sm"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Desconto</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => {
                        const discount = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({
                          ...prev,
                          discount,
                          total: prev.subtotal + prev.shipping - discount
                        }));
                      }}
                      className="h-8 text-sm"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({formData.items.reduce((sum, i) => sum + i.quantity, 0)} itens)</span>
                  <span className="text-black">{formatCurrency(formData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frete</span>
                  <span className="text-black">{formatCurrency(formData.shipping)}</span>
                </div>
                {formData.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Desconto</span>
                    <span className="text-green-600">-{formatCurrency(formData.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-bold text-black">Total</span>
                  <span className="text-xl font-bold text-[uss-admin]">
                    {formatCurrency(formData.total)}
                  </span>
                </div>
                {formData.paymentMethod === 'CREDIT_CARD' && formData.installments > 1 && (
                  <div className="text-xs text-center text-gray-500">
                    {formData.installments}x de {formatCurrency(formData.total / formData.installments)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" onClick={onClose} className="w-full">
                  Cancelar
                </Button>
                {mode !== 'view' && (
                  <Button type="submit" disabled={loading} className="w-full bg-[uss-admin] hover:bg-blue-900 text-white">
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                )}
              </div>
            </div>
          </div>
            </>
          )}
        </form>
      </DialogContent>

      {/* Modal de Criação de Cliente */}
      <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
        <DialogContent className="w-[600px] max-w-[600px] p-0 gap-0 bg-white">
          <DialogHeader className="px-6 py-4 border-b bg-[uss-admin] text-white">
            <DialogTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5 text-blue-400" />
              Criar Novo Cliente
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-black font-medium">Nome Completo *</Label>
                <Input
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do cliente"
                  className="text-black"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-black font-medium">Email *</Label>
                <Input
                  type="email"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="text-black"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-black font-medium">CPF *</Label>
                <div className="relative">
                  <Input
                    value={newCustomerData.cpf}
                    onChange={(e) => {
                      // Limpar erro ao digitar
                      setCpfError('');
                      // Format CPF: 000.000.000-00
                      const value = e.target.value.replace(/\D/g, '');
                      let formatted = value;
                      if (value.length > 3) formatted = value.slice(0, 3) + '.' + value.slice(3);
                      if (value.length > 6) formatted = formatted.slice(0, 7) + '.' + formatted.slice(7);
                      if (value.length > 9) formatted = formatted.slice(0, 11) + '-' + formatted.slice(11, 13);
                      setNewCustomerData(prev => ({ ...prev, cpf: formatted }));
                    }}
                    onBlur={(e) => handleCpfBlur(e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`text-black ${cpfError ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {isValidatingCpf && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                {cpfError && (
                  <p className="text-xs text-red-500 mt-1">{cpfError}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-black font-medium">Telefone *</Label>
                <Input
                  value={newCustomerData.phone}
                  onChange={(e) => {
                    // Format phone: (00) 00000-0000
                    const value = e.target.value.replace(/\D/g, '');
                    let formatted = value;
                    if (value.length > 0) formatted = '(' + value.slice(0, 2);
                    if (value.length > 2) formatted += ') ' + value.slice(2, 7);
                    if (value.length > 7) formatted += '-' + value.slice(7, 11);
                    setNewCustomerData(prev => ({ ...prev, phone: formatted }));
                  }}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="text-black"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-black font-medium">CEP</Label>
                <Input
                  value={newCustomerData.zipCode}
                  onChange={(e) => {
                    // Format CEP: 00000-000
                    const value = e.target.value.replace(/\D/g, '');
                    let formatted = value;
                    if (value.length > 5) formatted = value.slice(0, 5) + '-' + value.slice(5, 8);
                    setNewCustomerData(prev => ({ ...prev, zipCode: formatted }));
                  }}
                  onBlur={async (e) => {
                    const cep = e.target.value.replace(/\D/g, '');
                    if (cep.length === 8) {
                      try {
                        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                        const data = await response.json();
                        if (!data.erro) {
                          setNewCustomerData(prev => ({
                            ...prev,
                            address: data.logradouro || prev.address,
                            city: data.localidade || prev.city,
                            state: data.uf || prev.state
                          }));
                          toast.success('Endereço encontrado!');
                        } else {
                          toast.error('CEP não encontrado');
                        }
                      } catch (error) {
                        console.error('Erro ao buscar CEP:', error);
                        toast.error('Erro ao buscar CEP');
                      }
                    }
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  className="text-black"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label className="text-black font-medium">Endereço</Label>
                <Input
                  value={newCustomerData.address}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua, número, complemento"
                  className="text-black"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-black font-medium">Cidade</Label>
                <Input
                  value={newCustomerData.city}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Cidade"
                  className="text-black"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-black font-medium">Estado</Label>
                <Select
                  value={newCustomerData.state}
                  onValueChange={(value) => setNewCustomerData(prev => ({ ...prev, state: value }))}
                >
                  <SelectTrigger className="text-black">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              * Campos obrigatórios. Uma senha temporária será gerada automaticamente.
            </p>
          </div>
          
          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCustomerModal(false);
                setCpfError('');
                setNewCustomerData({
                  name: '',
                  email: '',
                  cpf: '',
                  phone: '',
                  address: '',
                  city: '',
                  state: '',
                  zipCode: ''
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateCustomer}
              disabled={isCreatingCustomer || !!cpfError}
              className="bg-[uss-admin] hover:bg-[uss-admin]/90 text-white"
            >
              {isCreatingCustomer ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Criar Cliente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}


