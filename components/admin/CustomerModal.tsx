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
import { User, Mail, Phone, MapPin, Star, Calendar, ShoppingBag } from 'lucide-react';
import { Customer } from '@/hooks/use-admin-crud';
import { api, Order } from '@/services/api';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> | Partial<Customer>) => Promise<void>;
  mode: 'create' | 'edit' | 'view';
}

export function CustomerModal({ isOpen, onClose, customer, onSave, mode }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
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
    }
  }, [customer, mode]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[75vw] max-w-[75vw] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-[#001941] text-white">
          <DialogTitle className="flex items-center gap-2 text-white text-lg">
            <User className="h-5 w-5 text-blue-400" />
            {mode === 'create' && 'Criar Novo Cliente'}
            {mode === 'edit' && 'Editar Cliente'}
            {mode === 'view' && 'Detalhes do Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {/* Informações básicas */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback>
                    {formData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-black">Nome Completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={mode === 'view'}
                        required
                        className="text-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-black">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={mode === 'view'}
                        required
                        className="text-black"
                      />
                    </div>
                    {mode === 'create' && (
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-black">Senha</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="********"
                          required
                          minLength={6}
                          className="text-black"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-black">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={mode === 'view'}
                        placeholder="+55 11 99999-9999"
                        className="text-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avatar" className="text-black">URL do Avatar</Label>
                      <Input
                        id="avatar"
                        value={formData.avatar}
                        onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                        disabled={mode === 'view'}
                        placeholder="https://..."
                        className="text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status VIP */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <Star className={`h-5 w-5 ${formData.isVip ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium">Cliente VIP</p>
                    <p className="text-sm text-gray-500">
                      Acesso a benefícios exclusivos
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.isVip}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVip: checked }))}
                  disabled={mode === 'view'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-gray-700" />
                <h3 className="font-semibold text-black">Endereço</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-black">Endereço</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    disabled={mode === 'view'}
                    placeholder="Rua, número, complemento"
                    className="text-black"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-black">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      disabled={mode === 'view'}
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-black">Estado</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      disabled={mode === 'view'}
                      placeholder="SP"
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-black">CEP</Label>
                    <Input
                      id="zipCode"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, zipCode: e.target.value }
                      }))}
                      onBlur={handleCepBlur}
                      disabled={mode === 'view'}
                      placeholder="01234-567"
                      className="text-black"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas (apenas visualização) */}
          {mode === 'view' && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Estatísticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formData.totalOrders}
                    </div>
                    <p className="text-sm text-gray-500">Total de Pedidos</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(formData.totalSpent)}
                    </div>
                    <p className="text-sm text-gray-500">Total Gasto</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatDate(formData.lastOrderDate)}
                    </div>
                    <p className="text-sm text-gray-500">Último Pedido</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pedidos (apenas visualização) */}
          {mode === 'view' && orders.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Pedidos Recentes</h3>
                  <Button
                    variant="link"
                    onClick={() => {}}
                    className="text-sm text-blue-600"
                  >
                    Ver Todos
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-5 w-5 text-blue-400" />
                          <p className="text-sm text-gray-500">
                            Pedido #{order.id}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {formatCurrency(order.total)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map(item => (
                          <Badge key={item.id} variant="outline" className="text-xs">
                            {(item as any).productName || (item as any).name || item.product?.name || `Produto ${item.productId}`}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {mode !== 'view' && (
              <Button type="submit" disabled={loading} className="bg-[#001941] hover:bg-blue-900 text-white">
                {loading ? 'Salvando...' : mode === 'create' ? 'Criar Cliente' : 'Salvar Alterações'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

