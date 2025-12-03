'use client'

import { useState } from 'react'
import { Send, MapPin, Phone, Mail, MessageCircle, CheckCircle2, Sparkles, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ContactInfo } from '@/components/ContactInfo'

// Dados da equipe
const teamMembers = [
    {
        name: 'Andrio Junior',
        role: 'Consultor Comercial',
        gradient: 'from-blue-600 to-blue-400'
    },
    {
        name: 'Luiz Fernando',
        role: 'Consultor Comercial',
        gradient: 'from-cyan-600 to-blue-700'
    },
    {
        name: 'Andrio',
        role: 'Consultor Comercial',
        gradient: 'from-purple-600 to-blue-800'
    }
]

export default function ContatoPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'Informações sobre Produtos',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const whatsappNumber = '5548991832760'
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Vim do site e gostaria de mais informações.')}`

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        setTimeout(() => {
            setIsSubmitting(false)
            setIsSuccess(true)
            toast.success('Mensagem enviada com sucesso!', {
                description: 'Entraremos em contato em breve.'
            })
            
            setTimeout(() => {
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: 'Informações sobre Produtos',
                    message: ''
                })
                setIsSuccess(false)
            }, 3000)
        }, 2000)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const faqItems = [
        {
            question: 'Qual o prazo de entrega?',
            answer: 'O prazo varia de 2 a 5 dias úteis dependendo da região. Frete grátis acima de R$ 2.000.'
        },
        {
            question: 'Os produtos são originais?',
            answer: 'Sim! 100% dos nossos produtos são originais e acompanham nota fiscal e garantia do fabricante.'
        },
        {
            question: 'Posso retirar na loja?',
            answer: 'Sim! Nossa loja física está localizada no Shopping Della, sala 09 térreo, Centro de Criciúma/SC.'
        },
        {
            question: 'Quais formas de pagamento aceitam?',
            answer: 'Aceitamos Pix, cartão de crédito (até 12x), débito e transferência bancária.'
        },
        {
            question: 'Como funciona a garantia?',
            answer: 'Oferecemos garantia estendida de até 24 meses em produtos selecionados, além da garantia legal de 90 dias.'
        },
        {
            question: 'Posso trocar ou devolver?',
            answer: 'Sim! Você tem 7 dias corridos para trocar ou devolver produtos conforme o Código de Defesa do Consumidor.'
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-400 via-blue-950 to-gray-900 text-white pt-24 sm:pt-28 pb-16 sm:pb-20">
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
                    <div className="text-center max-w-4xl mx-auto">
                        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-6 shadow-2xl shadow-cyan-500/50">
                            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                            Atendimento Premium
                        </Badge>
                        
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
                            Entre em Contato
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">
                                com Nossa Equipe
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto px-4">
                            Estamos prontos para atender você e oferecer as melhores soluções em tecnologia
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="py-12 sm:py-16 lg:py-20">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-16">
                        {[
                            {
                                icon: Phone,
                                title: 'Telefone',
                                content: '(48) 3411-6672',
                                subtitle: 'Seg-Sex: 9h às 19h',
                                link: 'tel:554834116672',
                                gradient: 'from-blue-600 to-blue-400'
                            },
                            {
                                icon: MessageCircle,
                                title: 'WhatsApp',
                                content: 'Chat Direto',
                                subtitle: 'Resposta imediata',
                                link: whatsappLink,
                                gradient: 'from-green-600 to-green-700'
                            },
                            {
                                icon: Mail,
                                title: 'E-mail',
                                content: 'Comercial@UssBrasil.com.br',
                                subtitle: 'Resposta em 24h',
                                link: 'mailto:comercial@ussbrasil.com.br',
                                gradient: 'from-cyan-600 to-blue-700'
                            }
                        ].map((item) => (
                            <a
                                key={item.title}
                                href={item.link}
                                target={item.link.startsWith('http') ? '_blank' : undefined}
                                rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                                className="block group"
                            >
                                <Card className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 h-full bg-white">
                                    <CardContent className="p-6 sm:p-8 text-center">
                                        <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
                                        </div>
                                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 sm:mb-3">{item.title}</h3>
                                        <p className="text-blue-400 font-semibold mb-2 text-sm sm:text-base">{item.content}</p>
                                        <p className="text-gray-500 text-xs sm:text-sm">{item.subtitle}</p>
                                    </CardContent>
                                </Card>
                            </a>
                        ))}
                    </div>

                    {/* Team Section */}
                    <div className="max-w-5xl mx-auto mb-16">
                        <div className="text-center mb-8 sm:mb-12">
                            <Badge className="bg-blue-100 text-blue-400 border border-blue-200 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4">
                                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                                Nossa Equipe
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                                Consultores Especializados
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                                Profissionais dedicados para oferecer o melhor atendimento
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {teamMembers.map((member, index) => (
                                <Card key={index} className="border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                                    <CardContent className="p-6 sm:p-8 text-center">
                                        <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br ${member.gradient} rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <User className="h-9 w-9 sm:h-12 sm:w-12 text-white" />
                                        </div>
                                        <h3 className="font-black text-lg sm:text-xl text-gray-900 mb-2">{member.name}</h3>
                                        <p className="text-blue-400 font-semibold text-sm sm:text-base mb-3">{member.role}</p>
                                        <Badge className="bg-blue-50 text-blue-400 border border-blue-200 text-xs">
                                            Especialista em Tecnologia
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Contact Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-white">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 max-w-7xl mx-auto">
                        {/* Contact Form */}
                        <div>
                            <Card className="border border-gray-200 shadow-xl bg-white">
                                <CardContent className="p-6 sm:p-8 lg:p-10">
                                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                                            <Send className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
                                                Envie sua Mensagem
                                            </h2>
                                            <p className="text-gray-500 text-xs sm:text-sm">Retorno garantido em até 24h</p>
                                        </div>
                                    </div>

                                    {isSuccess ? (
                                        <div className="text-center py-12 sm:py-16">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                                                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                                                Mensagem Enviada!
                                            </h3>
                                            <p className="text-gray-600 text-base sm:text-lg">
                                                Obrigado pelo contato. Responderemos em breve.
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-4 text-black sm:space-y-6">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                                                    Nome Completo *
                                                </label>
                                                <Input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Digite seu nome completo"
                                                    required
                                                    className="border-gray-200 focus:border-blue-400 h-10 sm:h-12 text-sm sm:text-base"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                                                        E-mail *
                                                    </label>
                                                    <Input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="seu@email.com"
                                                        required
                                                        className="border-gray-200 focus:border-blue-400 h-10 sm:h-12 text-sm sm:text-base"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                                                        Telefone
                                                    </label>
                                                    <Input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="(00) 00000-0000"
                                                        className="border-gray-200 focus:border-blue-400 h-10 sm:h-12 text-sm sm:text-base"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                                                    Assunto *
                                                </label>
                                                <select
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="w-full h-10 sm:h-12 px-4 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-sm sm:text-base"
                                                    required
                                                >
                                                    <option>Informações sobre Produtos</option>
                                                    <option>Orçamento</option>
                                                    <option>Suporte Técnico</option>
                                                    <option>Garantia</option>
                                                    <option>Outros</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                                                    Mensagem *
                                                </label>
                                                <textarea
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="Descreva como podemos ajudá-lo..."
                                                    rows={5}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all resize-none text-sm sm:text-base"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-blue-400 hover:bg-blue-500 text-white h-12 sm:h-14 text-base sm:text-lg font-bold transition-all duration-300"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                                                        Enviando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-5 w-5 mr-3" />
                                                        Enviar Mensagem
                                                    </>
                                                )}
                                            </Button>

                                            <p className="text-xs text-gray-400 text-center pt-2">
                                                🔒 Seus dados estão protegidos
                                            </p>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Info with Map */}
                        <div>
                            <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
                                        Onde Estamos
                                    </h2>
                                    <p className="text-gray-500 text-xs sm:text-sm">Visite nossa loja física</p>
                                </div>
                            </div>

                            {/* Contact Quick Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                                <Card className="border border-gray-200 hover:border-blue-300 transition-all duration-300 bg-white">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <MessageCircle className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500 font-semibold mb-1">WhatsApp</p>
                                                <a 
                                                    href={whatsappLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm sm:text-base font-bold text-green-700 hover:text-green-600 transition-colors block truncate"
                                                >
                                                    (48) 99183-2760
                                                </a>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border border-gray-200 hover:border-blue-300 transition-all duration-300 bg-white">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Mail className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500 font-semibold mb-1">E-mail</p>
                                                <a 
                                                    href="mailto:comercial@ussbrasil.com.br"
                                                    className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-600 transition-colors block truncate"
                                                >
                                                    comercial@ussbrasil.com.br
                                                </a>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border border-gray-200 hover:border-blue-300 transition-all duration-300 bg-white">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <MapPin className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500 font-semibold mb-1">Endereço</p>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                                                    Shopping Della, Sala 09
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border border-gray-200 hover:border-blue-300 transition-all duration-300 bg-white">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Clock className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500 font-semibold mb-1">Horário</p>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                                                    Seg-Sex: 9h às 19h
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <ContactInfo variant="full" showMap={true} />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                            <Badge className="bg-blue-100 text-blue-400 border border-blue-200 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4">
                                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                                FAQ
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
                                Perguntas Frequentes
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
                                Respostas rápidas para suas principais dúvidas
                            </p>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {faqItems.map((item, index) => (
                                <details
                                    key={index}
                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:shadow-lg hover:border-blue-300 transition-all duration-300"
                                >
                                    <summary className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 cursor-pointer font-bold text-sm sm:text-base lg:text-lg text-gray-900 hover:bg-blue-50 transition-all flex items-center justify-between">
                                        <span className="pr-4">{item.question}</span>
                                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                                            +
                                        </div>
                                    </summary>
                                    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-t border-gray-100 bg-gray-50">
                                        <p className="text-gray-700 text-xs sm:text-sm lg:text-base leading-relaxed">{item.answer}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 lg:py-20">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="relative bg-gradient-to-br from-blue-400 via-blue-950 to-gray-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl overflow-hidden">
                            {/* Background Effects */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-500/20 rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 rounded-full blur-3xl" />
                            </div>

                            {/* Grid Pattern */}
                            <div className="absolute inset-0 opacity-[0.03]" style={{
                                backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                                backgroundSize: '50px 50px'
                            }} />

                            <div className="relative z-10">
                                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 mb-4 sm:mb-6">
                                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
                                    Atendimento Imediato
                                </Badge>
                                
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 lg:mb-6">
                                    Prefere Falar Agora?
                                </h2>
                                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
                                    Nossa equipe especializada está pronta para atender você
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center max-w-xl mx-auto">
                                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button className="w-full bg-white hover:bg-gray-100 text-blue-400 px-6 sm:px-8 lg:px-10 py-4 sm:py-6 lg:py-7 text-sm sm:text-base lg:text-lg font-bold rounded-xl sm:rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                                            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-3" />
                                            Abrir WhatsApp
                                        </Button>
                                    </a>
                                    <a href="tel:554834116672" className="flex-1">
                                        <Button 
                                            variant="outline"
                                            className="w-full border-2 border-white text-white hover:bg-white/10 backdrop-blur px-6 sm:px-8 lg:px-10 py-4 sm:py-6 lg:py-7 text-sm sm:text-base lg:text-lg font-bold rounded-xl sm:rounded-2xl transition-all hover:scale-105"
                                        >
                                            <Phone className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-3" />
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

