'use client'

import Image from 'next/image'
import Link from 'next/link'
import { 
  Newspaper, 
  Download, 
  Mail, 
  Phone, 
  ExternalLink,
  Calendar,
  FileText,
  Image as ImageIcon,
  Video,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function ImprensaPage() {
  const pressReleases = [
    {
      title: 'USS Brasil expande operações para todo o Brasil',
      date: '15 de Novembro, 2024',
      excerpt: 'A USS Brasil anuncia expansão de suas operações logísticas para atender todo o território nacional com entrega expressa.',
      category: 'Expansão'
    },
    {
      title: 'Parceria oficial com Apple para revenda autorizada',
      date: '10 de Outubro, 2024',
      excerpt: 'Firmamos parceria estratégica com a Apple para comercialização de produtos originais com garantia oficial.',
      category: 'Parcerias'
    },
    {
      title: 'USS Brasil completa 15 anos de mercado',
      date: '01 de Setembro, 2024',
      excerpt: 'Celebramos 15 anos de história trazendo tecnologia premium para os brasileiros com qualidade e confiança.',
      category: 'Institucional'
    }
  ]

  const mediaAssets = [
    {
      title: 'Logo USS Brasil',
      type: 'Logotipos',
      icon: ImageIcon,
      description: 'Versões em alta resolução para uso em mídia'
    },
    {
      title: 'Fotos Institucionais',
      type: 'Imagens',
      icon: ImageIcon,
      description: 'Galeria de fotos para publicações'
    },
    {
      title: 'Vídeos Institucionais',
      type: 'Vídeos',
      icon: Video,
      description: 'Material audiovisual da empresa'
    },
    {
      title: 'Press Kit Completo',
      type: 'Documentos',
      icon: FileText,
      description: 'Kit de imprensa com todas as informações'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-400 via-blue-950 to-gray-900 text-white overflow-hidden pt-24 sm:pt-28 pb-16 sm:pb-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-6 shadow-2xl shadow-cyan-500/50">
              <Newspaper className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
              Sala de Imprensa
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
              Notícias e
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">
                Press Releases
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-4">
              Acompanhe as novidades e encontre materiais para divulgação sobre a USS Brasil
            </p>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-blue-100 text-blue-400 border border-blue-200 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                Últimas Notícias
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Press Releases
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {pressReleases.map((release, index) => (
                <Card key={index} className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <Badge className="bg-blue-50 text-blue-400 border border-blue-200 text-xs mb-3">
                          {release.category}
                        </Badge>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-2 group-hover:text-blue-400 transition-colors">
                          {release.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                          <Calendar className="h-4 w-4" />
                          {release.date}
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                          {release.excerpt}
                        </p>
                      </div>
                      <Button variant="outline" className="flex-shrink-0 border-blue-300 text-blue-400 hover:bg-blue-50">
                        Ler mais
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Media Assets */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-blue-100 text-blue-400 border border-blue-200 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                Downloads
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Materiais para Imprensa
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Baixe logotipos, fotos e materiais oficiais para uso em publicações
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {mediaAssets.map((asset, index) => (
                <Card key={index} className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <asset.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <Badge className="bg-gray-100 text-gray-600 border-0 text-xs mb-2">
                      {asset.type}
                    </Badge>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-400 transition-colors">
                      {asset.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {asset.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-blue-400 via-blue-950 to-gray-900 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4 sm:mb-6">
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                  Contato para Imprensa
                </Badge>
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4">
                  Assessoria de Imprensa
                </h2>
                <p className="text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto">
                  Para entrevistas, pautas e informações oficiais, entre em contato com nossa assessoria
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="mailto:imprensa@ussbrasil.com.br">
                    <Button className="w-full sm:w-auto bg-white hover:bg-gray-100 text-blue-500 px-8 py-4 font-bold rounded-xl transition-all hover:scale-105">
                      <Mail className="h-5 w-5 mr-2" />
                      imprensa@ussbrasil.com.br
                    </Button>
                  </a>
                  <a href="tel:554834116672">
                    <Button variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 px-8 py-4 font-bold rounded-xl transition-all hover:scale-105">
                      <Phone className="h-5 w-5 mr-2" />
                      (48) 3411-6672
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

