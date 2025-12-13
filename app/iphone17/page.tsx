'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Heart, ChevronLeft, ChevronRight, 
  Smartphone, Camera, Cpu, Battery, Sparkles, Monitor,
  Shield, Truck, Package, Check
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'

// Imagens reais do iPhone 17
const iPhoneGallery = [
  { src: '/iphone17/iphone-17-pro-max-unico.webp', model: 'iPhone 17 Pro Max', variant: 'Destaque' },
  { src: '/iphone17/iphone-17-pro-max-unico-zoom.webp', model: 'iPhone 17 Pro Max', variant: 'Zoom' },
  { src: '/iphone17/iphone-17-pro-max-colecao-completa.webp', model: 'iPhone 17 Pro Max', variant: 'Coleção' },
  { src: '/iphone17/iphone-17-pro-colecao-2-unico.webp', model: 'iPhone 17 Pro', variant: 'Single' },
  { src: '/iphone17/iphone-17-pro-model-unselect-gallery-1-202509.webp', model: 'iPhone 17 Pro', variant: 'Gallery' },
  { src: '/iphone17/Iphone 17 coleção 1 Unico Foco.webp', model: 'iPhone 17', variant: 'Foco' },
  { src: '/iphone17/Iphone 17 coleção 1 Unico.webp', model: 'iPhone 17', variant: 'Standard' },
  { src: '/iphone17/iphone-17-colecao-2-par.webp', model: 'iPhone 17', variant: 'Duo' },
]

// iPhone 17 Series Data
const iphoneModels = [
  {
    id: 'iphone-17',
    name: 'iPhone 17',
    subtitle: 'Potência essencial',
    image: '/iphone17/Iphone 17 coleção 1 Unico Foco.webp',
    price: 5999,
    originalPrice: 6499,
    description: 'O novo iPhone 17 com design inteligente e chip A18.',
    display: '6.1"',
    chip: 'A18',
    camera: '48MP',
    battery: '22h',
    features: [
      'Display Super Retina XDR de 6,1"',
      'Chip A18 com Neural Engine',
      'Câmera dual de 48MP + 12MP',
      'Até 22 horas de bateria',
      'Resistente a água IP68'
    ],
  },
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    subtitle: 'Pro. Além do extraordinário.',
    image: '/iphone17/iphone-17-pro-colecao-2-unico.webp',
    price: 7999,
    originalPrice: 8999,
    description: 'Performance Pro com design em titânio aeroespacial.',
    display: '6.3"',
    chip: 'A18 Pro',
    camera: '48MP',
    battery: '28h',
    features: [
      'Display ProMotion 120Hz de 6,3"',
      'Chip A18 Pro - 3nm',
      'Sistema triple camera com zoom 5x',
      'Até 28 horas de bateria',
      'Titânio Grau 5 aeroespacial'
    ],
  },
  {
    id: 'iphone-17-pro-max',
    name: 'iPhone 17 Pro Max',
    subtitle: 'Máximo. Em todos os sentidos.',
    image: '/iphone17/iphone-17-pro-max-unico.webp',
    price: 9999,
    originalPrice: 11499,
    description: 'O smartphone mais avançado já criado pela Apple.',
    display: '6.9"',
    chip: 'A18 Pro',
    camera: '48MP',
    battery: '33h',
    features: [
      'Display ProMotion 120Hz de 6,9"',
      'Chip A18 Pro - arquitetura 3nm',
      'Sistema triple camera com zoom 12x',
      'Até 33 horas de bateria',
      'Titânio Grau 5 aeroespacial'
    ],
  }
]

const storageOptions = [
  { size: '128GB', price: 0 },
  { size: '256GB', price: 400 },
  { size: '512GB', price: 1000 },
  { size: '1TB', price: 1800 },
]

const colors = [
  { name: 'Titânio Natural', hex: '#8a8a8a' },
  { name: 'Titânio Azul', hex: '#394867' },
  { name: 'Titânio Branco', hex: '#f5f5f0' },
  { name: 'Titânio Preto', hex: '#1a1a1a' },
]

