"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { api, CartItem as ApiCartItem, CartResponse } from '@/services/api';

// Interface do produto conforme vem da API
interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface Product {
  id: number | string;
  name: string;
  price: number;
  discountPrice?: number;
  originalPrice?: number;
  image?: string;
  images?: ProductImage[] | string;
  stock?: number;
  slug?: string;
  brand?: string | { name: string };
  category?: string | { name: string };
  // Variações do produto
  selectedColor?: string;
  selectedSize?: string;
  selectedStorage?: string;
}

interface CartItem extends Omit<Product, 'id' | 'images'> {
  id: string;
  quantity: number;
  images?: ProductImage[] | string;
  // Variações selecionadas
  selectedColor?: string;
  selectedSize?: string;
  selectedStorage?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string | number) => number;
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
  syncWithServer: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cartItems: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      getItemQuantity: () => 0,
      cartTotal: 0,
      cartCount: 0,
      isLoading: false,
      syncWithServer: async () => {},
    };
  }
  return context;
};

// Constante para expiração do carrinho local (7 dias)
const CART_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

// Helper para normalizar ID para string
const normalizeId = (id: string | number | undefined): string => {
  if (id === undefined || id === null) return '';
  return String(id).trim();
};

// Helper para obter o token de autenticação
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || 
         localStorage.getItem('auth_token') || 
         localStorage.getItem('accessToken') ||
         localStorage.getItem('uss_auth_token');
};

// Helper para extrair a imagem principal
const getPrimaryImage = (images?: ProductImage[] | string, fallbackImage?: string): string => {
  if (!images) return fallbackImage || '/placeholder.png';
  
  if (typeof images === 'string') {
    // Primeiro, tentar parse como JSON
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const primary = parsed.find((img: any) => img.isPrimary);
        return primary?.url || parsed[0]?.url || parsed[0] || fallbackImage || '/placeholder.png';
      }
    } catch {
      // Não é JSON - verificar se é lista separada por vírgula
      if (images.includes(',')) {
        const imageList = images.split(',').map(img => img.trim()).filter(Boolean);
        if (imageList.length > 0) {
          return imageList[0];
        }
      }
      // String única - retornar diretamente
      return images || fallbackImage || '/placeholder.png';
    }
  }
  
  if (Array.isArray(images) && images.length > 0) {
    const primary = images.find(img => img.isPrimary);
    return primary?.url || images[0]?.url || fallbackImage || '/placeholder.png';
  }
  
  return fallbackImage || '/placeholder.png';
};

interface StoredCart {
  items: CartItem[];
  expiresAt: number;
}

