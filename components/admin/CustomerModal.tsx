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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Star, Calendar, ShoppingBag, ChevronRight, ChevronLeft, Check, Lock, SkipForward, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/hooks/use-admin-crud';
import { api, Order } from '@/services/api';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> | Partial<Customer>) => Promise<void>;
  mode: 'create' | 'edit' | 'view';
}

const STEPS = [
  { id: 1, title: 'Dados Pessoais', icon: User },
  { id: 2, title: 'Endereço', icon: MapPin },
  { id: 3, title: 'Configurações', icon: Star },
];

export function CustomerModal({ isOpen, onClose, customer, onSave, mode }: CustomerModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    role: 'USER' as 'USER' | 'ADMIN',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    },
    totalOrders: 0,
    totalSpent: 0,
    isVip: false,
    lastOrderDate: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (customer && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        avatar: customer.avatar || '',
        role: (customer as any).role || 'USER',
        address: customer.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Brasil'
        },
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        isVip: customer.isVip,
        lastOrderDate: customer.lastOrderDate || '',
        password: ''
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        email: '',
        phone: '',
        avatar: '',
        role: 'USER',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Brasil'
        },
        totalOrders: 0,
        totalSpent: 0,
        isVip: false,
        lastOrderDate: '',
        password: ''
      });
      setCurrentStep(1);
    }
  }, [customer, mode, isOpen]);

  useEffect(() => {
    if (customer?.id && (mode === 'edit' || mode === 'view')) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const response = await api.users.getUserOrders(customer.id, { limit: 5 });
          setOrders(response.orders || []);
        } catch (error) {
          console.error('Erro ao buscar pedidos:', error);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [customer, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: data.logradouro,
              city: data.localidade,
              state: data.uf,
              zipCode: cep
            }
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.name && formData.email && (mode !== 'create' || formData.password);
    }
    return true;
  };

  // Para modo view/edit, mostrar tudo em uma única view
  const isStepMode = mode === 'create';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header Compacto */}
        <DialogHeader className="px-4 py-3 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <DialogTitle className="flex items-center gap-2 text-white text-sm font-semibold">
            <User className="h-4 w-4" />
            {mode === 'create' && 'Novo Cliente'}
            {mode === 'edit' && 'Editar Cliente'}
            {mode === 'view' && 'Detalhes do Cliente'}
          </DialogTitle>
        </DialogHeader>

        {/* Steps Indicator - apenas para create */}
        {isStepMode && (
          <div className="px-4 py-2 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-1.5 ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      currentStep > step.id 
                        ? 'bg-blue-600 text-white' 
                        : currentStep === step.id 
                          ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' 
                          : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.id ? <Check className="w-3 h-3" /> : step.id}
                    </div>
                    <span className="text-[10px] font-medium hidden sm:inline">{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Dados Pessoais */}
              {(isStepMode ? currentStep === 1 : true) && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: isStepMode ? 20 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {!isStepMode && (
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <User className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-semibold text-gray-700 uppercase">Dados Pessoais</h3>
                    </div>
                  )}
                  
                  {/* Avatar + Nome na mesma linha */}
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 shrink-0">
                      <AvatarImage src={formData.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {formData.name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'US'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label htmlFor="name" className="text-[10px] text-gray-600 uppercase">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={mode === 'view'}
                          required
                          className="h-8 text-sm"
                          placeholder="João Silva"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="email" className="text-[10px] text-gray-600 uppercase">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={mode === 'view'}
                          required
                          className="h-8 text-sm pl-8"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-[10px] text-gray-600 uppercase">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={mode === 'view'}
                          className="h-8 text-sm pl-8"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                  </div>

                  {mode === 'create' && (
                    <div>
                      <Label htmlFor="password" className="text-[10px] text-gray-600 uppercase">Senha *</Label>
                      <div className="relative">
                        <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          required
                          minLength={6}
                          className="h-8 text-sm pl-8"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Endereço */}
              {(isStepMode ? currentStep === 2 : true) && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: isStepMode ? 20 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {!isStepMode && (
                    <div className="flex items-center gap-2 pb-2 border-b mt-4">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-semibold text-gray-700 uppercase">Endereço</h3>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="zipCode" className="text-[10px] text-gray-600 uppercase">CEP</Label>
                    <Input
                      id="zipCode"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, zipCode: e.target.value }
                      }))}
                      onBlur={handleCepBlur}
                      disabled={mode === 'view'}
                      className="h-8 text-sm"
                      placeholder="01234-567"
                    />
                    <p className="text-[9px] text-gray-400 mt-0.5">Digite o CEP para preencher automaticamente</p>
                  </div>

                  <div>
                    <Label htmlFor="street" className="text-[10px] text-gray-600 uppercase">Endereço Completo</Label>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      disabled={mode === 'view'}
                      className="h-8 text-sm"
                      placeholder="Rua, número, complemento"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="city" className="text-[10px] text-gray-600 uppercase">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.address.city}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        disabled={mode === 'view'}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-[10px] text-gray-600 uppercase">Estado</Label>
                      <Input
                        id="state"
                        value={formData.address.state}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, state: e.target.value }
                        }))}
                        disabled={mode === 'view'}
                        className="h-8 text-sm"
                        placeholder="SP"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Configurações */}
              {(isStepMode ? currentStep === 3 : true) && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: isStepMode ? 20 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {!isStepMode && (
                    <div className="flex items-center gap-2 pb-2 border-b mt-4">
                      <Star className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-semibold text-gray-700 uppercase">Configurações</h3>
                    </div>
                  )}

                  {/* Role Selector */}
                  <div className="space-y-1">
                    <Label className="text-[10px] text-gray-600 uppercase flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Tipo de Usuário
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: 'USER' | 'ADMIN') => setFormData(prev => ({ ...prev, role: value }))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-blue-500" />
                            <span>Cliente (Padrão)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3 text-red-500" />
                            <span>Administrador</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.role === 'ADMIN' && (
                      <p className="text-[9px] text-red-500 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Administradores têm acesso total ao sistema
                      </p>
                    )}
                  </div>

                  {/* VIP Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <Star className={`h-4 w-4 ${formData.isVip ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cliente VIP</p>
                        <p className="text-[10px] text-gray-500">Benefícios exclusivos</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.isVip}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVip: checked }))}
                      disabled={mode === 'view'}
                    />
                  </div>

                  {/* Stats - apenas view */}
                  {mode === 'view' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">{formData.totalOrders}</p>
                        <p className="text-[9px] text-gray-500">Pedidos</p>
                      </div>
                      <div className="text-center p-2 bg-emerald-50 rounded-lg">
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(formData.totalSpent)}</p>
                        <p className="text-[9px] text-gray-500">Total Gasto</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <p className="text-sm font-bold text-purple-600">{formatDate(formData.lastOrderDate)}</p>
                        <p className="text-[9px] text-gray-500">Último Pedido</p>
                      </div>
                    </div>
                  )}

                  {/* Recent Orders - apenas view */}
                  {mode === 'view' && orders.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-600 uppercase font-semibold">Pedidos Recentes</p>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {orders.slice(0, 3).map(order => (
                          <div key={order.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-3 h-3 text-blue-500" />
                              <span className="text-gray-600">#{order.id.slice(0, 8)}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isStepMode && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">Tudo pronto!</p>
                      </div>
                      <p className="text-[10px] text-blue-700 mt-1">
                        Clique em "Criar Cliente" para finalizar o cadastro.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer com navegação */}
          <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
            {isStepMode ? (
              <>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={currentStep === 1 ? onClose : prevStep}
                  className="text-xs"
                >
                  <ChevronLeft className="w-3 h-3 mr-1" />
                  {currentStep === 1 ? 'Cancelar' : 'Voltar'}
                </Button>
                
                <div className="flex items-center gap-2">
                  {currentStep === 2 && (
                    <Button 
                      type="button" 
                      variant="outline"
                      size="sm"
                      onClick={nextStep}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      <SkipForward className="w-3 h-3 mr-1" />
                      Pular
                    </Button>
                  )}
                  
                  {currentStep < 3 ? (
                    <Button 
                      type="button" 
                      size="sm"
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      Próximo
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={loading}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                      {loading ? 'Criando...' : 'Criar Cliente'}
                      <Check className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
                  {mode === 'view' ? 'Fechar' : 'Cancelar'}
                </Button>
                {mode !== 'view' && (
                  <Button type="submit" size="sm" disabled={loading} className="text-xs bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                )}
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

