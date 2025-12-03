"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { getProductById } from '@/lib/products-manager';

interface Product {
  id: number | string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  stock?: number;
  slug?: string;
  brand?: string;
  category?: string;
  [key: string]: any;
}

interface CartItem extends Omit<Product, 'id'> {
  id: string; // ID sempre como string para suportar "1a", "2b", etc
  quantity: number;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    // Retornar um contexto padrão seguro em vez de lançar erro
    return {
      cartItems: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      getItemQuantity: () => 0,
      cartTotal: 0,
      cartCount: 0,
    };
  }
  return context;
};

// Constante para expiração do carrinho (1 semana em ms)
const CART_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

// Helper para normalizar ID para string
const normalizeId = (id: string | number | undefined): string => {
  if (id === undefined || id === null) return '';
  return String(id).trim();
};

interface StoredCart {
  items: CartItem[];
  expiresAt: number;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Carregar carrinho do localStorage com verificação de expiração
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('cart');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        
        // Verificar se é o novo formato com expiração
        if (parsed.expiresAt && parsed.items) {
          const now = Date.now();
          if (now < parsed.expiresAt) {
            // Carrinho ainda válido - normalizar IDs para string e filtrar inválidos
            const validItems = parsed.items
              .filter((item: any) => item.id !== undefined && item.id !== null && String(item.id).trim() !== '')
              .map((item: any) => ({
                ...item,
                id: normalizeId(item.id)
              }));
            setCartItems(validItems);
          } else {
            // Carrinho expirado - limpar
            localStorage.removeItem('cart');
            console.log('[Cart] Carrinho expirado, limpando...');
          }
        } else if (Array.isArray(parsed)) {
          // Formato antigo (array direto) - migrar para novo formato com validação
          const validItems = parsed
            .filter((item: any) => item.id !== undefined && item.id !== null && String(item.id).trim() !== '')
            .map((item: any) => ({
              ...item,
              id: normalizeId(item.id)
            }));
          setCartItems(validItems);
        }
      }
    } catch (error) {
      console.error('[Cart] Erro ao carregar carrinho:', error);
      localStorage.removeItem('cart');
    }
  }, []);

  // Salvar carrinho no localStorage com timestamp de expiração
  useEffect(() => {
    if (cartItems.length > 0) {
      const cartData: StoredCart = {
        items: cartItems,
        expiresAt: Date.now() + CART_EXPIRY_MS
      };
      localStorage.setItem('cart', JSON.stringify(cartData));
    } else {
      // Se carrinho vazio, remover do localStorage
      localStorage.removeItem('cart');
    }
  }, [cartItems]);

  const addToCart = (product: Product, quantity = 1) => {
    // Normalizar ID para string
    const productId = normalizeId(product.id);
    
    // Validar ID
    if (!productId) {
      console.error('[Cart] ID do produto inválido:', product.id);
      toast.error('Erro ao adicionar produto ao carrinho.');
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productId);
      // Usar stock do produto passado ou buscar do manager
      const prodData = getProductById(productId);
      const stock = product.stock ?? prodData?.stock ?? 999;
      
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, stock);
        if (newQty === existingItem.quantity) {
          toast.error('Estoque máximo atingido.');
          return prevItems;
        }
        // Atualizar quantidade do item existente
        return prevItems.map(item => item.id === productId ? { ...item, quantity: newQty } : item);
      } else {
        const initialQty = Math.min(quantity, stock);
        if (initialQty <= 0) {
          toast.error('Produto sem estoque.');
          return prevItems;
        }
        // Adicionar novo item com ID como string
        return [...prevItems, { ...product, id: productId, quantity: initialQty, stock }];
      }
    });
  };

  const removeFromCart = (productId: string | number) => {
    const id = normalizeId(productId);
    
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === id);
      if (itemToRemove) {
        toast.error(`'${itemToRemove.name}' removido do carrinho.`);
      }
      return prevItems.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    const id = normalizeId(productId);
    
    if (!id) {
      console.error('[Cart] ID inválido para updateQuantity:', productId);
      return;
    }
    
    setCartItems(prevItems => {
      const item = prevItems.find(i => i.id === id);
      if (!item) {
        console.warn('[Cart] Item não encontrado para atualizar:', id);
        return prevItems;
      }
      
      // Usar stock do item no carrinho ou buscar do manager
      const prodData = getProductById(id);
      const stock = item.stock ?? prodData?.stock ?? 999;
      
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
  };
  
  const getItemQuantity = (productId: string | number) => {
    const id = normalizeId(productId);
    const item = cartItems.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info('Carrinho esvaziado.');
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
