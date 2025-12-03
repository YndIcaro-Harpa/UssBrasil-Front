'use client';

import { BookOpen, Calendar, ArrowRight, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const blogPosts = [
  {
    id: 1,
    title: 'iPhone 17 Pro: Tudo sobre o novo lançamento da Apple',
    excerpt: 'Descubra todas as novidades do mais novo smartphone da Apple, com design revolucionário e tecnologia de ponta.',
    date: '2025-01-20',
    author: 'Equipe USS Brasil',
    category: 'Apple',
    image: '/images/iphone17.png',
    featured: true
  },
  {
    id: 2,
    title: 'Como escolher o fone de ouvido ideal para você',
    excerpt: 'Guia completo para ajudar você a encontrar o fone perfeito para suas necessidades.',
    date: '2025-01-18',
    author: 'Equipe USS Brasil',
    category: 'Guias',
    image: '/images/jbl-hero.png'
  },
  {
    id: 3,
    title: 'Xiaomi: A revolução dos smartphones acessíveis',
    excerpt: 'Conheça a história da marca que democratizou o acesso à tecnologia de qualidade.',
    date: '2025-01-15',
    author: 'Equipe USS Brasil',
    category: 'Xiaomi',
    image: '/images/categories/smartphones.webp'
  },
  {
    id: 4,
    title: 'Dicas para cuidar da bateria do seu smartphone',
    excerpt: 'Aprenda práticas simples que podem prolongar a vida útil da bateria do seu celular.',
    date: '2025-01-12',
    author: 'Equipe USS Brasil',
    category: 'Dicas',
    image: '/images/categories/acessorios.webp'
  }
];

export default function BlogPage() {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const featuredPost = blogPosts.find(p => p.featured);
  const regularPosts = blogPosts.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-bold mb-4">
            <BookOpen className="h-4 w-4" />
            BLOG
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog USS Brasil</h1>
          <p className="text-xl text-gray-600">Dicas, novidades e guias sobre tecnologia</p>
        </div>

        {featuredPost && (
          <div className="mb-12 bg-white rounded-3xl overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2">
              <div className="relative h-64 md:h-80">
                <Image src={featuredPost.image} alt={featuredPost.title} fill className="object-cover" />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4 w-fit">{featuredPost.category}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1"><User className="h-4 w-4" />{featuredPost.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(featuredPost.date)}</span>
                </div>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-400 text-white rounded-full font-semibold hover:bg-blue-500 transition-colors w-fit">Ler mais <ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
              <div className="relative h-48">
                <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-blue-400 text-white text-xs font-semibold rounded-full">{post.category}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3"><Calendar className="h-4 w-4" />{formatDate(post.date)}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                <span className="text-blue-400 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">Ler mais <ArrowRight className="h-4 w-4" /></span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
