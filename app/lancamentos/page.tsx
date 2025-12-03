'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ShoppingCart, Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import apiClient, { Product } from '@/lib/api-client';

export default function LancamentosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await apiClient.getProducts({ limit: 20 });
        // Ordenar por data de criação (mais recentes primeiro)
        const sorted = data.sort((a: Product, b: Product) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setProducts(sorted.slice(0, 12));
      } catch (error) {
        console.error('Erro ao carregar lançamentos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images?.[0] || '/fallback-product.png',
      category: product.category?.name || 'Geral',
      stock: product.stock
    });
    toast.success('Adicionado ao carrinho!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-bold mb-4">
            <Sparkles className="h-4 w-4" />
            NOVOS PRODUTOS
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Lançamentos</h1>
          <p className="text-xl text-gray-600">Conheça as últimas novidades em tecnologia</p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => {
              const isFavorite = favorites.includes(product.id);
              const displayPrice = product.discountPrice || product.price;
              
              return (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all group">
                  <Link href={`/produto/${product.slug}`}>
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={product.images?.[0] || '/fallback-product.png'}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform"
                      />
                      {index < 3 && (
                        <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3" /> NOVO
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(product.id);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      >
                        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-sm text-blue-400 font-medium mb-1">{product.brand?.name}</p>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="mb-3">
                      {product.discountPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-full font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Adicionar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">Nenhum lançamento disponível</p>
            <Link href="/produtos">
              <button className="mt-4 px-6 py-3 bg-blue-400 text-white rounded-full font-semibold">
                Ver todos os produtos
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
