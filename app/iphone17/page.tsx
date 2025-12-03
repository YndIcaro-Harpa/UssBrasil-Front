'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Heart, ChevronLeft, ChevronRight, Zap, 
  Smartphone, Camera, Cpu, Battery, Sparkles
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/contexts/ModalContext'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { getMediaUrl } from '@/lib/media-utils'

// iPhone 17 Series Data
const iphoneModels = [
  {
    id: 'iphone-17',
    name: 'iPhone 17',
    color: 'Lavanda',
    image: '/images/products/iphone-17-placeholder.svg',
    price: 4999.99,
    description: 'Potência essencial com o novo design inteligente',
    specs: [
      'Display Super Retina XDR de 6,1"',
      'Chip A18',
      'Câmera dual de 48MP + 12MP',
      'Bateria de até 22 horas',
      'Resistente a água IP69'
    ],
    specs_list: [
      { label: 'Processador', value: 'A18' },
      { label: 'RAM', value: '8GB' },
      { label: 'Tela', value: '6.1 polegadas' },
      { label: 'Câmera', value: '48MP + 12MP' },
      { label: 'Bateria', value: '3.500mAh' }
    ]
  },
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    color: 'Prateado',
    image: '/images/products/iphone-17-pro-placeholder.svg',
    price: 7499.99,
    description: 'Pro performance com design em titânio',
    specs: [
      'Display ProMotion 120Hz de 6,3"',
      'Chip A18 Pro',
      'Sistema de câmeras triple com zoom óptico 5x',
      'Bateria de até 28 horas',
      'Resistente a água IP69'
    ],
    specs_list: [
      { label: 'Processador', value: 'A18 Pro' },
      { label: 'RAM', value: '12GB' },
      { label: 'Tela', value: '6.3 polegadas' },
      { label: 'Câmera', value: '48MP + 12MP + 12MP' },
      { label: 'Bateria', value: '3.600mAh' }
    ]
  },
  {
    id: 'iphone-17-pro-max',
    name: 'iPhone 17 Pro Max',
    color: 'Prateado',
    image: '/images/products/iphone-17-pro-max-placeholder.svg',
    price: 9499.99,
    description: 'Máxima performance em um ecrã espetacular',
    specs: [
      'Display ProMotion 120Hz de 6,9"',
      'Chip A18 Pro',
      'Sistema de câmeras triple com zoom óptico 12x',
      'Bateria de até 33 horas',
      'Resistente a água IP69'
    ],
    specs_list: [
      { label: 'Processador', value: 'A18 Pro' },
      { label: 'RAM', value: '12GB' },
      { label: 'Tela', value: '6.9 polegadas' },
      { label: 'Câmera', value: '48MP + 12MP + 12MP' },
      { label: 'Bateria', value: '4.100mAh' }
    ]
  }
]

const storageOptions = ['128GB', '256GB', '512GB', '1TB']

// Cores específicas por modelo
const colorsByModel = {
  'iphone-17': [
    { name: 'Lavanda', hex: '#b6a3d9' },
    { name: 'Salvia', hex: '#7a9b6e' },
    { name: 'Azul Névoa', hex: '#6b8fb5' },
    { name: 'Branco', hex: '#f5f5f5' },
    { name: 'Preto', hex: '#1a1a1a' }
  ],
  'iphone-17-pro': [
    { name: 'Prateado', hex: '#e8e8e8' },
    { name: 'Laranja Cósmico', hex: '#d97706' },
    { name: 'Azul Intenso', hex: '#1e40af' },
    { name: 'Titânio Natural', hex: '#a8a8a8' }
  ],
  'iphone-17-pro-max': [
    { name: 'Prateado', hex: '#e8e8e8' },
    { name: 'Laranja Cósmico', hex: '#d97706' },
    { name: 'Azul Intenso', hex: '#1e40af' },
    { name: 'Titânio Natural', hex: '#a8a8a8' }
  ]
}

