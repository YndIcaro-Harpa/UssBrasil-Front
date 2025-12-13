'use client'

import Image from 'next/image'
import Link from 'next/link'
import { 
  Award, 
  Users, 
  Zap, 
  Shield, 
  Truck, 
  Heart,
  Target,
  TrendingUp,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function SobrePage() {
  const stats = [
    { icon: <Users className="h-8 w-8 text-black" />, value: '50K+', label: 'Clientes Satisfeitos' },
    { icon: <Award className="h-8 w-8 text-black" />, value: '15+', label: 'Anos de Mercado' },
    { icon: <Star className="h-8 w-8 text-black" />, value: '4.9', label: 'Avaliação Média' },
    { icon: <Truck className="h-8 w-8 text-black" />, value: '100%', label: 'Entregas Garantidas' }
  ]

  const values = [
    {
      icon: <Shield className="h-12 w-12 text-black" />,
      title: 'Confiança',
      description: 'Produtos originais com garantia oficial e selo de autenticidade em todas as compras.'
    },
    {
      icon: <Zap className="h-12 w-12 text-black" />,
      title: 'Inovação',
      description: 'Sempre à frente, trazendo as últimas tecnologias e lançamentos do mercado.'
    },
    {
      icon: <Heart className="h-12 w-12 text-black " />,
      title: 'Paixão',
      description: 'Dedicação total em proporcionar a melhor experiência de compra para você.'
    },
    {
      icon: <Target className="h-12 w-12 text-black" />,
      title: 'Excelência',
      description: 'Compromisso com a qualidade superior em produtos, atendimento e entrega.'
    }
  ]

  const benefits = [
    'Produtos 100% originais e certificados',
    'Garantia oficial do fabricante',
    'Frete grátis para todo o Brasil',
    'Parcelamento em até 12x sem juros',
    'Suporte especializado pré e pós-venda',
    'Troca facilitada em até 7 dias',
    'Entrega rápida e rastreável',
    'Atendimento humanizado via WhatsApp'
  ]

  const team = [
    {
      name: 'Tecnologia Premium',
      role: 'Apple Authorized',
      image: '/Empresa/apple-authorized.png'
    },
    {
      name: 'Áudio Profissional',
      role: 'JBL Partner',
      image: '/Empresa/jbl-partner.png'
    },
    {
      name: 'Drones & Câmeras',
      role: 'DJI Certified',
      image: '/Empresa/dji-certified.png'
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
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
              Excelência em Tecnologia
            </Badge>

            <div className="mb-8">
              <Image
                src="/Empresa/01.png"
                alt="USS Brasil"
                width={200}
                height={200}
                className="mx-auto drop-shadow-2xl"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
              Tecnologia Premium
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">
                Para Você
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-4">
              Há mais de 15 anos trazendo inovação e qualidade em produtos tecnológicos das marcas mais desejadas do mundo
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-xl mx-auto">
              <Link href="/produtos" className="flex-1">
                <Button className="w-full bg-white hover:bg-gray-100 text-blue-400 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base lg:text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Explorar Produtos
                </Button>
              </Link>
              <Link href="#contato" className="flex-1">
                <Button variant="outline" className="w-full border-2 border-white text-white hover:bg-white/10 backdrop-blur px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base lg:text-lg font-bold rounded-xl transition-all hover:scale-105">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Fale Conosco
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <Card key={stat.label} className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-400 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Story */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-blue-100 text-blue-400 border border-blue-200 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                Nossa História
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
                Quem Somos
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <Card className="border border-gray-200 shadow-xl bg-white">
                  <CardContent className="p-6 sm:p-8 lg:p-10">
                    <div className="space-y-4 text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                      <p>
                        A <strong className="text-blue-400">USS Brasil</strong> nasceu da paixão por tecnologia 
                        e do desejo de oferecer aos brasileiros acesso aos melhores produtos do mercado mundial.
                      </p>
                      <p>
                        Desde 2010, construímos uma trajetória de <strong>confiança e excelência</strong>, 
                        tornando-nos referência em importação e venda de dispositivos tecnológicos premium 
                        das marcas <strong>Apple, JBL, DJI, Xiaomi e Geonav</strong>.
                      </p>
                      <p>
                        Com sede em <strong>Criciúma/SC</strong>, atendemos todo o Brasil com a mesma dedicação 
                        e compromisso com a qualidade que nos trouxe até aqui. Mais de <strong>50 mil clientes</strong> já 
                        confiaram na USS Brasil para suas compras de tecnologia.
                      </p>
                      <div className="pt-4">
                        <div className="bg-gradient-to-r from-blue-400 to-cyan-600 text-white p-4 sm:p-6 rounded-xl">
                          <p className="font-bold text-base sm:text-lg lg:text-xl">
                            Não vendemos apenas produtos, entregamos experiências tecnológicas únicas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/Empresa/01.png"
                    alt="USS Brasil Loja"
                    fill
                    className="object-contain p-8 bg-gradient-to-br from-blue-50 to-cyan-50"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl blur-3xl opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <Badge className="bg-blue-100 text-blue-400 border border-blue-200 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
              Nossos Valores
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-3 sm:mb-4 text-gray-900">
              Princípios que nos Guiam
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Valores que definem cada decisão e ação da USS Brasil
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {values.map((value, index) => (
              <Card key={value.title} className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white group">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl mb-4 sm:mb-6 text-white group-hover:scale-110 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-black mb-3 sm:mb-4 text-gray-900 group-hover:text-blue-400 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-blue-100 text-blue-400 border border-blue-200 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                Vantagens
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-3 sm:mb-4 text-gray-900">
                Por Que Escolher a
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">USS Brasil?</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {benefits.map((benefit, index) => (
                <Card key={benefit} className="border border-gray-200 hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 bg-white group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-800">
                        {benefit}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-blue-100 text-blue-400 border border-blue-200 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4">
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                Fale Conosco
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-3 sm:mb-4 text-gray-900">
                Entre em Contato
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
                Estamos prontos para atender você da melhor forma
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <a
                href="https://wa.me/5548991832760"
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <Card className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-white h-full">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <Phone className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black mb-2 text-gray-900">WhatsApp</h3>
                    <p className="text-sm sm:text-base text-green-700 font-bold">(48) 99183-2760</p>
                  </CardContent>
                </Card>
              </a>

              <a
                href="mailto:comercial@ussbrasil.com.br"
                className="block group"
              >
                <Card className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-white h-full">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black mb-2 text-gray-900">E-mail</h3>
                    <p className="text-xs sm:text-sm text-blue-700 font-bold break-all">comercial@ussbrasil.com.br</p>
                  </CardContent>
                </Card>
              </a>

              <div className="sm:col-span-2 lg:col-span-1">
                <Card className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-white h-full">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mb-4 transition-transform">
                      <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black mb-2 text-gray-900">Endereço</h3>
                    <p className="text-xs sm:text-sm text-gray-700 font-semibold leading-relaxed">
                      Shopping Della, Sala 09<br />
                      Centro, Criciúma - SC<br />
                      CEP: 88801-000
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="text-center">
              <Link href="/produtos">
                <Button className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Explorar Produtos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

