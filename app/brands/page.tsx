'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

const brandLogos: Record<string, string> = {
  apple: '/images/brands/apple.png',
  jbl: '/images/brands/jbl.png',
  xiaomi: '/images/brands/xiaomi.png',
  samsung: '/images/brands/samsung.png',
  beats: '/images/brands/beats.png'
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const data = await apiClient.getBrands();
        setBrands(data);
      } catch (error) {
        console.error('Erro ao carregar marcas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBrands();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-bold mb-4">
            <Star className="h-4 w-4" />
            MARCAS
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nossas Marcas</h1>
          <p className="text-xl text-gray-600">Trabalhamos com as melhores marcas do mercado</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all group text-center"
            >
              <div className="relative h-20 mb-4">
                <Image
                  src={brandLogos[brand.slug] || '/images/brands/default.png'}
                  alt={brand.name}
                  fill
                  className="object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{brand.name}</h3>
              <span className="text-blue-600 font-semibold text-sm flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                Ver produtos <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        {brands.length === 0 && (
          <div className="text-center py-20">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">Nenhuma marca encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
