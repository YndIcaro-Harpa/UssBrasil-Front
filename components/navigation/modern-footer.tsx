'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter,
  Shield,
  CreditCard,
  Award,
  Heart,
  ArrowUp
} from 'lucide-react'
import { useState, useEffect } from 'react'

const ModernFooter = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Institucional',
      links: [
        { name: 'Sobre Nós', href: '/sobre' },
        { name: 'Imprensa', href: '/imprensa' },
        { name: 'Trabalhe Conosco', href: '/trabalhe-conosco' },
        { name: 'Termos de Uso', href: '/termos-de-uso' },
        { name: 'Privacidade', href: '/politica-de-privacidade' },
      ]
    },
    {
      title: 'Produtos',
      links: [
        { name: 'Apple', href: '/produtos?brand=apple' },
        { name: 'JBL', href: '/produtos?brand=jbl' },
        { name: 'DJI', href: '/produtos?brand=dji' },
        { name: 'Xiaomi', href: '/produtos?brand=xiaomi' },
        { name: 'Geonav', href: '/produtos?brand=geonav' },
      ]
    },
    {
      title: 'Atendimento',
      links: [
        { name: 'Central de Ajuda', href: '/central-ajuda' },
        { name: 'Perguntas Frequentes', href: '/faq' },
        { name: 'Como Comprar', href: '/como-comprar' },
        { name: 'Trocas e Devoluções', href: '/trocas-devolucoes' },
        { name: 'Garantia', href: '/garantia' },
        { name: 'Rastrear Pedido', href: '/rastreamento' },
      ]
    },
    {
      title: 'Minha Conta',
      links: [
        { name: 'Entrar', href: '/auth/login' },
        { name: 'Criar Conta', href: '/auth/registrar' },
        { name: 'Recuperar Senha', href: '/auth/recuperar' },
        { name: 'Meus Favoritos', href: '/favoritos' },
        { name: 'Meus Pedidos', href: '/meus-pedidos' },
      ]
    }
  ]

  const benefits = [
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: 'Compra Segura',
      description: 'Proteção SSL'
    },
    {
      icon: <CreditCard className="h-8 w-8 text-white" />,
      title: 'Parcelamento',
      description: 'Até 12x sem juros'
    },
    {
      icon: <Award className="h-8 w-8 text-white" />,
      title: 'Produtos Originais',
      description: 'Garantia oficial'
    }
  ]

  const socialLinks = [
    {
      name: 'Instagram',
      icon: <Instagram className="h-5 w-5" />,
      href: 'https://instagram.com/ussbrasil',
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      href: 'https://facebook.com/ussbrasil',
    },
    {
      name: 'YouTube',
      icon: <Youtube className="h-5 w-5" />,
      href: 'https://youtube.com/ussbrasil',
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      href: 'https://twitter.com/ussbrasil',
    }
  ]

  const paymentMethods = [
    { name: 'Visa', src: '/logos/Visa_Inc._logo.svg.webp' },
    { name: 'Mastercard', src: '/logos/Mastercard_2019_logo.svg.png' },
    { name: 'Pix', src: '/logos/logo-pix-icone-1024.png' },
  ]

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      {/* Benefits Section */}
      <div className="relative z-10 border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-400 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-400">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="inline-block">
                <Image
                  src="/Empresa/01.png"
                  alt="USS Brasil"
                  width={140}
                  height={50}
                  className="object-contain"
                />
              </Link>
              
              <p className="text-gray-400 leading-relaxed">
                USS Brasil é a sua loja de tecnologia premium. Oferecemos os melhores produtos 
                Apple, JBL, DJI, Xiaomi e Geonav com garantia oficial e entrega expressa.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <a href="tel:+554834116672" className="text-gray-400 hover:text-white transition-colors">
                    (48) 3411-6672
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <a href="mailto:Comercial@UssBrasil.com.br" className="text-gray-400 hover:text-white transition-colors">
                    Comercial@UssBrasil.com.br
                  </a>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
                  <span className="text-gray-400">
                    Rua Dr. Padre Nereu Ramos - Centro<br />
                    Shopping Della, Sala 09 Térreo<br />
                    Criciúma/SC - CEP: 88810-140
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods & Security */}
      <div className="relative z-10 border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            {/* Payment Methods */}
            <div className="text-center lg:text-left">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Formas de Pagamento
              </h4>
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="w-14 h-10 bg-white rounded flex items-center justify-center p-1"
                    title={method.name}
                  >
                    <Image
                      src={method.src}
                      alt={method.name}
                      width={40}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Security Info */}
            <div className="text-center lg:text-right">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Segurança e Certificações
              </h4>
              <div className="flex items-center justify-center lg:justify-end space-x-3">
                <div className="flex items-center space-x-2 bg-green-600 px-3 py-2 rounded">
                  <Shield className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-medium">SSL Seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                © {currentYear} USS Brasil. Todos os direitos reservados.
              </p>
              <div className="flex items-center justify-center md:justify-start space-x-4 mt-2">
                <Link href="/politica-de-privacidade" className="text-xs text-gray-500 hover:text-blue-400 transition-colors">
                  Política de Privacidade
                </Link>
                <span className="text-gray-700">•</span>
                <Link href="/termos-de-uso" className="text-xs text-gray-500 hover:text-blue-400 transition-colors">
                  Termos de Uso
                </Link>
                <span className="text-gray-700">•</span>
                <Link href="/faq" className="text-xs text-gray-500 hover:text-blue-400 transition-colors">
                  FAQ
                </Link>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 hidden sm:block">
                Siga-nos:
              </span>
              <div className="flex items-center space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-blue-400 transition-all duration-300 hover:scale-110"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Made with Love */}
     
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-blue-400 text-black rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:bg-blue-300"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </footer>
  )
}

export default ModernFooter
