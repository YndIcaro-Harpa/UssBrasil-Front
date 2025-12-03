'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Camera, Cpu, Battery, Zap, Smartphone, Video, 
  Shield, Wifi, ArrowRight, Play, ChevronDown, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const iPhone17ProPage = () => {
  const [selectedColor, setSelectedColor] = useState('orange')
  const whatsappNumber = '5548991832760'
  
  const colors = [
    { id: 'orange', name: 'Laranja-cósmico', hex: '#ff6b35', image: '/images/products/iphone-17-pro-placeholder.svg' },
    { id: 'blue', name: 'Azul-intenso', hex: '#1e3a8a', image: '/images/products/iphone-17-pro-placeholder.svg' },
    { id: 'silver', name: 'Prateado', hex: '#cbd5e1', image: '/images/products/iphone-17-pro-placeholder.svg' }
  ]

  const highlights = [
    { icon: Camera, title: 'Zoom 8x óptico', desc: 'Maior teleobjetiva em iPhone' },
    { icon: Cpu, title: 'Chip A19 Pro', desc: 'Desempenho 40% superior' },
    { icon: Battery, title: 'Até 37h de vídeo', desc: 'Maior bateria de iPhone' },
    { icon: Video, title: 'ProRes RAW', desc: 'Primeiro smartphone compatível' }
  ]

  const cameraSpecs = [
    { name: 'Fusion Principal', mp: '48 MP', focal: '24/48 mm', aperture: 'ƒ/1.78' },
    { name: 'Ultra-angular', mp: '48 MP', focal: '13 mm', aperture: 'ƒ/2.2' },
    { name: 'Teleobjetiva', mp: '48 MP', focal: '100/200 mm', aperture: 'ƒ/2.8' }
  ]

  const videoFeatures = [
    'ProRes RAW - Controle profissional',
    '4K Dolby Vision a 120 qps',
    'Compatibilidade com genlock',
    'Apple Log 2 - Tonalidade ampliada',
    'Estabilização aprimorada',
    'Captura Dupla simultânea'
  ]

  const designFeatures = [
    'Estrutura unibody em alumínio forjado',
    'Ceramic Shield 2 (3x mais resistente)',
    'Câmara de vapor soldada a laser',
    'Gerenciamento térmico avançado',
    'Resistência IP69',
    'Design interno otimizado'
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 pb-8 sm:pb-12 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <Badge className="bg-blue-400 text-white mb-3 sm:mb-4 text-xs sm:text-sm">NOVO</Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 text-black px-4">
              iPhone 17 Pro
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Design unibody. Alumínio forjado a quente. Capacidade excepcional.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4">
              <Button className="bg-blue-400 hover:bg-blue-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-xl">
                Comprar
              </Button>
              <Button className="bg-white hover:bg-gray-100 text-blue-400 border-2 border-blue-400 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-xl">
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Assistir ao vídeo
              </Button>
            </div>

            <p className="text-sm sm:text-base text-gray-600 mb-2">A partir de</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400">R$ 958,25/mês ou R$ 11.499*</p>
          </motion.div>

          {/* Color Selector & Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-4">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`group relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all ${
                    selectedColor === color.id
                      ? 'bg-blue-400 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <div 
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-md flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="font-semibold text-sm sm:text-base">{color.name}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center">
              <Image
                src="/iphone17/iphone-17-pro-model-unselect-gallery-1-202509.webp"
                alt="iPhone 17 Pro"
                width={500}
                height={600}
                className="object-contain drop-shadow-2xl w-full h-full"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16 text-black px-4"
          >
            Comece pelos destaques.
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {highlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-400 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-black">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Gallery Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16 text-black px-4"
          >
            Galeria iPhone 17
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              { src: '/iphone17/Iphone 17 coleção 1 Unico.webp', alt: 'iPhone 17 Coleção 1' },
              { src: '/iphone17/iphone-17-pro-colecao-2-unico.webp', alt: 'iPhone 17 Pro' },
              { src: '/iphone17/iphone-17-pro-max-unico.webp', alt: 'iPhone 17 Pro Max' },
              { src: '/iphone17/Iphone 17 coleção 1 Unico Foco.webp', alt: 'iPhone 17 Detalhe' },
              { src: '/iphone17/iphone-17-colecao-2-par.webp', alt: 'iPhone 17 Par' },
              { src: '/iphone17/iphone-17-pro-max-colecao-completa.webp', alt: 'iPhone 17 Coleção Completa' }
            ].map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-white"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-blue-400 text-white mb-3 sm:mb-4 text-xs sm:text-sm">DESIGN</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-black">
                Estrutura unibody.<br />
                Eles têm a força.
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-6 sm:mb-8">
                Apresentamos o iPhone 17 Pro e o iPhone 17 Pro Max. Projetados de dentro para fora, 
                eles são os modelos de iPhone mais potentes já produzidos. O coração do novo design 
                é a estrutura unibody em alumínio forjado a quente que maximiza o desempenho, 
                a capacidade da bateria e a durabilidade.
              </p>

              <div className="space-y-3 sm:space-y-4">
                {designFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <Check className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-1" />
                    <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button className="mt-6 sm:mt-8 bg-blue-400 hover:bg-blue-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base w-full sm:w-auto">
                Comparar o design dos modelos
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] order-first lg:order-last"
            >
              <Image
                src="/iphone17/iphone-17-pro-model-unselect-gallery-2-202509.webp"
                alt="iPhone 17 Pro - Estrutura unibody"
                fill
                className="object-contain"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Camera Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <Badge className="bg-blue-400 text-white mb-3 sm:mb-4 text-xs sm:text-sm">CÂMERAS</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-black px-4">
              Esse zoom vai longe.
            </h2>
            <div className="flex justify-center gap-8 sm:gap-12 md:gap-16 mb-6 sm:mb-8">
              <div className="text-center">
                <p className="text-4xl sm:text-5xl md:text-6xl font-black text-blue-400">8x</p>
                <p className="text-sm sm:text-base text-gray-600">Zoom óptico</p>
              </div>
              <div className="text-center">
                <p className="text-4xl sm:text-5xl md:text-6xl font-black text-blue-400">48 MP</p>
                <p className="text-sm sm:text-base text-gray-600">Câmeras traseiras</p>
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
            {cameraSpecs.map((spec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-black">{spec.name}</h3>
                <div className="space-y-2 text-sm sm:text-base text-gray-700">
                  <p><strong>{spec.mp}</strong></p>
                  <p>Distância focal: {spec.focal}</p>
                  <p>Abertura {spec.aperture}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-blue-400 rounded-3xl p-12 text-center"
          >
            <p className="text-3xl font-bold text-white mb-4">
              É como ter 8 lentes profissionais no seu bolso.
            </p>
            <p className="text-xl text-blue-200">
              A alta resolução é o novo padrão: fotos em 24 MP.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <Badge className="bg-white text-black mb-3 sm:mb-4 text-xs sm:text-sm">VÍDEO PRO</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 px-4">
              Recursos que colocam<br />Hollywood no bolso.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              O iPhone 17 Pro encara qualquer desafio. De vídeos caseiros a produções de cinema.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 md:mb-16">
            {videoFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-white/20"
              >
                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mb-2 sm:mb-3" />
                <p className="text-white font-semibold text-sm sm:text-base">{feature}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center px-4">
            <Button className="bg-white hover:bg-gray-100 text-black px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-xl w-full sm:w-auto">
              Comparar as câmeras dos modelos
            </Button>
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-blue-400 text-white mb-3 sm:mb-4 text-xs sm:text-sm">DESEMPENHO</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-black">
                A potência<br />avançou de nível.
              </h2>
              
              <div className="space-y-4 sm:space-y-6 md:space-y-8 mb-6 sm:mb-8">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <Cpu className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                    <h3 className="text-xl sm:text-2xl font-bold text-black">Chip A19 Pro</h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700">
                    O chip da Apple no iPhone 17 Pro oferece o maior desempenho em um iPhone. 
                    Ideal para jogos avançados e tarefas pesadas.
                  </p>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                  <p className="text-3xl sm:text-4xl font-black text-blue-400 mb-2">40%</p>
                  <p className="text-sm sm:text-base text-gray-700">
                    GPU e CPU oferecem desempenho contínuo até 40% melhor, aliados a design térmico inovador.
                  </p>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <Battery className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                    <h3 className="text-2xl font-bold text-black">Duração da bateria</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    O iPhone 17 Pro Max tem a maior duração de bateria em um iPhone. 
                    São até três horas a mais que no iPhone 15 Pro Max.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-3xl font-bold text-blue-400">31h</p>
                      <p className="text-sm text-gray-600">iPhone 17 Pro</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-3xl font-bold text-blue-400">37h</p>
                      <p className="text-sm text-gray-600">iPhone 17 Pro Max</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="bg-blue-400 hover:bg-blue-700 text-white px-8 py-6">
                Comparar desempenho dos modelos
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] order-first lg:order-last"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-3xl blur-3xl" />
              <Image
                src="/iphone17/iphone-air-finish-unselect-gallery-1-202509.webp"
                alt="iPhone 17 Pro - Performance"
                fill
                className="object-contain relative z-10"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Apple Intelligence Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <Badge className="bg-white text-black mb-3 sm:mb-4 text-xs sm:text-sm">APPLE INTELLIGENCE</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 px-4">
              Simples e útil<br />no seu dia a dia.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              { title: 'Inteligência Visual', desc: 'Use o conteúdo da tela para buscas e perguntas' },
              { title: 'Tradução ao Vivo', desc: 'Traduz textos automaticamente em Mensagens e FaceTime' },
              { title: 'Ferramenta de Limpeza', desc: 'Remova distrações indesejadas com um toque' },
              { title: 'Genmoji', desc: 'Crie emojis personalizados com descrições' },
              { title: 'Ferramentas de Escrita', desc: 'Revise, reescreva e encontre o tom perfeito' },
              { title: 'Liquid Glass', desc: 'Novo design do iOS que reflete em tempo real' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/20"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-black px-4">
              Vale trocar?<br />Vale 100%.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Garanta o seu iPhone 17 Pro agora e experiencie a tecnologia mais avançada do mercado.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href={`https://wa.me/${whatsappNumber}?text=Olá! Gostaria de saber mais sobre o iPhone 17 Pro`}>
                <Button className="bg-blue-400 hover:bg-blue-700 text-white px-8 sm:px-10 py-5 sm:py-7 text-base sm:text-lg rounded-xl shadow-xl w-full sm:w-auto">
                  <Smartphone className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  Falar com Vendedor
                </Button>
              </Link>
              <Button className="bg-white hover:bg-gray-100 text-blue-400 border-2 border-blue-400 px-8 sm:px-10 py-5 sm:py-7 text-base sm:text-lg rounded-xl w-full sm:w-auto">
                Ver Todos os Modelos
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default iPhone17ProPage