export default function IPhone17Page() {
  const [selectedModel, setSelectedModel] = useState(2) // Pro Max por padrão
  const [selectedStorage, setSelectedStorage] = useState(1) // 256GB
  const [selectedColor, setSelectedColor] = useState(0)
  const [currentImage, setCurrentImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const { addToCart } = useCart()

  const model = iphoneModels[selectedModel]
  const storage = storageOptions[selectedStorage]
  const color = colors[selectedColor]
  const totalPrice = model.price + storage.price
  const discount = Math.round((1 - model.price / model.originalPrice) * 100)

  // Auto-rotate gallery
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % iPhoneGallery.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // WhatsApp
  const whatsappNumber = '5548991832760'
  const whatsappMessage = `*USS Brasil Tecnologia*\n\nOlá! Tenho interesse no:\n\n*${model.name}*\nCor: ${color.name}\nArmazenamento: ${storage.size}\nPreço: R$ ${totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nEstá disponível?`
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  const handleAddToCart = () => {
    addToCart({
      id: `${model.id}-${storage.size}-${color.name}`,
      name: `${model.name} ${storage.size} ${color.name}`,
      price: totalPrice,
      image: model.image,
      category: 'iPhone',
      stock: 10
    })
    toast.success(`${model.name} adicionado ao carrinho!`, {
      action: {
        label: 'WhatsApp',
        onClick: () => window.open(whatsappLink, '_blank')
      }
    })
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 py-8 sm:py-12">
          {/* Header Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-600 text-sm font-bold">
              <Sparkles className="h-4 w-4" />
              PRÉ-VENDA EXCLUSIVA
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="order-1"
            >
              {/* Main Image */}
              <div className="relative aspect-square max-w-md mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={iPhoneGallery[currentImage].src}
                      alt={iPhoneGallery[currentImage].model}
                      fill
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button
                  onClick={() => setCurrentImage((prev) => prev === 0 ? iPhoneGallery.length - 1 : prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-100 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev + 1) % iPhoneGallery.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-100 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>

                {/* Image Info */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-700">
                  <p className="text-sm font-medium text-white">{iPhoneGallery[currentImage].model}</p>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-2 justify-center mt-4 overflow-x-auto pb-2">
                {iPhoneGallery.slice(0, 6).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all bg-gray-50 ${
                      currentImage === idx ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.model}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Right - Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-2 space-y-6"
            >
              {/* Title */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900">
                  {model.name}
                </h1>
                <p className="text-xl sm:text-2xl text-gray-500 mt-2">{model.subtitle}</p>
              </div>

              {/* Model Selection */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {iphoneModels.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(idx)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      selectedModel === idx
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {m.name.replace('iPhone 17 ', '')}
                  </button>
                ))}
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Monitor, label: 'Tela', value: model.display },
                  { icon: Cpu, label: 'Chip', value: model.chip },
                  { icon: Camera, label: 'Câmera', value: model.camera },
                  { icon: Battery, label: 'Bateria', value: model.battery },
                ].map((spec) => (
                  <div key={spec.label} className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                    <spec.icon className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-xs text-gray-500">{spec.label}</p>
                    <p className="text-sm font-bold text-gray-900">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Storage Selection */}
              <div>
                <p className="text-sm text-gray-500 mb-3">Armazenamento</p>
                <div className="flex flex-wrap gap-2">
                  {storageOptions.map((opt, idx) => (
                    <button
                      key={opt.size}
                      onClick={() => setSelectedStorage(idx)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        selectedStorage === idx
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {opt.size}
                      {opt.price > 0 && <span className="text-xs ml-1 opacity-70">+R${opt.price}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <p className="text-sm text-gray-500 mb-3">Cor: <span className="text-gray-900 font-medium">{color.name}</span></p>
                <div className="flex gap-3">
                  {colors.map((c, idx) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(idx)}
                      className={`w-10 h-10 rounded-full transition-all border border-gray-300 shadow-sm ${
                        selectedColor === idx
                          ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900">
                    R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-gray-400 line-through text-lg">
                    R$ {(model.originalPrice + storage.price).toLocaleString('pt-BR')}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                    -{discount}%
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  ou 12x de R$ {(totalPrice / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Comprar Agora
                </a>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all border border-gray-200 flex items-center justify-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  Adicionar ao Carrinho
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-4 rounded-xl border transition-all ${
                    isFavorite 
                      ? 'bg-red-50 border-red-300 text-red-500' 
                      : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-blue-500" />
                  <span>Frete Grátis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Garantia Apple</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Produto Oficial</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">Recursos do {model.name}</h2>
            <p className="text-gray-500">Tecnologia de ponta em cada detalhe</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {model.features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <Check className="h-5 w-5 text-blue-500 mb-2" />
                <p className="text-sm text-gray-700">{feature}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">Compare os Modelos</h2>
            <p className="text-gray-500">Escolha o iPhone 17 perfeito para você</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {iphoneModels.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white border rounded-2xl p-6 transition-all shadow-sm ${
                  selectedModel === idx 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {idx === 2 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-md">
                    MAIS VENDIDO
                  </div>
                )}
                
                <div className="relative w-full h-40 mb-4">
                  <Image
                    src={m.image}
                    alt={m.name}
                    fill
                    className="object-contain"
                  />
                </div>

                <h3 className="text-xl font-bold mb-1 text-gray-900">{m.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{m.subtitle}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tela</span>
                    <span className="text-gray-900">{m.display}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Chip</span>
                    <span className="text-gray-900">{m.chip}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bateria</span>
                    <span className="text-gray-900">{m.battery}</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-black text-blue-500">
                    R$ {m.price.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-400 line-through">
                    R$ {m.originalPrice.toLocaleString('pt-BR')}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedModel(idx)}
                  className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all ${
                    selectedModel === idx
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedModel === idx ? 'Selecionado' : 'Selecionar'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 sm:p-12 text-center shadow-xl"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Pronto para o futuro?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              Garanta seu {model.name} agora com condições exclusivas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-all inline-flex items-center justify-center gap-2 shadow-lg"
              >
                <Smartphone className="h-5 w-5" />
                Falar com Vendedor
              </a>
              <Link
                href="/produtos?brand=apple"
                className="bg-white/20 text-white font-bold py-4 px-8 rounded-xl hover:bg-white/30 transition-all border border-white/30"
              >
                Ver Todos os iPhones
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

