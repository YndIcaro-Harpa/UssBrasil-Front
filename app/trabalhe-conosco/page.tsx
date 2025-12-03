'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  Heart,
  Zap,
  Shield,
  TrendingUp,
  Send,
  CheckCircle,
  Building,
  GraduationCap,
  Coffee,
  Sparkles,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function TrabalheConoscoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    linkedin: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simular envio
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Candidatura enviada com sucesso!', {
        description: 'Analisaremos seu perfil e entraremos em contato.'
      })
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        linkedin: '',
        message: ''
      })
    }, 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Plano de Carreira',
      description: 'Oportunidades reais de crescimento profissional'
    },
    {
      icon: GraduationCap,
      title: 'Treinamentos',
      description: 'Capacitação contínua em tecnologia e vendas'
    },
    {
      icon: Heart,
      title: 'Plano de Saúde',
      description: 'Cobertura completa para você e sua família'
    },
    {
      icon: Coffee,
      title: 'Vale Alimentação',
      description: 'Benefício para suas refeições diárias'
    },
    {
      icon: Users,
      title: 'Ambiente Colaborativo',
      description: 'Time unido e ambiente de trabalho positivo'
    },
    {
      icon: Zap,
      title: 'Descontos Exclusivos',
      description: 'Preços especiais em todos os produtos'
    }
  ]

  const positions = [
    {
      title: 'Consultor(a) de Vendas',
      department: 'Comercial',
      location: 'Criciúma, SC',
      type: 'Presencial',
      description: 'Buscamos profissionais apaixonados por tecnologia para atender clientes.'
    },
    {
      title: 'Analista de Marketing Digital',
      department: 'Marketing',
      location: 'Criciúma, SC',
      type: 'Híbrido',
      description: 'Responsável por estratégias digitais e gestão de redes sociais.'
    },
    {
      title: 'Desenvolvedor(a) Full Stack',
      department: 'Tecnologia',
      location: 'Remoto',
      type: 'Remoto',
      description: 'Desenvolvimento e manutenção do e-commerce e sistemas internos.'
    }
  ]

  const values = [
    {
      icon: Shield,
      title: 'Integridade',
      description: 'Agimos com ética e transparência em todas as relações'
    },
    {
      icon: Zap,
      title: 'Inovação',
      description: 'Buscamos constantemente novas soluções e melhorias'
    },
    {
      icon: Heart,
      title: 'Paixão',
      description: 'Amamos tecnologia e isso reflete em tudo que fazemos'
    },
    {
      icon: Users,
      title: 'Colaboração',
      description: 'Trabalhamos juntos para alcançar resultados extraordinários'
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
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
              Carreiras
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
              Faça Parte do
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">
                Time USS Brasil
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-4">
              Junte-se a uma equipe apaixonada por tecnologia e comprometida com a excelência
            </p>

            <a href="#vagas">
              <Button className="bg-white hover:bg-gray-100 text-blue-500 px-8 py-4 font-bold rounded-xl transition-all hover:scale-105 shadow-xl">
                <Sparkles className="h-5 w-5 mr-2" />
                Ver Vagas Abertas
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-blue-100 text-blue-400 border border-blue-200 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                Nossa Cultura
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Nossos Valores
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Princípios que guiam nosso dia a dia e definem quem somos
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {values.map((value, index) => (
                <Card key={index} className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <value.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-400 transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                Benefícios
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Por Que Trabalhar Conosco?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Oferecemos um pacote completo de benefícios para nossos colaboradores
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <benefit.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-400 transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="vagas" className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-blue-100 text-blue-400 border border-blue-200 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                Oportunidades
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Vagas Abertas
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Encontre a oportunidade ideal para você e faça parte do nosso time
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {positions.map((position, index) => (
                <Card key={index} className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className="bg-blue-50 text-blue-400 border border-blue-200 text-xs">
                            {position.department}
                          </Badge>
                          <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                            {position.type}
                          </Badge>
                        </div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-2 group-hover:text-blue-400 transition-colors">
                          {position.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                          <MapPin className="h-4 w-4" />
                          {position.location}
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base">
                          {position.description}
                        </p>
                      </div>
                      <a href="#candidatura">
                        <Button className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-3 font-bold rounded-xl transition-all">
                          Candidatar-se
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="candidatura" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-blue-100 text-blue-400 border border-blue-200 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4">
                <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                Candidatura
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Envie seu Currículo
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Preencha o formulário abaixo e analisaremos seu perfil
              </p>
            </div>

            <Card className="border border-gray-200 shadow-xl bg-white">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Nome Completo *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Digite seu nome"
                        required
                        className="border-gray-200 focus:border-blue-400 h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        E-mail *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        required
                        className="border-gray-200 focus:border-blue-400 h-12"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        required
                        className="border-gray-200 focus:border-blue-400 h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Vaga de Interesse *
                      </label>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-gray-900"
                      >
                        <option value="">Selecione uma vaga</option>
                        {positions.map((pos, index) => (
                          <option key={index} value={pos.title}>{pos.title}</option>
                        ))}
                        <option value="Banco de Talentos">Banco de Talentos</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      LinkedIn (opcional)
                    </label>
                    <Input
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="linkedin.com/in/seu-perfil"
                      className="border-gray-200 focus:border-blue-400 h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Por que quer trabalhar conosco? *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Conte um pouco sobre você e por que gostaria de fazer parte da USS Brasil..."
                      rows={5}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all resize-none text-gray-900"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-white h-14 text-lg font-bold transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-3" />
                        Enviar Candidatura
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-400 text-center">
                    Ao enviar, você concorda com nossa política de privacidade.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
                  Dúvidas?
                </Badge>
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4">
                  Entre em Contato com o RH
                </h2>
                <p className="text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto">
                  Nossa equipe de Recursos Humanos está à disposição para esclarecer dúvidas
                </p>

                <a href="mailto:rh@ussbrasil.com.br">
                  <Button className="bg-white hover:bg-gray-100 text-blue-500 px-8 py-4 font-bold rounded-xl transition-all hover:scale-105">
                    <Building className="h-5 w-5 mr-2" />
                    rh@ussbrasil.com.br
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