function iPhone17Page() {
  const [selectedModel, setSelectedModel] = useState(0)
  const [selectedStorage, setSelectedStorage] = useState('256GB')
  const [selectedColor, setSelectedColor] = useState(colorsByModel['iphone-17'][0])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [favorites, setFavorites] = useState<string[]>([])
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { openAuthModal } = useModal()

  const model = iphoneModels[selectedModel]
  const modelKey = model.id as keyof typeof colorsByModel
  const availableColors = colorsByModel[modelKey]

  // Atualizar cor quando modelo mudar
  useEffect(() => {
    setSelectedColor(availableColors[0])
  }, [selectedModel])

  const storagePrice = selectedStorage === '128GB' ? 0 : selectedStorage === '256GB' ? 200 : selectedStorage === '512GB' ? 600 : 1200
  const totalPrice = model.price + storagePrice

  // WhatsApp USS Brasil Tecnologia
  const whatsappNumber = '5548991832760'
  const whatsappMessage = `🛒 *USS Brasil Tecnologia*\n\nOlá! Vim do site e gostaria de saber mais sobre:\n\n📱 *${model.name}*\n🎨 Cor: ${selectedColor.name}\n💾 Armazenamento: ${selectedStorage}\n💰 Preço visto: R$ ${totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nEsse modelo está disponível?`
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  const handleAddToCart = () => {
    addToCart({
      id: Date.now(),
      name: `${model.name} - ${selectedStorage} ${selectedColor.name}`,
      price: totalPrice,
      image: model.image,
      category: 'iPhone'
    })
    toast.success(`${model.name} adicionado ao carrinho! Finalize pelo WhatsApp.`, {
      description: 'Continue navegando ou fale com nosso vendedor',
      action: {
        label: 'WhatsApp',
        onClick: () => window.open(whatsappLink, '_blank')
      }
    })
  }

  const toggleFavorite = () => {
    setFavorites(prev => 
      prev.includes(model.id) 
        ? prev.filter(id => id !== model.id)
        : [...prev, model.id]
    )
  }

  return (
    <div className="min-h-screen bg-white to-uss-light pt-24">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-12">
        <div className="absolute inset-0 bg-gradient-uss opacity-10" />
        
        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square">
              <motion.div
                key={selectedModel}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 backdrop-blur-sm border border-white/20"
              >
                <div className="relative w-full h-full bg-gradient-to-br from-uss-cyan/20 to-uss-primary/20 rounded-2xl flex items-center justify-center overflow-hidden">
                  <Image
                    src={model.image}
                    alt={model.name}
                    fill
                    className="object-contain p-4"
                    priority
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.src = '/fallback-product.png'
                    }}
                  />
                </div>
              </motion.div>

              {/* Color Selector Below Image */}
              <div className="mt-8 flex justify-center gap-4 flex-wrap">
                {availableColors.map(color => (
                  <motion.button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      selectedColor.name === color.name
                        ? 'border-uss-primary scale-110 ring-2 ring-uss-primary/30'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-black space-y-8"
          >
            {/* Model Selector */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-black">
                {model.name}
              </h1>
              <p className="text-xl text-uss-cyan font-semibold mb-6">{model.color}</p>
              <p className="text-lg text-black leading-relaxed max-w-lg">
                {model.description}
              </p>
            </div>

            {/* Model Selection Tabs */}
            <div className="flex gap-3 flex-wrap">
              {iphoneModels.map((m, idx) => (
                <motion.button
                  key={m.id}
                  onClick={() => setSelectedModel(idx)}
                  whileHover={{ scale: 1.05 }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedModel === idx
                      ? 'bg-blue-400 hover:bg-blue-600 text-white shadow-lg shadow-blue-400/50'
                      : 'bg-white/10 text-black hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {m.name}
                </motion.button>
              ))}
            </div>

            {/* Storage Selection */}
            <div>
              <label className="block text-sm font-semibold mb-4 text-uss-cyan">
                Armazenamento: <span className="text-uss-primary">{selectedStorage}</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {storageOptions.map(storage => (
                  <motion.button
                    key={storage}
                    onClick={() => setSelectedStorage(storage)}
                    whileHover={{ scale: 1.05 }}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
                      selectedStorage === storage
                        ? 'bg-blue-400 text-black shadow-lg shadow-blue-400/50'
                        : 'bg-white/10 text-black hover:text-white/20 border border-white/20'
                    }`}
                  >
                    {storage}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-uss-primary/20 to-uss-cyan/20 border border-uss-cyan/30 rounded-xl p-6">
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-black text-sm mb-2">Preço base:</p>
                  <p className="text-sm line-through text-black">
                    R$ {model.price.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-uss-cyan text-sm mb-2">Com armazenamento:</p>
                  <p className="text-4xl font-bold text-black">
                    R$ {totalPrice.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {model.specs.map((spec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-uss-cyan/30 rounded-lg p-3 text-sm"
                >
                  <p className="text-black">{spec}</p>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 flex-wrap">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-max bg-blue-400 hover:bg-blue-700 text-black font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Smartphone className="h-5 w-5" />
                Falar no WhatsApp
              </a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFavorite}
                className="bg-white/10 text-black hover:bg-white/20 border border-white/20 font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Heart
                  className={`h-5 w-5 ${
                    favorites.includes(model.id)
                      ? 'fill-red-500 text-red-500'
                      : ''
                  }`}
                />
                Favoritos
              </motion.button>
            </div>

            {/* Info Banner */}
            <div className="bg-uss-success/20 border border-uss-success/50 rounded-lg p-4 flex items-start gap-3">
              <Zap className="h-5 w-5 text-uss-success flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-uss-success">Oferta Especial</p>
                <p className="text-black">Frete grátis em compras acima de R$ 2.000</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Detailed Specs Section */}
      <section className="py-24 bg-white/5 border-y border-uss-primary/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-black mb-4">Especificações Técnicas</h2>
            <p className="text-xl text-black">Conheça todos os detalhes do {model.name}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-uss-primary/10 to-uss-cyan/10 border border-uss-cyan/30 rounded-2xl p-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {model.specs_list.map((spec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <p className="text-sm text-uss-cyan font-semibold uppercase tracking-wider mb-3">
                    {spec.label}
                  </p>
                  <p className="text-2xl font-bold text-black">{spec.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-black mb-4">Compare os Modelos</h2>
            <p className="text-xl text-black">Escolha o iPhone 17 perfeito para você</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-uss-primary/50">
                  <th className="text-left py-4 px-6 text-black font-bold">Especificação</th>
                  {iphoneModels.map(model => (
                    <th key={model.id} className="text-center py-4 px-6 text-uss-cyan font-bold">
                      {model.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Preço Base', values: ['R$ 3.499', 'R$ 4.999', 'R$ 5.999'] },
                  { label: 'Tela', values: ['6.1"', '6.3"', '6.9"'] },
                  { label: 'ProMotion 120Hz', values: ['Não', 'Sim', 'Sim'] },
                  { label: 'Processador', values: ['A18', 'A18 Pro', 'A18 Pro'] },
                  { label: 'Câmera Principal', values: ['48MP', '48MP', '48MP'] },
                  { label: 'Zoom Óptico', values: ['2x', '5x', '12x'] },
                  { label: 'Bateria', values: ['22h', '28h', '33h'] }
                ].map((row, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    viewport={{ once: true }}
                    className={`border-b border-uss-primary/20 ${
                      idx % 2 === 0 ? 'bg-white/[0.02]' : ''
                    }`}
                  >
                    <td className="py-4 px-6 text-black font-semibold">{row.label}</td>
                    {row.values.map((value, idx) => (
                      <td
                        key={idx}
                        className="text-center py-4 px-6 text-black"
                      >
                        {value}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-r from-uss-primary/10 via-uss-cyan/10 to-uss-primary/10 border-y border-uss-primary/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-black mb-4">Recursos Inovadores</h2>
            <p className="text-xl text-black">Tecnologia de ponta para sua vida</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Camera, title: 'Câmera Profissional', desc: 'Imagens com qualidade de cinema' },
              { icon: Smartphone, title: 'Design Premium', desc: 'Titânio duradouro e elegante' },
              { icon: Battery, title: 'Bateria Longa Duração', desc: 'Até 33 horas de uso' },
              { icon: Cpu, title: 'Chip A18 Pro', desc: 'Performance sem limites' },
              { icon: Sparkles, title: 'Tela SuperRetina', desc: 'Cores vibrantes e nítidas' },
              { icon: Zap, title: 'Carregamento Rápido', desc: 'De 0 a 100% em 30 minutos' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-uss-cyan/30 rounded-xl p-8 hover:bg-white/10 transition-all group"
              >
                <feature.icon className="h-12 w-12 text-uss-cyan mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
                <p className="text-black">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-uss-primary rounded-2xl p-12 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Pronto para o futuro?
            </h2>
            <p className="text-xl text-black/90 mb-8 max-w-2xl mx-auto">
              Garanta o seu iPhone 17 agora e experiêncie a tecnologia mais avançada do mercado
            </p>
            <motion.a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-400 hover:bg-blue-700 text-black font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              <Smartphone className="h-5 w-5" />
              Falar com Vendedor
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default iPhone17Page

