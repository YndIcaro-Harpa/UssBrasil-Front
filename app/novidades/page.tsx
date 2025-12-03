'use client';

import { useState, useEffect } from 'react';
import { Newspaper, Calendar, ArrowRight, Tag, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: string;
  image: string;
  featured?: boolean;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: 'iPhone 17 Pro: O que esperar do novo lançamento da Apple',
    summary: 'A Apple está preparando uma das maiores atualizações de design do iPhone em anos. Confira todas as novidades esperadas.',
    date: '2025-01-15',
    category: 'Apple',
    image: '/images/iphone17.png',
    featured: true
  },
  {
    id: 2,
    title: 'JBL lança nova linha de fones com cancelamento de ruído avançado',
    summary: 'A JBL apresentou sua nova linha de fones de ouvido com tecnologia de cancelamento de ruído adaptativo.',
    date: '2025-01-12',
    category: 'Áudio',
    image: '/images/jbl-hero.png'
  },
  {
    id: 3,
    title: 'Xiaomi expande portfólio de dispositivos inteligentes no Brasil',
    summary: 'A empresa chinesa amplia sua presença no mercado brasileiro com novos produtos para casa inteligente.',
    date: '2025-01-10',
    category: 'Xiaomi',
    image: '/images/categories/smartphones.webp'
  },
  {
    id: 4,
    title: 'Black Friday 2025: Dicas para conseguir os melhores preços',
    summary: 'Prepare-se para a maior data do varejo brasileiro com nossas dicas exclusivas de economia.',
    date: '2025-01-08',
    category: 'Promoções',
    image: '/images/ofertas-bg.png'
  },
  {
    id: 5,
    title: 'Smartwatches: tendências e novidades para 2025',
    summary: 'Conheça as principais tendências em relógios inteligentes para o próximo ano.',
    date: '2025-01-05',
    category: 'Wearables',
    image: '/images/categories/watches.webp'
  },
  {
    id: 6,
    title: 'Acessórios essenciais para seu iPhone',
    summary: 'Descubra os melhores acessórios para proteger e potencializar seu smartphone.',
    date: '2025-01-03',
    category: 'Acessórios',
    image: '/images/categories/acessorios.webp'
  }
];

const categories = ['Todos', 'Apple', 'Áudio', 'Xiaomi', 'Promoções', 'Wearables', 'Acessórios'];

export default function NovidadesPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [filteredNews, setFilteredNews] = useState(newsItems);

  useEffect(() => {
    if (selectedCategory === 'Todos') {
      setFilteredNews(newsItems);
    } else {
      setFilteredNews(newsItems.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const featuredNews = newsItems.find(item => item.featured);
  const regularNews = filteredNews.filter(item => !item.featured);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-400 rounded-full text-sm font-bold mb-4">
            <Newspaper className="h-4 w-4" />
            FIQUE ATUALIZADO
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Novidades</h1>
          <p className="text-xl text-gray-600">Acompanhe as últimas notícias e tendências do mundo da tecnologia</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-blue-400 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {featuredNews && selectedCategory === 'Todos' && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white/80 text-sm font-medium">Destaque</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {featuredNews.title}
                  </h2>
                  <p className="text-white/80 mb-6">{featuredNews.summary}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-white/60 text-sm flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(featuredNews.date)}
                    </span>
                    <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                      {featuredNews.category}
                    </span>
                  </div>
                </div>
                <div className="relative h-64 md:h-auto">
                  <Image
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        {regularNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((news) => (
              <article
                key={news.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="relative h-48">
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-blue-400 text-white text-xs font-semibold rounded-full">
                      {news.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <Calendar className="h-4 w-4" />
                    {formatDate(news.date)}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {news.summary}
                  </p>
                  <button className="text-blue-400 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Ler mais <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">Nenhuma novidade encontrada nesta categoria</p>
            <button 
              onClick={() => setSelectedCategory('Todos')}
              className="mt-4 px-6 py-3 bg-blue-400 text-white rounded-full font-semibold"
            >
              Ver todas as novidades
            </button>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center">
          <Sparkles className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Receba as novidades em primeira mão
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Inscreva-se em nossa newsletter e fique por dentro de todas as novidades, lançamentos e ofertas exclusivas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-8 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-full font-semibold transition-colors">
              Inscrever-se
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
