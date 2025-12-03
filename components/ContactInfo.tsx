'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ContactInfoProps {
  variant?: 'full' | 'minimal' | 'inline'
  showMap?: boolean
  className?: string
}

export function ContactInfo({ variant = 'full', showMap = false, className = '' }: ContactInfoProps) {
  const whatsappNumber = '5548991832760'
  const whatsappLink = `https://wa.me/${whatsappNumber}`
  
  const contactData = {
    phone: '(48) 3411-6672',
    email: 'Comercial@UssBrasil.com.br',
    address: {
      street: 'Rua Dr. Padre Nereu Ramos',
      complement: 'Shopping Della, Sala 09 - Térreo',
      city: 'Centro, Criciúma/SC',
      zip: 'CEP: 88810-140'
    },
    hours: {
      weekdays: 'Segunda a Sexta: 9h às 19h',
      saturday: 'Sábado: 9h às 18h',
      sunday: 'Domingo: Fechado'
    },
    social: {
      instagram: '@comercialussbrasil',
      followers: '1.123'
    }
  }

  if (variant === 'minimal') {
    return (
      <div className={`space-y-3 ${className}`}>
        <a 
          href={`tel:${whatsappNumber}`}
          className="flex items-center gap-3 text-gray-700 hover:text-uss-primary transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-uss-primary/10 flex items-center justify-center group-hover:bg-uss-primary/20 transition-colors">
            <Phone className="h-5 w-5 text-uss-primary" />
          </div>
          <span className="font-medium">{contactData.phone}</span>
        </a>
        
        <a 
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-gray-700 hover:text-[#25D366] transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
          </div>
          <span className="font-medium">WhatsApp</span>
        </a>
        
        <a 
          href={`mailto:${contactData.email}`}
          className="flex items-center gap-3 text-gray-700 hover:text-uss-primary transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-uss-primary/10 flex items-center justify-center group-hover:bg-uss-primary/20 transition-colors">
            <Mail className="h-5 w-5 text-uss-primary" />
          </div>
          <span className="font-medium text-sm">{contactData.email}</span>
        </a>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-6 ${className}`}>
        <a href={`tel:${whatsappNumber}`} className="flex items-center gap-2 text-gray-700 hover:text-uss-primary transition-colors">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-medium">{contactData.phone}</span>
        </a>
        <a href={`mailto:${contactData.email}`} className="flex items-center gap-2 text-gray-700 hover:text-uss-primary transition-colors">
          <Mail className="h-4 w-4" />
          <span className="text-sm font-medium">{contactData.email}</span>
        </a>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#25D366] hover:text-[#20BD5A] transition-colors">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">WhatsApp</span>
        </a>
      </div>
    )
  }

  // Full variant
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {/* Telefone e WhatsApp */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-uss-primary/20 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-uss-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-uss-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Telefone</h3>
                <a 
                  href={`tel:${whatsappNumber}`}
                  className="text-uss-primary hover:text-uss-primary/80 font-semibold text-xl block mb-3"
                >
                  {contactData.phone}
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* E-mail */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-uss-primary/20 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-uss-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-uss-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-900">E-mail</h3>
                <a 
                  href={`mailto:${contactData.email}`}
                  className="text-uss-primary hover:text-uss-primary/80 font-semibold block mb-1"
                >
                  {contactData.email}
                </a>
                <p className="text-gray-600 text-sm">
                  Resposta em até 24h úteis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Endereço */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-uss-primary/20 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-uss-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-uss-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Endereço</h3>
                <address className="not-italic text-gray-700 space-y-1">
                  <p className="font-semibold">{contactData.address.street}</p>
                  <p className="text-sm">{contactData.address.complement}</p>
                  <p className="text-sm">{contactData.address.city}</p>
                  <p className="text-sm text-gray-600">{contactData.address.zip}</p>
                </address>
                <a
                  href="https://maps.google.com/?q=Shopping+Della+Criciuma+SC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-uss-primary hover:text-uss-primary/80 font-semibold text-sm"
                >
                  <MapPin className="h-4 w-4" />
                  Ver no Mapa
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Horário de Funcionamento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-uss-primary/20 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-uss-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-uss-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-3 text-gray-900">Horário</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-700">Segunda a Sexta:</span>
                    <span className="font-semibold text-gray-900">9h às 19h</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-700">Sábado:</span>
                    <span className="font-semibold text-gray-900">9h às 18h</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-700">Domingo:</span>
                    <span className="font-semibold text-gray-500">Fechado</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mapa (se showMap = true) */}
      {showMap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-2"
        >
          <Card className="border-uss-primary/20 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3511.234567890123!2d-49.369876!3d-28.677123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDQwJzM3LjYiUyA0OcKwMjInMTEuNiJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