// Converter item da API para formato local
const apiItemToCartItem = (item: ApiCartItem): CartItem => ({
  id: item.productId,
  name: item.product.name,
  price: item.product.price,
  originalPrice: item.product.originalPrice ?? undefined,
  slug: item.product.slug,
  stock: item.product.stock,
  images: item.product.images,
  image: getPrimaryImage(item.product.images as any),
  category: item.product.category?.name,
  brand: item.product.brand?.name,
  quantity: item.quantity,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar carrinho do localStorage ou servidor
  useEffect(() => {
    const loadCart = async () => {
      const token = getAuthToken();
      
      if (token) {
        // Usuário logado - carregar do servidor
        try {
          setIsLoading(true);
          const response = await api.cart.getCart(token);
          const serverItems = response.items.map(apiItemToCartItem);
          
          // Verificar se há itens locais para sincronizar
          const localData = localStorage.getItem('cart');
          if (localData) {
            const parsed = JSON.parse(localData);
            const localItems = parsed.items || (Array.isArray(parsed) ? parsed : []);
            
            if (localItems.length > 0) {
              // Sincronizar itens locais com o servidor
              const itemsToSync = localItems.map((item: CartItem) => ({
                productId: normalizeId(item.id),
                quantity: item.quantity,
              }));
              
              const syncedResponse = await api.cart.syncCart(token, itemsToSync);
              setCartItems(syncedResponse.items.map(apiItemToCartItem));
              
              // Limpar carrinho local após sincronização
              localStorage.removeItem('cart');
              toast.success('Carrinho sincronizado com sua conta!');
            } else {
              setCartItems(serverItems);
            }
          } else {
            setCartItems(serverItems);
          }
        } catch (error) {
          console.error('[Cart] Erro ao carregar carrinho do servidor:', error);
          // Fallback para carrinho local
          loadLocalCart();
        } finally {
          setIsLoading(false);
        }
      } else {
        // Usuário não logado - usar localStorage
        loadLocalCart();
      }
      
      setIsInitialized(true);
    };

    const loadLocalCart = () => {
      try {
        const storedData = localStorage.getItem('cart');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          
          if (parsed.expiresAt && parsed.items) {
            const now = Date.now();
            if (now < parsed.expiresAt) {
              const validItems = parsed.items
                .filter((item: any) => item.id !== undefined && item.id !== null && String(item.id).trim() !== '')
                .map((item: any) => ({
                  ...item,
                  id: normalizeId(item.id),
                  image: item.image || getPrimaryImage(item.images),
                }));
              setCartItems(validItems);
            } else {
              localStorage.removeItem('cart');
            }
          } else if (Array.isArray(parsed)) {
            const validItems = parsed
              .filter((item: any) => item.id !== undefined && item.id !== null && String(item.id).trim() !== '')
              .map((item: any) => ({
                ...item,
                id: normalizeId(item.id),
                image: item.image || getPrimaryImage(item.images),
              }));
            setCartItems(validItems);
          }
        }
      } catch (error) {
        console.error('[Cart] Erro ao carregar carrinho local:', error);
        localStorage.removeItem('cart');
      }
    };

    loadCart();
  }, []);

  // Salvar carrinho no localStorage (apenas quando não logado)
  useEffect(() => {
    if (!isInitialized) return;
    
    const token = getAuthToken();
    if (!token) {
      if (cartItems.length > 0) {
        const cartData: StoredCart = {
          items: cartItems,
          expiresAt: Date.now() + CART_EXPIRY_MS
        };
        localStorage.setItem('cart', JSON.stringify(cartData));
      } else {
        localStorage.removeItem('cart');
      }
    }
  }, [cartItems, isInitialized]);

  // Função para sincronizar com servidor
  const syncWithServer = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await api.cart.getCart(token);
      setCartItems(response.items.map(apiItemToCartItem));
    } catch (error) {
      console.error('[Cart] Erro ao sincronizar com servidor:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = async (product: Product, quantity = 1) => {
    const baseProductId = normalizeId(product.id);
    
    if (!baseProductId) {
      console.error('[Cart] ID do produto inválido:', product.id);
      toast.error('Erro ao adicionar produto ao carrinho.');
      return;
    }
    
    const token = getAuthToken();
    
    if (token) {
      // Usuário logado - usar API
      try {
        setIsLoading(true);
        await api.cart.addToCart(token, baseProductId, quantity);
        await syncWithServer();
        toast.success('Produto adicionado ao carrinho!');
      } catch (error: any) {
        console.error('[Cart] Erro ao adicionar ao carrinho:', error);
        toast.error(error.message || 'Erro ao adicionar ao carrinho');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Usuário não logado - usar localStorage
      const variationParts = [
        baseProductId,
        product.selectedColor || '',
        product.selectedSize || '',
        product.selectedStorage || ''
      ].filter(Boolean);
      const cartItemId = variationParts.join('-');
      
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === cartItemId);
        const stock = product.stock ?? 999;
        
        if (existingItem) {
          const newQty = Math.min(existingItem.quantity + quantity, stock);
          if (newQty === existingItem.quantity) {
            toast.error('Estoque máximo atingido.');
            return prevItems;
          }
          toast.success('Quantidade atualizada no carrinho!');
          return prevItems.map(item => item.id === cartItemId ? { ...item, quantity: newQty } : item);
        } else {
          const initialQty = Math.min(quantity, stock);
          if (initialQty <= 0) {
            toast.error('Produto sem estoque.');
            return prevItems;
          }
          toast.success('Produto adicionado ao carrinho!');
          return [...prevItems, { 
            ...product, 
            id: cartItemId, 
            quantity: initialQty, 
            stock,
            image: product.image || getPrimaryImage(product.images as ProductImage[]),
            images: Array.isArray(product.images) ? product.images as ProductImage[] : undefined,
            brand: typeof product.brand === 'object' ? product.brand.name : product.brand,
            category: typeof product.category === 'object' ? product.category.name : product.category,
            selectedColor: product.selectedColor,
            selectedSize: product.selectedSize,
            selectedStorage: product.selectedStorage
          }];
        }
      });
    }
  };

  const removeFromCart = async (productId: string | number) => {
    const id = normalizeId(productId);
    const token = getAuthToken();
    
    if (token) {
      try {
        setIsLoading(true);
        await api.cart.removeFromCart(token, id);
        await syncWithServer();
        toast.info('Produto removido do carrinho.');
      } catch (error: any) {
        console.error('[Cart] Erro ao remover do carrinho:', error);
        toast.error(error.message || 'Erro ao remover do carrinho');
      } finally {
        setIsLoading(false);
      }
    } else {
      setCartItems(prevItems => {
        const itemToRemove = prevItems.find(item => item.id === id);
        if (itemToRemove) {
          toast.info(`'${itemToRemove.name}' removido do carrinho.`);
        }
        return prevItems.filter(item => item.id !== id);
      });
    }
  };

  const updateQuantity = async (productId: string | number, quantity: number) => {
    const id = normalizeId(productId);
    
    if (!id) {
      console.error('[Cart] ID inválido para updateQuantity:', productId);
      return;
    }
    
    const token = getAuthToken();
    
    if (token) {
      try {
        setIsLoading(true);
        if (quantity <= 0) {
          await api.cart.removeFromCart(token, id);
        } else {
          await api.cart.updateQuantity(token, id, quantity);
        }
        await syncWithServer();
      } catch (error: any) {
        console.error('[Cart] Erro ao atualizar quantidade:', error);
        toast.error(error.message || 'Erro ao atualizar quantidade');
      } finally {
        setIsLoading(false);
      }
    } else {
      setCartItems(prevItems => {
        const item = prevItems.find(i => i.id === id);
        if (!item) {
          console.warn('[Cart] Item não encontrado para atualizar:', id);
          return prevItems;
        }
        
        const stock = item.stock ?? 999;
        let newQuantity = quantity;
        
        if (newQuantity > stock) {
          toast.error(`Apenas ${stock} unidades disponíveis.`);
          newQuantity = stock;
        }
        
        if (newQuantity <= 0) {
          return prevItems.filter(i => i.id !== id);
        }
        
        return prevItems.map(i =>
          i.id === id ? { ...i, quantity: newQuantity } : i
        );
      });
    }
  };
  
  const getItemQuantity = (productId: string | number) => {
    const id = normalizeId(productId);
    const item = cartItems.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  const clearCart = async () => {
    const token = getAuthToken();
    
    if (token) {
      try {
        setIsLoading(true);
        await api.cart.clearCart(token);
        setCartItems([]);
        toast.info('Carrinho esvaziado.');
      } catch (error: any) {
        console.error('[Cart] Erro ao limpar carrinho:', error);
        toast.error(error.message || 'Erro ao limpar carrinho');
      } finally {
        setIsLoading(false);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('cart');
      toast.info('Carrinho esvaziado.');
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.discountPrice || item.price;
    return total + price * item.quantity;
  }, 0);
  
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        cartTotal,
        cartCount,
        isLoading,
        syncWithServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
